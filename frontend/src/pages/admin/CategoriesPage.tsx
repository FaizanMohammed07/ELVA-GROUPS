import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Plus, Edit2, Tag, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';

interface Category {
  id: string; name: string; slug: string; description?: string;
  image?: string; icon?: string; order: number;
  isActive: boolean; isFeatured: boolean; productCount: number;
}

const EMPTY = { name: '', description: '', icon: '', isFeatured: false };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.get('/categories').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editId ? apiClient.put(`/categories/${editId}`, data) : apiClient.post('/categories', data),
    onSuccess: () => {
      toast.success(editId ? 'Category updated' : 'Category created');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/categories/${id}/status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
    onError: () => toast.error('Failed to toggle'),
  });

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setShowModal(true); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description || '', icon: c.icon || '', isFeatured: c.isFeatured });
    setEditId(c.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Categories</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} /> New Category
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-400 font-sans text-sm">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <Tag size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-sans">No categories yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={cn(
                'bg-white border rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-sm',
                cat.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                  {cat.icon || '🏷️'}
                </div>
                <div className="flex items-center gap-1">
                  {cat.isFeatured && <Star size={12} className="fill-amber-400 text-amber-400" />}
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate(cat.id)}
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
                  >
                    {cat.isActive
                      ? <ToggleRight size={16} className="text-indigo-500" />
                      : <ToggleLeft size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-sans text-sm">{cat.name}</p>
                <p className="text-[11px] text-gray-400 font-sans mt-0.5 font-mono">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-gray-500 font-sans mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                <span className="text-[11px] text-gray-400 font-sans">{cat.productCount} products</span>
                <span className={cn(
                  'ml-auto text-[10px] px-2 py-0.5 rounded font-sans font-medium',
                  cat.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400',
                )}>
                  {cat.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold font-sans text-gray-900">
                {editId ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Candles"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-sans mb-1.5">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => set('icon', e.target.value)}
                  placeholder="🕯️"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-indigo-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => set('isFeatured', e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span className="text-sm font-sans text-gray-700">Featured on homepage</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending || !form.name}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-sans font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
