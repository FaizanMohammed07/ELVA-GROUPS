import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SuperAdminDashboard() {
  const { data: dashboard } = useQuery({ queryKey: ['sa', 'dashboard'], queryFn: () => apiClient.get('/analytics/dashboard').then(r => r.data.data) });
  const { data: cfo } = useQuery({ queryKey: ['sa', 'cfo'], queryFn: () => apiClient.get('/analytics/cfo-summary').then(r => r.data.data) });
  const { data: categories } = useQuery({ queryKey: ['sa', 'categories'], queryFn: () => apiClient.get('/analytics/revenue/categories').then(r => r.data.data) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Super Admin Dashboard</h1>
        <span className="bg-gold-100 text-gold-700 text-xs px-2 py-0.5 rounded font-sans font-medium">Full Access</span>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today Revenue', value: `₹${(dashboard?.todayRevenue || 0).toLocaleString('en-IN')}` },
          { label: 'Month Revenue', value: `₹${(dashboard?.monthRevenue || 0).toLocaleString('en-IN')}` },
          { label: 'Revenue Growth', value: `${dashboard?.revenueGrowth || 0}%` },
          { label: 'Total Customers', value: (dashboard?.totalUsers || 0).toLocaleString('en-IN') },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-sans mb-2">{label}</p>
            <p className="text-2xl font-semibold font-sans">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Revenue Trend (This Month)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cfo?.currentMonth?.daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(categories || []).slice(0, 6)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="_id" width={120} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
