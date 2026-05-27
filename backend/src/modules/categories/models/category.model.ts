import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  icon?: string;
  parentId?: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  seo: { title?: string; description?: string; keywords?: string[] };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    image: String,
    banner: String,
    icon: String,
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      _id: false,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

CategorySchema.virtual('id').get(function () { return this._id.toHexString(); });
CategorySchema.index({ parentId: 1, isActive: 1 });

export const CategoryModel: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);
