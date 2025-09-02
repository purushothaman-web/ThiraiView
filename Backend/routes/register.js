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

// ✅ Simple email validation
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// ✅ Send verification email
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
    html: `
      <p>Thank you for registering!</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
}

router.post('/', async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!name || !email || !password || !username) {
    return res.status(400).json({ error: 'All fields are required (name, email, password, username).' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters.' });
  }

  try {
    // Check for duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username,
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
    const verificationLink = `${APP_BASE_URL}/verify/${token}`;
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
