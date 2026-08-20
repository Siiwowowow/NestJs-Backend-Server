import { PrismaClient, Role, UserStatus } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'fahimrahman0145@gmail.com';
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || '12345678';
  const name = 'Super Administrator';

  console.log(`🌱 Checking for Super Admin account: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`ℹ️ User ${email} already exists. Updating role to SUPER_ADMIN...`);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    // Ensure AdminProfile exists
    await prisma.adminProfile.upsert({
      where: { userId: existingUser.id },
      update: { department: 'Executive', permissions: ['*'] },
      create: {
        userId: existingUser.id,
        department: 'Executive',
        permissions: ['*'],
        notes: 'Primary Super Administrator',
      },
    });

    console.log('✅ Super Admin profile synchronized.');
    return;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      accounts: {
        create: {
          accountId: email,
          providerId: 'credential',
          password: hashedPassword,
        },
      },
      adminProfile: {
        create: {
          department: 'Executive',
          permissions: ['*'],
          notes: 'Primary Super Administrator',
        },
      },
    },
  });

  console.log(`🎉 Super Admin created successfully: ${user.email} (ID: ${user.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
