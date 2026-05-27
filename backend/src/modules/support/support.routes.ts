import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { contactRateLimiter } from '../../middleware/rateLimiter';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { SupportTicketModel } from './models/ticket.model';

const createTicketSchema = z.object({
  subject: z.string().min(5).max(200).trim(),
  message: z.string().min(10).max(5000).trim(),
});

const replySchema = z.object({
  message: z.string().min(1).max(2000).trim(),
});

const ticketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
});

const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  subject: z.string().max(200).trim().optional(),
  message: z.string().min(10).max(3000).trim(),
});

export const supportRouter = Router();

supportRouter.post('/tickets', authenticate, validateBody(createTicketSchema), async (req, res) => {
  const { subject, message } = req.body;
  const ticket = await SupportTicketModel.create({ user: req.user!.id, subject, message });
  sendCreated(res, ticket, 'Ticket submitted');
});

supportRouter.get('/my-tickets', authenticate, async (req, res) => {
  const tickets = await SupportTicketModel.find({ user: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(20);
  sendSuccess(res, tickets, 'My tickets');
});

supportRouter.get('/tickets', authenticate, requireAdmin, async (req, res) => {
  const filter: any = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  const limit = Math.min(100, Number(req.query.limit) || 30);
  const tickets = await SupportTicketModel.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  sendSuccess(res, tickets, 'Support tickets');
});

supportRouter.post(
  '/tickets/:id/reply',
  authenticate,
  requireAdmin,
  validateMongoId(),
  validateBody(replySchema),
  async (req, res) => {
    const ticket = await SupportTicketModel.findByIdAndUpdate(
      req.params['id'],
      { $push: { replies: { message: req.body.message, isAdmin: true } }, $set: { status: 'in_progress' } },
      { new: true },
    ).populate('user', 'name email');
    if (!ticket) throw AppError.notFound('Ticket not found');
    sendSuccess(res, ticket, 'Reply sent');
  },
);

supportRouter.patch(
  '/tickets/:id',
  authenticate,
  requireAdmin,
  validateMongoId(),
  validateBody(ticketStatusSchema),
  async (req, res) => {
    const ticket = await SupportTicketModel.findByIdAndUpdate(
      req.params['id'],
      { $set: { status: req.body.status } },
      { new: true },
    );
    if (!ticket) throw AppError.notFound('Ticket not found');
    sendSuccess(res, ticket, 'Ticket updated');
  },
);

// Public contact form — rate-limited to prevent spam
export const contactRouter = Router();

contactRouter.post(
  '/',
  contactRateLimiter,
  validateBody(contactSchema),
  async (req, res) => {
    const { name, email, subject, message } = req.body;
    await SupportTicketModel.create({
      user: null,
      subject: subject || `Contact from ${name} <${email}>`,
      message: `From: ${name} (${email})\n\n${message}`,
    } as any);
    sendSuccess(res, null, "Message received. We'll get back to you within 24 hours.");
  },
);
