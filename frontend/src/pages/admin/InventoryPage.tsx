import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@api/client';
import { Search, AlertTriangle, Package, TrendingDown, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'all' | 'low' | 'out';

export default function AdminInventoryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editNote, setEditNote] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => apiClient.get('/inventory/summary').then(r => r.data.data).catch(() => ({})),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'products', tab, search, page],
    queryFn: () =>
      apiClient.get('/inventory/products', {
        params: { tab, search: search || undefined, page, limit: 20 },
      }).then(r => r.data).catch(() => ({ data: [], meta: { total: 0, hasNext: false } })),
    placeholderData: (prev) => prev,
  });

  const products: any[] = data?.data || [];
  const meta = data?.meta;

  const adjustMutation = useMutation({
    mutationFn: ({ id, quantity, note }: { id: string; quantity: number; note: string }) =>
      apiClient.patch(`/inventory/${id}/adjust`, { quantity, note }),
    onSuccess: () => {
      toast.success('Stock updated');
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const handleAdjust = (product: any) => {
    setEditingId(product._id || product.id);
    setEditQty(String(product.stock ?? 0));
    setEditNote('');
  };

  const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'all', label: 'All Products', icon: Package },
    { id: 'low', label: 'Low Stock', icon: AlertTriangle },
    { id: 'out', label: 'Out of Stock', icon: TrendingDown },
  ];

  const stockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= 5) return 'text-amber-600 bg-amber-50';
    return 'text-green-700 bg-green-50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Inventory Management</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Monitor and adjust stock levels</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['inventory'] })}
          className="flex items-center gap-2 border border-charcoal-200 bg-white px-4 py-2 text-xs text-charcoal-700 hover:bg-cream-50 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: summary?.total ?? 0, icon: Package, color: 'text-charcoal-700' },
          { label: 'Active', value: summary?.active ?? 0, icon: Package, color: 'text-green-700' },
          { label: 'Low Stock', value: summary?.lowStock ?? 0, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Out of Stock', value: summary?.outOfStock ?? 0, icon: TrendingDown, color: 'text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-charcoal-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-charcoal-400 uppercase tracking-wider">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-3xl font-semibold font-sans ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-charcoal-100 bg-white overflow-hidden">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-charcoal-100 last:border-r-0 transition-colors whitespace-nowrap ${tab === id ? 'bg-charcoal-950 text-white' : 'text-charcoal-600 hover:bg-cream-50'}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU…"
            className="w-full pl-8 pr-3 py-2 border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-charcoal-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-charcoal-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-charcoal-50 border-b border-charcoal-100">
            <tr>
              {['Product', 'SKU', 'Category', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-5 skeleton" /></td></tr>
                ))
              : products.length === 0
                ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-charcoal-400 text-sm">
                        <Package size={32} className="mx-auto mb-3 text-charcoal-200" />
                        No products found
                      </td>
                    </tr>
                  )
                : products.map((p: any) => {
                    const id = p._id || p.id;
                    const stock = p.stock ?? 0;
                    const isEditing = editingId === id;
                    return (
                      <tr key={id} className="hover:bg-cream-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.thumbnail || '/placeholder.svg'} alt="" className="w-8 h-10 object-cover bg-cream-100 flex-shrink-0" />
                            <p className="font-medium text-charcoal-900 text-xs line-clamp-2 max-w-[180px]">{p.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-charcoal-400 font-mono">{p.sku || '—'}</td>
                        <td className="px-4 py-3 text-xs text-charcoal-600 capitalize">{p.category || '—'}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editQty}
                              onChange={e => setEditQty(e.target.value)}
                              className="w-20 border border-charcoal-300 px-2 py-1 text-xs focus:outline-none focus:border-gold-400"
                              autoFocus
                            />
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${stockColor(stock)}`}>
                              {stock === 0 ? 'Out' : stock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-charcoal-400">{p.lowStockThreshold ?? 10}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500'}`}>
                            {p.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editNote}
                                onChange={e => setEditNote(e.target.value)}
                                placeholder="Note (optional)"
                                className="border border-charcoal-200 px-2 py-1 text-xs w-28 focus:outline-none"
                              />
                              <button
                                onClick={() => adjustMutation.mutate({ id, quantity: Number(editQty), note: editNote })}
                                disabled={adjustMutation.isPending}
                                className="bg-charcoal-950 text-white px-3 py-1 text-xs hover:bg-charcoal-800 transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-charcoal-400 hover:text-charcoal-700">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAdjust(p)}
                                className="px-3 py-1.5 border border-charcoal-200 text-xs text-charcoal-600 hover:bg-cream-50 transition-colors"
                              >
                                Adjust Stock
                              </button>
                              <button
                                onClick={() => adjustMutation.mutate({ id, quantity: stock + 1, note: 'Quick +1' })}
                                className="p-1.5 border border-charcoal-200 text-charcoal-500 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                                title="+1"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                onClick={() => adjustMutation.mutate({ id, quantity: Math.max(0, stock - 1), note: 'Quick -1' })}
                                className="p-1.5 border border-charcoal-200 text-charcoal-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                title="-1"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-400">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} of {meta.total} products
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Prev</button>
            <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
