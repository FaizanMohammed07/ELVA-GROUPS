import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sparkles, Upload, X, ChevronRight, ChevronLeft, Settings,
  Loader2, CheckCircle, AlertCircle, Eye, Trash2, Clock,
  FlaskConical, Hammer, Package, TrendingUp, IndianRupee,
  Brain, Zap, BarChart3, ShieldCheck, Info,
} from 'lucide-react';
import { cn } from '@utils/cn';
import { intelligenceApi, AIAnalysis, GlobalConfig } from '@api/intelligence.api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${n.toFixed(2)}`;
const fmtRound = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const COMPLEXITY_LEVELS = ['simple', 'moderate', 'complex', 'premium'] as const;
const FRAGRANCE_LEVELS = ['none', 'light', 'medium', 'strong'] as const;
const CUSTOMIZATION_LEVELS = ['none', 'low', 'medium', 'high'] as const;

const MODELS = [
  { value: 'anthropic/claude-opus-4-5', label: 'Claude Opus 4.5 (Best)' },
  { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Fast)' },
  { value: 'google/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Cheap)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (Balanced)' },
];

const STEPS = [
  'Product Name',
  'Upload Images',
  'Optional Hints',
  'AI Analysis',
  'Results',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
              i < step ? 'bg-violet-600 border-violet-600 text-white' :
              i === step ? 'bg-white border-violet-600 text-violet-600' :
              'bg-white border-gray-200 text-gray-400',
            )}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium whitespace-nowrap', i === step ? 'text-violet-600' : 'text-gray-400')}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('flex-1 h-0.5 mx-2 mb-5 transition-all', i < step ? 'bg-violet-600' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );
}

function ImageDropzone({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    onAdd(dropped.slice(0, 5 - files.length));
  }, [files.length, onAdd]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          dragging ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-400 hover:bg-gray-50',
        )}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="font-medium text-gray-700">Drop images here or click to browse</p>
        <p className="text-sm text-gray-400 mt-1">Up to 5 images · JPG, PNG, WebP · Max 10MB each</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => onAdd(Array.from(e.target.files || []).slice(0, 5 - files.length))} />
      </div>

      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(f)} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              <button onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                {(f.size / 1024).toFixed(0)}KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CostCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl p-4 border', accent ? 'border-violet-200 bg-violet-50' : 'border-gray-100 bg-gray-50')}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn('text-xl font-bold', accent ? 'text-violet-700' : 'text-gray-800')}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function PricingTier({ tier, price, psych, marginLabel }: { tier: string; price: number; psych: number; marginLabel: string }) {
  const colors = { suggested: 'blue', premium: 'violet', luxury: 'amber' } as const;
  const c = colors[tier as keyof typeof colors] || 'blue';
  return (
    <div className={`rounded-xl p-5 border border-${c}-200 bg-${c}-50`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold text-${c}-700 uppercase tracking-wide`}>{tier}</span>
        <span className={`text-xs bg-${c}-100 text-${c}-600 px-2 py-0.5 rounded-full`}>{marginLabel} margin</span>
      </div>
      <p className={`text-3xl font-black text-${c}-800`}>{fmtRound(psych)}</p>
      <p className="text-xs text-gray-400 mt-1">Cost-plus: {fmt(price)}</p>
    </div>
  );
}

function AnalysisResults({ analysis }: { analysis: AIAnalysis }) {
  const cb = analysis.costBreakdown;
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800">{analysis.productName}</p>
          <p className="text-sm text-green-600">
            Category: <span className="font-medium">{analysis.detectedCategory}</span> ·
            Accuracy: <span className="font-medium">{analysis.accuracyEstimate}%</span> ·
            Complexity: <span className="font-medium">{analysis.complexityScore}/10</span>
          </p>
        </div>
      </div>

      {/* Pricing tiers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-violet-600" /> Pricing Recommendations
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <PricingTier tier="suggested" price={cb.suggestedPrice} psych={cb.psychologicalSuggested} marginLabel="40%" />
          <PricingTier tier="premium" price={cb.premiumPrice} psych={cb.psychologicalPremium} marginLabel="55%" />
          <PricingTier tier="luxury" price={cb.luxuryPrice} psych={Math.round(cb.luxuryPrice / 50) * 50 - 1} marginLabel="70%" />
        </div>
      </div>

      {/* True cost + breakdown toggle */}
      <div className="grid grid-cols-2 gap-3">
        <CostCard label="True Cost" value={fmt(cb.trueCost)} sub="All buffers included" accent />
        <CostCard label="Material Cost" value={fmt(cb.materialCost)} sub={`${analysis.detectedMaterials.length} materials`} />
        <CostCard label="Labor Cost" value={fmt(cb.laborCost)} sub={`${analysis.estimatedLaborHours}h active work`} />
        <CostCard label="Mold Depreciation" value={fmt(cb.moldDepreciation)} sub={cb.moldName || 'No mold matched'} />
      </div>

      {/* Detailed breakdown toggle */}
      <button onClick={() => setShowBreakdown(!showBreakdown)}
        className="flex items-center gap-2 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors">
        <BarChart3 className="w-4 h-4" />
        {showBreakdown ? 'Hide' : 'Show'} full cost breakdown
      </button>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">Cost Breakdown</h4>
              {[
                ['Materials', cb.materialCost],
                ['Mold depreciation', cb.moldDepreciation],
                ['Labor', cb.laborCost],
                ['Packaging', cb.packagingCost],
                ['Subtotal', cb.subtotal, true],
                ['Wastage buffer', cb.wastageBuffer],
                ['Operational buffer', cb.operationalBuffer],
                ['Marketing buffer', cb.marketingBuffer],
                ['Risk buffer', cb.riskBuffer],
                ['TRUE COST', cb.trueCost, true],
              ].map(([label, val, bold]) => (
                <div key={label as string} className={cn('flex justify-between text-sm', bold ? 'font-bold border-t border-gray-200 pt-2' : 'text-gray-600')}>
                  <span>{label as string}</span>
                  <span>{fmt(val as number)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detected materials */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-violet-600" /> Detected Materials
        </h3>
        <div className="space-y-2">
          {analysis.detectedMaterials.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">{m.name}</p>
                <p className="text-xs text-gray-400">
                  {m.estimatedQuantity}{m.unit}
                  {m.matchedMaterialName && ` → matched: ${m.matchedMaterialName}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{fmt(m.totalCost)}</p>
                <p className="text-xs text-gray-400">{Math.round(m.confidence * 100)}% conf</p>
              </div>
            </div>
          ))}
          {analysis.detectedMaterials.length === 0 && (
            <p className="text-sm text-gray-400 italic">No materials detected</p>
          )}
        </div>
      </div>

      {/* Production notes */}
      {analysis.productionNotes && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{analysis.productionNotes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function ConfigModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ['intelligence-config'], queryFn: () => intelligenceApi.getConfig().then(r => r.data.data) });
  const [form, setForm] = useState<Partial<GlobalConfig>>({});

  const update = useMutation({
    mutationFn: (data: Partial<GlobalConfig>) => intelligenceApi.updateConfig(data),
    onSuccess: () => { toast.success('Config saved'); qc.invalidateQueries({ queryKey: ['intelligence-config'] }); onClose(); },
    onError: () => toast.error('Failed to save config'),
  });

  const merged = { ...cfg, ...form };
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const numField = (key: keyof GlobalConfig, label: string, unit = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" step="0.01" value={(merged as any)[key] ?? ''}
          onChange={e => set(key, parseFloat(e.target.value))}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Settings className="w-5 h-5 text-violet-600" /> Global Configuration</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {numField('laborRatePerHour', 'Labor Rate / Hour', '₹/hr')}
            {numField('basePackagingCost', 'Base Packaging Cost', '₹')}
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buffer Percentages</p>
          <div className="grid grid-cols-2 gap-4">
            {numField('wastageBufferPercent', 'Wastage Buffer', '%')}
            {numField('operationalBufferPercent', 'Operational Buffer', '%')}
            {numField('marketingBufferPercent', 'Marketing Buffer', '%')}
            {numField('riskBufferPercent', 'Risk Buffer', '%')}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">OpenRouter API Key</label>
            <input type="password" value={(merged.openRouterApiKey) ?? ''}
              onChange={e => set('openRouterApiKey', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="sk-or-..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vision Model</label>
            <select value={merged.preferredVisionModel ?? ''} onChange={e => set('preferredVisionModel', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
          <button onClick={() => update.mutate(form)}
            disabled={update.isPending}
            className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ onView }: { onView: (a: AIAnalysis) => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['intelligence-history'],
    queryFn: () => intelligenceApi.getAnalyses().then(r => r.data.data),
  });

  const del = useMutation({
    mutationFn: (id: string) => intelligenceApi.deleteAnalysis(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['intelligence-history'] }); },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>;
  if (!data?.items.length) return <p className="text-sm text-gray-400 text-center py-8">No analyses yet</p>;

  return (
    <div className="space-y-3">
      {data.items.map((a) => (
        <div key={a._id} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-violet-200 transition-colors">
          <div className={cn('w-2 h-2 rounded-full shrink-0', a.status === 'completed' ? 'bg-green-500' : 'bg-red-400')} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{a.productName}</p>
            <p className="text-xs text-gray-400">
              {a.detectedCategory} · {new Date(a.createdAt).toLocaleDateString('en-IN')}
              {a.status === 'completed' && ` · ₹${Math.round(a.costBreakdown.trueCost)} true cost`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {a.status === 'completed' && (
              <button onClick={() => onView(a)} className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg">
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => del.mutate(a._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductIntelligencePage() {
  const qc = useQueryClient();

  // Wizard state
  const [step, setStep] = useState(0);
  const [productName, setProductName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [hints, setHints] = useState<{
    approximateWeightGrams?: number;
    dimensions?: string;
    complexityLevel?: string;
    fragranceIntensity?: string;
    customizationLevel?: string;
    materialHints?: string;
  }>({});
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [viewingHistory, setViewingHistory] = useState<AIAnalysis | null>(null);

  // UI state
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history'>('wizard');

  const analyze = useMutation({
    mutationFn: () => intelligenceApi.analyzeProduct({ productName, images, hints: hints as any }),
    onSuccess: (res) => {
      setResult(res.data.data);
      setStep(4);
      qc.invalidateQueries({ queryKey: ['intelligence-history'] });
      toast.success('AI analysis complete!');
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message || e.message || 'Analysis failed';
      toast.error(msg);
      if (msg.includes('API key')) {
        setShowConfig(true);
      }
    },
  });

  const resetWizard = () => {
    setStep(0);
    setProductName('');
    setImages([]);
    setHints({});
    setResult(null);
    setViewingHistory(null);
  };

  const canProceed = [
    productName.trim().length >= 2,
    images.length >= 1,
    true, // hints optional
    false, // trigger step
    true,
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-violet-600" /> AI Product Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload product images → AI detects materials → instant cost & pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-600 transition-all">
            <Settings className="w-4 h-4" /> Config
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['wizard', 'history'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab === 'wizard' ? <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> Analyze</span> :
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> History</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'history' ? (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-500" /> Recent Analyses
              </h2>
              {viewingHistory ? (
                <div>
                  <button onClick={() => setViewingHistory(null)}
                    className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 mb-4">
                    <ChevronLeft className="w-4 h-4" /> Back to list
                  </button>
                  <AnalysisResults analysis={viewingHistory} />
                </div>
              ) : (
                <HistoryPanel onView={setViewingHistory} />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="wizard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <StepBar step={step} />

              <AnimatePresence mode="wait">
                {/* Step 0: Product Name */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">What product are you analyzing?</h2>
                      <p className="text-sm text-gray-500">Give it a name for your records</p>
                    </div>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="e.g. Rose Garden Soy Candle, Teddy Bear Clay Keychain..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-400"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && canProceed[0] && setStep(1)}
                    />
                    <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                      <Zap className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-violet-700">
                        <p className="font-medium mb-1">How it works</p>
                        <p className="text-violet-600">Upload 1–5 photos of your product. The AI will detect materials, estimate quantities, match them to your material database, and calculate an accurate manufacturing cost + pricing tiers.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Images */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">Upload product images</h2>
                      <p className="text-sm text-gray-500">Better photos = more accurate AI analysis. Use well-lit, clear shots.</p>
                    </div>
                    <ImageDropzone
                      files={images}
                      onAdd={(f) => setImages(prev => [...prev, ...f].slice(0, 5))}
                      onRemove={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    />
                  </motion.div>
                )}

                {/* Step 2: Hints */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">Optional hints <span className="text-sm font-normal text-gray-400">(improves accuracy)</span></h2>
                      <p className="text-sm text-gray-500">Help the AI with additional context about your product</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Approximate Weight</label>
                        <div className="flex items-center gap-2">
                          <input type="number" placeholder="e.g. 200" value={hints.approximateWeightGrams ?? ''}
                            onChange={e => setHints(h => ({ ...h, approximateWeightGrams: e.target.value ? +e.target.value : undefined }))}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                          <span className="text-xs text-gray-400">grams</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Dimensions</label>
                        <input type="text" placeholder="e.g. 8cm x 6cm x 5cm" value={hints.dimensions ?? ''}
                          onChange={e => setHints(h => ({ ...h, dimensions: e.target.value || undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Complexity Level</label>
                        <select value={hints.complexityLevel ?? ''} onChange={e => setHints(h => ({ ...h, complexityLevel: e.target.value || undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                          <option value="">Not sure</option>
                          {COMPLEXITY_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Fragrance Intensity</label>
                        <select value={hints.fragranceIntensity ?? ''} onChange={e => setHints(h => ({ ...h, fragranceIntensity: e.target.value || undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                          <option value="">N/A</option>
                          {FRAGRANCE_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Customization Level</label>
                        <select value={hints.customizationLevel ?? ''} onChange={e => setHints(h => ({ ...h, customizationLevel: e.target.value || undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                          <option value="">None</option>
                          {CUSTOMIZATION_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Material Hints</label>
                        <input type="text" placeholder="e.g. soy wax, rose mold" value={hints.materialHints ?? ''}
                          onChange={e => setHints(h => ({ ...h, materialHints: e.target.value || undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: AI Running */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="py-12 flex flex-col items-center gap-6">
                    {analyze.isPending ? (
                      <>
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-violet-600" />
                          </div>
                          <div className="absolute inset-0 rounded-full border-4 border-violet-400 border-t-transparent animate-spin" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800 text-lg">AI is analyzing your product</p>
                          <p className="text-sm text-gray-500 mt-1">Detecting materials, matching to database, computing costs...</p>
                          <p className="text-xs text-gray-400 mt-2">This may take 15–45 seconds</p>
                        </div>
                      </>
                    ) : analyze.isError ? (
                      <>
                        <AlertCircle className="w-16 h-16 text-red-400" />
                        <div className="text-center">
                          <p className="font-semibold text-red-700">Analysis failed</p>
                          <p className="text-sm text-gray-500 mt-1">{(analyze.error as any)?.response?.data?.message || 'Please try again'}</p>
                        </div>
                        <button onClick={() => setStep(2)} className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
                          Go Back
                        </button>
                      </>
                    ) : null}
                  </motion.div>
                )}

                {/* Step 4: Results */}
                {step === 4 && result && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <AnalysisResults analysis={result} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {step !== 3 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={step === 4 ? resetWizard : () => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-30 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    {step === 4 ? 'New Analysis' : 'Back'}
                  </button>

                  {step < 4 && (
                    <button
                      disabled={!canProceed[step]}
                      onClick={() => {
                        if (step === 2) {
                          setStep(3);
                          analyze.mutate();
                        } else {
                          setStep(s => s + 1);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      {step === 2 ? (
                        <><Sparkles className="w-4 h-4" /> Analyze with AI</>
                      ) : (
                        <>Continue <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} />}
    </div>
  );
}
