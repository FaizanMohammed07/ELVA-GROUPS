import mongoose from 'mongoose';
import { UserModel } from '../../modules/users/models/user.model';
import { hashPassword, comparePassword } from '../../utils/crypto';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

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
    // Sync password if env changed (e.g. after .env quote fix, password rotation)
    // Also unlock account in case repeated failed attempts locked it out
    const matches = await comparePassword(account.password, existing.passwordHash ?? '');
    if (!matches || existing.isLocked || existing.failedLoginAttempts > 0) {
      const updates: Record<string, any> = { isLocked: false, failedLoginAttempts: 0 };
      if (!matches) updates.passwordHash = await hashPassword(account.password);
      await UserModel.updateOne({ email }, { $set: updates });
      logger.info(`Admin account fixed (password re-synced + unlocked): ${email}`);
    }
    return;
  }

  const passwordHash = await hashPassword(account.password);
  await UserModel.create({
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

  logger.info(`Admin account created: ${email} (${account.role})`);
}

/**
 * Called during server bootstrap (after DB connection is established).
 * Idempotent — skips accounts that already exist.
 */
export async function ensureAdminAccounts(): Promise<void> {
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
}

// Standalone CLI runner — only when executed directly
if (require.main === module || process.argv[1]?.includes('super-admin')) {
  (async () => {
    await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
    console.log('\n🌱 Seeding admin accounts...\n');
    await ensureAdminAccounts();
    console.log('\n📋 Portal Details:');
    console.log(`   Admin Login      : ${env.ADMIN_LOGIN_PATH}`);
    console.log(`   Super Admin Login: ${env.SUPER_ADMIN_LOGIN_PATH}`);
    console.log('\n✅ Done\n');
    await mongoose.disconnect();
  })().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
