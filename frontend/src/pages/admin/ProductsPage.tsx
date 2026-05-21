import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Package, X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { apiClient } from '@api/client';
import { categoriesApi } from '@api/products.api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-charcoal-100 text-charcoal-600',
  archived: 'bg-red-100 text-red-600',
};

const DEFAULT_FORM = {
  title: '', slug: '', description: '', shortDescription: '',
  price: '', compareAtPrice: '',
  category: '', stock: '', sku: '',
  isPersonalizable: false, isFeatured: false,
  status: 'draft', tags: '',
  thumbnail: '', images: [] as string[],
};

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => apiClient.get('/products', { params: { page, limit: 20, search, status: 'all' } }).then((r) => ({
      products: r.data.data,
      total: r.data.meta?.total ?? r.data.data?.length ?? 0,
    })),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/products', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product created'); closeModal(); },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/products/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated'); closeModal(); },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete product'),
  });

  const openCreate = () => { setEditProduct(null); setForm(DEFAULT_FORM); setShowModal(true); };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      title: p.title || '', slug: p.slug || '',
      description: p.description || '', shortDescription: p.shortDescription || '',
      price: p.price || '', compareAtPrice: p.compareAtPrice || '',
      category: p.categoryIds?.[0]?._id || p.categoryIds?.[0] || p.category?._id || p.category || '',
      stock: p.stock || '', sku: p.sku || '',
      isPersonalizable: p.isPersonalizable || false,
      isFeatured: p.isFeatured || false,
      status: p.status || 'draft',
      tags: (p.tags || []).join(', '),
      thumbnail: p.thumbnail || '',
      images: p.images || [],
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); setForm(DEFAULT_FORM); };

  // ── Upload thumbnail ──────────────────────────────────────────────────────
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await apiClient.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, thumbnail: r.data.data.url }));
      toast.success('Thumbnail uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setThumbnailUploading(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  // ── Upload gallery images ─────────────────────────────────────────────────
  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (form.images.length + files.length > 10) {
      toast.error('Maximum 10 gallery images allowed');
      return;
    }
    setGalleryUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const r = await apiClient.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, images: [...f.images, ...r.data.data.urls] }));
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { category, tags, price, compareAtPrice, stock, ...rest } = form;
    const payload = {
      ...rest,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      categoryIds: category ? [category] : [],
    };
    if (editProduct) updateMutation.mutate({ id: editProduct._id || editProduct.id, data: payload });
    else createMutation.mutate(payload);
  };

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Products</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2 border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-charcoal-400"
        />
      </div>

      <div className="bg-white border border-charcoal-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 border-b border-charcoal-100">
              <tr>
                {['Product', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={`text-${h === 'Actions' ? 'right' : 'left'} px-4 py-3 font-sans font-medium text-charcoal-600 text-xs uppercase tracking-wide`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {products.map((p: any) => (
                <tr key={p._id || p.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream-100 flex-shrink-0 overflow-hidden">
                        {(p.thumbnail || p.images?.[0]) ? (
                          <img src={p.thumbnail || p.images?.[0]} alt={p.title} className="w-full h-full object-cover" />
                        ) : <Package size={16} className="m-auto mt-2.5 text-charcoal-300" />}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-charcoal-400">{p.sku || p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-700">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 0 ? 'text-red-600 font-medium' : p.stock <= 5 ? 'text-amber-600 font-medium' : 'text-charcoal-700'}>{p.stock ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[p.status] || STATUS_COLORS.draft}`}>{p.status || 'draft'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-charcoal-400 hover:text-charcoal-700"><Eye size={15} /></a>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-charcoal-400 hover:text-charcoal-700"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteTarget(p._id || p.id)} className="p-1.5 text-charcoal-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-charcoal-400 text-sm">No products found</td></tr>
              )}
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

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
              className="bg-white w-full max-w-2xl flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Fixed header */}
              <div className="flex items-center justify-between p-6 border-b border-charcoal-100 flex-shrink-0">
                <h2 className="font-display text-xl text-charcoal-950">{editProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={closeModal} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto min-h-0">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* ── Images Section ─────────────────────────────────────── */}
                <div className="space-y-4">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Product Images</p>

                  {/* Thumbnail */}
                  <div>
                    <label className="label-xs">Thumbnail (Primary Image)</label>
                    <div className="flex items-start gap-4 mt-1.5">
                      {/* Preview */}
                      <div className="relative w-28 h-32 bg-cream-100 border border-charcoal-200 flex-shrink-0 overflow-hidden">
                        {thumbnailUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-cream-50">
                            <Loader2 size={20} className="text-charcoal-400 animate-spin" />
                          </div>
                        ) : form.thumbnail ? (
                          <>
                            <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, thumbnail: '' }))}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal-300">
                            <Package size={24} />
                            <span className="text-[10px] mt-1">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Upload button */}
                      <div className="flex-1">
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleThumbnailChange}
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={thumbnailUploading}
                          className="flex items-center gap-2 border-2 border-dashed border-charcoal-200 hover:border-gold-400 hover:bg-gold-50/30 px-5 py-3 text-xs text-charcoal-500 hover:text-charcoal-700 transition-all disabled:opacity-50 w-full justify-center"
                        >
                          {thumbnailUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> {form.thumbnail ? 'Replace Thumbnail' : 'Upload Thumbnail'}</>}
                        </button>
                        <p className="text-[10px] text-charcoal-400 mt-1.5">JPEG, PNG or WebP · Max 10MB · Auto-converted to WebP</p>
                        {/* Or paste URL */}
                        <div className="mt-2">
                          <input
                            type="url"
                            value={form.thumbnail}
                            onChange={(e) => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                            placeholder="Or paste image URL…"
                            className="input-field text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery images */}
                  <div>
                    <label className="label-xs">Gallery Images <span className="text-charcoal-400 normal-case font-normal tracking-normal">(up to 10)</span></label>
                    <div className="mt-1.5 space-y-3">
                      {/* Existing gallery */}
                      {form.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.images.map((url, idx) => (
                            <div key={idx} className="relative w-20 h-24 bg-cream-100 border border-charcoal-200 overflow-hidden group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                              {idx === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-charcoal-950/70 text-white text-[8px] text-center py-0.5">Main</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      {form.images.length < 10 && (
                        <>
                          <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleGalleryChange}
                          />
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={galleryUploading}
                            className="flex items-center gap-2 border-2 border-dashed border-charcoal-200 hover:border-gold-400 hover:bg-gold-50/30 px-5 py-3 text-xs text-charcoal-500 hover:text-charcoal-700 transition-all disabled:opacity-50 w-full justify-center"
                          >
                            {galleryUploading
                              ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                              : <><ImagePlus size={14} /> Add Gallery Images ({form.images.length}/10)</>}
                          </button>
                          <p className="text-[10px] text-charcoal-400">Select multiple files at once · Each auto-converted to WebP</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Product Details ─────────────────────────────────────── */}
                <div className="border-t border-charcoal-100 pt-5 space-y-4">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Product Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label-xs">Title *</label>
                      <input
                        required
                        value={form.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                          setForm(f => ({ ...f, title, slug: f.slug || slug }));
                        }}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-xs">Slug</label>
                      <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="label-xs">SKU</label>
                      <input required value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="ELVA-001" className="input-field" />
                    </div>
                    <div>
                      <label className="label-xs">Price (₹) *</label>
                      <input required type="number" min="0" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="label-xs">Compare At (₹)</label>
                      <input type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="label-xs">Stock *</label>
                      <input required type="number" min="0" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="label-xs">Category</label>
                      <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field bg-white">
                        <option value="">No category</option>
                        {(categories || []).map((c: any) => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-xs">Status</label>
                      <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="input-field bg-white">
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label-xs">Short Description</label>
                      <input value={form.shortDescription} onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="One-line summary shown on product cards" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="label-xs">Description</label>
                      <textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="label-xs">Tags (comma-separated)</label>
                      <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="candle, luxury, personalizable" className="input-field" />
                    </div>
                    <div className="col-span-2 flex gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-charcoal-700">
                        <input type="checkbox" checked={form.isPersonalizable} onChange={(e) => setForm(f => ({ ...f, isPersonalizable: e.target.checked }))} className="w-4 h-4 accent-gold-500" /> Personalizable
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-charcoal-700">
                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-gold-500" /> Featured
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-charcoal-100">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || thumbnailUploading || galleryUploading}
                    className="btn-primary py-2.5 px-6 text-xs disabled:opacity-60 flex items-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={13} className="animate-spin" />}
                    {createMutation.isPending || updateMutation.isPending ? 'Saving…' : editProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-outline py-2.5 px-6 text-xs">Cancel</button>
                </div>
              </form>
              </div>{/* end scrollable body */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white p-6 max-w-sm w-full">
              <h3 className="font-display text-lg text-charcoal-950 mb-2">Delete Product?</h3>
              <p className="text-sm text-charcoal-500 mb-5">This cannot be undone. The product will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteMutation.mutate(deleteTarget!)} disabled={deleteMutation.isPending} className="btn-primary bg-red-600 hover:bg-red-700 py-2 px-5 text-xs disabled:opacity-60">
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
                <button onClick={() => setDeleteTarget(null)} className="btn-outline py-2 px-5 text-xs">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
