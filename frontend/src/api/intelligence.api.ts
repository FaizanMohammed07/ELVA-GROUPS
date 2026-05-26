import { apiClient } from './client';

const BASE = '/intelligence';

export interface GlobalConfig {
  laborRatePerHour: number;
  basePackagingCost: number;
  wastageBufferPercent: number;
  operationalBufferPercent: number;
  marketingBufferPercent: number;
  riskBufferPercent: number;
  defaultTargetMarginPercent: number;
  openRouterApiKey: string;
  preferredVisionModel: string;
}

export interface Mold {
  _id: string;
  id: string;
  name: string;
  category: string;
  cavityCount: number;
  purchaseCost: number;
  estimatedUses: number;
  depreciationPerUse: number;
  complexityScore: number;
  tags: string[];
  isActive: boolean;
}

export interface DetectedMaterial {
  name: string;
  estimatedQuantity: number;
  unit: string;
  confidence: number;
  matchedMaterialId?: string;
  matchedMaterialName?: string;
  costPerUnit: number;
  wastagePercent: number;
  totalCost: number;
}

export interface CostBreakdown {
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
  suggestedPrice: number;
  premiumPrice: number;
  luxuryPrice: number;
  psychologicalSuggested: number;
  psychologicalPremium: number;
}

export interface AIAnalysis {
  _id: string;
  id: string;
  productName: string;
  detectedCategory: string;
  imageCount: number;
  userHints: Record<string, any>;
  detectedMaterials: DetectedMaterial[];
  suggestedMoldName?: string;
  complexityScore: number;
  estimatedLaborHours: number;
  productionNotes: string;
  accuracyEstimate: number;
  costBreakdown: CostBreakdown;
  status: 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface AnalyzeProductPayload {
  productName: string;
  images: File[];
  hints?: {
    approximateWeightGrams?: number;
    dimensions?: string;
    complexityLevel?: 'simple' | 'moderate' | 'complex' | 'premium';
    fragranceIntensity?: 'none' | 'light' | 'medium' | 'strong';
    customizationLevel?: 'none' | 'low' | 'medium' | 'high';
    materialHints?: string;
  };
}

export const intelligenceApi = {
  // Config
  getConfig: () => apiClient.get<{ data: GlobalConfig }>(`${BASE}/config`),
  updateConfig: (data: Partial<GlobalConfig>) => apiClient.patch<{ data: GlobalConfig }>(`${BASE}/config`, data),

  // Molds
  getMolds: (params?: { category?: string; active?: boolean }) =>
    apiClient.get<{ data: Mold[] }>(`${BASE}/molds`, { params }),
  createMold: (data: Partial<Mold>) => apiClient.post<{ data: Mold }>(`${BASE}/molds`, data),
  updateMold: (id: string, data: Partial<Mold>) => apiClient.patch<{ data: Mold }>(`${BASE}/molds/${id}`, data),
  deleteMold: (id: string) => apiClient.delete(`${BASE}/molds/${id}`),

  // Analysis
  analyzeProduct: (payload: AnalyzeProductPayload) => {
    const form = new FormData();
    form.append('productName', payload.productName);
    payload.images.forEach((img) => form.append('images', img));
    if (payload.hints && Object.keys(payload.hints).length > 0) {
      form.append('hints', JSON.stringify(payload.hints));
    }
    return apiClient.post<{ data: AIAnalysis }>(`${BASE}/analyze`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  getAnalyses: (page = 1, limit = 20) =>
    apiClient.get<{ data: { items: AIAnalysis[]; total: number; page: number; pages: number } }>(
      `${BASE}/analyses`, { params: { page, limit } },
    ),
  getAnalysis: (id: string) => apiClient.get<{ data: AIAnalysis }>(`${BASE}/analyses/${id}`),
  deleteAnalysis: (id: string) => apiClient.delete(`${BASE}/analyses/${id}`),
};
