import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketReply {
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  replies: ITicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<ITicketReply>(
  { message: { type: String, required: true }, isAdmin: { type: Boolean, default: false } },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const ticketSchema = new Schema<ISupportTicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    replies: [replySchema],
  },
  { timestamps: true },
);

ticketSchema.virtual('id').get(function () { return this._id.toHexString(); });
ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });

export const SupportTicketModel = mongoose.model<ISupportTicket>('SupportTicket', ticketSchema);
