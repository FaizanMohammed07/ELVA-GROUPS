import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalConfig extends Document {
  key: string; // always 'default' — singleton
  laborRatePerHour: number;
  basePackagingCost: number;
  wastageBufferPercent: number;
  operationalBufferPercent: number;
  marketingBufferPercent: number;
  riskBufferPercent: number;
  defaultTargetMarginPercent: number;
  openRouterApiKey: string;
  preferredVisionModel: string;
  updatedAt: Date;
}

const GlobalConfigSchema = new Schema<IGlobalConfig>(
  {
    key: { type: String, default: 'default', unique: true },
    laborRatePerHour: { type: Number, default: 80 },
    basePackagingCost: { type: Number, default: 20 },
    wastageBufferPercent: { type: Number, default: 8 },
    operationalBufferPercent: { type: Number, default: 5 },
    marketingBufferPercent: { type: Number, default: 5 },
    riskBufferPercent: { type: Number, default: 3 },
    defaultTargetMarginPercent: { type: Number, default: 40 },
    openRouterApiKey: { type: String, default: '' },
    preferredVisionModel: { type: String, default: 'anthropic/claude-opus-4-5' },
  },
  { timestamps: true },
);

export const GlobalConfigModel: Model<IGlobalConfig> =
  mongoose.models['GlobalConfig'] ||
  mongoose.model<IGlobalConfig>('GlobalConfig', GlobalConfigSchema);

/** Ensure a default config doc exists */
export async function ensureGlobalConfig(): Promise<IGlobalConfig> {
  let cfg = await GlobalConfigModel.findOne({ key: 'default' });
  if (!cfg) cfg = await GlobalConfigModel.create({ key: 'default' });
  return cfg;
}
