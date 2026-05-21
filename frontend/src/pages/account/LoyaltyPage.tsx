import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '@api/user.api';
import { apiClient } from '@api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, TrendingUp, Award, Copy, Check, Coins, X } from 'lucide-react';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

const TIER_CONFIG = {
  bronze: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🥉', next: 'Silver', nextAt: 500 },
  silver: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: '🥈', next: 'Gold', nextAt: 2000 },
  gold: { color: 'text-gold-600', bg: 'bg-gold-50', border: 'border-gold-200', icon: '🥇', next: 'Platinum', nextAt: 5000 },
  platinum: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: '💎', next: null, nextAt: null },
};

export default function LoyaltyPage() {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [redeemModal, setRedeemModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');

  const { data: loyalty, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: () => loyaltyApi.get().then(r => r.data.data),
  });

  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: () => loyaltyApi.getHistory().then(r => r.data.data),
  });

  const { data: referralData } = useQuery({
    queryKey: ['referral-code'],
    queryFn: () => apiClient.get('/referrals/my-code').then(r => r.data.data).catch(() => null),
  });

  const redeemMutation = useMutation({
    mutationFn: (points: number) => apiClient.post('/loyalty/redeem', { points }),
    onSuccess: (r) => {
      toast.success(`₹${r.data.data?.discountAmount || redeemPoints} coupon generated! Use it at checkout.`);
      setRedeemModal(false);
      setRedeemPoints('');
      qc.invalidateQueries({ queryKey: ['loyalty'] });
      qc.invalidateQueries({ queryKey: ['loyalty-transactions'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Redemption failed'),
  });

  const handleCopyReferral = () => {
    const code = referralData?.code;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral code copied!');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}
        </div>
      </div>
    );
  }

  const tier = (loyalty?.tier as keyof typeof TIER_CONFIG) || 'bronze';
  const tierConfig = TIER_CONFIG[tier];
  const points = loyalty?.points || 0;
  const progress = tierConfig.nextAt ? Math.min((loyalty?.lifetimePoints / tierConfig.nextAt) * 100, 100) : 100;
  const maxRedeemable = Math.min(points, 500);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-3">Rewards</p>
          <h1 className="font-serif text-4xl text-charcoal-950">Loyalty Programme</h1>
        </div>

        {/* Tier card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('border p-8 text-center mb-6', tierConfig.border, tierConfig.bg)}
        >
          <div className="text-5xl mb-3">{tierConfig.icon}</div>
          <p className={cn('font-sans font-semibold uppercase tracking-widest text-sm mb-1', tierConfig.color)}>
            {tier} Member
          </p>
          <p className="font-serif text-5xl text-charcoal-950 mb-1">{points.toLocaleString('en-IN')}</p>
          <p className="font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-6">Available Points</p>

          <button
            onClick={() => setRedeemModal(true)}
            disabled={points < 50}
            className="bg-charcoal-950 text-white px-8 py-3 text-sm font-sans hover:bg-charcoal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Coins size={16} />
            {points < 50 ? 'Need 50 pts to redeem' : `Redeem Points`}
          </button>

          {tierConfig.nextAt && (
            <div className="mt-6">
              <div className="flex justify-between text-xs font-sans text-charcoal-500 mb-2">
                <span>{loyalty?.lifetimePoints?.toLocaleString('en-IN')} lifetime pts</span>
                <span>{tierConfig.nextAt?.toLocaleString('en-IN')} for {tierConfig.next}</span>
              </div>
              <div className="h-2 bg-charcoal-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-charcoal-950 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Referral card */}
        {referralData?.code && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-charcoal-950 text-white p-6 mb-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-gold-400 text-xs uppercase tracking-widest font-sans mb-1">Refer & Earn</p>
                <p className="font-serif text-xl mb-2">Share your code, earn ₹100!</p>
                <p className="text-charcoal-300 text-xs font-sans">Your friend gets ₹50 off their first order. You earn 100 points when they complete purchase.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-charcoal-800 border border-charcoal-700 px-4 py-3">
                <span className="font-mono text-gold-400 tracking-widest text-lg">{referralData.code}</span>
              </div>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-2 bg-gold-500 text-white px-5 py-3 text-sm font-sans hover:bg-gold-600 transition-colors"
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            {referralData.referralCount > 0 && (
              <p className="text-charcoal-400 text-xs font-sans mt-3">{referralData.referralCount} successful referrals · {referralData.totalEarned} pts earned</p>
            )}
          </motion.div>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Gift, label: '1 Point = ₹1 Off', sub: 'Redeem on orders' },
            { icon: Star, label: '1% Earn Rate', sub: 'On every purchase' },
            { icon: TrendingUp, label: 'Tier Bonuses', sub: 'More as you grow' },
            { icon: Award, label: 'Birthday Bonus', sub: '2× points in month' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-cream-50 p-4 text-center border border-charcoal-100">
              <Icon size={20} className="text-charcoal-500 mx-auto mb-2" />
              <p className="font-sans text-xs font-semibold text-charcoal-950">{label}</p>
              <p className="font-sans text-[11px] text-charcoal-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div>
          <h2 className="font-sans font-semibold text-charcoal-950 uppercase tracking-wider text-sm mb-4">Transaction History</h2>
          {!transactions?.length ? (
            <p className="text-center font-sans text-charcoal-400 py-10">No transactions yet. Start shopping to earn points!</p>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {transactions.map((tx: any) => (
                <div key={tx.id || tx._id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-sans text-sm font-medium text-charcoal-950">{tx.reason}</p>
                    <p className="font-sans text-xs text-charcoal-500 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={cn('font-sans font-semibold text-sm', tx.type === 'credit' ? 'text-green-600' : 'text-red-500')}>
                    {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.points)} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Redeem Modal */}
      <AnimatePresence>
        {redeemModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-charcoal-950">Redeem Points</h2>
                <button onClick={() => setRedeemModal(false)}><X size={18} className="text-charcoal-400" /></button>
              </div>
              <p className="font-sans text-sm text-charcoal-500 mb-1">Available: <span className="font-semibold text-charcoal-900">{points} pts</span></p>
              <p className="font-sans text-xs text-charcoal-400 mb-5">Max redeemable per order: {maxRedeemable} pts (= ₹{maxRedeemable})</p>
              <div className="flex gap-2 mb-4">
                {[50, 100, 200, maxRedeemable].filter((v, i, a) => a.indexOf(v) === i && v <= points).map(v => (
                  <button key={v} onClick={() => setRedeemPoints(String(v))} className={`flex-1 py-2 text-xs border font-sans transition-colors ${redeemPoints === String(v) ? 'bg-charcoal-950 text-white border-charcoal-950' : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-500'}`}>
                    {v} pts
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={redeemPoints}
                onChange={e => setRedeemPoints(e.target.value)}
                min={50}
                max={maxRedeemable}
                placeholder="Or enter custom amount"
                className="w-full border border-charcoal-200 px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-400 mb-5"
              />
              {redeemPoints && Number(redeemPoints) >= 50 && (
                <p className="text-sm font-sans text-green-700 bg-green-50 px-3 py-2 mb-4">
                  You'll get ₹{redeemPoints} off your next order
                </p>
              )}
              <button
                onClick={() => redeemMutation.mutate(Number(redeemPoints))}
                disabled={!redeemPoints || Number(redeemPoints) < 50 || Number(redeemPoints) > points || redeemMutation.isPending}
                className="w-full bg-charcoal-950 text-white py-3 text-sm font-sans hover:bg-charcoal-800 transition-colors disabled:opacity-50"
              >
                {redeemMutation.isPending ? 'Processing…' : `Redeem ${redeemPoints || '—'} Points`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
