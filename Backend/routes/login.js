const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma'); // adjust path if needed

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // Short-lived access token
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';

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

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Generate Access Token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // ✅ Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // ✅ Return both tokens (you can also set refreshToken in HttpOnly cookie)
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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
