import { MoldModel } from '../models/mold.model';
import { MaterialModel } from '../../materials/models/material.model';
import { ensureGlobalConfig, GlobalConfigModel } from '../models/global-config.model';
import { env } from '../../../config/env';

const MOLDS = [
  // Flowers
  { name: 'Flower Mould Set (7 Designs)', category: 'flower', cavityCount: 1, purchaseCost: 399, estimatedUses: 50, complexityScore: 3, tags: ['flower', 'petal', 'floral', 'set'] },
  { name: 'Succulent Mould Set (10 Designs)', category: 'flower', cavityCount: 1, purchaseCost: 518, estimatedUses: 50, complexityScore: 3, tags: ['succulent', 'plant', 'cactus', 'set'] },
  { name: 'Tulip Bouquet Mold', category: 'flower', cavityCount: 1, purchaseCost: 399, estimatedUses: 150, complexityScore: 4, tags: ['tulip', 'bouquet', 'flower'] },
  { name: 'Single Tulip Mold Big', category: 'flower', cavityCount: 1, purchaseCost: 233, estimatedUses: 150, complexityScore: 3, tags: ['tulip', 'single', 'big', 'flower'] },
  { name: 'Rose Mold Big', category: 'flower', cavityCount: 1, purchaseCost: 399, estimatedUses: 150, complexityScore: 4, tags: ['rose', 'big', 'flower', 'floral'] },
  { name: 'Small Rose Mold', category: 'flower', cavityCount: 21, purchaseCost: 299, estimatedUses: 150, complexityScore: 2, tags: ['rose', 'small', 'mini', 'flower'] },
  { name: 'Peony Flower Mold', category: 'flower', cavityCount: 1, purchaseCost: 349, estimatedUses: 150, complexityScore: 4, tags: ['peony', 'flower', 'floral'] },
  { name: 'Daisy Flower Mold', category: 'flower', cavityCount: 1, purchaseCost: 299, estimatedUses: 150, complexityScore: 2, tags: ['daisy', 'flower', 'simple'] },
  { name: 'Leaf Mold', category: 'flower', cavityCount: 1, purchaseCost: 299, estimatedUses: 150, complexityScore: 2, tags: ['leaf', 'leaves', 'botanical'] },
  { name: 'Berries Mold Set', category: 'fruit', cavityCount: 3, purchaseCost: 399, estimatedUses: 150, complexityScore: 3, tags: ['berries', 'blueberry', 'strawberry', 'raspberry', 'fruit'] },
  // Character / Geometric
  { name: 'Heart Mold', category: 'geometric', cavityCount: 1, purchaseCost: 175, estimatedUses: 150, complexityScore: 1, tags: ['heart', 'love', 'simple', 'geometric'] },
  { name: 'Big Teddy Mold', category: 'character', cavityCount: 1, purchaseCost: 298, estimatedUses: 150, complexityScore: 4, tags: ['teddy', 'bear', 'character', 'cute'] },
  // Food / Dessert
  { name: 'Skytail Cream Biscuit Mold', category: 'food_dessert', cavityCount: 1, purchaseCost: 229, estimatedUses: 150, complexityScore: 3, tags: ['biscuit', 'cream', 'cookie', 'dessert'] },
  { name: 'Skytail Different Biscuit Mold', category: 'food_dessert', cavityCount: 1, purchaseCost: 299, estimatedUses: 150, complexityScore: 3, tags: ['biscuit', 'cookie', 'dessert', 'variety'] },
  { name: 'Chocolate Mold', category: 'food_dessert', cavityCount: 1, purchaseCost: 382, estimatedUses: 150, complexityScore: 3, tags: ['chocolate', 'dessert', 'food', 'sweet'] },
  { name: 'Coffee Bean Mold', category: 'food_dessert', cavityCount: 55, purchaseCost: 174, estimatedUses: 150, complexityScore: 2, tags: ['coffee', 'bean', 'espresso', 'tiny'] },
];

const MATERIALS = [
  // Wax
  { name: 'Soy Wax', sku: 'WAX-SOY-001', category: 'wax', unit: 'g', costPerUnit: 0.555, wastagePercent: 5, currentStock: 5000, reorderPoint: 1000, minOrderQty: 500, leadTimeDays: 7 },
  { name: 'Paraffin Wax', sku: 'WAX-PAR-001', category: 'wax', unit: 'g', costPerUnit: 0.12, wastagePercent: 5, currentStock: 3000, reorderPoint: 500, minOrderQty: 500, leadTimeDays: 5 },
  { name: 'Beeswax', sku: 'WAX-BEE-001', category: 'wax', unit: 'g', costPerUnit: 0.7, wastagePercent: 3, currentStock: 1000, reorderPoint: 200, minOrderQty: 250, leadTimeDays: 10 },
  { name: 'Coconut Wax', sku: 'WAX-COC-001', category: 'wax', unit: 'g', costPerUnit: 0.6, wastagePercent: 5, currentStock: 2000, reorderPoint: 500, minOrderQty: 500, leadTimeDays: 7 },
  { name: 'Gel Wax', sku: 'WAX-GEL-001', category: 'wax', unit: 'g', costPerUnit: 0.545, wastagePercent: 5, currentStock: 2000, reorderPoint: 500, minOrderQty: 500, leadTimeDays: 7 },
  // Wick
  { name: 'Cotton Wick', sku: 'WICK-COT-001', category: 'wick', unit: 'pcs', costPerUnit: 2.5, wastagePercent: 2, currentStock: 500, reorderPoint: 100, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Wooden Wick', sku: 'WICK-WOD-001', category: 'wick', unit: 'pcs', costPerUnit: 5, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  // Fragrance
  { name: 'Fragrance Oil', sku: 'FRG-OIL-001', category: 'fragrance', unit: 'ml', costPerUnit: 7.32, wastagePercent: 3, currentStock: 500, reorderPoint: 100, minOrderQty: 60, leadTimeDays: 7 },
  // Containers / Vessels
  { name: 'Glass Jar', sku: 'PKG-JAR-001', category: 'glass', unit: 'pcs', costPerUnit: 45, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 12, leadTimeDays: 7 },
  { name: 'Ceramic Jar', sku: 'PKG-CER-001', category: 'other', unit: 'pcs', costPerUnit: 80, wastagePercent: 2, currentStock: 100, reorderPoint: 20, minOrderQty: 6, leadTimeDays: 10 },
  { name: 'Tin Container', sku: 'PKG-TIN-001', category: 'metal', unit: 'pcs', costPerUnit: 30, wastagePercent: 1, currentStock: 300, reorderPoint: 50, minOrderQty: 12, leadTimeDays: 7 },
  // Dye / Color
  { name: 'Liquid Pigment', sku: 'DYE-LQD-001', category: 'dye', unit: 'ml', costPerUnit: 0.376, wastagePercent: 5, currentStock: 1000, reorderPoint: 200, minOrderQty: 100, leadTimeDays: 5 },
  { name: 'Glitter', sku: 'DYE-GLT-001', category: 'dye', unit: 'g', costPerUnit: 0.5, wastagePercent: 10, currentStock: 500, reorderPoint: 100, minOrderQty: 50, leadTimeDays: 5 },
  // Additives
  { name: 'Dried Flowers', sku: 'ADD-DRY-001', category: 'other', unit: 'g', costPerUnit: 1.5, wastagePercent: 5, currentStock: 300, reorderPoint: 50, minOrderQty: 100, leadTimeDays: 7 },
  // Packaging
  { name: 'Label Sticker', sku: 'PKG-LBL-001', category: 'packaging', unit: 'pcs', costPerUnit: 3, wastagePercent: 2, currentStock: 500, reorderPoint: 100, minOrderQty: 50, leadTimeDays: 3 },
  { name: 'Dust Cover', sku: 'PKG-DST-001', category: 'packaging', unit: 'pcs', costPerUnit: 5, wastagePercent: 2, currentStock: 300, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 3 },
  { name: 'Kraft Packaging', sku: 'PKG-KFT-001', category: 'packaging', unit: 'pcs', costPerUnit: 15, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 25, leadTimeDays: 3 },
  { name: 'Bubble Wrap', sku: 'PKG-BUB-001', category: 'packaging', unit: 'pcs', costPerUnit: 4, wastagePercent: 5, currentStock: 500, reorderPoint: 100, minOrderQty: 100, leadTimeDays: 3 },
  { name: 'Foam Insert', sku: 'PKG-FOM-001', category: 'packaging', unit: 'pcs', costPerUnit: 8, wastagePercent: 3, currentStock: 200, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  // Clay materials
  { name: 'Air Dry Clay', sku: 'CLA-AIR-001', category: 'clay', unit: 'g', costPerUnit: 0.3, wastagePercent: 8, currentStock: 2000, reorderPoint: 500, minOrderQty: 500, leadTimeDays: 7 },
  { name: 'Polymer Clay', sku: 'CLA-POL-001', category: 'clay', unit: 'g', costPerUnit: 0.5, wastagePercent: 5, currentStock: 1000, reorderPoint: 200, minOrderQty: 250, leadTimeDays: 7 },
  { name: 'Resin Clay', sku: 'CLA-RES-001', category: 'clay', unit: 'g', costPerUnit: 0.6, wastagePercent: 5, currentStock: 500, reorderPoint: 100, minOrderQty: 250, leadTimeDays: 7 },
  { name: 'Acrylic Paint', sku: 'DYE-ACR-001', category: 'dye', unit: 'ml', costPerUnit: 0.997, wastagePercent: 10, currentStock: 600, reorderPoint: 100, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Gloss Varnish', sku: 'CHM-GLS-001', category: 'chemical', unit: 'ml', costPerUnit: 0.8, wastagePercent: 5, currentStock: 300, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Resin Coating', sku: 'CHM-RSN-001', category: 'chemical', unit: 'ml', costPerUnit: 1.2, wastagePercent: 5, currentStock: 200, reorderPoint: 50, minOrderQty: 100, leadTimeDays: 7 },
  // Hardware
  { name: 'Hook', sku: 'HRW-HOK-001', category: 'metal', unit: 'pcs', costPerUnit: 3, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Chain', sku: 'HRW-CHN-001', category: 'metal', unit: 'pcs', costPerUnit: 8, wastagePercent: 2, currentStock: 100, reorderPoint: 20, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Bead', sku: 'HRW-BED-001', category: 'other', unit: 'pcs', costPerUnit: 1.5, wastagePercent: 5, currentStock: 500, reorderPoint: 100, minOrderQty: 100, leadTimeDays: 5 },
  { name: 'Charm', sku: 'HRW-CHM-001', category: 'other', unit: 'pcs', costPerUnit: 5, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Magnet', sku: 'HRW-MGT-001', category: 'other', unit: 'pcs', costPerUnit: 4, wastagePercent: 2, currentStock: 300, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
  { name: 'Ring', sku: 'HRW-RNG-001', category: 'metal', unit: 'pcs', costPerUnit: 6, wastagePercent: 2, currentStock: 200, reorderPoint: 50, minOrderQty: 50, leadTimeDays: 5 },
];

export async function seedIntelligenceData() {
  const cfg = await ensureGlobalConfig();

  // Seed API key from env if not yet set in DB
  if (!cfg.openRouterApiKey && env.OPENROUTER_API_KEY) {
    await GlobalConfigModel.updateOne({ key: 'default' }, { $set: { openRouterApiKey: env.OPENROUTER_API_KEY } });
  }

  // Seed molds (skip existing by name)
  for (const moldData of MOLDS) {
    const exists = await MoldModel.findOne({ name: moldData.name });
    if (!exists) {
      await MoldModel.create(moldData);
    }
  }

  // Seed materials (skip existing by SKU)
  for (const matData of MATERIALS) {
    const exists = await MaterialModel.findOne({ sku: matData.sku });
    if (!exists) {
      await MaterialModel.create(matData);
    }
  }

  console.log('Intelligence seed data loaded');
}
