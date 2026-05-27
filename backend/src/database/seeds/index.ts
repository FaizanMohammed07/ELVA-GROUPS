import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elva_dev';

const categories = [
  { name: 'Premium Candles', slug: 'premium-candles', description: 'Hand-poured luxury candles', emoji: '🕯️', isActive: true, sortOrder: 1 },
  { name: 'Personalized Gifts', slug: 'personalized-gifts', description: 'One-of-a-kind personalized gifts', emoji: '🎁', isActive: true, sortOrder: 2 },
  { name: 'Clay Art', slug: 'clay-art', description: 'Handcrafted clay sculptures', emoji: '🏺', isActive: true, sortOrder: 3 },
  { name: 'Home Decor', slug: 'home-decor', description: 'Artisanal home accents', emoji: '🏡', isActive: true, sortOrder: 4 },
  { name: 'Couple Collections', slug: 'couple-collections', description: 'Gifts for couples', emoji: '💑', isActive: true, sortOrder: 5 },
  { name: 'Wedding Collections', slug: 'wedding-collections', description: 'Wedding gifts and decor', emoji: '💍', isActive: true, sortOrder: 6 },
  { name: 'Festival Collections', slug: 'festival-collections', description: 'Festival gifting', emoji: '🪔', isActive: true, sortOrder: 7 },
  { name: 'Corporate Gifting', slug: 'corporate-gifting', description: 'Premium corporate gifts', emoji: '💼', isActive: true, sortOrder: 8 },
  { name: 'Luxury Hampers', slug: 'luxury-hampers', description: 'Curated luxury hampers', emoji: '🧺', isActive: true, sortOrder: 9 },
  { name: 'Subscription Boxes', slug: 'subscription-boxes', description: 'Monthly curated boxes', emoji: '📦', isActive: true, sortOrder: 10 },
  { name: 'Limited Edition', slug: 'limited-edition', description: 'Exclusive limited drops', emoji: '⭐', isActive: true, sortOrder: 11 },
  { name: 'Creator Collaborations', slug: 'creator-collaborations', description: 'Artist collaborations', emoji: '🎨', isActive: true, sortOrder: 12 },
];

const sampleProducts = [
  {
    title: 'Serenity Soy Candle — Sandalwood & Vanilla',
    slug: 'serenity-soy-candle-sandalwood-vanilla',
    shortDescription: 'Hand-poured 100% natural soy wax candle with premium fragrance oils. Burns clean for 45+ hours.',
    category: 'premium-candles',
    tags: ['candle', 'soy', 'sandalwood', 'luxury', 'home'],
    price: 799,
    compareAtPrice: 999,
    stock: 50,
    sku: 'ELUNORA-CND-001',
    thumbnail: '/products/prod-1.png',
    images: ['/products/prod-1.png'],
    rating: 4.8,
    reviewCount: 124,
    salesCount: 340,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isLimitedEdition: false,
    isPersonalizable: false,
    isActive: true,
    weight: 300,
    shippingInfo: { weight: 0.5, dimensions: { length: 10, width: 10, height: 12 } },
  },
  {
    title: 'Personalised Heart Locket Necklace',
    slug: 'personalised-heart-locket-necklace',
    shortDescription: 'Handcrafted sterling silver locket with custom engraving. The perfect gift for someone special.',
    category: 'personalized-gifts',
    tags: ['necklace', 'silver', 'engraving', 'personalized', 'jewelry'],
    price: 1499,
    compareAtPrice: 1999,
    stock: 30,
    sku: 'ELUNORA-PG-001',
    thumbnail: '/products/prod-2.png',
    images: ['/products/prod-2.png'],
    rating: 4.9,
    reviewCount: 89,
    salesCount: 210,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isLimitedEdition: false,
    isPersonalizable: true,
    personalizationFields: [
      { key: 'engraving', label: 'Engraving Text', type: 'text', placeholder: 'E.g. Forever Yours', maxLength: 20, required: true },
      { key: 'font', label: 'Font Style', type: 'select', options: ['Cursive', 'Classic', 'Modern'], required: true },
    ],
    isActive: true,
  },
  {
    title: 'Terracotta Ganesha Sculpture',
    slug: 'terracotta-ganesha-sculpture',
    shortDescription: 'Hand-sculpted terracotta Ganesha idol by master artisans from Jaipur. Each piece is unique.',
    category: 'clay-art',
    tags: ['ganesha', 'terracotta', 'sculpture', 'spiritual', 'handcrafted'],
    price: 2499,
    compareAtPrice: 2999,
    stock: 15,
    sku: 'ELUNORA-CA-001',
    thumbnail: '/products/prod-3.png',
    images: ['/products/prod-3.png'],
    rating: 5.0,
    reviewCount: 34,
    salesCount: 45,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isLimitedEdition: false,
    isPersonalizable: false,
    isActive: true,
  },
  {
    title: 'Luxury New Year Hamper',
    slug: 'luxury-new-year-hamper',
    shortDescription: 'A premium hamper curated with artisanal chocolates, candles, bath bombs, and a personalised card.',
    category: 'luxury-hampers',
    tags: ['hamper', 'luxury', 'new year', 'gift', 'premium'],
    price: 4999,
    compareAtPrice: 6500,
    stock: 20,
    sku: 'ELUNORA-LH-001',
    thumbnail: '/products/prod-4.png',
    images: ['/products/prod-4.png'],
    rating: 4.7,
    reviewCount: 56,
    salesCount: 89,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isLimitedEdition: false,
    isPersonalizable: true,
    personalizationFields: [
      { key: 'message', label: 'Gift Message', type: 'textarea', placeholder: 'Write a personal message...', maxLength: 150, required: false },
    ],
    isActive: true,
  },
  {
    title: 'Couple Portrait — Custom Hand-Painted',
    slug: 'couple-portrait-custom-hand-painted',
    shortDescription: 'Commission a beautiful hand-painted portrait of you and your partner from your favourite photo.',
    category: 'couple-collections',
    tags: ['portrait', 'painting', 'couple', 'custom', 'anniversary'],
    price: 3999,
    compareAtPrice: null,
    stock: 10,
    sku: 'ELUNORA-CC-001',
    thumbnail: '/products/prod-5.png',
    images: ['/products/prod-5.png'],
    rating: 5.0,
    reviewCount: 22,
    salesCount: 33,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isLimitedEdition: true,
    isPersonalizable: true,
    personalizationFields: [
      { key: 'photoUrl', label: 'Reference Photo Description', type: 'textarea', placeholder: 'Describe or upload reference...', maxLength: 300, required: true },
      { key: 'size', label: 'Canvas Size', type: 'select', options: ['A4 (21×29cm)', 'A3 (30×42cm)', 'A2 (42×59cm)'], required: true },
    ],
    isActive: true,
  },
  {
    title: 'Sleek Handcrafted Clay Art Duo',
    slug: 'sleek-handcrafted-clay-art-duo',
    shortDescription: 'Minimalist hand-molded clay vases. Perfectly balancing rustic earthy textures with clean contemporary silhouettes.',
    category: 'clay-art',
    tags: ['clay', 'vases', 'decor', 'minimalist', 'handcrafted'],
    price: 1899,
    compareAtPrice: 2499,
    stock: 25,
    sku: 'ELUNORA-CA-002',
    thumbnail: '/products/prod-6.png',
    images: ['/products/prod-6.png'],
    rating: 4.9,
    reviewCount: 42,
    salesCount: 110,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isLimitedEdition: false,
    isPersonalizable: false,
    isActive: true,
  },
  {
    title: 'Glowing Decorative Clay Diya',
    slug: 'glowing-decorative-clay-diya',
    shortDescription: 'A premium glowing decorative clay lamp with ornate hand-carved details and a burning oil flame.',
    category: 'clay-art',
    tags: ['diya', 'clay', 'festival', 'glowing', 'handcrafted'],
    price: 999,
    compareAtPrice: 1299,
    stock: 40,
    sku: 'ELUNORA-CA-003',
    thumbnail: '/products/prod-7.png',
    images: ['/products/prod-7.png'],
    rating: 4.8,
    reviewCount: 15,
    salesCount: 65,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isLimitedEdition: false,
    isPersonalizable: false,
    isActive: true,
  },
  {
    title: 'Elunora Premium Corporate Gift Box',
    slug: 'elva-premium-corporate-gift-box',
    shortDescription: 'A luxury corporate premium gift box containing an elegant black and gold pen, custom premium black leather diary with golden embossed logo, and a solid brass cardholder.',
    category: 'corporate-gifting',
    tags: ['corporate', 'gift box', 'diary', 'pen', 'premium'],
    price: 3499,
    compareAtPrice: 4500,
    stock: 15,
    sku: 'ELUNORA-CORP-001',
    thumbnail: '/products/prod-8.png',
    images: ['/products/prod-8.png'],
    rating: 5.0,
    reviewCount: 28,
    salesCount: 50,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isLimitedEdition: true,
    isPersonalizable: true,
    personalizationFields: [
      { key: 'logo', label: 'Company Logo Description', type: 'text', placeholder: 'Describe logo engraving...', maxLength: 100, required: false },
    ],
    isActive: true,
  },
];

const adminUser = {
  name: 'ELUNORA Admin',
  email: 'admin@elvagroup.in',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniQf8VDJHQ2LcKv2WxF8KDDIS', // Admin@1234
  role: 'super_admin',
  isEmailVerified: true,
  tokenVersion: 0,
  permissions: [],
};

async function seed() {
  console.log('🌱 Starting ELUNORA database seed...');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Import models dynamically to avoid circular deps
  const { ProductModel } = await import('../../modules/products/models/product.model.js' as any);
  const { CategoryModel } = await import('../../modules/categories/models/category.model.js' as any);
  const { UserModel } = await import('../../modules/users/models/user.model.js' as any);

  // Clear existing seed data
  await ProductModel.deleteMany({ sku: { $regex: /^ELUNORA-/ } });
  await CategoryModel.deleteMany({});
  await UserModel.deleteMany({ email: adminUser.email });
  console.log('🗑️  Cleared existing seed data');

  // Seed categories
  const seededCategories = await CategoryModel.insertMany(categories);
  console.log(`✅ Seeded ${categories.length} categories`);

  // Build category slug -> ObjectId mapping
  const categoryMap: Record<string, any> = {};
  seededCategories.forEach((cat: any) => {
    categoryMap[cat.slug] = cat._id;
  });

  // Seed products with category mapping and required fields
  const productsToSeed = sampleProducts.map((p) => {
    const catId = categoryMap[p.category];
    const categoryIds = catId ? [catId] : [];
    return {
      ...p,
      description: p.shortDescription || p.title,
      status: 'active', // Make sure status is active so API fetches it!
      categoryIds,
    };
  });

  await ProductModel.insertMany(productsToSeed);
  console.log(`✅ Seeded ${productsToSeed.length} products`);

  // Seed admin user
  await UserModel.create(adminUser);
  console.log('✅ Seeded admin user (admin@elvagroup.in / Admin@1234)');

  await mongoose.disconnect();
  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
