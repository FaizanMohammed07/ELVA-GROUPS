import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { uploadRateLimiter } from '../../middleware/rateLimiter';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID ?? '', secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '' },
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    } else {
      cb(null, true);
    }
  },
});

const uploadToS3 = async (buffer: Buffer, key: string, mimeType: string): Promise<string> => {
  await s3.send(new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read' as any,
  }));
  return env.AWS_S3_CDN_URL
    ? `${env.AWS_S3_CDN_URL}/${key}`
    : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

export const uploadRouter = Router();

uploadRouter.use(authenticate, requireAdmin, uploadRateLimiter);

uploadRouter.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');

  const optimized = await sharp(req.file.buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const key = `products/${uuidv4()}.webp`;
  const url = await uploadToS3(optimized, key, 'image/webp');
  sendSuccess(res, { url, key }, 'Image uploaded');
});

uploadRouter.post('/images', upload.array('images', 10), async (req: Request, res: Response) => {
  if (!req.files?.length) throw AppError.badRequest('No files uploaded');
  const files = req.files as Express.Multer.File[];

  const urls = await Promise.all(
    files.map(async (file) => {
      const optimized = await sharp(file.buffer).resize({ width: 1200, fit: 'inside' }).webp({ quality: 85 }).toBuffer();
      const key = `products/${uuidv4()}.webp`;
      return uploadToS3(optimized, key, 'image/webp');
    }),
  );
  sendSuccess(res, { urls }, 'Images uploaded');
});
