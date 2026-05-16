import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => apiClient.get('/orders', { params: { status: status || undefined, limit: 50 } }).then((r) => r.data),
  });

  const orders = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Orders</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm font-sans focus:outline-none">
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-8 skeleton rounded" /></td></tr>
            )) : orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4 font-mono text-xs font-medium text-blue-600">{o.orderNumber}</td>
                <td className="py-3 px-4">{o.userId?.name || '—'}</td>
                <td className="py-3 px-4 text-gray-500">{o.items?.length} items</td>
                <td className="py-3 px-4 font-semibold">₹{o.total?.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
