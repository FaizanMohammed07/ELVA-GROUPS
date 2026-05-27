import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Store, Truck, CreditCard, Share2, AlertTriangle, Save } from 'lucide-react';
import { apiClient } from '@api/client';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function StoreSettingsPage() {
  const [tab, setTab] = useState<'general' | 'shipping' | 'payments' | 'social' | 'maintenance'>('general');
  const { register, handleSubmit, reset, watch } = useForm<any>();
  const maintenanceMode = watch('maintenanceMode');

  const { data, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => apiClient.get('/admin/settings').then((r) => r.data.data).catch(() => ({})),
  });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData: any) => apiClient.put('/admin/settings', formData),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  const TABS = [
    { id: 'general' as const, label: 'General', icon: Store },
    { id: 'shipping' as const, label: 'Shipping', icon: Truck },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'social' as const, label: 'Social', icon: Share2 },
    { id: 'maintenance' as const, label: 'Maintenance', icon: AlertTriangle },
  ];

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 skeleton" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-charcoal-950">Store Settings</h1>
        <p className="text-sm text-charcoal-400 mt-0.5">Global configuration for ELUNORA store</p>
      </div>

      <div className="flex gap-0 border border-charcoal-100 bg-white overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-r border-charcoal-100 last:border-r-0 transition-colors ${tab === id ? 'bg-charcoal-950 text-white' : 'text-charcoal-600 hover:bg-cream-50'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white border border-charcoal-100 p-6 max-w-2xl space-y-5">

          {tab === 'general' && (
            <>
              <div><label className="label-xs">Store Name</label><input {...register('storeName')} defaultValue="ELUNORA" className="input-field" /></div>
              <div><label className="label-xs">Store Email</label><input type="email" {...register('storeEmail')} placeholder="hello@elvagroup.in" className="input-field" /></div>
              <div><label className="label-xs">Store Phone</label><input {...register('storePhone')} placeholder="+91 99999 99999" className="input-field" /></div>
              <div><label className="label-xs">Store Address</label><textarea rows={3} {...register('storeAddress')} placeholder="123 Artisan Lane, Mumbai, Maharashtra 400001" className="input-field resize-none" /></div>
              <div><label className="label-xs">Logo URL</label><input {...register('logoUrl')} placeholder="https://cdn.elva.in/logo.svg" className="input-field" /></div>
              <div><label className="label-xs">GST Number</label><input {...register('gstNumber')} placeholder="27AABCU9603R1ZM" className="input-field" /></div>
            </>
          )}

          {tab === 'shipping' && (
            <>
              <div><label className="label-xs">Free Shipping Threshold (₹)</label><input type="number" min="0" {...register('freeShippingThreshold')} className="input-field" /></div>
              <div><label className="label-xs">Standard Shipping Rate (₹)</label><input type="number" min="0" {...register('standardShippingRate')} className="input-field" /></div>
              <div><label className="label-xs">Express Shipping Rate (₹)</label><input type="number" min="0" {...register('expressShippingRate')} className="input-field" /></div>
              <div><label className="label-xs">Estimated Delivery Days (standard)</label><input type="number" min="1" {...register('standardDeliveryDays')} className="input-field" /></div>
              <div><label className="label-xs">Estimated Delivery Days (express)</label><input type="number" min="1" {...register('expressDeliveryDays')} className="input-field" /></div>
              <div><label className="label-xs">Shiprocket API Key</label><input type="password" {...register('shiprocketApiKey')} placeholder="••••••••" className="input-field" /></div>
            </>
          )}

          {tab === 'payments' && (
            <>
              <div>
                <label className="label-xs">COD (Cash on Delivery)</label>
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                  <input type="checkbox" {...register('codEnabled')} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm text-charcoal-700">Enable Cash on Delivery</span>
                </label>
              </div>
              <div><label className="label-xs">COD Extra Charge (₹)</label><input type="number" min="0" {...register('codCharge')} className="input-field" /></div>
              <div><label className="label-xs">Tax Rate (%)</label><input type="number" min="0" max="100" step="0.1" {...register('taxRate')} className="input-field" /></div>
              <div>
                <label className="label-xs">Payment Methods</label>
                <div className="space-y-2 mt-2">
                  {['Razorpay', 'UPI', 'Netbanking', 'Credit Card', 'Debit Card'].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer text-sm text-charcoal-700">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-gold-500" /> {m}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'social' && (
            <>
              <div><label className="label-xs">Instagram URL</label><input {...register('instagramUrl')} placeholder="https://instagram.com/elvagroup" className="input-field" /></div>
              <div><label className="label-xs">Facebook URL</label><input {...register('facebookUrl')} placeholder="https://facebook.com/elvagroup" className="input-field" /></div>
              <div><label className="label-xs">Pinterest URL</label><input {...register('pinterestUrl')} placeholder="https://pinterest.com/elvagroup" className="input-field" /></div>
              <div><label className="label-xs">YouTube URL</label><input {...register('youtubeUrl')} placeholder="https://youtube.com/@elvagroup" className="input-field" /></div>
              <div><label className="label-xs">WhatsApp Number</label><input {...register('whatsappNumber')} placeholder="+919999999999" className="input-field" /></div>
            </>
          )}

          {tab === 'maintenance' && (
            <>
              <div className={`p-4 border-2 ${maintenanceMode ? 'border-red-300 bg-red-50' : 'border-charcoal-200 bg-white'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('maintenanceMode')} className="w-5 h-5 accent-red-500" />
                  <div>
                    <p className="font-medium text-charcoal-900">Maintenance Mode</p>
                    <p className="text-xs text-charcoal-500">When enabled, customers see a maintenance page. Admins can still access the store.</p>
                  </div>
                </label>
              </div>
              {maintenanceMode && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700">Maintenance mode is ON. Your store will be inaccessible to customers.</p>
                </div>
              )}
              <div><label className="label-xs">Maintenance Message</label><textarea rows={3} {...register('maintenanceMessage')} placeholder="We're improving your shopping experience. Back soon! 🛠️" className="input-field resize-none" /></div>
              <div><label className="label-xs">Expected Back Online</label><input type="datetime-local" {...register('maintenanceEndsAt')} className="input-field" /></div>
            </>
          )}
        </motion.div>

        <div>
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-xs disabled:opacity-60">
            <Save size={15} />{saveMutation.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
