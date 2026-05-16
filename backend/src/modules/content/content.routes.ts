import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: String, subtitle: String, image: { type: String, required: true },
  mobileImage: String, link: String, linkText: String,
  position: { type: String, enum: ['hero', 'mid', 'category', 'popup'], default: 'hero' },
  isActive: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  startsAt: Date, expiresAt: Date,
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true },
  content: { type: String, required: true }, excerpt: String, thumbnail: String,
  tags: [String], isPublished: { type: Boolean, default: false },
  publishedAt: Date, author: String, seo: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Banner = mongoose.model('Banner', BannerSchema);
const Blog = mongoose.model('Blog', BlogSchema);

export const contentRouter = Router();

contentRouter.get('/banners', async (_req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
  sendSuccess(res, banners, 'Banners fetched');
});

contentRouter.get('/blogs', async (_req, res) => {
  const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(20);
  sendSuccess(res, blogs, 'Blogs fetched');
});

contentRouter.get('/blogs/:slug', async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
  sendSuccess(res, blog, 'Blog fetched');
});

contentRouter.use(authenticate, requireAdmin);
contentRouter.post('/banners', async (req, res) => { const b = await Banner.create(req.body); sendCreated(res, b, 'Banner created'); });
contentRouter.put('/banners/:id', async (req, res) => { const b = await Banner.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); sendSuccess(res, b, 'Banner updated'); });
contentRouter.delete('/banners/:id', async (req, res) => { await Banner.findByIdAndDelete(req.params.id); sendSuccess(res, null, 'Banner deleted'); });
contentRouter.post('/blogs', async (req, res) => { const b = await Blog.create(req.body); sendCreated(res, b, 'Blog created'); });
contentRouter.put('/blogs/:id', async (req, res) => { const b = await Blog.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); sendSuccess(res, b, 'Blog updated'); });
