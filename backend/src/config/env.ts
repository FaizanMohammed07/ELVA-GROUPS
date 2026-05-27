import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('production'),
  DISABLE_RATE_LIMIT: z.string().optional(), // set to 'true' to explicitly disable — do NOT rely on NODE_ENV
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().default('ELUNORA'),
  APP_URL: z.string().url().default('http://localhost:5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('elva'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookie
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 chars'),
  COOKIE_DOMAIN: z.string().default('localhost'),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET: z.string().default('elva-media'),
  AWS_S3_CDN_URL: z.string().default(''),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default('hello@elva.in'),
  RESEND_FROM_NAME: z.string().default('ELUNORA'),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_CLIENT_ID: z.string().optional(),

  // WhatsApp
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),

  // SMS
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().default('ELVAIN'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // Default super admin account
  SUPER_ADMIN_FIRST_NAME: z.string().default('Super'),
  SUPER_ADMIN_LAST_NAME: z.string().default('Admin'),
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@elva.in'),
  SUPER_ADMIN_PASSWORD: z.string().min(12, 'SUPER_ADMIN_PASSWORD must be at least 12 chars'),
  SUPER_ADMIN_PHONE: z.string().optional(),

  // Default admin account
  ADMIN_FIRST_NAME: z.string().default('Admin'),
  ADMIN_LAST_NAME: z.string().default('ELUNORA'),
  ADMIN_EMAIL: z.string().email().default('admin@elva.in'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 chars'),
  ADMIN_PHONE: z.string().optional(),

  // Admin portal slug & paths
  ADMIN_LOGIN_SLUG: z.string().default('elva-admin-x7k9m2'),
  ADMIN_LOGIN_PATH: z.string().default('/elva-admin-x7k9m2/login'),
  SUPER_ADMIN_LOGIN_SLUG: z.string().default('elva-superadmin-p4k8r5'),
  SUPER_ADMIN_LOGIN_PATH: z.string().default('/elva-superadmin-p4k8r5/login'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Monitoring
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SENTRY_DSN: z.string().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
