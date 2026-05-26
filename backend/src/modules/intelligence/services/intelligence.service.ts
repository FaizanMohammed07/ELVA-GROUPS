import { Types } from 'mongoose';
import { ensureGlobalConfig, IGlobalConfig } from '../models/global-config.model';
import { MoldModel, IMold } from '../models/mold.model';
import { AIAnalysisModel, IAIAnalysis, ICostBreakdown, IDetectedMaterial } from '../models/ai-analysis.model';
import { MaterialModel, IMaterial } from '../../materials/models/material.model';
import { analyzeWithOpenRouter, AIProductAnalysis } from './openrouter.service';

// ─── Psychological rounding ────────────────────────────────────────────────
function psychologicalPrice(price: number): number {
  if (price <= 0) return 0;
  const rounded = Math.round(price);
  // Find nearest "9" ending: ₹349, ₹399, ₹499 etc.
  const base = Math.floor(rounded / 50) * 50;
  const candidates = [base - 1, base + 49, base + 99];
  return candidates.reduce((prev, curr) =>
    Math.abs(curr - rounded) < Math.abs(prev - rounded) ? curr : prev,
  );
}

// ─── Fuzzy material matching ───────────────────────────────────────────────
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchScore(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const aWords = new Set(na.split(' '));
  const bWords = nb.split(' ');
  const overlap = bWords.filter((w) => aWords.has(w)).length;
  return overlap / Math.max(aWords.size, bWords.length);
}

async function findBestMaterialMatch(
  aiName: string,
  materials: IMaterial[],
): Promise<IMaterial | null> {
  let best: IMaterial | null = null;
  let bestScore = 0.4; // min threshold
  for (const m of materials) {
    const score = matchScore(aiName, m.name);
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

async function findBestMoldMatch(
  suggestedMold: string | null,
  molds: IMold[],
): Promise<IMold | null> {
  if (!suggestedMold) return null;
  let best: IMold | null = null;
  let bestScore = 0.3;
  for (const m of molds) {
    // Check name + tags
    const nameScore = matchScore(suggestedMold, m.name);
    const tagScore = m.tags.reduce((max, t) => Math.max(max, matchScore(suggestedMold, t)), 0);
    const score = Math.max(nameScore, tagScore);
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

// ─── Unit normaliser — convert AI unit to match Material unit ─────────────
function normaliseQuantity(qty: number, fromUnit: string, toUnit: string): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();
  if (from === to) return qty;
  if (from === 'kg' && to === 'g') return qty * 1000;
  if (from === 'g' && to === 'kg') return qty / 1000;
  if (from === 'l' && to === 'ml') return qty * 1000;
  if (from === 'ml' && to === 'l') return qty / 1000;
  return qty; // best-effort
}

// ─── Cost computation ──────────────────────────────────────────────────────
function computeCosts(
  detectedMaterials: IDetectedMaterial[],
  mold: IMold | null,
  laborHours: number,
  cfg: IGlobalConfig,
): ICostBreakdown {
  const materialCost = detectedMaterials.reduce((s, m) => s + m.totalCost, 0);
  const moldDepreciation = mold ? mold.depreciationPerUse : 0;
  const laborCost = laborHours * cfg.laborRatePerHour;
  const packagingCost = cfg.basePackagingCost;

  const subtotal = materialCost + moldDepreciation + laborCost + packagingCost;

  const wastageBuffer = subtotal * (cfg.wastageBufferPercent / 100);
  const operationalBuffer = subtotal * (cfg.operationalBufferPercent / 100);
  const marketingBuffer = subtotal * (cfg.marketingBufferPercent / 100);
  const riskBuffer = subtotal * (cfg.riskBufferPercent / 100);

  const trueCost = subtotal + wastageBuffer + operationalBuffer + marketingBuffer + riskBuffer;

  const suggestedPrice = trueCost / (1 - 0.40);   // 40% margin
  const premiumPrice = trueCost / (1 - 0.55);     // 55% margin
  const luxuryPrice = trueCost / (1 - 0.70);      // 70% margin

  return {
    materialCost: +materialCost.toFixed(2),
    moldDepreciation: +moldDepreciation.toFixed(2),
    moldName: mold?.name,
    laborCost: +laborCost.toFixed(2),
    packagingCost: +packagingCost.toFixed(2),
    subtotal: +subtotal.toFixed(2),
    wastageBuffer: +wastageBuffer.toFixed(2),
    operationalBuffer: +operationalBuffer.toFixed(2),
    marketingBuffer: +marketingBuffer.toFixed(2),
    riskBuffer: +riskBuffer.toFixed(2),
    trueCost: +trueCost.toFixed(2),
    suggestedPrice: +suggestedPrice.toFixed(2),
    premiumPrice: +premiumPrice.toFixed(2),
    luxuryPrice: +luxuryPrice.toFixed(2),
    psychologicalSuggested: psychologicalPrice(suggestedPrice),
    psychologicalPremium: psychologicalPrice(premiumPrice),
  };
}

// ─── Public API ────────────────────────────────────────────────────────────
export interface AnalyzeProductInput {
  productName: string;
  imageBase64List: string[];
  hints?: {
    approximateWeightGrams?: number;
    dimensions?: string;
    complexityLevel?: 'simple' | 'moderate' | 'complex' | 'premium';
    fragranceIntensity?: 'none' | 'light' | 'medium' | 'strong';
    customizationLevel?: 'none' | 'low' | 'medium' | 'high';
    materialHints?: string;
  };
}

export async function analyzeProduct(input: AnalyzeProductInput): Promise<IAIAnalysis> {
  const cfg = await ensureGlobalConfig();

  if (!cfg.openRouterApiKey) throw new Error('OpenRouter API key not configured in Global Settings');

  // Call AI
  let aiResult: AIProductAnalysis;
  try {
    aiResult = await analyzeWithOpenRouter(
      input.imageBase64List,
      input.hints ?? {},
      cfg.openRouterApiKey,
      cfg.preferredVisionModel,
    );
  } catch (err: any) {
    // Save failed analysis record
    const failed = await AIAnalysisModel.create({
      productName: input.productName,
      imageCount: input.imageBase64List.length,
      userHints: input.hints ?? {},
      aiRawResponse: err.message ?? 'AI call failed',
      status: 'failed',
      errorMessage: err.message ?? 'Unknown AI error',
      costBreakdown: {},
      configSnapshot: {
        laborRatePerHour: cfg.laborRatePerHour,
        basePackagingCost: cfg.basePackagingCost,
        wastageBufferPercent: cfg.wastageBufferPercent,
        operationalBufferPercent: cfg.operationalBufferPercent,
        marketingBufferPercent: cfg.marketingBufferPercent,
        riskBufferPercent: cfg.riskBufferPercent,
      },
    });
    throw err;
  }

  // Load reference data
  const [allMaterials, allMolds] = await Promise.all([
    MaterialModel.find({ isActive: true }).lean<IMaterial[]>(),
    MoldModel.find({ isActive: true }).lean<IMold[]>(),
  ]);

  // Match materials
  const detectedMaterials: IDetectedMaterial[] = await Promise.all(
    aiResult.materials.map(async (m) => {
      const match = await findBestMaterialMatch(m.name, allMaterials);
      const normQty = match
        ? normaliseQuantity(m.estimatedQuantity, m.unit, match.unit)
        : m.estimatedQuantity;
      const costPerUnit = match?.costPerUnit ?? 0;
      const wastagePercent = match?.wastagePercent ?? 0;
      const grossQty = normQty * (1 + wastagePercent / 100);
      const totalCost = grossQty * costPerUnit;

      return {
        name: m.name,
        estimatedQuantity: m.estimatedQuantity,
        unit: m.unit,
        confidence: m.confidence,
        matchedMaterialId: match ? new Types.ObjectId(String(match._id)) : undefined,
        matchedMaterialName: match?.name,
        costPerUnit,
        wastagePercent,
        totalCost: +totalCost.toFixed(4),
      } as IDetectedMaterial;
    }),
  );

  // Match mold
  const mold = await findBestMoldMatch(aiResult.suggestedMold, allMolds);

  // Compute costs
  const costBreakdown = computeCosts(detectedMaterials, mold, aiResult.estimatedLaborHours, cfg);

  const analysis = await AIAnalysisModel.create({
    productName: input.productName,
    detectedCategory: aiResult.detectedCategory,
    imageCount: input.imageBase64List.length,
    userHints: input.hints ?? {},
    aiRawResponse: JSON.stringify(aiResult),
    detectedMaterials,
    suggestedMoldId: mold ? new Types.ObjectId(String(mold._id)) : undefined,
    suggestedMoldName: mold?.name,
    complexityScore: aiResult.complexityScore,
    estimatedLaborHours: aiResult.estimatedLaborHours,
    productionNotes: aiResult.productionNotes,
    accuracyEstimate: aiResult.accuracyEstimate,
    costBreakdown,
    configSnapshot: {
      laborRatePerHour: cfg.laborRatePerHour,
      basePackagingCost: cfg.basePackagingCost,
      wastageBufferPercent: cfg.wastageBufferPercent,
      operationalBufferPercent: cfg.operationalBufferPercent,
      marketingBufferPercent: cfg.marketingBufferPercent,
      riskBufferPercent: cfg.riskBufferPercent,
    },
    status: 'completed',
  });

  return analysis;
}

export async function getAnalysisHistory(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AIAnalysisModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AIAnalysisModel.countDocuments(),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getAnalysisById(id: string) {
  return AIAnalysisModel.findById(id).lean();
}

export async function deleteAnalysis(id: string) {
  return AIAnalysisModel.findByIdAndDelete(id);
}
