import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '@api/user.api';
import { motion } from 'framer-motion';
import { Gift, Star, TrendingUp, Award } from 'lucide-react';
import { cn } from '@utils/cn';

const TIER_CONFIG = {
  bronze: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🥉', next: 'Silver', nextAt: 500 },
  silver: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: '🥈', next: 'Gold', nextAt: 2000 },
  gold: { color: 'text-gold-600', bg: 'bg-gold-50', border: 'border-gold-200', icon: '🥇', next: 'Platinum', nextAt: 5000 },
  platinum: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: '💎', next: null, nextAt: null },
};

export default function LoyaltyPage() {
  const { data: loyalty, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: () => loyaltyApi.get().then(r => r.data.data),
  });

  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: () => loyaltyApi.getHistory().then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton rounded" />)}
        </div>
      </div>
    );
  }

  const tier = loyalty?.tier as keyof typeof TIER_CONFIG || 'bronze';
  const tierConfig = TIER_CONFIG[tier];
  const progress = tierConfig.nextAt ? Math.min((loyalty?.lifetimePoints / tierConfig.nextAt) * 100, 100) : 100;

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
          className={cn('border p-8 text-center mb-8', tierConfig.border, tierConfig.bg)}
        >
          <div className="text-5xl mb-3">{tierConfig.icon}</div>
          <p className={cn('font-sans font-semibold uppercase tracking-widest text-sm mb-1', tierConfig.color)}>
            {tier} Member
          </p>
          <p className="font-serif text-5xl text-charcoal-950 mb-1">{loyalty?.points?.toLocaleString('en-IN')}</p>
          <p className="font-sans text-xs text-charcoal-500 uppercase tracking-wider">Available Points</p>

          {tierConfig.nextAt && (
            <div className="mt-6">
              <div className="flex justify-between text-xs font-sans text-charcoal-500 mb-2">
                <span>{loyalty?.lifetimePoints?.toLocaleString('en-IN')} lifetime pts</span>
                <span>{tierConfig.nextAt?.toLocaleString('en-IN')} for {tierConfig.next}</span>
              </div>
              <div className="h-2 bg-charcoal-200 rounded-full overflow-hidden">
                <div className="h-full bg-charcoal-950 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Gift, label: '1 Point = ₹1 Off', sub: 'Redeem on orders' },
            { icon: Star, label: '1% Earn Rate', sub: 'On every purchase' },
            { icon: TrendingUp, label: 'Tier Bonuses', sub: 'More as you grow' },
            { icon: Award, label: 'Birthday Bonus', sub: '2× points in month' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-cream-50 p-4 text-center">
              <Icon size={20} className="text-charcoal-500 mx-auto mb-2" />
              <p className="font-sans text-xs font-semibold text-charcoal-950">{label}</p>
              <p className="font-sans text-[11px] text-charcoal-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div>
          <h2 className="font-sans font-semibold text-charcoal-950 uppercase tracking-wider text-sm mb-4">Transaction History</h2>
          {transactions?.length === 0 ? (
            <p className="text-center font-sans text-charcoal-400 py-10">No transactions yet. Start shopping to earn points!</p>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {transactions?.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center py-4">
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
    </div>
  );
}
