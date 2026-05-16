import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Star, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'reviews', 'pending'], queryFn: () => apiClient.get('/reviews', { params: { isApproved: false } }).then(r => r.data.data) });
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/reviews/${id}/approve`),
    onSuccess: () => { toast.success('Review approved'); qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">Reviews Management</h1>
      <div className="space-y-4">
        {isLoading ? <div className="skeleton h-32 rounded-lg" /> :
        (data || []).map((r: any) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {Array.from({length: r.rating}).map((_, i) => <Star key={i} size={14} className="fill-gold-400 text-gold-400"/>)}
                  <span className="text-sm font-medium font-sans text-gray-700">{r.userId?.name}</span>
                  {r.isVerifiedPurchase && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified Purchase</span>}
                </div>
                <p className="text-sm text-gray-600 font-sans">{r.body}</p>
                <p className="text-xs text-gray-400 font-sans mt-2">Product: {r.productId?.title}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => approveMutation.mutate(r.id)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
                  <Check size={16}/>
                </button>
                <button className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><X size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
