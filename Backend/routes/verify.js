const express = require("express");
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

router.get("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
