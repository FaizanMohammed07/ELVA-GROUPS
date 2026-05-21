import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Plus, Search, AlertTriangle, Edit2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';

const CATEGORIES = ['wax', 'wick', 'fragrance', 'dye', 'clay', 'paper', 'fabric', 'metal', 'glass', 'packaging', 'chemical', 'other'];
const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'm', 'cm', 'sqft'];

const EMPTY = { name: '', sku: '', category: 'other', unit: 'g', costPerUnit: 0, supplierName: '', currentStock: 0, reorderPoint: 0, minOrderQty: 1, wastagePercent: 0, leadTimeDays: 7 };

export default function MaterialsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials', search, filterCat],
    queryFn: () => apiClient.get('/materials', { params: { search: search || undefined, category: filterCat || undefined } }).then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? apiClient.put(`/materials/${editId}`, data) : apiClient.post('/materials', data),
    onSuccess: () => { toast.success(editId ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['materials'] }); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const adjustStock = useMutation({
    mutationFn: ({ id, adj }: { id: string; adj: number }) => apiClient.patch(`/materials/${id}/stock`, { adjustment: adj }),
    onSuccess: () => { toast.success('Stock updated'); qc.invalidateQueries({ queryKey: ['materials'] }); },
  });

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setShowModal(true); };
  const openEdit = (m: any) => {
    setForm({ name: m.name, sku: m.sku, category: m.category, unit: m.unit, costPerUnit: m.costPerUnit, supplierName: m.supplierName || '', currentStock: m.currentStock, reorderPoint: m.reorderPoint, minOrderQty: m.minOrderQty, wastagePercent: m.wastagePercent, leadTimeDays: m.leadTimeDays });
    setEditId(m.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const lowStock = (materials as any[]).filter((m: any) => m.currentStock <= m.reorderPoint);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Raw Materials Registry</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">{(materials as any[]).length} materials tracked</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> Add Material
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm font-sans text-amber-800">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <strong>{lowStock.length} material{lowStock.length > 1 ? 's' : ''} at or below reorder point:</strong>
          {lowStock.slice(0, 4).map((m: any) => <span key={m.id} className="bg-amber-100 px-2 py-0.5 rounded text-xs">{m.name}</span>)}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-indigo-400" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              {['Material', 'Category', 'Unit', 'Cost/Unit', 'Stock', 'Reorder', 'Wastage', 'Supplier', 'Actions'].map(h => (
                <th key={h} className={cn('py-3 font-semibold', h === 'Material' ? 'text-left px-5' : 'text-center px-2')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400">Loading…</td></tr>
            ) : (materials as any[]).length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400">No materials found</td></tr>
            ) : (materials as any[]).map((m: any) => {
              const isLow = m.currentStock <= m.reorderPoint;
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.sku}</p>
                  </td>
                  <td className="text-center px-2">
                    <span className="text-[10px] font-sans bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{m.category}</span>
                  </td>
                  <td className="text-center px-2 text-gray-600">{m.unit}</td>
                  <td className="text-center px-2 font-medium text-gray-900">₹{m.costPerUnit}</td>
                  <td className="text-center px-2">
                    <div className="flex items-center justify-center gap-1">
                      <span className={cn('font-semibold', isLow ? 'text-red-600' : 'text-gray-700')}>{m.currentStock}</span>
                      {isLow && <AlertTriangle size={11} className="text-red-400" />}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <button onClick={() => adjustStock.mutate({ id: m.id, adj: -1 })} className="text-gray-400 hover:text-red-500 w-4 h-4 flex items-center justify-center text-xs border border-gray-200 rounded">−</button>
                      <button onClick={() => adjustStock.mutate({ id: m.id, adj: 1 })} className="text-gray-400 hover:text-green-500 w-4 h-4 flex items-center justify-center text-xs border border-gray-200 rounded">+</button>
                    </div>
                  </td>
                  <td className="text-center px-2 text-gray-500 text-xs">{m.reorderPoint} {m.unit}</td>
                  <td className="text-center px-2 text-gray-500 text-xs">{m.wastagePercent}%</td>
                  <td className="text-center px-2 text-gray-500 text-xs truncate max-w-[80px]">{m.supplierName || '—'}</td>
                  <td className="text-center px-2">
                    <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-indigo-500" />
                <h2 className="text-lg font-semibold font-sans text-gray-900">{editId ? 'Edit Material' : 'New Material'}</h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name *" value={form.name} onChange={(v: string) => set('name', v)} />
                <Field label="SKU *" value={form.sku} onChange={(v: string) => set('sku', v.toUpperCase())} />
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Unit</label>
                  <select value={form.unit} onChange={e => set('unit', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <NumberField label="Cost per Unit (₹)" value={form.costPerUnit} onChange={(v: number) => set('costPerUnit', v)} />
                <NumberField label="Wastage %" value={form.wastagePercent} onChange={(v: number) => set('wastagePercent', v)} />
                <NumberField label="Current Stock" value={form.currentStock} onChange={(v: number) => set('currentStock', v)} />
                <NumberField label="Reorder Point" value={form.reorderPoint} onChange={(v: number) => set('reorderPoint', v)} />
                <NumberField label="Min Order Qty" value={form.minOrderQty} onChange={(v: number) => set('minOrderQty', v)} />
                <NumberField label="Lead Time (days)" value={form.leadTimeDays} onChange={(v: number) => set('leadTimeDays', v)} />
              </div>
              <Field label="Supplier Name" value={form.supplierName} onChange={(v: string) => set('supplierName', v)} />
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name || !form.sku}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-sans font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-xs text-gray-600 font-sans mb-1.5">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
  </div>
);
const NumberField = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-xs text-gray-600 font-sans mb-1.5">{label}</label>
    <input type="number" value={value || ''} onChange={e => onChange(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
  </div>
);
