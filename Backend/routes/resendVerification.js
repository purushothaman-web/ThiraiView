const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('../generated/prisma');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Remove any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Create a new verification token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Construct verification link
    const verificationLink = `${FRONTEND_URL}/verify/${token}`;

    // Send email
    await sendVerificationEmail(user.email, verificationLink);

    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

async function sendVerificationEmail(to, link) {
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});


  await transporter.sendMail({
    from: `"ThiraiView" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Verify your account",
    html: `<p>Please click the link below to verify your account:</p><p><a href="${link}">${link}</a></p>`,
  });
}

module.exports = router;
