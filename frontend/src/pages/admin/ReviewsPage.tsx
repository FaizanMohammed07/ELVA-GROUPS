import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Star, Check, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', filter],
    queryFn: () => {
      const params: any = { limit: 50 };
      if (filter === 'pending') params.isApproved = false;
      if (filter === 'approved') params.isApproved = true;
      return apiClient.get('/reviews', { params }).then((r) => r.data.data);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/reviews/${id}/approve`),
    onSuccess: () => { toast.success('Review approved'); qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); },
    onError: () => toast.error('Failed to approve review'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reviews/${id}`),
    onSuccess: () => { toast.success('Review rejected and removed'); qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); },
    onError: () => toast.error('Failed to reject review'),
  });

  const reviews = data?.reviews || data?.items || (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Reviews</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Moderate customer reviews</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 items-center">
        <Filter size={14} className="text-charcoal-400" />
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium border capitalize transition-colors ${filter === f ? 'bg-charcoal-950 text-white border-charcoal-950' : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-400'}`}>{f}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center text-charcoal-400 text-sm">No {filter} reviews</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r._id || r.id} className="bg-white border border-charcoal-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < (r.rating || 0) ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-charcoal-800">{r.userId?.name || r.user?.name || 'Customer'}</span>
                    {r.isVerifiedPurchase && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verified Purchase</span>}
                    {r.isApproved && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Approved</span>}
                  </div>
                  {r.title && <p className="font-medium text-charcoal-900 text-sm mb-1">{r.title}</p>}
                  <p className="text-sm text-charcoal-600 leading-relaxed">{r.body || r.comment}</p>
                  <p className="text-xs text-charcoal-400 mt-2">
                    Product: <span className="text-charcoal-600">{r.productId?.title || r.product?.title || '—'}</span>
                    {r.createdAt && ` · ${new Date(r.createdAt).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!r.isApproved && (
                    <button onClick={() => approveMutation.mutate(r._id || r.id)} disabled={approveMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-60">
                      <Check size={13} /> Approve
                    </button>
                  )}
                  <button onClick={() => rejectMutation.mutate(r._id || r.id)} disabled={rejectMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-60">
                    <X size={13} /> {r.isApproved ? 'Remove' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
