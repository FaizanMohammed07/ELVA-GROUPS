import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Copy, Trash2, Edit2, X, Check } from 'lucide-react';
import { apiClient } from '@api/client';
import toast from 'react-hot-toast';

const DEFAULT_COUPON = {
  code: '', type: 'percentage', value: '', minOrderValue: '', maxDiscount: '',
  usageLimit: '', expiresAt: '', isActive: true, description: '',
};

export default function AdminMarketingPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [form, setForm] = useState(DEFAULT_COUPON);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => apiClient.get('/coupons', { params: { limit: 50 } }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/coupons', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon created'); closeModal(); },
    onError: () => toast.error('Failed to create coupon'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/coupons/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon updated'); closeModal(); },
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon deleted'); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.patch(`/coupons/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const openCreate = () => { setEditCoupon(null); setForm(DEFAULT_COUPON); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditCoupon(c);
    setForm({
      code: c.code || '', type: c.type || 'percentage',
      value: c.value || '', minOrderValue: c.minOrderValue || '',
      maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.isActive ?? true, description: c.description || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditCoupon(null); setForm(DEFAULT_COUPON); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      value: Number(form.value),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: form.expiresAt || undefined,
    };
    if (editCoupon) { updateMutation.mutate({ id: editCoupon._id || editCoupon.id, data: payload }); }
    else { createMutation.mutate(payload); }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
    toast.success('Code copied!');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'ELVA' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(f => ({ ...f, code }));
  };

  const coupons = data?.coupons || data?.items || (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Marketing</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Manage coupons and promotions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"><Plus size={15} /> New Coupon</button>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c: any) => {
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <motion.div key={c._id || c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`border-2 border-dashed p-5 relative ${c.isActive && !isExpired ? 'border-charcoal-200 bg-white' : 'border-charcoal-100 bg-charcoal-50 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gold-500" />
                    <button onClick={() => handleCopy(c.code)} className="font-mono text-sm font-bold text-charcoal-900 hover:text-gold-600 flex items-center gap-1.5 transition-colors">
                      {c.code}
                      {copied === c.code ? <Check size={12} className="text-green-500" /> : <Copy size={11} className="text-charcoal-400" />}
                    </button>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive && !isExpired ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500'}`}>
                    {isExpired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-2xl font-display text-charcoal-950 mb-1">
                  {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </p>
                {c.minOrderValue && <p className="text-xs text-charcoal-500">Min order: ₹{c.minOrderValue}</p>}
                {c.maxDiscount && c.type === 'percentage' && <p className="text-xs text-charcoal-500">Max discount: ₹{c.maxDiscount}</p>}
                {c.expiresAt && <p className="text-xs text-charcoal-400 mt-1">Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>}
                {c.usageCount !== undefined && <p className="text-xs text-charcoal-400">Used: {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''} times</p>}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-charcoal-100">
                  <button onClick={() => toggleActiveMutation.mutate({ id: c._id || c.id, isActive: !c.isActive })} className="text-xs text-charcoal-500 hover:text-charcoal-800">{c.isActive ? 'Deactivate' : 'Activate'}</button>
                  <span className="text-charcoal-200">·</span>
                  <button onClick={() => openEdit(c)} className="text-xs text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1"><Edit2 size={11} /> Edit</button>
                  <span className="text-charcoal-200">·</span>
                  <button onClick={() => setDeleteTarget(c._id || c.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={11} /> Delete</button>
                </div>
              </motion.div>
            );
          })}
          {coupons.length === 0 && (
            <div className="col-span-3 py-16 text-center text-charcoal-400">
              <Tag size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No coupons yet. Create your first one.</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="bg-white w-full max-w-md flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100 flex-shrink-0">
                <h2 className="font-display text-xl text-charcoal-950">{editCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
                <button onClick={closeModal} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="label-xs">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input required value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-field flex-1 font-mono" />
                    <button type="button" onClick={generateCode} className="px-3 py-2 border border-charcoal-200 text-xs text-charcoal-600 hover:bg-cream-50 whitespace-nowrap">Generate</button>
                  </div>
                </div>
                <div>
                  <label className="label-xs">Type *</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="input-field bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                {form.type !== 'free_shipping' && (
                  <div>
                    <label className="label-xs">Discount Value *</label>
                    <input required type="number" min="0" max={form.type === 'percentage' ? 100 : undefined} value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '20' : '100'} className="input-field" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-xs">Min Order (₹)</label><input type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm(f => ({ ...f, minOrderValue: e.target.value }))} className="input-field" /></div>
                  {form.type === 'percentage' && <div><label className="label-xs">Max Discount (₹)</label><input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input-field" /></div>}
                  <div><label className="label-xs">Usage Limit</label><input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input-field" /></div>
                  <div><label className="label-xs">Expires At</label><input type="date" value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input-field" /></div>
                </div>
                <div><label className="label-xs">Description</label><input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Diwali special offer" className="input-field" /></div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-charcoal-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-gold-500" /> Active immediately
                </label>
                <div className="flex gap-3 pt-2 border-t border-charcoal-100">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary py-2.5 px-6 text-xs disabled:opacity-60">
                    {createMutation.isPending || updateMutation.isPending ? 'Saving…' : editCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-outline py-2.5 px-6 text-xs">Cancel</button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white p-6 max-w-sm w-full">
              <h3 className="font-display text-lg text-charcoal-950 mb-2">Delete Coupon?</h3>
              <p className="text-sm text-charcoal-500 mb-5">This will permanently delete this coupon code.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteMutation.mutate(deleteTarget!)} disabled={deleteMutation.isPending} className="btn-primary bg-red-600 hover:bg-red-700 py-2 px-5 text-xs disabled:opacity-60">{deleteMutation.isPending ? 'Deleting…' : 'Delete'}</button>
                <button onClick={() => setDeleteTarget(null)} className="btn-outline py-2 px-5 text-xs">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
