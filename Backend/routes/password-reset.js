const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
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
  FRONTEND_URL,
  NODE_ENV
} = process.env;

if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS || !EMAIL_FROM || !FRONTEND_URL) {
  throw new Error("One or more required email or app config environment variables are missing.");
}

// ✅ Simple email validation
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// ✅ Send password reset email
function buildPasswordResetEmailHTML(appName, link) {
  return `
    <div style="background:#f6f9fc;padding:24px 0;width:100%;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111">
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h1 style="margin:0;font-size:20px;">Reset your password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;">You requested a password reset for your ${appName} account.</p>
            <p style="margin:0 0 20px;">Click the button below to reset your password. The link expires in 1 hour.</p>
            <p style="margin:0 0 24px;">
              <a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;">Reset Password</a>
            </p>
            <p style="margin:0 0 8px;font-size:12px;color:#555;">Button not working? Copy and paste this URL into your browser:</p>
            <p style="word-break:break-all;font-size:12px;color:#555;">${link}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #eee;font-size:12px;color:#6b7280;">
            <p style="margin:0;">If you didn't request this password reset, you can ignore this email.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function sendPasswordResetEmail(to, link) {
  const transporter = nodemailer.createTransporter({
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
    subject: "Reset your password for ThiraiView",
    text: `You requested a password reset!\n\nReset your password by opening this link (valid for 1 hour):\n${link}\n\nIf you didn't request this, ignore this email.`,
    html: buildPasswordResetEmailHTML("ThiraiView", link),
  });
}

// POST /password-reset/forgot
router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // To avoid account enumeration, respond with a generic success message
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset email has been sent.' });
    }

    // Remove any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create a new password reset token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Construct password reset link
    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

    // Send email
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({ message: 'If an account exists, a password reset email has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /password-reset/reset
router.post('/reset', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Find the password reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.isUsed) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /password-reset/validate/:token
router.get('/validate/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.isUsed) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ valid: true, message: 'Token is valid' });
  } catch (err) {
    console.error('Validate token error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
