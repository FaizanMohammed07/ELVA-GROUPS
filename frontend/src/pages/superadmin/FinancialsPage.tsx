import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function SuperAdminFinancialsPage() {
  const { data: cfo } = useQuery({ queryKey: ['sa', 'cfo'], queryFn: () => apiClient.get('/analytics/cfo-summary').then(r => r.data.data) });
  const { data: payments } = useQuery({ queryKey: ['sa', 'payments'], queryFn: () => apiClient.get('/analytics/payments/breakdown').then(r => r.data.data) });

  const combined = (cfo?.currentMonth?.daily || []).map((curr: any) => {
    const last = (cfo?.lastMonth?.daily || []).find((l: any) => l._id.slice(-2) === curr._id.slice(-2));
    return { ...curr, lastMonthRevenue: last?.revenue || 0 };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">CFO Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'This Month Revenue', value: `₹${(cfo?.currentMonth?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: `${cfo?.currentMonth?.totalOrders || 0} orders` },
          { label: 'Last Month Revenue', value: `₹${(cfo?.lastMonth?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: `${cfo?.lastMonth?.totalOrders || 0} orders` },
          { label: 'Avg Order Value', value: `₹${Math.round(cfo?.currentMonth?.avgOrderValue || 0).toLocaleString('en-IN')}`, sub: 'Current month' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-sans mb-2">{label}</p>
            <p className="text-3xl font-semibold font-sans">{value}</p>
            <p className="text-xs text-gray-400 font-sans mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Month-over-Month Revenue Comparison</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`]} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="This Month" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lastMonthRevenue" name="Last Month" stroke="#d1d5db" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Payment Method Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {(payments || []).map((p: any) => (
            <div key={p._id} className="bg-gray-50 rounded p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-sans mb-1">{p._id}</p>
              <p className="text-xl font-semibold font-sans">₹{p.revenue?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 font-sans">{p.count} orders</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
