import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../../../middleware/authenticate';
import { requireSuperAdmin } from '../../../middleware/authorize';
import { aiAnalysisRateLimiter } from '../../../middleware/rateLimiter';
import { sendSuccess } from '../../../utils/apiResponse';
import { AppError } from '../../../utils/appError';
import { ensureGlobalConfig, GlobalConfigModel } from '../models/global-config.model';
import { MoldModel } from '../models/mold.model';
import { analyzeProduct, getAnalysisHistory, getAnalysisById, deleteAnalysis } from '../services/intelligence.service';

const router = Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP allowed.`));
    }
  },
});

const isSuperAdmin = requireSuperAdmin;

// ─── Global Config ────────────────────────────────────────────────────────
// Strip sensitive fields before sending config to client
function sanitizeConfig(cfg: any) {
  const obj = cfg.toObject ? cfg.toObject() : { ...cfg };
  delete obj.openRouterApiKey; // never expose API key in response
  obj.hasApiKey = !!(cfg.openRouterApiKey);
  return obj;
}

router.get('/config', authenticate, isSuperAdmin, async (_req: Request, res: Response) => {
  const cfg = await ensureGlobalConfig();
  sendSuccess(res, sanitizeConfig(cfg));
});

router.patch('/config', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const allowed = [
    'laborRatePerHour', 'basePackagingCost',
    'wastageBufferPercent', 'operationalBufferPercent',
    'marketingBufferPercent', 'riskBufferPercent',
    'defaultTargetMarginPercent', 'openRouterApiKey', 'preferredVisionModel',
  ];
  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const cfg = await GlobalConfigModel.findOneAndUpdate(
    { key: 'default' },
    { $set: updates },
    { new: true, upsert: true },
  );
  sendSuccess(res, sanitizeConfig(cfg), 'Config updated');
});

// ─── Molds ────────────────────────────────────────────────────────────────
router.get('/molds', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const { category, active } = req.query;
  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  if (active !== undefined) filter.isActive = active === 'true';
  const molds = await MoldModel.find(filter).sort({ category: 1, name: 1 });
  sendSuccess(res, molds);
});

router.post('/molds', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const mold = await MoldModel.create(req.body);
  sendSuccess(res, mold, 'Mold created', 201);
});

router.get('/molds/:id', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const mold = await MoldModel.findById(req.params.id);
  if (!mold) throw AppError.notFound('Mold not found');
  sendSuccess(res, mold);
});

router.patch('/molds/:id', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const mold = await MoldModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!mold) throw AppError.notFound('Mold not found');
  sendSuccess(res, mold, 'Mold updated');
});

router.delete('/molds/:id', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const mold = await MoldModel.findByIdAndDelete(req.params.id);
  if (!mold) throw AppError.notFound('Mold not found');
  sendSuccess(res, null, 'Mold deleted');
});

// ─── AI Analysis ─────────────────────────────────────────────────────────
router.post(
  '/analyze',
  authenticate,
  isSuperAdmin,
  aiAnalysisRateLimiter,
  upload.array('images', 5),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) throw AppError.badRequest('At least one product image is required');

    const productName = req.body.productName?.trim();
    if (!productName) throw AppError.badRequest('productName is required');

    const imageBase64List = files.map((f) => {
      const mime = f.mimetype || 'image/jpeg';
      return `data:${mime};base64,${f.buffer.toString('base64')}`;
    });

    let hints: Record<string, any> = {};
    try {
      hints = req.body.hints ? JSON.parse(req.body.hints) : {};
    } catch {
      // ignore malformed hints
    }

    const analysis = await analyzeProduct({ productName, imageBase64List, hints });
    sendSuccess(res, analysis, 'Analysis complete', 201);
  },
);

// ─── Analysis History ──────────────────────────────────────────────────────
router.get('/analyses', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const result = await getAnalysisHistory(page, limit);
  sendSuccess(res, result);
});

router.get('/analyses/:id', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const analysis = await getAnalysisById(String(req.params.id));
  if (!analysis) throw AppError.notFound('Analysis not found');
  sendSuccess(res, analysis);
});

router.delete('/analyses/:id', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  const deleted = await deleteAnalysis(String(req.params.id));
  if (!deleted) throw AppError.notFound('Analysis not found');
  sendSuccess(res, null, 'Analysis deleted');
});

export default router;
