import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserX, UserCheck, X, ShoppingBag, Mail, Phone } from 'lucide-react';
import { apiClient } from '@api/client';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => apiClient.get('/users', { params: { role: 'customer', page, limit: 20, search } }).then((r) => ({
      users: r.data.data,
      total: r.data.meta?.total ?? r.data.data?.length ?? 0,
    })),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id }: { id: string; isActive: boolean }) => apiClient.patch(`/users/${id}/status`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success(vars.isActive ? 'Customer unblocked' : 'Customer blocked');
      setSelectedUser((prev: any) => prev ? { ...prev, isActive: vars.isActive } : null);
    },
    onError: () => toast.error('Failed to update customer'),
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Customers</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">{total} registered customers</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="w-full pl-9 pr-4 py-2 border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-charcoal-400" />
      </div>

      <div className="bg-white border border-charcoal-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 border-b border-charcoal-100">
              <tr>
                {['Customer', 'Email', 'Phone', 'Orders', 'Joined', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-medium text-charcoal-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {users.map((u: any) => (
                <tr key={u._id || u.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{(u.name || 'U')[0].toUpperCase()}</span>
                      </div>
                      <p className="font-medium text-charcoal-900">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-charcoal-500 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-charcoal-600">{u.orderCount || 0}</td>
                  <td className="px-4 py-3 text-xs text-charcoal-400">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.isActive ? 'Active' : 'Blocked'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(u)} className="text-xs text-charcoal-400 hover:text-charcoal-700">View</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-charcoal-400 text-sm">No customers found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-400">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Next</button>
          </div>
        </div>
      )}

      {/* Customer Detail Panel */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white w-full sm:max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100">
                <h2 className="font-display text-lg text-charcoal-950">Customer Profile</h2>
                <button onClick={() => setSelectedUser(null)} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{(selectedUser.name || 'U')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900">{selectedUser.name}</p>
                    <p className="text-xs text-charcoal-400">Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-charcoal-600"><Mail size={14} />{selectedUser.email}</div>
                  {selectedUser.phone && <div className="flex items-center gap-2 text-charcoal-600"><Phone size={14} />{selectedUser.phone}</div>}
                  <div className="flex items-center gap-2 text-charcoal-600"><ShoppingBag size={14} />{selectedUser.orderCount || 0} orders placed</div>
                </div>

                <div className="pt-2 border-t border-charcoal-100">
                  <p className="label-xs mb-3">Account Action</p>
                  <button
                    onClick={() => blockMutation.mutate({ id: selectedUser._id || selectedUser.id, isActive: !selectedUser.isActive })}
                    disabled={blockMutation.isPending}
                    className={`flex items-center gap-2 text-sm font-medium px-4 py-2 border transition-colors disabled:opacity-60 ${selectedUser.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                  >
                    {selectedUser.isActive ? <><UserX size={15} /> Block Customer</> : <><UserCheck size={15} /> Unblock Customer</>}
                    {blockMutation.isPending && '…'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
