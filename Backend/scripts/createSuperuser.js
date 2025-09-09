const bcrypt = require('bcrypt');
const { PrismaClient } = require('../generated/prisma');
require('dotenv').config();

const prisma = new PrismaClient();

async function createSuperuser() {
  try {
    const superuserEmail = process.env.SUPERUSER_EMAIL || 'admin@thiraiview.com';
    const superuserPassword = process.env.SUPERUSER_PASSWORD || 'Admin@123456';
    const superuserUsername = process.env.SUPERUSER_USERNAME || 'superadmin';
    const superuserName = process.env.SUPERUSER_NAME || 'Super Administrator';

    // Check if superuser already exists
    const existingSuperuser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: superuserEmail },
          { username: superuserUsername },
          { role: 'ADMIN' }
        ]
      }
    });

    if (existingSuperuser) {
      console.log('Superuser already exists:', {
        id: existingSuperuser.id,
        email: existingSuperuser.email,
        username: existingSuperuser.username,
        role: existingSuperuser.role
      });
      return existingSuperuser;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superuserPassword, saltRounds);

    // Create the superuser
    const superuser = await prisma.user.create({
      data: {
        name: superuserName,
        email: superuserEmail,
        username: superuserUsername,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true, // Superuser is automatically verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    console.log('✅ Superuser created successfully:');
    console.log({
      id: superuser.id,
      name: superuser.name,
      email: superuser.email,
      username: superuser.username,
      role: superuser.role,
      isVerified: superuser.isVerified,
      createdAt: superuser.createdAt
    });

    console.log('\n📋 Login Credentials:');
    console.log(`Email/Username: ${superuserEmail} or ${superuserUsername}`);
    console.log(`Password: ${superuserPassword}`);
    console.log('\n⚠️  Please change the default password after first login!');

    return superuser;

  } catch (error) {
    console.error('❌ Error creating superuser:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  createSuperuser()
    .then(() => {
      console.log('\n🎉 Superuser setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to create superuser:', error);
      process.exit(1);
    });
}

module.exports = { createSuperuser };
