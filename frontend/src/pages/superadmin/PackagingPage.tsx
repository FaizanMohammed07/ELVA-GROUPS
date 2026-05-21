import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Plus, Edit2, Package, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';

const TYPES = ['honeycomb-paper','shredded-paper','custom-box','sticker','thank-you-card','premium-ribbon','magnetic-box','protective-wrap','glass-protection','eco-packaging','luxury-packaging','tissue-paper','tape','label','other'];
const BRANDING = ['logo-printed', 'plain', 'custom', 'eco'];
const EMPTY = { name: '', type: 'other', costPerUnit: 0, unit: 'pcs', supplierName: '', currentStock: 0, reorderPoint: 50, brandingType: 'plain', premiumScore: 5, isReusable: false };

export default function PackagingPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['packaging-items'],
    queryFn: () => apiClient.get('/packaging-items').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? apiClient.put(`/packaging-items/${editId}`, data) : apiClient.post('/packaging-items', data),
    onSuccess: () => { toast.success(editId ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['packaging-items'] }); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setShowModal(true); };
  const openEdit = (p: any) => {
    setForm({ name: p.name, type: p.type, costPerUnit: p.costPerUnit, unit: p.unit, supplierName: p.supplierName || '', currentStock: p.currentStock, reorderPoint: p.reorderPoint, brandingType: p.brandingType, premiumScore: p.premiumScore, isReusable: p.isReusable });
    setEditId(p.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Group by type for display
  const grouped = (items as any[]).reduce((acc: any, item: any) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const PREMIUM_COLOR = (score: number) =>
    score >= 8 ? 'text-purple-600' : score >= 5 ? 'text-amber-600' : 'text-gray-500';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Packaging Intelligence</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">{(items as any[]).length} packaging items tracked</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: (items as any[]).length },
          { label: 'Avg Premium Score', value: ((items as any[]).reduce((s: number, i: any) => s + i.premiumScore, 0) / Math.max(1, (items as any[]).length)).toFixed(1) },
          { label: 'Low Stock', value: (items as any[]).filter((i: any) => i.currentStock <= i.reorderPoint).length },
          { label: 'Reusable', value: (items as any[]).filter((i: any) => i.isReusable).length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-sans text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-sans mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-400 font-sans text-sm">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <Package size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-sans">No packaging items yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, typeItems]: [string, any]) => (
            <div key={type} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans capitalize">{type.replace(/-/g, ' ')}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {typeItems.map((item: any) => {
                  const isLow = item.currentStock <= item.reorderPoint;
                  return (
                    <div key={item.id} className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 font-sans text-sm">{item.name}</p>
                          {item.isReusable && <span className="text-[9px] font-sans bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Reusable</span>}
                          <span className={cn('text-[9px] font-sans bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize')}>{item.brandingType}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">{item.supplierName || 'No supplier'} · {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm font-sans">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">₹{item.costPerUnit}</p>
                          <p className="text-[10px] text-gray-400">per {item.unit}</p>
                        </div>
                        <div className="text-center">
                          <p className={cn('font-semibold', isLow ? 'text-red-600' : 'text-gray-700')}>{item.currentStock}</p>
                          <p className="text-[10px] text-gray-400">in stock</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-0.5 justify-center">
                            {[1,2,3,4,5].map(n => (
                              <div key={n} className={cn('w-1.5 h-1.5 rounded-full', n <= Math.round(item.premiumScore / 2) ? 'bg-amber-400' : 'bg-gray-200')} />
                            ))}
                          </div>
                          <p className={cn('text-[10px] font-semibold', PREMIUM_COLOR(item.premiumScore))}>{item.premiumScore}/10</p>
                        </div>
                        <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold font-sans text-gray-900">{editId ? 'Edit Item' : 'New Packaging Item'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none">
                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Branding</label>
                  <select value={form.brandingType} onChange={e => set('brandingType', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none">
                    {BRANDING.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <NF label="Cost per Unit (₹)" value={form.costPerUnit} onChange={(v: number) => set('costPerUnit', v)} />
                <NF label="Current Stock" value={form.currentStock} onChange={(v: number) => set('currentStock', v)} />
                <NF label="Reorder Point" value={form.reorderPoint} onChange={(v: number) => set('reorderPoint', v)} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Supplier Name</label>
                <input value={form.supplierName} onChange={e => set('supplierName', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-2">Premium Score: <strong>{form.premiumScore}/10</strong></label>
                <input type="range" min={1} max={10} value={form.premiumScore} onChange={e => set('premiumScore', +e.target.value)} className="w-full accent-amber-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isReusable} onChange={e => set('isReusable', e.target.checked)} className="rounded accent-indigo-600" />
                <span className="text-sm font-sans text-gray-700">Reusable / Eco-friendly</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name}
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

const NF = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-xs text-gray-600 font-sans mb-1.5">{label}</label>
    <input type="number" value={value || ''} onChange={(e: any) => onChange(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
  </div>
);
