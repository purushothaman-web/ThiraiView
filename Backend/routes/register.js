const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const router = express.Router();

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  EMAIL_FROM,
  APP_BASE_URL,
  NODE_ENV
} = process.env;

// 🛑 Fail fast if missing critical env vars
if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS || !EMAIL_FROM || !APP_BASE_URL) {
  throw new Error("One or more required email or app config environment variables are missing.");
}

// ✅ Enhanced validation functions
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function isValidUsername(username) {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

function isValidName(name) {
  // 2-50 characters, letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
}

// ✅ Send verification email
function buildEmailHTML(appName, link) {
  return `
    <div style="background:#f6f9fc;padding:24px 0;width:100%;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111">
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h1 style="margin:0;font-size:20px;">Verify your email</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;">Thanks for signing up for ${appName}!</p>
            <p style="margin:0 0 20px;">Please confirm this email address by clicking the button below. The link expires in 1 hour.</p>
            <p style="margin:0 0 24px;">
              <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;">Verify Email</a>
            </p>
            <p style="margin:0 0 8px;font-size:12px;color:#555;">Button not working? Copy and paste this URL into your browser:</p>
            <p style="word-break:break-all;font-size:12px;color:#555;">${link}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #eee;font-size:12px;color:#6b7280;">
            <p style="margin:0;">If you didn’t create an account, you can ignore this email.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function sendVerificationEmail(to, link) {
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT, 10),
    secure: false, // true for 465, false for 587
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ThiraiView" <${EMAIL_FROM}>`,
    to,
    subject: "Verify your email for ThiraiView",
    text: `Thank you for registering!\n\nVerify your email by opening this link (valid for 1 hour):\n${link}\n\nIf you didn’t create an account, ignore this email.`,
    html: buildEmailHTML("ThiraiView", link),
  });
}

router.post('/', async (req, res) => {
  const { name, email, password, username } = req.body;

  // Check for required fields
  if (!name || !email || !password || !username) {
    return res.status(400).json({ 
      error: 'All fields are required (name, email, password, username).',
      field: !name ? 'name' : !email ? 'email' : !password ? 'password' : 'username'
    });
  }

  // Trim whitespace
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim();

  // Validate name
  if (!isValidName(trimmedName)) {
    return res.status(400).json({ 
      error: 'Name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes.',
      field: 'name'
    });
  }

  // Validate email
  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address.',
      field: 'email'
    });
  }

  // Validate password
  if (!isValidPassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
      field: 'password'
    });
  }

  // Validate username
  if (!isValidUsername(trimmedUsername)) {
    return res.status(400).json({ 
      error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
      field: 'username'
    });
  }

  try {
    // Check for duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existingEmail) {
      return res.status(400).json({ 
        error: 'Email is already registered.',
        field: 'email'
      });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: trimmedUsername } });
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'Username is already taken.',
        field: 'username'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        username: trimmedUsername,
        isVerified: false,
      },
    });

    // Generate verification token (1-hour expiry)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email
    // Use frontend URL for verification UI
    const verificationLink = `${process.env.FRONTEND_URL || APP_BASE_URL}/verify/${token}`;
    await sendVerificationEmail(user.email, verificationLink);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    if (NODE_ENV !== 'production') {
      console.error('Register error:', err);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
