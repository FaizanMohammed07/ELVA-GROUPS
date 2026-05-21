import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, AlertTriangle, Award, Package, Target } from 'lucide-react';
import { cn } from '@utils/cn';

const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;
const pct = (n: number) => `${(n || 0).toFixed(1)}%`;
const round = (n: number) => Math.round(n * 10) / 10;

const MARGIN_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

export default function CFODashboard() {
  const { data: cfo } = useQuery({
    queryKey: ['sa', 'cfo'],
    queryFn: () => apiClient.get('/analytics/cfo-summary').then(r => r.data.data),
  });
  const { data: payments } = useQuery({
    queryKey: ['sa', 'payments'],
    queryFn: () => apiClient.get('/analytics/payments/breakdown').then(r => r.data.data),
  });
  const { data: health } = useQuery({
    queryKey: ['sa', 'health'],
    queryFn: () => apiClient.get('/analytics/startup-health').then(r => r.data.data),
  });
  const { data: costBreakdown } = useQuery({
    queryKey: ['sa', 'cost-breakdown'],
    queryFn: () => apiClient.get('/costing/cfo-breakdown').then(r => r.data.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['sa', 'categories'],
    queryFn: () => apiClient.get('/analytics/revenue/categories').then(r => r.data.data),
  });

  const revenueGrowth = cfo
    ? (cfo.lastMonth?.totalRevenue > 0
        ? ((cfo.currentMonth?.totalRevenue - cfo.lastMonth?.totalRevenue) / cfo.lastMonth?.totalRevenue) * 100
        : 0)
    : 0;

  const combined = (cfo?.currentMonth?.daily || []).map((curr: any) => {
    const last = (cfo?.lastMonth?.daily || []).find((l: any) => l._id.slice(-2) === curr._id.slice(-2));
    return { ...curr, lastMonthRevenue: last?.revenue || 0 };
  });

  const costBreakdownPie = costBreakdown ? [
    { name: 'Materials', value: round(costBreakdown.avgMaterialPercent) },
    { name: 'Labor', value: round(costBreakdown.avgLaborPercent) },
    { name: 'Packaging', value: round(costBreakdown.avgPackagingPercent) },
    { name: 'Other', value: round(Math.max(0, 100 - costBreakdown.avgMaterialPercent - costBreakdown.avgLaborPercent - costBreakdown.avgPackagingPercent)) },
  ] : [];

  const healthScore = health?.healthScore || 0;
  const healthColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';
  const healthLabel = healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Attention';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">CFO Dashboard</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">Financial intelligence & profit overview</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold font-sans text-lg"
            style={{ background: healthColor }}
          >
            {healthScore}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-sans">Startup Health</p>
            <p className="text-sm font-semibold font-sans" style={{ color: healthColor }}>{healthLabel}</p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'This Month Revenue',
            value: fmt(cfo?.currentMonth?.totalRevenue),
            sub: `${cfo?.currentMonth?.totalOrders || 0} orders`,
            icon: DollarSign,
            trend: revenueGrowth,
            color: 'blue',
          },
          {
            label: 'Avg Order Value',
            value: fmt(cfo?.currentMonth?.avgOrderValue),
            sub: 'Current month',
            icon: ShoppingBag,
            color: 'purple',
          },
          {
            label: 'Avg Net Margin',
            value: pct(costBreakdown?.avgNetMargin),
            sub: `${costBreakdown?.costedProductCount || 0} products costed`,
            icon: Target,
            color: costBreakdown?.avgNetMargin > 30 ? 'green' : 'orange',
          },
          {
            label: 'Low Stock Alerts',
            value: String(cfo?.lowStockMaterials || 0),
            sub: 'Raw materials',
            icon: AlertTriangle,
            color: (cfo?.lowStockMaterials || 0) > 0 ? 'red' : 'green',
          },
        ].map(({ label, value, sub, icon: Icon, trend, color }) => (
          <KpiCard key={label} label={label} value={value} sub={sub} icon={Icon} trend={trend} color={color} />
        ))}
      </div>

      {/* ── Revenue Charts ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Revenue: This Month vs Last Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(-2)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [fmt(v)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="revenue" name="This Month" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="lastMonthRevenue" name="Last Month" stroke="#d1d5db" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Health Score Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Health Components</h2>
          <div className="space-y-3">
            {health?.components && Object.entries(health.components).map(([key, val]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-sans mb-1">
                  <span className="text-gray-600 capitalize">{key.replace('Score', '')}</span>
                  <span className="font-medium">{round(val)}/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, val)}%`,
                      background: val >= 70 ? '#10b981' : val >= 45 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cost Breakdown + Category Revenue ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost Structure Pie */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-1">Avg Cost Structure</h2>
          <p className="text-xs text-gray-400 font-sans mb-4">Based on costed products</p>
          {costBreakdownPie.length > 0 ? (
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={costBreakdownPie} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {costBreakdownPie.map((_, i) => <Cell key={i} fill={MARGIN_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`]} />
              </PieChart>
              <div className="space-y-2">
                {costBreakdownPie.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: MARGIN_COLORS[i] }} />
                    <span className="text-xs font-sans text-gray-600">{item.name}</span>
                    <span className="text-xs font-semibold font-sans ml-auto">{item.value}%</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 text-xs font-sans text-gray-500">
                  Avg Gross: <span className="font-semibold text-green-600">{pct(costBreakdown?.avgGrossMargin)}</span>
                  <span className="mx-2">·</span>
                  Net: <span className="font-semibold text-indigo-600">{pct(costBreakdown?.avgNetMargin)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-sans py-8 text-center">No products costed yet.<br />Use the Costing Engine to get started.</p>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(categories || []).slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="_id" width={130} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [fmt(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top Products + Margin Leaders ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700 font-sans">Top Revenue Products</h2>
          </div>
          <div className="space-y-3">
            {(cfo?.topProducts || []).slice(0, 6).map((p: any, i: number) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-sans w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium font-sans text-gray-800 truncate">{p.title}</p>
                  <p className="text-[10px] text-gray-400 font-sans">{p.unitsSold} sold</p>
                </div>
                <span className="text-xs font-semibold font-sans text-gray-900">{fmt(p.revenue)}</span>
              </div>
            ))}
            {!cfo?.topProducts?.length && <p className="text-sm text-gray-400 font-sans py-4 text-center">No sales data yet</p>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-700 font-sans">Highest Margin Products</h2>
          </div>
          <div className="space-y-3">
            {(cfo?.profitMetrics?.topMarginProducts || []).slice(0, 6).map((p: any, i: number) => (
              <div key={p._id || i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-sans w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium font-sans text-gray-800 truncate">{p.productTitle}</p>
                  <p className="text-[10px] text-gray-400 font-sans">{fmt(p.currentSellingPrice)} selling</p>
                </div>
                <MarginBadge value={p.netMarginPercent} />
              </div>
            ))}
            {!cfo?.profitMetrics?.topMarginProducts?.length && (
              <p className="text-sm text-gray-400 font-sans py-4 text-center">Add product costings to see margins</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Payment Method Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(payments || []).map((p: any) => (
            <div key={p._id} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans mb-1">{p._id || 'Unknown'}</p>
              <p className="text-lg font-semibold font-sans">{fmt(p.revenue)}</p>
              <p className="text-xs text-gray-400 font-sans">{p.count} orders</p>
            </div>
          ))}
          {!payments?.length && <p className="text-sm text-gray-400 font-sans col-span-4 py-4 text-center">No payment data</p>}
        </div>
      </div>

      {/* ── Underpriced Alert ── */}
      {(costBreakdown?.underpricedProducts || 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 font-sans">
              {costBreakdown.underpricedProducts} product{costBreakdown.underpricedProducts > 1 ? 's are' : ' is'} priced below suggested price
            </p>
            <p className="text-xs text-amber-600 font-sans mt-0.5">
              Visit Profit Intelligence to review and adjust pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, trend, color }: any) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-emerald-600 bg-emerald-50',
    orange: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-sans">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c)}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold font-sans text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-400 font-sans">{sub}</p>
        {trend !== undefined && (
          <span className={cn('text-xs font-semibold font-sans flex items-center gap-0.5', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(round(trend))}%
          </span>
        )}
      </div>
    </div>
  );
}

function MarginBadge({ value }: { value: number }) {
  const color = value >= 40 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : value >= 20 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';
  return (
    <span className={cn('text-[10px] font-bold font-sans px-2 py-0.5 rounded border', color)}>
      {value?.toFixed(1)}%
    </span>
  );
}
