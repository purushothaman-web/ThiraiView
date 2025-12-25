const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('../generated/prisma');
const requireAuth = require('../middleware/auth'); // Import auth middleware

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be defined in your environment variables.');
}


// GET /auth/validate - Validate access token and return user
router.get('/validate', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isVerified: true,
        profilePicture: true,
        bio: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        ...user,
        isSuperuser: user.role === 'ADMIN'
      }
    });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const { id: userId, jti } = decoded;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const dbToken = await prisma.refreshToken.findUnique({ where: { jti } });

    // Reuse detection or invalidation checks
    if (!dbToken || dbToken.isRevoked || dbToken.tokenHash !== tokenHash || dbToken.expiresAt < new Date()) {
      // Revoke all tokens for this user as a precaution
      if (userId) {
        await prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } });
      }
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Rotate token: revoke old and issue new
    const newJti = crypto.randomUUID();
    const newRefreshPayload = { id: userId, jti: newJti };
    const newRefreshToken = jwt.sign(newRefreshPayload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY));

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { jti },
        data: { isRevoked: true, replacedByJti: newJti },
      }),
      prisma.refreshToken.create({
        data: { userId, jti: newJti, tokenHash: newTokenHash, expiresAt },
      }),
    ]);

    // Issue new access token
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    setRefreshCookie(res, newRefreshToken, expiresAt);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      const { jti } = decoded;
      await prisma.refreshToken.updateMany({ where: { jti }, data: { isRevoked: true } });
    } catch (_) {
      // ignore
    }
  }
  clearRefreshCookie(res);
  return res.json({ message: 'Logged out' });
});

module.exports = router;

// helpers
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

function clearRefreshCookie(res) {
  const isProd = NODE_ENV === 'production';
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}

function parseExpiryToMs(exp) {
  if (!exp) return 0;
  const match = String(exp).match(/^(\d+)([smhd])?$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}


