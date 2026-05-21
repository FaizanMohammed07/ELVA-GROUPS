import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaterial extends Document {
  id: string;
  name: string;
  sku: string;
  category: 'wax' | 'wick' | 'fragrance' | 'dye' | 'clay' | 'paper' | 'fabric' | 'metal' | 'glass' | 'packaging' | 'chemical' | 'other';
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'm' | 'cm' | 'sqft';
  costPerUnit: number;
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  currentStock: number;
  reorderPoint: number;
  minOrderQty: number;
  wastagePercent: number;
  leadTimeDays: number;
  isActive: boolean;
  priceHistory: Array<{ cost: number; date: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: {
      type: String,
      enum: ['wax', 'wick', 'fragrance', 'dye', 'clay', 'paper', 'fabric', 'metal', 'glass', 'packaging', 'chemical', 'other'],
      required: true,
    },
    unit: { type: String, enum: ['g', 'kg', 'ml', 'L', 'pcs', 'm', 'cm', 'sqft'], required: true },
    costPerUnit: { type: Number, required: true, min: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    currentStock: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 0, min: 0 },
    minOrderQty: { type: Number, default: 1, min: 1 },
    wastagePercent: { type: Number, default: 0, min: 0, max: 100 },
    leadTimeDays: { type: Number, default: 7, min: 0 },
    isActive: { type: Boolean, default: true },
    priceHistory: [
      {
        cost: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String },
        _id: false,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

MaterialSchema.index({ category: 1, isActive: 1 });
MaterialSchema.virtual('id').get(function () { return this._id.toHexString(); });

export const MaterialModel: Model<IMaterial> = mongoose.models['Material'] || mongoose.model<IMaterial>('Material', MaterialSchema);
