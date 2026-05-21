import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import {
  Plus, Trash2, Save, Calculator, ChevronDown, ChevronUp,
  Package, Users, Zap, Settings, Tag, Truck, AlertCircle,
  TrendingUp, DollarSign, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';

const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;
const pct = (n: number) => `${(n || 0).toFixed(1)}%`;

const COMPLEXITY_MULTIPLIERS = { simple: 1, moderate: 1.3, complex: 1.7, premium: 2.2 };
const COMPLEXITY_COLORS: Record<string, string> = {
  simple: 'bg-green-100 text-green-700',
  moderate: 'bg-blue-100 text-blue-700',
  complex: 'bg-amber-100 text-amber-700',
  premium: 'bg-purple-100 text-purple-700',
};

type MaterialLine = { materialId?: string; name: string; quantity: number; unit: string; costPerUnit: number; wastagePercent: number; supplierName?: string; totalCost: number };
type PackagingLine = { packagingItemId?: string; name: string; quantity: number; costPerUnit: number; totalCost: number };

const EMPTY_FORM = {
  productId: '', currentSellingPrice: 0,
  materials: [] as MaterialLine[],
  laborHoursRequired: 0, laborMinutesRequired: 0, laborRatePerHour: 120, complexityLevel: 'simple',
  electricityUnits: 0, electricityRatePerUnit: 8, waterCost: 0,
  machineHours: 0, machineRatePerHour: 0,
  packagingItems: [] as PackagingLine[],
  brandingCostPerUnit: 0, operationalCostPerUnit: 0, marketingCostPerUnit: 0,
  platformFeePercent: 0, paymentGatewayFeePercent: 2,
  deliveryRiskBuffer: 50, returnRiskPercent: 2, miscCost: 0,
  targetMarginPercent: 40, notes: '',
};

export default function CostingEnginePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [computed, setComputed] = useState<any>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({
    materials: true, labor: true, utilities: false, packaging: true, overhead: false, pricing: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => apiClient.get('/products', { params: { status: 'all', limit: 200 } }).then(r => r.data.data),
  });
  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => apiClient.get('/materials').then(r => r.data.data),
  });
  const { data: packagingItems } = useQuery({
    queryKey: ['packaging-items'],
    queryFn: () => apiClient.get('/packaging-items').then(r => r.data.data),
  });
  const { data: costings } = useQuery({
    queryKey: ['costings'],
    queryFn: () => apiClient.get('/costing').then(r => r.data.data),
  });

  // Debounced real-time calculation
  const calculate = useCallback(async (data: typeof form) => {
    if (!data.productId) return;
    try {
      const res = await apiClient.post('/costing/calculate', data);
      setComputed(res.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => calculate(form), 400);
    return () => clearTimeout(t);
  }, [form, calculate]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/costing', data),
    onSuccess: () => {
      toast.success('Costing saved!');
      qc.invalidateQueries({ queryKey: ['costings'] });
    },
    onError: () => toast.error('Save failed'),
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const loadCosting = (c: any) => {
    setEditingId(c.id);
    setForm({
      productId: c.productId,
      currentSellingPrice: c.currentSellingPrice,
      materials: c.materials || [],
      laborHoursRequired: c.laborHoursRequired,
      laborMinutesRequired: c.laborMinutesRequired,
      laborRatePerHour: c.laborRatePerHour,
      complexityLevel: c.complexityLevel,
      electricityUnits: c.electricityUnits,
      electricityRatePerUnit: c.electricityRatePerUnit,
      waterCost: c.waterCost,
      machineHours: c.machineHours,
      machineRatePerHour: c.machineRatePerHour,
      packagingItems: c.packagingItems || [],
      brandingCostPerUnit: c.brandingCostPerUnit,
      operationalCostPerUnit: c.operationalCostPerUnit,
      marketingCostPerUnit: c.marketingCostPerUnit,
      platformFeePercent: c.platformFeePercent,
      paymentGatewayFeePercent: c.paymentGatewayFeePercent,
      deliveryRiskBuffer: c.deliveryRiskBuffer,
      returnRiskPercent: c.returnRiskPercent,
      miscCost: c.miscCost,
      targetMarginPercent: c.targetMarginPercent,
      notes: c.notes || '',
    });
  };

  const addMaterialLine = (mat?: any) => {
    const line: MaterialLine = mat
      ? { materialId: mat.id, name: mat.name, quantity: 1, unit: mat.unit, costPerUnit: mat.costPerUnit, wastagePercent: mat.wastagePercent, supplierName: mat.supplierName, totalCost: mat.costPerUnit }
      : { name: '', quantity: 1, unit: 'g', costPerUnit: 0, wastagePercent: 0, totalCost: 0 };
    set('materials', [...form.materials, line]);
  };

  const updateMaterialLine = (i: number, field: string, value: any) => {
    const lines = [...form.materials];
    lines[i] = { ...lines[i], [field]: value };
    // Recompute line total
    const l = lines[i];
    lines[i].totalCost = Math.round(l.quantity * l.costPerUnit * (1 + l.wastagePercent / 100) * 100) / 100;
    set('materials', lines);
  };

  const addPackagingLine = (item?: any) => {
    const line: PackagingLine = item
      ? { packagingItemId: item.id, name: item.name, quantity: 1, costPerUnit: item.costPerUnit, totalCost: item.costPerUnit }
      : { name: '', quantity: 1, costPerUnit: 0, totalCost: 0 };
    set('packagingItems', [...form.packagingItems, line]);
  };

  const updatePackagingLine = (i: number, field: string, value: any) => {
    const lines = [...form.packagingItems];
    lines[i] = { ...lines[i], [field]: value };
    lines[i].totalCost = Math.round(lines[i].quantity * lines[i].costPerUnit * 100) / 100;
    set('packagingItems', lines);
  };

  const handleSave = () => {
    if (!form.productId) { toast.error('Select a product'); return; }
    saveMutation.mutate({ ...form, ...(editingId ? { _id: editingId } : {}) });
  };

  const toggle = (s: string) => setOpen(o => ({ ...o, [s]: !o[s] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Costing Engine</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">14-dimension true cost calculator with 95–99% accuracy</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !form.productId}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save size={15} />
          {saveMutation.isPending ? 'Saving…' : 'Save Costing'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: saved costings ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Saved Costings</p>
          {(costings || []).map((c: any) => (
            <button
              key={c.id}
              onClick={() => loadCosting(c)}
              className={cn(
                'w-full text-left p-3 rounded-lg border text-sm transition-all',
                editingId === c.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              <p className="font-medium font-sans text-gray-800 truncate">{c.productTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-sans text-gray-400">{c.productSku}</span>
                <MarginPill value={c.netMarginPercent} />
              </div>
              <p className="text-[10px] font-sans text-gray-400 mt-0.5">
                Cost: {fmt(c.trueProductionCost)} · Sell: {fmt(c.currentSellingPrice)}
              </p>
            </button>
          ))}
          {!costings?.length && (
            <div className="text-center py-8 text-sm text-gray-400 font-sans bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No costings yet.<br />Select a product to start.
            </div>
          )}
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setEditingId(null); setComputed(null); }}
            className="w-full py-2 text-xs font-sans text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            + New Costing
          </button>
        </div>

        {/* ── Center: form ── */}
        <div className="space-y-4">
          {/* Product selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans mb-2">Product *</label>
            <select
              value={form.productId}
              onChange={e => set('productId', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-indigo-400"
            >
              <option value="">Select product…</option>
              {(products || []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.title} — {p.sku}</option>
              ))}
            </select>
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 font-sans mb-1">Current Selling Price (₹)</label>
                <input type="number" value={form.currentSellingPrice || ''} onChange={e => set('currentSellingPrice', +e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 font-sans mb-1">Complexity Level</label>
                <select value={form.complexityLevel} onChange={e => set('complexityLevel', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400">
                  {Object.keys(COMPLEXITY_MULTIPLIERS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ─ Dim 1: Materials ─ */}
          <Section icon={Package} title="Materials (BOM)" dim="1" open={open.materials} toggle={() => toggle('materials')}
            total={computed?.totalMaterialCost} badge={`${form.materials.length} items`}>
            <div className="space-y-2">
              {form.materials.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5 items-start">
                  <input value={m.name} onChange={e => updateMaterialLine(i, 'name', e.target.value)}
                    placeholder="Name" className="col-span-3 input-sm" />
                  <input type="number" value={m.quantity || ''} onChange={e => updateMaterialLine(i, 'quantity', +e.target.value)}
                    placeholder="Qty" className="col-span-2 input-sm" />
                  <input value={m.unit} onChange={e => updateMaterialLine(i, 'unit', e.target.value)}
                    placeholder="Unit" className="col-span-1 input-sm" />
                  <input type="number" value={m.costPerUnit || ''} onChange={e => updateMaterialLine(i, 'costPerUnit', +e.target.value)}
                    placeholder="₹/unit" className="col-span-2 input-sm" />
                  <input type="number" value={m.wastagePercent || ''} onChange={e => updateMaterialLine(i, 'wastagePercent', +e.target.value)}
                    placeholder="Waste%" className="col-span-2 input-sm" />
                  <div className="col-span-1 flex items-center justify-between">
                    <span className="text-[10px] font-sans font-semibold text-emerald-700">{fmt(m.totalCost)}</span>
                  </div>
                  <button onClick={() => set('materials', form.materials.filter((_, j) => j !== i))}
                    className="col-span-1 text-gray-300 hover:text-red-500 flex justify-center"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={() => addMaterialLine()}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-sans hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                  <Plus size={12} /> Add Row
                </button>
                {(materials || []).length > 0 && (
                  <select onChange={e => { if (e.target.value) { addMaterialLine((materials || []).find((m: any) => m.id === e.target.value)); e.target.value = ''; } }}
                    className="text-xs border border-gray-200 rounded px-2 py-1 font-sans text-gray-600 focus:outline-none">
                    <option value="">+ From registry</option>
                    {(materials || []).map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                  </select>
                )}
              </div>
            </div>
          </Section>

          {/* ─ Dim 2+3: Labor ─ */}
          <Section icon={Users} title="Labor & Time" dim="2–3" open={open.labor} toggle={() => toggle('labor')}
            total={computed?.totalLaborCost}>
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Hours" value={form.laborHoursRequired} onChange={v => set('laborHoursRequired', v)} />
              <NumberField label="Minutes" value={form.laborMinutesRequired} onChange={v => set('laborMinutesRequired', v)} />
              <NumberField label="Rate/hr (₹)" value={form.laborRatePerHour} onChange={v => set('laborRatePerHour', v)} />
            </div>
            <div className="mt-2 p-2.5 bg-blue-50 rounded-lg text-xs font-sans text-blue-700">
              {form.laborHoursRequired}h {form.laborMinutesRequired}m × ₹{form.laborRatePerHour}/hr
              = <strong>{fmt(computed?.totalLaborCost || 0)}</strong>
            </div>
          </Section>

          {/* ─ Dim 4+5: Utilities + Machine ─ */}
          <Section icon={Zap} title="Utilities & Machine" dim="4–5" open={open.utilities} toggle={() => toggle('utilities')}
            total={(computed?.totalUtilityCost || 0) + (computed?.totalMachineCost || 0)}>
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Electricity (units)" value={form.electricityUnits} onChange={v => set('electricityUnits', v)} />
              <NumberField label="Rate/unit (₹)" value={form.electricityRatePerUnit} onChange={v => set('electricityRatePerUnit', v)} />
              <NumberField label="Water cost (₹)" value={form.waterCost} onChange={v => set('waterCost', v)} />
              <NumberField label="Machine hours" value={form.machineHours} onChange={v => set('machineHours', v)} />
              <NumberField label="Machine rate/hr (₹)" value={form.machineRatePerHour} onChange={v => set('machineRatePerHour', v)} />
            </div>
          </Section>

          {/* ─ Dim 6: Packaging ─ */}
          <Section icon={Tag} title="Packaging" dim="6" open={open.packaging} toggle={() => toggle('packaging')}
            total={computed?.totalPackagingCost} badge={`${form.packagingItems.length} items`}>
            <div className="space-y-2">
              {form.packagingItems.map((p, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                  <input value={p.name} onChange={e => updatePackagingLine(i, 'name', e.target.value)}
                    placeholder="Item name" className="col-span-4 input-sm" />
                  <input type="number" value={p.quantity || ''} onChange={e => updatePackagingLine(i, 'quantity', +e.target.value)}
                    placeholder="Qty" className="col-span-2 input-sm" />
                  <input type="number" value={p.costPerUnit || ''} onChange={e => updatePackagingLine(i, 'costPerUnit', +e.target.value)}
                    placeholder="₹/pcs" className="col-span-3 input-sm" />
                  <span className="col-span-2 text-[10px] font-semibold font-sans text-emerald-700">{fmt(p.totalCost)}</span>
                  <button onClick={() => set('packagingItems', form.packagingItems.filter((_, j) => j !== i))}
                    className="col-span-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => addPackagingLine()}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-sans hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                  <Plus size={12} /> Add Row
                </button>
                {(packagingItems || []).length > 0 && (
                  <select onChange={e => { if (e.target.value) { addPackagingLine((packagingItems || []).find((p: any) => p.id === e.target.value)); e.target.value = ''; } }}
                    className="text-xs border border-gray-200 rounded px-2 py-1 font-sans text-gray-600 focus:outline-none">
                    <option value="">+ From registry</option>
                    {(packagingItems || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            </div>
          </Section>

          {/* ─ Dim 7–14: Overhead & Fees ─ */}
          <Section icon={Settings} title="Overhead, Fees & Risk" dim="7–14" open={open.overhead} toggle={() => toggle('overhead')}>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Branding/unit (₹)" value={form.brandingCostPerUnit} onChange={v => set('brandingCostPerUnit', v)} />
              <NumberField label="Operational/unit (₹)" value={form.operationalCostPerUnit} onChange={v => set('operationalCostPerUnit', v)} />
              <NumberField label="Marketing/unit (₹)" value={form.marketingCostPerUnit} onChange={v => set('marketingCostPerUnit', v)} />
              <NumberField label="Misc cost (₹)" value={form.miscCost} onChange={v => set('miscCost', v)} />
              <NumberField label="Platform fee (%)" value={form.platformFeePercent} onChange={v => set('platformFeePercent', v)} step="0.1" />
              <NumberField label="Payment gateway (%)" value={form.paymentGatewayFeePercent} onChange={v => set('paymentGatewayFeePercent', v)} step="0.1" />
              <NumberField label="Delivery buffer (₹)" value={form.deliveryRiskBuffer} onChange={v => set('deliveryRiskBuffer', v)} />
              <NumberField label="Return risk (%)" value={form.returnRiskPercent} onChange={v => set('returnRiskPercent', v)} step="0.1" />
            </div>
          </Section>

          {/* Target margin */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-indigo-500" />
              <span className="text-sm font-semibold font-sans text-gray-700">Target Margin</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="range" min={10} max={80} step={1} value={form.targetMarginPercent}
                onChange={e => set('targetMarginPercent', +e.target.value)}
                className="flex-1 accent-indigo-600" />
              <span className="text-lg font-bold text-indigo-600 font-sans w-14 text-right">{form.targetMarginPercent}%</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[30, 40, 50, 60].map(v => (
                <button key={v} onClick={() => set('targetMarginPercent', v)}
                  className={cn('flex-1 py-1 text-xs font-sans rounded border transition-colors',
                    form.targetMarginPercent === v ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300')}>
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: live results ── */}
        <div className="space-y-4">
          {computed ? (
            <>
              {/* True cost breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={16} className="text-indigo-500" />
                  <h3 className="text-sm font-semibold font-sans text-gray-700">True Cost Breakdown</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Materials', val: computed.totalMaterialCost, icon: '📦' },
                    { label: 'Labor', val: computed.totalLaborCost, icon: '👷' },
                    { label: 'Utilities', val: computed.totalUtilityCost, icon: '⚡' },
                    { label: 'Machine', val: computed.totalMachineCost, icon: '⚙️' },
                    { label: 'Packaging', val: computed.totalPackagingCost, icon: '🎁' },
                    { label: 'Branding', val: form.brandingCostPerUnit, icon: '✨' },
                    { label: 'Operational', val: form.operationalCostPerUnit, icon: '🏭' },
                    { label: 'Marketing', val: form.marketingCostPerUnit, icon: '📣' },
                    { label: 'Misc', val: form.miscCost, icon: '📌' },
                  ].filter(r => r.val > 0).map(row => (
                    <div key={row.label} className="flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-500 flex items-center gap-1.5"><span>{row.icon}</span>{row.label}</span>
                      <span className="font-medium text-gray-800">{fmt(row.val)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-sans font-semibold">
                    <span className="text-gray-700">Production Cost</span>
                    <span className="text-gray-900">{fmt(computed.trueProductionCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-gray-500">
                    <span>+ Platform fee</span><span>{fmt(computed.platformFeeAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-gray-500">
                    <span>+ Gateway fee</span><span>{fmt(computed.paymentGatewayFeeAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-gray-500">
                    <span>+ Return risk</span><span>{fmt(computed.returnRiskAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-gray-500">
                    <span>+ Delivery buffer</span><span>{fmt(form.deliveryRiskBuffer)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-sans font-bold">
                    <span className="text-gray-900">Total True Cost</span>
                    <span className="text-red-600">{fmt(computed.totalTrueCost)}</span>
                  </div>
                </div>
              </div>

              {/* Pricing suggestions */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={16} className="text-emerald-500" />
                  <h3 className="text-sm font-semibold font-sans text-gray-700">Price Suggestions</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Budget (30%)', val: computed.budgetPrice, color: 'text-gray-700', bg: 'bg-gray-50' },
                    { label: `Suggested (${form.targetMarginPercent}%)`, val: computed.suggestedPrice, color: 'text-indigo-700', bg: 'bg-indigo-50', highlight: true },
                    { label: `Psychological`, val: computed.suggestedPricePsychological, color: 'text-purple-700', bg: 'bg-purple-50' },
                    { label: 'Premium (55%)', val: computed.premiumPrice, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Luxury (70%)', val: computed.luxuryPrice, color: 'text-rose-700', bg: 'bg-rose-50' },
                  ].map(row => (
                    <div key={row.label}
                      className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-sans', row.bg, row.highlight ? 'ring-1 ring-indigo-300' : '')}>
                      <span className={cn('font-medium', row.color)}>{row.label}</span>
                      <span className={cn('font-bold', row.color)}>{fmt(row.val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin analysis */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold font-sans text-gray-700 mb-4">At Current Price ({fmt(form.currentSellingPrice)})</h3>
                {form.currentSellingPrice > 0 ? (
                  <div className="space-y-3">
                    <MetricRow label="Gross Profit" value={fmt(computed.grossProfitAmount)} sub={pct(computed.grossMarginPercent)}
                      color={computed.grossMarginPercent > 0 ? 'text-emerald-600' : 'text-red-600'} />
                    <MetricRow label="Net Profit" value={fmt(computed.netProfitAmount)} sub={pct(computed.netMarginPercent)}
                      color={computed.netMarginPercent > 0 ? 'text-indigo-600' : 'text-red-600'} />
                    <MetricRow label="ROI" value={pct(computed.roi)} color={computed.roi > 0 ? 'text-emerald-600' : 'text-red-600'} />

                    {computed.netMarginPercent < 10 && (
                      <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-sans text-red-700">
                          <strong>Critical margin!</strong> Consider raising price to at least {fmt(computed.suggestedPrice)}
                        </p>
                      </div>
                    )}
                    {form.currentSellingPrice < computed.suggestedPrice && computed.netMarginPercent >= 10 && (
                      <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                        <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-sans text-amber-700">
                          Priced {fmt(computed.suggestedPrice - form.currentSellingPrice)} below target. Consider {fmt(computed.suggestedPricePsychological)}.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-sans text-center py-2">Enter selling price to see profit analysis</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Calculator size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-sans">Select a product and fill in costs<br />to see real-time calculations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Section({ icon: Icon, title, dim, open, toggle, total, badge, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-indigo-500" />
          <span className="text-sm font-semibold font-sans text-gray-700">{title}</span>
          <span className="text-[10px] font-sans text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Dim {dim}</span>
          {badge && <span className="text-[10px] font-sans text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{badge}</span>}
        </div>
        <div className="flex items-center gap-2">
          {total !== undefined && total > 0 && <span className="text-xs font-bold font-sans text-emerald-700">{fmt(total)}</span>}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function NumberField({ label, value, onChange, step = '1' }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 font-sans mb-1">{label}</label>
      <input type="number" step={step} value={value || ''} onChange={e => onChange(+e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
    </div>
  );
}

function MetricRow({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-sans">{label}</span>
      <div className="text-right">
        <span className={cn('text-sm font-bold font-sans', color)}>{value}</span>
        {sub && <span className="text-[10px] font-sans text-gray-400 ml-1.5">({sub})</span>}
      </div>
    </div>
  );
}

function MarginPill({ value }: { value: number }) {
  const color = value >= 35 ? 'text-emerald-700 bg-emerald-50' : value >= 15 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
  return <span className={cn('text-[10px] font-bold font-sans px-1.5 py-0.5 rounded', color)}>{(value || 0).toFixed(0)}%</span>;
}
