import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Tag, Plus } from 'lucide-react';

export default function AdminMarketingPage() {
  const { data: coupons } = useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => apiClient.get('/coupons').then(r => r.data.data) });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Marketing</h1>
        <button className="flex items-center gap-2 bg-charcoal-950 text-white px-4 py-2.5 text-sm font-medium font-sans">
          <Plus size={16} /> Create Coupon
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4"><Tag size={18} className="text-gray-500"/><h2 className="text-sm font-semibold text-gray-700 font-sans">Active Coupons</h2></div>
          <div className="space-y-3">
            {(coupons || []).filter((c: any) => c.isActive).map((c: any) => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div><p className="font-mono font-bold text-charcoal-950">{c.code}</p><p className="text-xs text-gray-400 font-sans">{c.type} · {c.value}{c.type === 'percentage' ? '%' : '₹'} off</p></div>
                <p className="text-xs text-gray-400">{c.usageCount}/{c.usageLimit || '∞'} used</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Newsletter Subscribers</h2>
          <div className="text-center py-8 text-gray-400">
            <p className="font-sans text-sm">Email marketing integration coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
