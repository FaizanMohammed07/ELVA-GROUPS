import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import {
  TrendingUp, ShoppingCart, Users, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, IndianRupee,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, prefix = '', isCurrency = false }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-500 font-sans">{title}</p>
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-gray-600" />
      </div>
    </div>
    <p className="text-2xl font-semibold text-gray-900 font-sans mb-2">
      {prefix}{isCurrency ? `₹${Number(value).toLocaleString('en-IN')}` : Number(value).toLocaleString('en-IN')}
    </p>
    {change !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-sans ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(change).toFixed(1)}% vs last month
      </div>
    )}
  </div>
);

export default function AdminDashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then((r) => r.data.data),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin', 'revenue', '30d'],
    queryFn: () => apiClient.get('/analytics/revenue').then((r) => r.data.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin', 'top-products'],
    queryFn: () => apiClient.get('/analytics/products/top').then((r) => r.data.data),
  });

  const { data: alerts } = useQuery({
    queryKey: ['admin', 'inventory-alerts'],
    queryFn: () => apiClient.get('/analytics/inventory/alerts').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-32 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Dashboard</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Welcome back! Here's what's happening with ELUNORA today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={summary?.todayRevenue ?? 0} icon={IndianRupee} isCurrency />
        <StatCard title="Month Revenue" value={summary?.monthRevenue ?? 0} change={summary?.revenueGrowth} icon={TrendingUp} isCurrency />
        <StatCard title="Pending Orders" value={summary?.pendingOrders ?? 0} icon={ShoppingCart} />
        <StatCard title="Total Customers" value={summary?.totalUsers ?? 0} icon={Users} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Month Orders" value={summary?.monthOrders ?? 0} icon={ShoppingCart} />
        <StatCard title="Active Products" value={summary?.totalProducts ?? 0} icon={Package} />
        <StatCard title="New Customers Today" value={summary?.newUsersToday ?? 0} icon={Users} />
        <StatCard title="Low Stock Alerts" value={summary?.lowStockCount ?? 0} icon={AlertTriangle} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData?.daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Top Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(topProducts || []).slice(0, 6)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="title" width={100} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Alerts */}
      {alerts?.lowStock?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800 font-sans">Low Stock Alerts ({alerts.lowStock.length})</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {alerts.lowStock.slice(0, 8).map((p: any) => (
              <div key={p._id} className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs font-medium text-gray-800 font-sans line-clamp-1">{p.title}</p>
                <p className="text-xs text-gray-500 font-sans">SKU: {p.sku}</p>
                <p className="text-sm font-semibold text-amber-600 mt-1">{p.stock} left</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
