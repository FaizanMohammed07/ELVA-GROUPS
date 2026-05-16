import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#1a1a1a', '#f59e0b', '#d97706', '#92400e', '#78350f'];

export default function AdminAnalyticsPage() {
  const { data: revenue } = useQuery({ queryKey: ['analytics', 'revenue'], queryFn: () => apiClient.get('/analytics/revenue').then(r => r.data.data) });
  const { data: users } = useQuery({ queryKey: ['analytics', 'users'], queryFn: () => apiClient.get('/analytics/users').then(r => r.data.data) });
  const { data: topProducts } = useQuery({ queryKey: ['analytics', 'top-products'], queryFn: () => apiClient.get('/analytics/products/top').then(r => r.data.data) });
  const { data: orderStatus } = useQuery({ queryKey: ['analytics', 'order-status'], queryFn: () => apiClient.get('/analytics/orders/status').then(r => r.data.data) });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-sans">Total Revenue (30d)</p>
          <p className="text-3xl font-semibold font-sans">₹{(revenue?.totalRevenue || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-sans">Total Orders (30d)</p>
          <p className="text-3xl font-semibold font-sans">{revenue?.totalOrders || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-sans">Avg Order Value</p>
          <p className="text-3xl font-semibold font-sans">₹{Math.round(revenue?.avgOrderValue || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 font-sans mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenue?.daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 font-sans mb-4">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={orderStatus || []} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                {(orderStatus || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 font-sans mb-4">New Users Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={users?.signupsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 font-sans mb-4">Top Products by Revenue</h3>
          <div className="space-y-3">
            {(topProducts || []).slice(0, 8).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-sans line-clamp-1 flex-1">{p.title}</p>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold font-sans">₹{p.revenue?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 font-sans">{p.unitsSold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
