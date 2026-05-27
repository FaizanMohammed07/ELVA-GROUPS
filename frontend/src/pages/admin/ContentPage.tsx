import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Image, Bell, Globe } from 'lucide-react';
import { apiClient } from '@api/client';
import toast from 'react-hot-toast';

const DEFAULT_BANNER = { title: '', subtitle: '', ctaText: '', ctaLink: '', imageUrl: '', isActive: true, position: 0 };
const DEFAULT_ANNOUNCEMENT = { message: '', type: 'info', isActive: true, expiresAt: '' };

export default function AdminContentPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'banners' | 'announcements' | 'seo'>('banners');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [bannerForm, setBannerForm] = useState(DEFAULT_BANNER);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState(DEFAULT_ANNOUNCEMENT);
  const [editAnn, setEditAnn] = useState<any>(null);

  const { data: bannersData } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => apiClient.get('/content/banners').then((r) => r.data.data).catch(() => []),
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => apiClient.get('/content/announcements').then((r) => r.data.data).catch(() => []),
  });

  const createBannerMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/content/banners', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner created'); setShowBannerModal(false); setBannerForm(DEFAULT_BANNER); },
    onError: () => toast.error('Failed to create banner'),
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/content/banners/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner updated'); setShowBannerModal(false); setEditBanner(null); },
    onError: () => toast.error('Failed to update banner'),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/content/banners/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner deleted'); },
    onError: () => toast.error('Failed to delete banner'),
  });

  const createAnnMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/content/announcements', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); toast.success('Announcement created'); setShowAnnModal(false); setAnnForm(DEFAULT_ANNOUNCEMENT); },
    onError: () => toast.error('Failed to create announcement'),
  });

  const deleteAnnMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/content/announcements/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); toast.success('Announcement deleted'); },
    onError: () => toast.error('Failed to delete announcement'),
  });

  const openEditBanner = (b: any) => { setEditBanner(b); setBannerForm({ title: b.title || '', subtitle: b.subtitle || '', ctaText: b.ctaText || '', ctaLink: b.ctaLink || '', imageUrl: b.imageUrl || '', isActive: b.isActive ?? true, position: b.position || 0 }); setShowBannerModal(true); };

  const handleBannerSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editBanner) updateBannerMutation.mutate({ id: editBanner._id || editBanner.id, data: bannerForm }); else createBannerMutation.mutate(bannerForm); };
  const handleAnnSubmit = (e: React.FormEvent) => { e.preventDefault(); createAnnMutation.mutate(annForm); };

  const banners = bannersData?.banners || bannersData?.items || (Array.isArray(bannersData) ? bannersData : []);
  const announcements = announcementsData?.announcements || announcementsData?.items || (Array.isArray(announcementsData) ? announcementsData : []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display text-2xl text-charcoal-950">Content Management</h1>

      {/* Tabs */}
      <div className="flex border-b border-charcoal-100">
        {([['banners', 'Hero Banners', Image], ['announcements', 'Announcements', Bell], ['seo', 'SEO & Meta', Globe]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-charcoal-950 text-charcoal-950' : 'border-transparent text-charcoal-400 hover:text-charcoal-700'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Banners Tab */}
      {tab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditBanner(null); setBannerForm(DEFAULT_BANNER); setShowBannerModal(true); }} className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"><Plus size={15} /> New Banner</button>
          </div>
          <div className="space-y-3">
            {banners.map((b: any) => (
              <div key={b._id || b.id} className="bg-white border border-charcoal-100 p-4 flex items-center gap-4">
                {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-24 h-14 object-cover flex-shrink-0 bg-cream-100" />}
                {!b.imageUrl && <div className="w-24 h-14 bg-cream-100 flex items-center justify-center flex-shrink-0"><Image size={20} className="text-charcoal-300" /></div>}
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">{b.title || 'Untitled'}</p>
                  <p className="text-xs text-charcoal-400">{b.subtitle}</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">CTA: {b.ctaText} → {b.ctaLink}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEditBanner(b)} className="p-1.5 text-charcoal-400 hover:text-charcoal-700"><Edit2 size={15} /></button>
                  <button onClick={() => deleteBannerMutation.mutate(b._id || b.id)} className="p-1.5 text-charcoal-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {banners.length === 0 && <p className="text-center py-12 text-charcoal-400 text-sm">No banners yet. Add your first hero banner.</p>}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAnnModal(true)} className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"><Plus size={15} /> New Announcement</button>
          </div>
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div key={a._id || a.id} className={`p-4 border-l-4 flex items-center gap-4 ${a.type === 'success' ? 'border-green-500 bg-green-50' : a.type === 'warning' ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'}`}>
                <p className="flex-1 text-sm text-charcoal-800">{a.message}</p>
                {a.expiresAt && <span className="text-xs text-charcoal-400">Expires {new Date(a.expiresAt).toLocaleDateString('en-IN')}</span>}
                <button onClick={() => deleteAnnMutation.mutate(a._id || a.id)} className="text-charcoal-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-center py-12 text-charcoal-400 text-sm">No announcements. Add a site-wide banner message.</p>}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {tab === 'seo' && (
        <div className="max-w-2xl space-y-4 bg-white border border-charcoal-100 p-6">
          <p className="text-sm text-charcoal-600">Configure global SEO defaults for the ELUNORA store. These are applied as fallbacks when specific page metadata is not set.</p>
          <div><label className="label-xs">Site Title</label><input defaultValue="ELUNORA — India's Finest Handcrafted Gifts" className="input-field" /></div>
          <div><label className="label-xs">Meta Description</label><textarea rows={3} defaultValue="Discover premium handcrafted gifts, personalized candles, clay art, and luxury hampers. Made with love by Indian artisans." className="input-field resize-none" /></div>
          <div><label className="label-xs">OG Image URL</label><input placeholder="https://..." className="input-field" /></div>
          <button className="btn-primary py-2.5 px-6 text-xs">Save SEO Settings</button>
        </div>
      )}

      {/* Banner Modal */}
      <AnimatePresence>
        {showBannerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowBannerModal(false); }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="bg-white w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100">
                <h2 className="font-display text-xl">{editBanner ? 'Edit Banner' : 'New Banner'}</h2>
                <button onClick={() => setShowBannerModal(false)} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>
              <form onSubmit={handleBannerSubmit} className="p-5 space-y-4">
                <div><label className="label-xs">Title *</label><input required value={bannerForm.title} onChange={(e) => setBannerForm(f => ({ ...f, title: e.target.value }))} className="input-field" /></div>
                <div><label className="label-xs">Subtitle</label><input value={bannerForm.subtitle} onChange={(e) => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} className="input-field" /></div>
                <div><label className="label-xs">Image URL</label><input value={bannerForm.imageUrl} onChange={(e) => setBannerForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cdn.elva.in/hero.jpg" className="input-field" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-xs">CTA Text</label><input value={bannerForm.ctaText} onChange={(e) => setBannerForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Shop Now" className="input-field" /></div>
                  <div><label className="label-xs">CTA Link</label><input value={bannerForm.ctaLink} onChange={(e) => setBannerForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/products" className="input-field" /></div>
                </div>
                <div><label className="label-xs">Position</label><input type="number" min="0" value={bannerForm.position} onChange={(e) => setBannerForm(f => ({ ...f, position: Number(e.target.value) }))} className="input-field" /></div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-charcoal-700"><input type="checkbox" checked={bannerForm.isActive} onChange={(e) => setBannerForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-gold-500" /> Active</label>
                <div className="flex gap-3 pt-2 border-t border-charcoal-100">
                  <button type="submit" disabled={createBannerMutation.isPending || updateBannerMutation.isPending} className="btn-primary py-2.5 px-6 text-xs disabled:opacity-60">{createBannerMutation.isPending || updateBannerMutation.isPending ? 'Saving…' : 'Save Banner'}</button>
                  <button type="button" onClick={() => setShowBannerModal(false)} className="btn-outline py-2.5 px-6 text-xs">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAnnModal(false); }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="bg-white w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100">
                <h2 className="font-display text-xl">New Announcement</h2>
                <button onClick={() => setShowAnnModal(false)} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>
              <form onSubmit={handleAnnSubmit} className="p-5 space-y-4">
                <div><label className="label-xs">Message *</label><textarea required rows={3} value={annForm.message} onChange={(e) => setAnnForm(f => ({ ...f, message: e.target.value }))} placeholder="🎉 Free shipping on orders above ₹999 this weekend!" className="input-field resize-none" /></div>
                <div>
                  <label className="label-xs">Type</label>
                  <select value={annForm.type} onChange={(e) => setAnnForm(f => ({ ...f, type: e.target.value }))} className="input-field bg-white">
                    <option value="info">Info (Blue)</option><option value="success">Success (Green)</option><option value="warning">Warning (Amber)</option>
                  </select>
                </div>
                <div><label className="label-xs">Expires At</label><input type="date" value={annForm.expiresAt} onChange={(e) => setAnnForm(f => ({ ...f, expiresAt: e.target.value }))} className="input-field" /></div>
                <div className="flex gap-3 pt-2 border-t border-charcoal-100">
                  <button type="submit" disabled={createAnnMutation.isPending} className="btn-primary py-2.5 px-6 text-xs disabled:opacity-60">{createAnnMutation.isPending ? 'Creating…' : 'Create'}</button>
                  <button type="button" onClick={() => setShowAnnModal(false)} className="btn-outline py-2.5 px-6 text-xs">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
