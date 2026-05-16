import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@api/client';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: () => apiClient.get('/products', { params: { page, limit: 20, status: undefined } }).then((r) => r.data),
  });

  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Products</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">{meta?.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="flex items-center gap-2 bg-charcoal-950 text-white px-4 py-2.5 text-sm font-medium font-sans hover:bg-charcoal-800 transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 text-sm focus:outline-none font-sans"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-8 skeleton rounded" /></td></tr>
              ))
            ) : products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="w-10 h-12 object-cover bg-gray-100 rounded" />}
                    <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="py-3 px-4 font-semibold">₹{p.price?.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <span className={p.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>{p.stock}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'active' ? 'bg-green-100 text-green-700' :
                    p.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                  }`}>{p.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/products/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-600"><Eye size={14} /></Link>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
