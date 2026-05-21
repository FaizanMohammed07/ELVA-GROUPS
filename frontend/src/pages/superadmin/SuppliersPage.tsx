import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Plus, Search, Edit2, Star, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';

const PAYMENT_TERMS = ['advance', 'cod', 'net15', 'net30', 'net60'];
const CATEGORIES = ['raw-material', 'packaging', 'both', 'other'];
const EMPTY = { name: '', contactPerson: '', email: '', phone: '', address: '', city: '', category: 'raw-material', paymentTerms: 'cod', leadTimeDays: 7, rating: 3, notes: '' };

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => apiClient.get('/suppliers', { params: { search: search || undefined } }).then(r => r.data.data),
  });
  const { data: supplierDetail } = useQuery({
    queryKey: ['supplier', selectedId],
    queryFn: () => selectedId ? apiClient.get(`/suppliers/${selectedId}`).then(r => r.data.data) : null,
    enabled: !!selectedId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? apiClient.put(`/suppliers/${editId}`, data) : apiClient.post('/suppliers', data),
    onSuccess: () => { toast.success(editId ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['suppliers'] }); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setShowModal(true); };
  const openEdit = (s: any) => {
    setForm({ name: s.name, contactPerson: s.contactPerson, email: s.email || '', phone: s.phone, address: s.address || '', city: s.city || '', category: s.category, paymentTerms: s.paymentTerms, leadTimeDays: s.leadTimeDays, rating: s.rating, notes: s.notes || '' });
    setEditId(s.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Supplier Registry</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">{(suppliers as any[]).length} active suppliers</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…"
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-indigo-400" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-50">
            {(suppliers as any[]).length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-sans text-sm">
                <Truck size={32} className="mx-auto mb-3 text-gray-200" />
                No suppliers yet
              </div>
            ) : (suppliers as any[]).map((s: any) => (
              <div key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={cn('flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors', selectedId === s.id && 'bg-indigo-50')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 font-sans text-sm">{s.name}</p>
                    <span className="text-[10px] font-sans bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">{s.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">{s.contactPerson} · {s.phone} · {s.city || 'No city'}</p>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    {s.paymentTerms.toUpperCase()} · {s.leadTimeDays}d lead time
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(n => <Star key={n} size={10} className={cn(n <= s.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />)}
                  </div>
                  <button onClick={e => { e.stopPropagation(); openEdit(s); }}
                    className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {supplierDetail ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 sticky top-6">
              <div>
                <h3 className="font-semibold text-gray-900 font-sans">{supplierDetail.supplier?.name}</h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">{supplierDetail.supplier?.category}</p>
              </div>
              <div className="space-y-2 text-xs font-sans">
                {[
                  { label: 'Contact', value: supplierDetail.supplier?.contactPerson },
                  { label: 'Phone', value: supplierDetail.supplier?.phone },
                  { label: 'Email', value: supplierDetail.supplier?.email || '—' },
                  { label: 'City', value: supplierDetail.supplier?.city || '—' },
                  { label: 'Payment', value: supplierDetail.supplier?.paymentTerms?.toUpperCase() },
                  { label: 'Lead Time', value: `${supplierDetail.supplier?.leadTimeDays} days` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              {supplierDetail.supplier?.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs font-sans text-gray-600">{supplierDetail.supplier.notes}</div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-sans mb-2">Materials Supplied ({supplierDetail.materials?.length || 0})</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(supplierDetail.materials || []).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-700">{m.name}</span>
                      <span className="text-gray-400">₹{m.costPerUnit}/{m.unit}</span>
                    </div>
                  ))}
                  {!supplierDetail.materials?.length && <p className="text-xs text-gray-400 font-sans">No materials linked yet</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 font-sans">
              <Truck size={28} className="mx-auto mb-2 text-gray-300" />
              Click a supplier to view details
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-semibold font-sans text-gray-900">{editId ? 'Edit Supplier' : 'New Supplier'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Company Name *" value={form.name} onChange={(v: string) => set('name', v)} />
                <Field label="Contact Person *" value={form.contactPerson} onChange={(v: string) => set('contactPerson', v)} />
                <Field label="Phone *" value={form.phone} onChange={(v: string) => set('phone', v)} />
                <Field label="Email" value={form.email} onChange={(v: string) => set('email', v)} />
                <Field label="City" value={form.city} onChange={(v: string) => set('city', v)} />
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Payment Terms</label>
                  <select value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none">
                    {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-sans mb-1.5">Lead Time (days)</label>
                  <input type="number" value={form.leadTimeDays} onChange={e => set('leadTimeDays', +e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Rating (1–5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => set('rating', n)}
                      className={cn('w-9 h-9 rounded-lg border text-sm font-sans transition-colors',
                        form.rating >= n ? 'bg-amber-400 border-amber-400 text-white' : 'border-gray-200 text-gray-400 hover:border-amber-300')}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 flex-shrink-0">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name || !form.phone}
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
    <input value={value} onChange={(e: any) => onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400" />
  </div>
);
