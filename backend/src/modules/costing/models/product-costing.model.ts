import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICostingMaterialLine {
  materialId?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  wastagePercent: number;
  supplierName?: string;
  totalCost: number; // auto-computed: quantity * costPerUnit * (1 + wastagePercent/100)
}

export interface ICostingPackagingLine {
  packagingItemId?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  costPerUnit: number;
  totalCost: number;
}

export interface IProductCosting extends Document {
  id: string;
  productId: mongoose.Types.ObjectId;
  productTitle: string;
  productSku: string;
  version: number;

  // Dimension 1: Materials (BOM)
  materials: ICostingMaterialLine[];
  totalMaterialCost: number;

  // Dimension 2+3: Labor & Production Time
  laborHoursRequired: number;
  laborMinutesRequired: number;
  laborRatePerHour: number;
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'premium';
  totalLaborCost: number;

  // Dimension 4: Utilities
  electricityUnits: number;
  electricityRatePerUnit: number;
  waterCost: number;
  totalUtilityCost: number;

  // Dimension 5: Machine Usage
  machineHours: number;
  machineRatePerHour: number;
  totalMachineCost: number;

  // Dimension 6: Packaging
  packagingItems: ICostingPackagingLine[];
  totalPackagingCost: number;

  // Dimension 7: Branding
  brandingCostPerUnit: number;

  // Dimension 8: Operational overhead allocated per unit
  operationalCostPerUnit: number;

  // Dimension 9: Marketing allocation per unit
  marketingCostPerUnit: number;

  // Dimension 10: Platform fee %
  platformFeePercent: number;

  // Dimension 11: Payment gateway fee %
  paymentGatewayFeePercent: number;

  // Dimension 12: Delivery risk buffer (fixed ₹ per order)
  deliveryRiskBuffer: number;

  // Dimension 13: Return/damage risk (% of selling price)
  returnRiskPercent: number;

  // Dimension 14: Miscellaneous
  miscCost: number;

  // ─── Computed totals ────────────────────────────────────────────────────
  trueProductionCost: number; // sum of dims 1-8 + misc
  currentSellingPrice: number;

  // Platform + gateway fees (computed at selling price)
  platformFeeAmount: number;
  paymentGatewayFeeAmount: number;
  returnRiskAmount: number;

  totalTrueCost: number; // everything including fees/risk

  // ─── Pricing suggestions ────────────────────────────────────────────────
  targetMarginPercent: number;
  suggestedPrice: number;           // trueProductionCost / (1 - targetMargin)
  suggestedPricePsychological: number; // round to .99
  budgetPrice: number;              // 30% margin
  premiumPrice: number;             // 55% margin
  luxuryPrice: number;              // 70% margin

  // ─── Profit at current selling price ───────────────────────────────────
  grossProfitAmount: number;
  grossMarginPercent: number;
  netProfitAmount: number;
  netMarginPercent: number;
  roi: number;

  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialLineSchema = new Schema<ICostingMaterialLine>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    costPerUnit: { type: Number, required: true, min: 0 },
    wastagePercent: { type: Number, default: 0, min: 0, max: 100 },
    supplierName: { type: String },
    totalCost: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const PackagingLineSchema = new Schema<ICostingPackagingLine>(
  {
    packagingItemId: { type: Schema.Types.ObjectId, ref: 'PackagingItem' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    costPerUnit: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ProductCostingSchema = new Schema<IProductCosting>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productTitle: { type: String, required: true },
    productSku: { type: String, required: true },
    version: { type: Number, default: 1 },

    materials: [MaterialLineSchema],
    totalMaterialCost: { type: Number, default: 0 },

    laborHoursRequired: { type: Number, default: 0 },
    laborMinutesRequired: { type: Number, default: 0 },
    laborRatePerHour: { type: Number, default: 0 },
    complexityLevel: { type: String, enum: ['simple', 'moderate', 'complex', 'premium'], default: 'simple' },
    totalLaborCost: { type: Number, default: 0 },

    electricityUnits: { type: Number, default: 0 },
    electricityRatePerUnit: { type: Number, default: 8 },
    waterCost: { type: Number, default: 0 },
    totalUtilityCost: { type: Number, default: 0 },

    machineHours: { type: Number, default: 0 },
    machineRatePerHour: { type: Number, default: 0 },
    totalMachineCost: { type: Number, default: 0 },

    packagingItems: [PackagingLineSchema],
    totalPackagingCost: { type: Number, default: 0 },

    brandingCostPerUnit: { type: Number, default: 0 },
    operationalCostPerUnit: { type: Number, default: 0 },
    marketingCostPerUnit: { type: Number, default: 0 },
    platformFeePercent: { type: Number, default: 0 },
    paymentGatewayFeePercent: { type: Number, default: 2 },
    deliveryRiskBuffer: { type: Number, default: 0 },
    returnRiskPercent: { type: Number, default: 0 },
    miscCost: { type: Number, default: 0 },

    trueProductionCost: { type: Number, default: 0 },
    currentSellingPrice: { type: Number, default: 0 },
    platformFeeAmount: { type: Number, default: 0 },
    paymentGatewayFeeAmount: { type: Number, default: 0 },
    returnRiskAmount: { type: Number, default: 0 },
    totalTrueCost: { type: Number, default: 0 },

    targetMarginPercent: { type: Number, default: 40 },
    suggestedPrice: { type: Number, default: 0 },
    suggestedPricePsychological: { type: Number, default: 0 },
    budgetPrice: { type: Number, default: 0 },
    premiumPrice: { type: Number, default: 0 },
    luxuryPrice: { type: Number, default: 0 },

    grossProfitAmount: { type: Number, default: 0 },
    grossMarginPercent: { type: Number, default: 0 },
    netProfitAmount: { type: Number, default: 0 },
    netMarginPercent: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },

    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ProductCostingSchema.index({ productId: 1, isActive: 1 });
ProductCostingSchema.virtual('id').get(function () { return this._id.toHexString(); });

export const ProductCostingModel: Model<IProductCosting> =
  mongoose.models['ProductCosting'] ||
  mongoose.model<IProductCosting>('ProductCosting', ProductCostingSchema);
