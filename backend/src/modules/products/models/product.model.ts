import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock';
export type ProductType = 'simple' | 'variable' | 'digital' | 'subscription';

export interface IProductVariant {
  _id?: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  images?: string[];
  isDefault: boolean;
}

export interface IPersonalizationField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'image';
  required: boolean;
  options?: string[];
  maxLength?: number;
  placeholder?: string;
}

export interface IProduct extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  type: ProductType;
  status: ProductStatus;
  categoryIds: mongoose.Types.ObjectId[];
  tags: string[];
  images: string[];
  thumbnail: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: { l: number; w: number; h: number };
  variants: IProductVariant[];
  attributes: Record<string, string[]>;
  isPersonalizable: boolean;
  personalizationFields: IPersonalizationField[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
  collections: string[];
  vendor?: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  shippingInfo: {
    isFreeShipping: boolean;
    estimatedDays: number;
    shipsFrom: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalizationFieldSchema = new Schema<IPersonalizationField>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'select', 'color', 'image'], required: true },
  required: { type: Boolean, default: false },
  options: [String],
  maxLength: Number,
  placeholder: String,
}, { _id: false });

const VariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  weight: Number,
  images: [String],
  isDefault: { type: Boolean, default: false },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 500 },
    sku: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['simple', 'variable', 'digital', 'subscription'], default: 'simple' },
    status: { type: String, enum: ['draft', 'active', 'archived', 'out_of_stock'], default: 'draft', index: true },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: String, lowercase: true, trim: true }],
    images: [{ type: String }],
    thumbnail: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    weight: Number,
    dimensions: {
      l: Number,
      w: Number,
      h: Number,
      _id: false,
    },
    variants: [VariantSchema],
    attributes: { type: Schema.Types.Mixed, default: {} },
    isPersonalizable: { type: Boolean, default: false, index: true },
    personalizationFields: [PersonalizationFieldSchema],
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isLimitedEdition: { type: Boolean, default: false },
    collections: [{ type: String }],
    vendor: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      _id: false,
    },
    shippingInfo: {
      isFreeShipping: { type: Boolean, default: false },
      estimatedDays: { type: Number, default: 5 },
      shipsFrom: { type: String, default: 'India' },
      _id: false,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ status: 1, isNewArrival: 1 });
ProductSchema.index({ status: 1, isBestSeller: 1 });
ProductSchema.index({ categoryIds: 1, status: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1, reviewCount: -1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ProductSchema.virtual('discountPercent').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

ProductSchema.virtual('isInStock').get(function () {
  return this.stock > 0 || this.allowBackorder;
});

export const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
