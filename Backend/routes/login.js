const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('../generated/prisma'); // adjust path if needed

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // 1 hour access token by default
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets must be defined in your environment variables.");
}

router.post('/', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    // Try to find user by email first, then username
    const user =
      (await prisma.user.findUnique({ where: { email: identifier } })) ||
      (await prisma.user.findUnique({ where: { username: identifier } }));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked (but allow superuser/admin to login even if blocked)
    if (user.blocked && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified (superuser/admin bypass verification requirement)
    if (!user.isVerified && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Account not verified',
        code: 'UNVERIFIED_ACCOUNT',
        message: 'Please verify your email before logging in. Check your inbox for a verification link.'
      });
    }

    // Generate Access Token with additional claims for admin users
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    };

    // Add superuser flag for admin users
    if (user.role === 'ADMIN') {
      tokenPayload.isSuperuser = true;
    }

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Generate Refresh Token with JTI for rotation (now includes admin users)
    const jti = crypto.randomUUID();
    const refreshPayload = { id: user.id, jti, role: user.role };
    const refreshToken = jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Persist hashed refresh token for ALL users including admins
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY));

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        jti,
        tokenHash,
        expiresAt,
      },
    });

    // Set HttpOnly cookie for refresh token
    setRefreshCookie(res, refreshToken, expiresAt);

    // Return access token and user info
    res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperuser: user.role === 'ADMIN',
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        bio: user.bio
      },
    });

  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', err);
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;

// --- helpers ---
function setRefreshCookie(res, token, expiresAt) {
  const isProd = NODE_ENV === 'production';
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

function parseExpiryToMs(exp) {
  // Supports formats like '30d', '12h', '15m', '3600' (seconds)
  if (!exp) return 0;
  const match = String(exp).match(/^(\d+)([smhd])?$/);
  if (!match) {
    // fallback: JWT libraries accept e.g. '30d'; default to 30 days
    return 30 * 24 * 60 * 60 * 1000;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}
