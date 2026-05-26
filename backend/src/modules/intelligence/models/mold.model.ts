import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMold extends Document {
  id: string;
  name: string;
  category: 'flower' | 'fruit' | 'character' | 'food_dessert' | 'geometric' | 'other';
  cavityCount: number;
  purchaseCost: number;
  estimatedUses: number;
  depreciationPerUse: number; // auto = purchaseCost / (estimatedUses * cavityCount)
  complexityScore: number; // 1–5
  tags: string[]; // for AI fuzzy matching: ['rose', 'flower', 'petal']
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MoldSchema = new Schema<IMold>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['flower', 'fruit', 'character', 'food_dessert', 'geometric', 'other'],
      required: true,
    },
    cavityCount: { type: Number, required: true, min: 1, default: 1 },
    purchaseCost: { type: Number, required: true, min: 0 },
    estimatedUses: { type: Number, required: true, min: 1, default: 150 },
    depreciationPerUse: { type: Number, default: 0 },
    complexityScore: { type: Number, min: 1, max: 5, default: 3 },
    tags: [{ type: String, lowercase: true, trim: true }],
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Auto-calculate depreciation before save
MoldSchema.pre('save', function () {
  this.depreciationPerUse = this.purchaseCost / (this.estimatedUses * this.cavityCount);
});

MoldSchema.virtual('id').get(function () { return this._id.toHexString(); });
MoldSchema.index({ category: 1, isActive: 1 });
MoldSchema.index({ tags: 1 });

export const MoldModel: Model<IMold> =
  mongoose.models['Mold'] || mongoose.model<IMold>('Mold', MoldSchema);
