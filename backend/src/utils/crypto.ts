import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, env.BCRYPT_ROUNDS);

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const generateRandomToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateDeviceFingerprint = (
  userAgent: string,
  ip: string,
  acceptLanguage: string,
): string => {
  const data = `${userAgent}:${ip}:${acceptLanguage}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};
