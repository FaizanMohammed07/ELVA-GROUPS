export type ProductCategory =
  | 'premium-candles'
  | 'personalized-gifts'
  | 'clay-art'
  | 'home-decor'
  | 'couple-collections'
  | 'wedding-collections'
  | 'festival-collections'
  | 'corporate-gifting'
  | 'luxury-hampers'
  | 'subscription-boxes'
  | 'limited-edition'
  | 'creator-collaborations';

export interface IPersonalizationField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  required: boolean;
}

export interface IProductVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  stock: number;
  sku: string;
  thumbnail: string;
  images: string[];
  variants?: IProductVariant[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  isPersonalizable: boolean;
  personalizationFields?: IPersonalizationField[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
  isActive: boolean;
  weight?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}
