import mongoose from 'mongoose';
import { UserModel } from '../../modules/users/models/user.model';
import { hashPassword } from '../../utils/crypto';
import { env } from '../../config/env';

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'super_admin' | 'admin';
}

async function seedAccount(account: SeedAccount): Promise<void> {
  const email = account.email.toLowerCase();
  const existing = await UserModel.findOne({ email });

  if (existing) {
    console.log(`  ⚠️  Already exists: ${email} (${existing.role})`);
    return;
  }

  const passwordHash = await hashPassword(account.password);
  const user = await UserModel.create({
    name: account.name,
    email,
    ...(account.phone && { phone: account.phone }),
    passwordHash,
    role: account.role,
    isEmailVerified: true,
    isActive: true,
    tokenVersion: 0,
    permissions: account.role === 'super_admin' ? ['*'] : [],
  });

  console.log(`  ✅ Created ${user.role}: ${user.email}`);
}

async function run() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('\n🌱 Seeding admin accounts...\n');

  await seedAccount({
    name: `${env.SUPER_ADMIN_FIRST_NAME} ${env.SUPER_ADMIN_LAST_NAME}`,
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
    phone: env.SUPER_ADMIN_PHONE,
    role: 'super_admin',
  });

  await seedAccount({
    name: `${env.ADMIN_FIRST_NAME} ${env.ADMIN_LAST_NAME}`,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    phone: env.ADMIN_PHONE,
    role: 'admin',
  });

  console.log('\n📋 Portal Details:');
  console.log(`   Admin Login      : ${env.ADMIN_LOGIN_PATH}`);
  console.log(`   Super Admin Login: ${env.SUPER_ADMIN_LOGIN_PATH}`);
  console.log('\n⚠️  Change passwords after first login!\n');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
