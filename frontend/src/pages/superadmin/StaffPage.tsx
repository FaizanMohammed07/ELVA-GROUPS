import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'support', 'marketing', 'inventory'] as const;
type StaffRole = typeof ROLES[number];

interface CreateAdminForm {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

export default function SuperAdminStaffPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAdminForm>({ name: '', email: '', password: '', role: 'admin' });

  const { data: staff, isLoading } = useQuery({
    queryKey: ['sa', 'staff'],
    queryFn: () => apiClient.get('/admin/staff').then(r => r.data.data),
  });

  const { mutate: createAdmin, isPending } = useMutation({
    mutationFn: (data: CreateAdminForm) => apiClient.post('/admin/staff/create', data),
    onSuccess: () => {
      toast.success('Admin user created');
      qc.invalidateQueries({ queryKey: ['sa', 'staff'] });
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'admin' });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to create admin');
    },
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/admin/staff/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['sa', 'staff'] });
    },
  });

  const { mutate: deactivate } = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/staff/${id}/deactivate`),
    onSuccess: () => {
      toast.success('Staff deactivated');
      qc.invalidateQueries({ queryKey: ['sa', 'staff'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    createAdmin(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Staff Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-charcoal-950 text-white px-4 py-2.5 text-sm font-medium font-sans hover:bg-charcoal-800 transition-colors"
        >
          <UserPlus size={15} /> Create Admin
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-sans text-amber-800">
        Only Super Admins can manage staff roles. Changes take effect immediately.
      </div>

      {/* Create Admin Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold font-sans text-gray-900">Create Admin User</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-950"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-950"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-950"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffRole }))}
                  className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-950"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 text-sm font-sans hover:bg-gray-50 transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-charcoal-950 text-white py-2.5 text-sm font-sans hover:bg-charcoal-800 disabled:opacity-50 transition-colors rounded"
                >
                  {isPending ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-8 skeleton rounded" /></td></tr>
              ))
            ) : (staff || []).map((s: any) => (
              <tr key={s.id || s._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{s.name}</td>
                <td className="py-3 px-4 text-gray-500">{s.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                    {s.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <select
                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                      defaultValue={s.role}
                      onChange={e => updateRole({ id: s.id || s._id, role: e.target.value })}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {s.isActive && (
                      <button
                        onClick={() => deactivate(s.id || s._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
