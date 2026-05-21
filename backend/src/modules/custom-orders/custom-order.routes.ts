import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import multer from 'multer';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

const customOrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: String,
    occasion: String,
    budget: String,
    recipientAge: String,
    recipientGender: String,
    giftFor: String,
    preferences: String,
    message: String,
    timeline: String,
    referenceImages: [String],
    status: { type: String, enum: ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'], default: 'pending' },
    adminNote: String,
    quotedPrice: Number,
  },
  { timestamps: true },
);

customOrderSchema.virtual('id').get(function () { return this._id.toHexString(); });

const CustomOrderModel = mongoose.models['CustomOrder'] ||
  mongoose.model('CustomOrder', customOrderSchema);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 } });

export const customOrderRouter = Router();

// Customer: submit a custom order request
customOrderRouter.post('/', optionalAuthenticate, upload.array('referenceImages', 5), async (req: any, res) => {
  const { occasion, budget, recipientAge, recipientGender, giftFor, preferences, message, timeline, guestEmail } = req.body;
  if (!occasion && !giftFor) throw AppError.badRequest('Please provide at least occasion or gift-for information');

  const order = await CustomOrderModel.create({
    user: req.user?.id || null,
    guestEmail: guestEmail || null,
    occasion, budget, recipientAge, recipientGender, giftFor, preferences, message, timeline,
    referenceImages: [],
  });

  sendCreated(res, order, 'Custom order request submitted. Our team will contact you within 24 hours.');
});

// Customer: my custom orders
customOrderRouter.get('/my', authenticate, async (req: any, res) => {
  const orders = await CustomOrderModel.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);
  sendSuccess(res, orders, 'Custom orders fetched');
});

// Admin: list all custom orders
customOrderRouter.get('/', authenticate, requireAdmin, async (req, res) => {
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await CustomOrderModel.find(filter)
    .populate('user', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 50);
  sendSuccess(res, orders, 'Custom orders fetched');
});

// Admin: update status / add note / quote price
customOrderRouter.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { status, adminNote, quotedPrice } = req.body;
  const order = await CustomOrderModel.findByIdAndUpdate(
    req.params['id'],
    { $set: { status, adminNote, quotedPrice } },
    { new: true },
  );
  if (!order) throw AppError.notFound('Order not found');
  sendSuccess(res, order, 'Order updated');
});
