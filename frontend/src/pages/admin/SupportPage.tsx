import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@api/client';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  open: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
};

export default function AdminSupportPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: () => apiClient.get('/support/tickets', { params: { status: statusFilter, limit: 30 } }).then((r) => r.data.data).catch(() => ({ tickets: [] })),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => apiClient.post(`/support/tickets/${id}/reply`, { message }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tickets'] }); toast.success('Reply sent'); setReply(''); },
    onError: () => toast.error('Failed to send reply'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/support/tickets/${id}`, { status }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success(`Ticket marked as ${vars.status}`);
      setSelected((prev: any) => prev ? { ...prev, status: vars.status } : null);
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    replyMutation.mutate({ id: selected._id || selected.id, message: reply.trim() });
  };

  const tickets = data?.tickets || data?.items || (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Customer Support</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Manage support tickets</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {['open', 'in_progress', 'resolved'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 text-xs font-medium border transition-colors capitalize ${statusFilter === s ? 'bg-charcoal-950 text-white border-charcoal-950' : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-400'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 skeleton" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center">
          <MessageSquare size={40} className="mx-auto mb-4 text-charcoal-200" />
          <p className="text-charcoal-400 text-sm">No {statusFilter.replace('_', ' ')} tickets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => {
            const statusConf = STATUS_COLORS[t.status] || STATUS_COLORS.open;
            const StatusIcon = statusConf.icon;
            return (
              <div key={t._id || t.id} className="bg-white border border-charcoal-100 p-4 cursor-pointer hover:border-charcoal-300 transition-colors" onClick={() => setSelected(t)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConf.bg} ${statusConf.text}`}>
                        <StatusIcon size={10} />{t.status?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-charcoal-400">#{(t._id || t.id).slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="font-medium text-charcoal-900 text-sm">{t.subject || 'Support Request'}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5 line-clamp-1">{t.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-charcoal-500">{t.user?.name || 'Customer'}</p>
                    <p className="text-xs text-charcoal-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white w-full sm:max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100 flex-shrink-0">
                <div>
                  <h2 className="font-display text-lg text-charcoal-950">{selected.subject || 'Support Ticket'}</h2>
                  <p className="text-xs text-charcoal-400">{selected.user?.name} · {selected.user?.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-5 space-y-4">
                {/* Original message */}
                <div className="bg-cream-50 p-4">
                  <p className="text-sm text-charcoal-700">{selected.message}</p>
                  <p className="text-xs text-charcoal-400 mt-2">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                </div>

                {/* Replies */}
                {(selected.replies || []).map((r: any, i: number) => (
                  <div key={i} className={`p-4 ${r.isAdmin ? 'bg-charcoal-950 text-white ml-6' : 'bg-cream-50 mr-6'}`}>
                    <p className={`text-xs font-medium mb-1 ${r.isAdmin ? 'text-gold-400' : 'text-charcoal-500'}`}>{r.isAdmin ? 'ELVA Support' : selected.user?.name}</p>
                    <p className={`text-sm ${r.isAdmin ? 'text-charcoal-100' : 'text-charcoal-700'}`}>{r.message}</p>
                    <p className={`text-xs mt-1 ${r.isAdmin ? 'text-charcoal-400' : 'text-charcoal-400'}`}>{new Date(r.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                ))}

                {/* Reply form */}
                {selected.status !== 'resolved' && (
                  <form onSubmit={handleReply} className="border-t border-charcoal-100 pt-4 space-y-3">
                    <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" className="input-field resize-none" />
                    <div className="flex gap-3">
                      <button type="submit" disabled={replyMutation.isPending || !reply.trim()} className="btn-primary flex items-center gap-2 py-2 px-5 text-xs disabled:opacity-60">
                        <Send size={13} />{replyMutation.isPending ? 'Sending…' : 'Send Reply'}
                      </button>
                      <button type="button" onClick={() => updateStatusMutation.mutate({ id: selected._id || selected.id, status: 'resolved' })} disabled={updateStatusMutation.isPending} className="px-4 py-2 border border-green-200 text-green-700 text-xs hover:bg-green-50 disabled:opacity-60">
                        Mark Resolved
                      </button>
                    </div>
                  </form>
                )}
                {selected.status === 'resolved' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm border-t border-charcoal-100 pt-4">
                    <CheckCircle size={16} /> This ticket has been resolved.
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
