import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDetectedMaterial {
  name: string;
  estimatedQuantity: number;
  unit: string;
  confidence: number;
  matchedMaterialId?: mongoose.Types.ObjectId;
  matchedMaterialName?: string;
  costPerUnit: number;
  wastagePercent: number;
  totalCost: number;
}

export interface ICostBreakdown {
  materialCost: number;
  moldDepreciation: number;
  moldName?: string;
  laborCost: number;
  packagingCost: number;
  subtotal: number;
  wastageBuffer: number;
  operationalBuffer: number;
  marketingBuffer: number;
  riskBuffer: number;
  trueCost: number;
  suggestedPrice: number;    // 40% margin
  premiumPrice: number;      // 55% margin
  luxuryPrice: number;       // 70% margin
  psychologicalSuggested: number;
  psychologicalPremium: number;
}

export interface IAIAnalysis extends Document {
  id: string;
  productName: string;
  detectedCategory: string;
  imageCount: number;
  userHints: {
    approximateWeightGrams?: number;
    dimensions?: string;
    complexityLevel?: 'simple' | 'moderate' | 'complex' | 'premium';
    fragranceIntensity?: 'none' | 'light' | 'medium' | 'strong';
    customizationLevel?: 'none' | 'low' | 'medium' | 'high';
    materialHints?: string;
  };
  // Raw AI output
  aiRawResponse: string;
  // Processed result
  detectedMaterials: IDetectedMaterial[];
  suggestedMoldId?: mongoose.Types.ObjectId;
  suggestedMoldName?: string;
  complexityScore: number;
  estimatedLaborHours: number;
  productionNotes: string;
  accuracyEstimate: number;
  // Computed costs
  costBreakdown: ICostBreakdown;
  // Config snapshot at time of analysis
  configSnapshot: {
    laborRatePerHour: number;
    basePackagingCost: number;
    wastageBufferPercent: number;
    operationalBufferPercent: number;
    marketingBufferPercent: number;
    riskBufferPercent: number;
  };
  status: 'completed' | 'failed';
  errorMessage?: string;
  linkedCostingId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DetectedMaterialSchema = new Schema<IDetectedMaterial>({
  name: String,
  estimatedQuantity: Number,
  unit: String,
  confidence: Number,
  matchedMaterialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  matchedMaterialName: String,
  costPerUnit: { type: Number, default: 0 },
  wastagePercent: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
}, { _id: false });

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    productName: { type: String, required: true },
    detectedCategory: { type: String, default: 'unknown' },
    imageCount: { type: Number, default: 0 },
    userHints: {
      approximateWeightGrams: Number,
      dimensions: String,
      complexityLevel: String,
      fragranceIntensity: String,
      customizationLevel: String,
      materialHints: String,
    },
    aiRawResponse: { type: String, default: '' },
    detectedMaterials: [DetectedMaterialSchema],
    suggestedMoldId: { type: Schema.Types.ObjectId, ref: 'Mold' },
    suggestedMoldName: String,
    complexityScore: { type: Number, default: 5 },
    estimatedLaborHours: { type: Number, default: 0 },
    productionNotes: { type: String, default: '' },
    accuracyEstimate: { type: Number, default: 75 },
    costBreakdown: {
      materialCost: { type: Number, default: 0 },
      moldDepreciation: { type: Number, default: 0 },
      moldName: String,
      laborCost: { type: Number, default: 0 },
      packagingCost: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      wastageBuffer: { type: Number, default: 0 },
      operationalBuffer: { type: Number, default: 0 },
      marketingBuffer: { type: Number, default: 0 },
      riskBuffer: { type: Number, default: 0 },
      trueCost: { type: Number, default: 0 },
      suggestedPrice: { type: Number, default: 0 },
      premiumPrice: { type: Number, default: 0 },
      luxuryPrice: { type: Number, default: 0 },
      psychologicalSuggested: { type: Number, default: 0 },
      psychologicalPremium: { type: Number, default: 0 },
    },
    configSnapshot: {
      laborRatePerHour: Number,
      basePackagingCost: Number,
      wastageBufferPercent: Number,
      operationalBufferPercent: Number,
      marketingBufferPercent: Number,
      riskBufferPercent: Number,
    },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    errorMessage: String,
    linkedCostingId: { type: Schema.Types.ObjectId, ref: 'ProductCosting' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

AIAnalysisSchema.virtual('id').get(function () { return this._id.toHexString(); });
AIAnalysisSchema.index({ createdAt: -1 });
AIAnalysisSchema.index({ status: 1 });

export const AIAnalysisModel: Model<IAIAnalysis> =
  mongoose.models['AIAnalysis'] ||
  mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
