import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';

const ROLES = ['admin', 'support', 'marketing', 'inventory'];

export default function SuperAdminStaffPage() {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['sa', 'staff'],
    queryFn: () => apiClient.get('/admin/staff').then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Staff Management</h1>
        <button className="bg-charcoal-950 text-white px-4 py-2.5 text-sm font-medium font-sans hover:bg-charcoal-800 transition-colors">
          + Invite Staff
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-sans text-amber-800">
        ⚠️ Only Super Admins can manage staff roles. Changes take effect immediately.
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(staff || []).map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{s.name}</td>
                <td className="py-3 px-4 text-gray-500">{s.email}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">{s.role?.replace('_', ' ')}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3 px-4 text-gray-400 text-xs">{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}</td>
                <td className="py-3 px-4">
                  <select className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" defaultValue={s.role}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
