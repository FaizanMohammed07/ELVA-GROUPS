import { IProductCosting } from './models/product-costing.model';

/**
 * Core calculation engine — deterministic, pure function.
 * Takes partial costing data, returns fully computed figures.
 * Used by both the save route and the real-time /calculate endpoint.
 */
export function computeCosting(data: Partial<IProductCosting>): Partial<IProductCosting> {
  // ── Material cost (each line already has totalCost) ──────────────────────
  const totalMaterialCost = (data.materials || []).reduce((s, m) => s + m.totalCost, 0);

  // ── Labor: convert total minutes to hours ────────────────────────────────
  const totalMinutes = (data.laborHoursRequired || 0) * 60 + (data.laborMinutesRequired || 0);
  const totalLaborCost = (totalMinutes / 60) * (data.laborRatePerHour || 0);

  // ── Utilities ────────────────────────────────────────────────────────────
  const totalUtilityCost =
    (data.electricityUnits || 0) * (data.electricityRatePerUnit || 8) +
    (data.waterCost || 0);

  // ── Machine ──────────────────────────────────────────────────────────────
  const totalMachineCost = (data.machineHours || 0) * (data.machineRatePerHour || 0);

  // ── Packaging ────────────────────────────────────────────────────────────
  const totalPackagingCost = (data.packagingItems || []).reduce((s, p) => s + p.totalCost, 0);

  // ── True production cost (dims 1–8 + misc) ───────────────────────────────
  const trueProductionCost =
    totalMaterialCost +
    totalLaborCost +
    totalUtilityCost +
    totalMachineCost +
    totalPackagingCost +
    (data.brandingCostPerUnit || 0) +
    (data.operationalCostPerUnit || 0) +
    (data.marketingCostPerUnit || 0) +
    (data.miscCost || 0);

  // ── Fee amounts at current selling price ─────────────────────────────────
  const sp = data.currentSellingPrice || 0;
  const platformFeeAmount = sp * (data.platformFeePercent || 0) / 100;
  const paymentGatewayFeeAmount = sp * (data.paymentGatewayFeePercent || 2) / 100;
  const returnRiskAmount = sp * (data.returnRiskPercent || 0) / 100;

  const totalTrueCost =
    trueProductionCost +
    platformFeeAmount +
    paymentGatewayFeeAmount +
    (data.deliveryRiskBuffer || 0) +
    returnRiskAmount;

  // ── Suggested prices ─────────────────────────────────────────────────────
  const margin = (data.targetMarginPercent || 40) / 100;
  const rawSuggested = margin < 1 ? trueProductionCost / (1 - margin) : trueProductionCost * 2;
  const psycho = (n: number) => {
    const rounded = Math.ceil(n / 100) * 100;
    return rounded - 1; // ₹499, ₹999, etc.
  };

  const suggestedPrice = Math.round(rawSuggested);
  const budgetPrice = Math.round(trueProductionCost / (1 - 0.30));
  const premiumPrice = Math.round(trueProductionCost / (1 - 0.55));
  const luxuryPrice = Math.round(trueProductionCost / (1 - 0.70));

  // ── Profit at current selling price ──────────────────────────────────────
  const grossProfitAmount = sp - trueProductionCost;
  const grossMarginPercent = sp > 0 ? (grossProfitAmount / sp) * 100 : 0;
  const netProfitAmount = sp - totalTrueCost;
  const netMarginPercent = sp > 0 ? (netProfitAmount / sp) * 100 : 0;
  const roi = trueProductionCost > 0 ? (netProfitAmount / trueProductionCost) * 100 : 0;

  return {
    totalMaterialCost: round2(totalMaterialCost),
    totalLaborCost: round2(totalLaborCost),
    totalUtilityCost: round2(totalUtilityCost),
    totalMachineCost: round2(totalMachineCost),
    totalPackagingCost: round2(totalPackagingCost),
    trueProductionCost: round2(trueProductionCost),
    platformFeeAmount: round2(platformFeeAmount),
    paymentGatewayFeeAmount: round2(paymentGatewayFeeAmount),
    returnRiskAmount: round2(returnRiskAmount),
    totalTrueCost: round2(totalTrueCost),
    suggestedPrice,
    suggestedPricePsychological: psycho(rawSuggested),
    budgetPrice,
    premiumPrice,
    luxuryPrice,
    grossProfitAmount: round2(grossProfitAmount),
    grossMarginPercent: round2(grossMarginPercent),
    netProfitAmount: round2(netProfitAmount),
    netMarginPercent: round2(netMarginPercent),
    roi: round2(roi),
  };
}

/** Compute a single material line's totalCost */
export function computeMaterialLine(qty: number, cost: number, wastage: number): number {
  return round2(qty * cost * (1 + wastage / 100));
}

const round2 = (n: number) => Math.round(n * 100) / 100;
