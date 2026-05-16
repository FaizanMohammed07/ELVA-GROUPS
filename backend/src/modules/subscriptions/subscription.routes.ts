import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import mongoose from 'mongoose';

const SubscriptionBoxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  frequency: { type: String, enum: ['monthly', 'quarterly', 'bi-annual'], default: 'monthly' },
  images: [String],
  isActive: { type: Boolean, default: true },
  maxSubscribers: Number,
  currentSubscribers: { type: Number, default: 0 },
}, { timestamps: true });

const UserSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boxId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionBox', required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  nextBillingDate: Date,
  shippingAddress: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const SubscriptionBox = mongoose.model('SubscriptionBox', SubscriptionBoxSchema);
const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);

export const subscriptionRouter = Router();

subscriptionRouter.get('/boxes', async (_req, res) => {
  const boxes = await SubscriptionBox.find({ isActive: true });
  sendSuccess(res, boxes, 'Subscription boxes');
});

subscriptionRouter.get('/boxes/:id', async (req, res) => {
  const box = await SubscriptionBox.findById(req.params.id);
  sendSuccess(res, box, 'Box details');
});

subscriptionRouter.use(authenticate);
subscriptionRouter.get('/my', async (req: any, res) => {
  const subs = await UserSubscription.find({ userId: req.user.id }).populate('boxId');
  sendSuccess(res, subs, 'My subscriptions');
});

subscriptionRouter.post('/', async (req: any, res) => {
  const sub = await UserSubscription.create({ ...req.body, userId: req.user.id });
  sendCreated(res, sub, 'Subscribed successfully');
});

subscriptionRouter.patch('/:id/cancel', async (req: any, res) => {
  await UserSubscription.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: { status: 'cancelled' } });
  sendSuccess(res, null, 'Subscription cancelled');
});

subscriptionRouter.use(requireAdmin);
subscriptionRouter.post('/boxes', async (req, res) => {
  const box = await SubscriptionBox.create(req.body);
  sendCreated(res, box, 'Box created');
});
