import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, BarChart2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SUPER_BASE } from '@config/admin';
import { cn } from '@utils/cn';

const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;
const pct = (n: number) => `${(n || 0).toFixed(1)}%`;

type FilterType = 'all' | 'critical' | 'warning' | 'healthy' | 'excellent' | 'underpriced';

export default function ProfitIntelligencePage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'netMarginPercent' | 'roi' | 'grossMarginPercent'>('netMarginPercent');

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['profit-intelligence'],
    queryFn: () => apiClient.get('/costing/profit-intelligence').then(r => r.data.data),
  });

  const data: any[] = raw;

  const filtered = data
    .filter(p => {
      if (filter === 'all') return true;
      if (filter === 'underpriced') return p.underpriced;
      return p.flag === filter;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const summary = {
    total: data.length,
    excellent: data.filter(p => p.flag === 'excellent').length,
    healthy: data.filter(p => p.flag === 'healthy').length,
    warning: data.filter(p => p.flag === 'warning').length,
    critical: data.filter(p => p.flag === 'critical').length,
    underpriced: data.filter(p => p.underpriced).length,
    avgMargin: data.length ? data.reduce((s, p) => s + p.netMarginPercent, 0) / data.length : 0,
  };

  const chartData = [...data]
    .sort((a, b) => b.netMarginPercent - a.netMarginPercent)
    .slice(0, 12)
    .map(p => ({ name: p.productTitle.length > 14 ? p.productTitle.slice(0, 14) + '…' : p.productTitle, margin: Math.round(p.netMarginPercent * 10) / 10, flag: p.flag }));

  const FLAG_COLORS: Record<string, string> = {
    excellent: '#10b981',
    healthy: '#6366f1',
    warning: '#f59e0b',
    critical: '#ef4444',
  };

  if (isLoading) return <div className="text-sm text-gray-400 font-sans py-10 text-center">Loading intelligence…</div>;

  if (!data.length) return (
    <div className="text-center py-20">
      <BarChart2 size={48} className="text-gray-200 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 font-sans mb-2">No Products Costed Yet</h2>
      <p className="text-sm text-gray-400 font-sans mb-6">Use the Costing Engine to add product cost configurations.</p>
      <Link to={`${SUPER_BASE}/costing-engine`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors">
        Go to Costing Engine <ArrowRight size={14} />
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Profit Intelligence</h1>
        <p className="text-sm text-gray-500 font-sans mt-0.5">Per-product profitability analysis & pricing health</p>
      </div>

      {/* ── Summary Tiles ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'All Products', count: summary.total, color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
          { key: 'excellent', label: 'Excellent', count: summary.excellent, color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
          { key: 'healthy', label: 'Healthy', count: summary.healthy, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
          { key: 'warning', label: 'Warning', count: summary.warning, color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
          { key: 'critical', label: 'Critical', count: summary.critical, color: 'bg-red-100 text-red-700', border: 'border-red-200' },
          { key: 'underpriced', label: 'Underpriced', count: summary.underpriced, color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
        ].map(tile => (
          <button
            key={tile.key}
            onClick={() => setFilter(tile.key as FilterType)}
            className={cn('rounded-xl border p-3 text-center transition-all', tile.border,
              filter === tile.key ? 'ring-2 ring-indigo-400' : 'hover:shadow-sm')}
          >
            <p className={cn('text-2xl font-bold font-sans', tile.color.split(' ')[1])}>{tile.count}</p>
            <p className="text-[10px] font-sans text-gray-500 uppercase tracking-wide mt-0.5">{tile.label}</p>
          </button>
        ))}
      </div>

      {/* ── Margin Bar Chart ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Net Margin by Product (Top 12)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: any) => [`${v}%`, 'Net Margin']} />
            <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={FLAG_COLORS[entry.flag] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Sort + Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700 font-sans">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400 font-sans">· Avg net margin: <strong>{pct(summary.avgMargin)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sans">Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 font-sans focus:outline-none focus:border-indigo-400">
              <option value="netMarginPercent">Net Margin</option>
              <option value="grossMarginPercent">Gross Margin</option>
              <option value="roi">ROI</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="text-left px-5 py-3 font-semibold">Product</th>
                <th className="text-right px-3 py-3 font-semibold">True Cost</th>
                <th className="text-right px-3 py-3 font-semibold">Selling</th>
                <th className="text-right px-3 py-3 font-semibold">Gross Margin</th>
                <th className="text-right px-3 py-3 font-semibold">Net Margin</th>
                <th className="text-right px-3 py-3 font-semibold">ROI</th>
                <th className="text-right px-3 py-3 font-semibold">Suggested</th>
                <th className="text-center px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 text-sm">{p.productTitle}</p>
                    <p className="text-[10px] text-gray-400">{p.productSku}</p>
                  </td>
                  <td className="text-right px-3 py-3.5 text-gray-700">{fmt(p.trueProductionCost)}</td>
                  <td className="text-right px-3 py-3.5">
                    <span className={cn('font-medium', p.underpriced ? 'text-amber-600' : 'text-gray-700')}>
                      {fmt(p.currentSellingPrice)}
                    </span>
                  </td>
                  <td className="text-right px-3 py-3.5">
                    <MarginCell value={p.grossMarginPercent} />
                  </td>
                  <td className="text-right px-3 py-3.5">
                    <MarginCell value={p.netMarginPercent} bold />
                  </td>
                  <td className="text-right px-3 py-3.5">
                    <span className={cn('font-medium text-xs', p.roi >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {pct(p.roi)}
                    </span>
                  </td>
                  <td className="text-right px-3 py-3.5 text-gray-500 text-xs">{fmt(p.suggestedPrice)}</td>
                  <td className="text-center px-3 py-3.5">
                    <StatusBadge flag={p.flag} underpriced={p.underpriced} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost driver breakdown */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-sans mb-3">Cost Driver Summary</p>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {filtered.slice(0, 6).map((p: any) => (
                <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-medium text-gray-700 font-sans truncate mb-2">{p.productTitle}</p>
                  <MiniBar label="Mat" value={p.trueProductionCost > 0 ? (p.totalMaterialCost / p.trueProductionCost) * 100 : 0} color="#6366f1" />
                  <MiniBar label="Lab" value={p.trueProductionCost > 0 ? (p.totalLaborCost / p.trueProductionCost) * 100 : 0} color="#f59e0b" />
                  <MiniBar label="Pkg" value={p.trueProductionCost > 0 ? (p.totalPackagingCost / p.trueProductionCost) * 100 : 0} color="#10b981" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recommendations ── */}
      {(summary.critical > 0 || summary.underpriced > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-3">AI Recommendations</h2>
          <div className="space-y-2.5">
            {data.filter(p => p.flag === 'critical').slice(0, 3).map((p: any) => (
              <RecommendationRow key={p.id} type="critical" icon={AlertTriangle}
                text={`${p.productTitle}: Net margin ${pct(p.netMarginPercent)} is critical. Raise price to at least ${fmt(p.suggestedPrice)} to achieve target margin.`} />
            ))}
            {data.filter(p => p.underpriced && p.flag !== 'critical').slice(0, 3).map((p: any) => (
              <RecommendationRow key={p.id} type="warning" icon={TrendingUp}
                text={`${p.productTitle}: Priced ${fmt(p.gapToSuggested)} below target. Consider ₹${p.suggestedPrice - 1} (psychological pricing).`} />
            ))}
            {data.filter(p => p.flag === 'excellent').slice(0, 2).map((p: any) => (
              <RecommendationRow key={p.id} type="success" icon={CheckCircle}
                text={`${p.productTitle}: ${pct(p.netMarginPercent)} net margin — high performer. Consider increasing marketing spend.`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MarginCell({ value, bold }: { value: number; bold?: boolean }) {
  const color = value >= 40 ? 'text-emerald-600' : value >= 20 ? 'text-amber-600' : 'text-red-600';
  return <span className={cn('text-xs', color, bold && 'font-bold')}>{pct(value)}</span>;
}

function StatusBadge({ flag, underpriced }: { flag: string; underpriced: boolean }) {
  const MAP: Record<string, { label: string; cls: string }> = {
    excellent: { label: 'Excellent', cls: 'bg-emerald-100 text-emerald-700' },
    healthy: { label: 'Healthy', cls: 'bg-indigo-100 text-indigo-700' },
    warning: { label: 'Warning', cls: 'bg-amber-100 text-amber-700' },
    critical: { label: 'Critical', cls: 'bg-red-100 text-red-700' },
  };
  const m = MAP[flag] || MAP.healthy;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded font-sans', m.cls)}>{m.label}</span>
      {underpriced && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded font-sans bg-purple-100 text-purple-700">Under</span>}
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-[9px] font-sans text-gray-400 w-5">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      <span className="text-[9px] font-sans text-gray-500 w-7 text-right">{Math.round(value)}%</span>
    </div>
  );
}

function RecommendationRow({ type, icon: Icon, text }: { type: string; icon: any; text: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  const iconColors: Record<string, string> = {
    critical: 'text-red-500', warning: 'text-amber-500', success: 'text-emerald-500',
  };
  return (
    <div className={cn('flex items-start gap-2.5 p-3 rounded-lg border text-xs font-sans', styles[type])}>
      <Icon size={14} className={cn('flex-shrink-0 mt-0.5', iconColors[type])} />
      {text}
    </div>
  );
}
