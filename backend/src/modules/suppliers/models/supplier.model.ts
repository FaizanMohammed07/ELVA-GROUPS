import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  id: string;
  name: string;
  contactPerson: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  category: 'raw-material' | 'packaging' | 'both' | 'other';
  paymentTerms: 'advance' | 'cod' | 'net15' | 'net30' | 'net60';
  leadTimeDays: number;
  rating: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String },
    city: { type: String },
    category: {
      type: String,
      enum: ['raw-material', 'packaging', 'both', 'other'],
      default: 'raw-material',
    },
    paymentTerms: {
      type: String,
      enum: ['advance', 'cod', 'net15', 'net30', 'net60'],
      default: 'cod',
    },
    leadTimeDays: { type: Number, default: 7, min: 0 },
    rating: { type: Number, default: 3, min: 1, max: 5 },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SupplierSchema.virtual('id').get(function () { return this._id.toHexString(); });

export const SupplierModel: Model<ISupplier> = mongoose.models['Supplier'] || mongoose.model<ISupplier>('Supplier', SupplierSchema);
