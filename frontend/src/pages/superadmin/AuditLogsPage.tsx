import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Download, ShieldAlert, User, Package, ShoppingCart, Tag, Settings } from 'lucide-react';
import { apiClient } from '@api/client';

const ACTION_ICONS: Record<string, typeof User> = {
  user: User, product: Package, order: ShoppingCart, coupon: Tag, settings: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-600',
  login: 'bg-purple-100 text-purple-700',
  approve: 'bg-teal-100 text-teal-700',
  reject: 'bg-rose-100 text-rose-600',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, actionFilter, resourceFilter],
    queryFn: () =>
      apiClient.get('/admin/audit-logs', {
        params: { page, limit: 30, search: search || undefined, action: actionFilter || undefined, resource: resourceFilter || undefined },
      }).then((r) => r.data.data).catch(() => ({ logs: [], total: 0 })),
  });

  const logs = data?.logs || data?.items || (Array.isArray(data) ? data : []);
  const total = data?.total || logs.length;

  const handleExport = () => {
    apiClient.get('/admin/audit-logs/export', { responseType: 'blob' })
      .then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a'); a.href = url; a.download = `audit-logs-${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
      }).catch(() => alert('Export not available'));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Audit Logs</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Complete history of all admin actions</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 border border-charcoal-200 bg-white px-4 py-2 text-xs text-charcoal-700 hover:bg-cream-50 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search admin, resource…" className="w-full pl-9 pr-4 py-2 border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-charcoal-400" />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="border border-charcoal-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal-400">
          <option value="">All Actions</option>
          {['create', 'update', 'delete', 'login', 'approve', 'reject', 'export'].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
        </select>
        <select value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} className="border border-charcoal-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal-400">
          <option value="">All Resources</option>
          {['user', 'product', 'order', 'coupon', 'review', 'settings', 'staff'].map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Logs */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center">
          <ShieldAlert size={40} className="mx-auto mb-4 text-charcoal-200" />
          <p className="text-charcoal-400 text-sm">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-white border border-charcoal-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 border-b border-charcoal-100">
              <tr>
                {['Time', 'Admin', 'Action', 'Resource', 'Details', 'IP'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-medium text-charcoal-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {logs.map((log: any) => {
                const ResourceIcon = ACTION_ICONS[log.resource?.toLowerCase()] || Settings;
                const isExpanded = expanded === (log._id || log.id);
                return (
                  <>
                    <tr key={log._id || log.id} className="hover:bg-cream-50 transition-colors cursor-pointer" onClick={() => setExpanded(isExpanded ? null : (log._id || log.id))}>
                      <td className="px-4 py-3 text-xs text-charcoal-400 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-charcoal-200 flex items-center justify-center text-xs font-bold text-charcoal-700">
                            {(log.admin?.name || 'A')[0].toUpperCase()}
                          </div>
                          <span className="text-xs text-charcoal-700">{log.admin?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${ACTION_COLORS[log.action] || 'bg-charcoal-100 text-charcoal-600'}`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
                          <ResourceIcon size={13} className="text-charcoal-400" />
                          <span className="capitalize">{log.resource}</span>
                          {log.resourceId && <span className="font-mono text-charcoal-400">#{log.resourceId?.slice(-6)}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-charcoal-500 max-w-xs truncate">{log.description || '—'}</td>
                      <td className="px-4 py-3 text-xs text-charcoal-400 font-mono">{log.ip || '—'}</td>
                    </tr>
                    {isExpanded && log.metadata && (
                      <tr key={`${log._id || log.id}-detail`}>
                        <td colSpan={6} className="px-4 py-3 bg-cream-50 border-t border-charcoal-100">
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <p className="text-xs text-charcoal-500 font-mono whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</p>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 30 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-400">Showing {(page - 1) * 30 + 1}–{Math.min(page * 30, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Prev</button>
            <button disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
