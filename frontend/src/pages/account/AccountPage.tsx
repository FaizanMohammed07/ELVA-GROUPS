import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import { userApi as usersApi } from '@api/user.api';
import { User, Package, Heart, Gift, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile required').optional().or(z.literal('')),
});

export default function AccountPage() {
  const { user, logout } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe().then(r => r.data.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name || '', phone: profile?.phone || '' },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: any) => usersApi.updateMe(data),
    onSuccess: () => toast.success('Profile updated!'),
    onError: () => toast.error('Failed to update profile'),
  });

  const navLinks = [
    { to: '/account', label: 'Profile', icon: User },
    { to: '/account/orders', label: 'My Orders', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account/loyalty', label: 'Loyalty Points', icon: Gift },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-cream-50 p-6 mb-4">
              <div className="w-16 h-16 bg-charcoal-200 rounded-full flex items-center justify-center mb-3">
                <span className="font-serif text-2xl text-charcoal-700">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <p className="font-sans font-semibold text-charcoal-950 text-sm">{profile?.name}</p>
              <p className="font-sans text-charcoal-500 text-xs">{profile?.email}</p>
            </div>
            <nav className="space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-charcoal-700 hover:bg-cream-50 hover:text-charcoal-950 transition-colors"
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <h1 className="font-serif text-3xl text-charcoal-950 mb-8">My Profile</h1>
            <form onSubmit={handleSubmit(d => updateProfile(d))} className="max-w-lg space-y-5">
              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input {...register('name')} className="input-luxury" />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message as string}</p>}
              </div>
              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input value={profile?.email || ''} disabled className="input-luxury opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                <input {...register('phone')} className="input-luxury" />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message as string}</p>}
              </div>
              <button type="submit" disabled={isPending} className="btn-primary px-10 py-3">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
