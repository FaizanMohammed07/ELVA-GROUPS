import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';

export default function AdminCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => apiClient.get('/users', { params: { role: 'customer', limit: 50 } }).then(r => r.data),
  });
  const customers = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">Customers</h1>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Name', 'Email', 'Phone', 'Verified', 'Status', 'Joined'].map(h => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? Array.from({length: 10}).map((_, i) => (
              <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-8 skeleton rounded"/></td></tr>
            )) : customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4 text-gray-500">{c.email}</td>
                <td className="py-3 px-4 text-gray-500">{c.phone || '—'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${c.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isEmailVerified ? 'Yes' : 'No'}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
