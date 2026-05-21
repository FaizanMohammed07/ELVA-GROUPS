import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { SupportTicketModel } from './models/ticket.model';

export const supportRouter = Router();

// ── Customer: create a ticket ─────────────────────────────────────────────────
supportRouter.post('/tickets', authenticate, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) throw AppError.badRequest('Subject and message are required');
  const ticket = await SupportTicketModel.create({ user: (req as any).user.id, subject, message });
  sendCreated(res, ticket, 'Ticket submitted');
});

// ── Customer: my tickets ──────────────────────────────────────────────────────
supportRouter.get('/my-tickets', authenticate, async (req, res) => {
  const tickets = await SupportTicketModel.find({ user: (req as any).user.id })
    .sort({ createdAt: -1 })
    .limit(20);
  sendSuccess(res, tickets, 'My tickets');
});

// ── Admin: list all tickets ───────────────────────────────────────────────────
supportRouter.get('/tickets', authenticate, requireAdmin, async (req, res) => {
  const filter: any = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  const limit = Math.min(100, Number(req.query.limit) || 30);

  const tickets = await SupportTicketModel.find(filter)
    .populate('user', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const formatted = tickets.map((t: any) => ({
    ...t,
    user: t.user
      ? { ...t.user, name: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() }
      : null,
  }));

  sendSuccess(res, formatted, 'Support tickets');
});

// ── Admin: reply to ticket ────────────────────────────────────────────────────
supportRouter.post('/tickets/:id/reply', authenticate, requireAdmin, async (req, res) => {
  const { message } = req.body;
  if (!message) throw AppError.badRequest('Message is required');
  const ticket = await SupportTicketModel.findByIdAndUpdate(
    req.params['id'],
    {
      $push: { replies: { message, isAdmin: true } },
      $set: { status: 'in_progress' },
    },
    { new: true },
  ).populate('user', 'firstName lastName email');
  if (!ticket) throw AppError.notFound('Ticket not found');
  sendSuccess(res, ticket, 'Reply sent');
});

// ── Admin: update ticket status ───────────────────────────────────────────────
supportRouter.patch('/tickets/:id', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const ticket = await SupportTicketModel.findByIdAndUpdate(
    req.params['id'],
    { $set: { status } },
    { new: true },
  );
  if (!ticket) throw AppError.notFound('Ticket not found');
  sendSuccess(res, ticket, 'Ticket updated');
});

// ── Public: contact form ──────────────────────────────────────────────────────
export const contactRouter = Router();

contactRouter.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) throw AppError.badRequest('Name, email, and message are required');
  await SupportTicketModel.create({
    user: null,
    subject: subject || `Contact from ${name} <${email}>`,
    message: `From: ${name} (${email})\n\n${message}`,
  } as any);
  sendSuccess(res, null, 'Message received. We\'ll get back to you within 24 hours.');
});
