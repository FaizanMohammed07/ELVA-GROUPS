import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { uploadRateLimiter } from '../../middleware/rateLimiter';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
  },
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

const uploadToS3 = async (buffer: Buffer, key: string): Promise<string> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
      // ACL removed — configure public access via S3 bucket policy instead
    }),
  );

  return env.AWS_S3_CDN_URL
    ? `${env.AWS_S3_CDN_URL}/${key}`
    : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

// Multer error → AppError so it reaches the global error handler
const handleMulterError = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return next(AppError.badRequest('File too large. Max 10MB per image.'));
    if (err.code === 'LIMIT_FILE_COUNT') return next(AppError.badRequest('Too many files. Max 10 images at once.'));
    return next(AppError.badRequest(err.message));
  }
  if (err) return next(AppError.badRequest(err.message));
  next();
};

export const uploadRouter = Router();
uploadRouter.use(authenticate, requireAdmin, uploadRateLimiter);

// ── Single image ────────────────────────────────────────────────────────────
uploadRouter.post(
  '/image',
  (req, res, next) => upload.single('image')(req, res, (err) => handleMulterError(err, req, res, next)),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('No file uploaded. Send the file in the "image" field.');

    const optimized = await sharp(req.file.buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const key = `products/${uuidv4()}.webp`;
    const url = await uploadToS3(optimized, key);

    sendSuccess(res, { url, key }, 'Image uploaded successfully');
  }),
);

// ── Multiple images (up to 10) ──────────────────────────────────────────────
uploadRouter.post(
  '/images',
  (req, res, next) => upload.array('images', 10)(req, res, (err) => handleMulterError(err, req, res, next)),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) throw AppError.badRequest('No files uploaded. Send files in the "images" field.');

    const urls = await Promise.all(
      files.map(async (file) => {
        const optimized = await sharp(file.buffer)
          .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();

        const key = `products/${uuidv4()}.webp`;
        return uploadToS3(optimized, key);
      }),
    );

    sendSuccess(res, { urls, count: urls.length }, `${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
  }),
);
