import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

export default function AdminInventoryPage() {
  const { data: summary } = useQuery({ queryKey: ['inventory', 'summary'], queryFn: () => apiClient.get('/inventory/summary').then(r => r.data.data) });
  const { data: lowStock } = useQuery({ queryKey: ['inventory', 'low-stock'], queryFn: () => apiClient.get('/inventory/low-stock').then(r => r.data.data) });
  const { data: outOfStock } = useQuery({ queryKey: ['inventory', 'out-of-stock'], queryFn: () => apiClient.get('/inventory/out-of-stock').then(r => r.data.data) });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">Inventory Management</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: summary?.total, icon: Package },
          { label: 'Active Products', value: summary?.active, icon: Package },
          { label: 'Low Stock', value: summary?.lowStock, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Out of Stock', value: summary?.outOfStock, icon: TrendingDown, color: 'text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-sans">{label}</p>
              <Icon size={18} className={color || 'text-gray-400'} />
            </div>
            <p className={`text-3xl font-semibold font-sans ${color || ''}`}>{value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">⚠️ Low Stock Products</h2>
          <div className="space-y-3">
            {(lowStock || []).map((p: any) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div><p className="text-sm font-medium font-sans">{p.title}</p><p className="text-xs text-gray-400 font-sans">{p.sku}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-amber-600">{p.stock} left</p><p className="text-xs text-gray-400">Threshold: {p.lowStockThreshold}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">🚫 Out of Stock</h2>
          <div className="space-y-3">
            {(outOfStock || []).map((p: any) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div><p className="text-sm font-medium font-sans">{p.title}</p><p className="text-xs text-gray-400 font-sans">{p.sku}</p></div>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
