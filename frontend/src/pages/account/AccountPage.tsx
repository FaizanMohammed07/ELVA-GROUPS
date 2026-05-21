import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/authStore';
import { userApi as usersApi } from '@api/user.api';
import { apiClient } from '@api/client';
import { User, Package, Heart, Gift, LogOut, MapPin, Lock, Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

type AccountTab = 'profile' | 'addresses' | 'password';

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile required').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const addressSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile required'),
  line1: z.string().min(5, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  isDefault: z.boolean().optional(),
});

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<AccountTab>('profile');
  const [addressModal, setAddressModal] = useState<{ open: boolean; editing: any | null }>({ open: false, editing: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe().then(r => r.data.data),
  });

  const { data: addresses, isLoading: addressLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiClient.get('/users/me/addresses').then(r => r.data.data).catch(() => []),
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name || '', phone: profile?.phone || '' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    values: addressModal.editing ? {
      fullName: addressModal.editing.fullName || '',
      phone: addressModal.editing.phone || '',
      line1: addressModal.editing.line1 || '',
      line2: addressModal.editing.line2 || '',
      city: addressModal.editing.city || '',
      state: addressModal.editing.state || '',
      pincode: addressModal.editing.pincode || '',
      isDefault: addressModal.editing.isDefault || false,
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateMe(data),
    onSuccess: () => { toast.success('Profile updated!'); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/auth/change-password', data),
    onSuccess: () => { toast.success('Password changed!'); passwordForm.reset(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to change password'),
  });

  const saveAddressMutation = useMutation({
    mutationFn: (data: any) => addressModal.editing?._id
      ? apiClient.put(`/users/me/addresses/${addressModal.editing._id}`, data)
      : apiClient.post('/users/me/addresses', data),
    onSuccess: () => {
      toast.success(addressModal.editing ? 'Address updated' : 'Address added');
      setAddressModal({ open: false, editing: null });
      qc.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: () => toast.error('Failed to save address'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
    onSuccess: () => { toast.success('Address removed'); setDeleteConfirm(null); qc.invalidateQueries({ queryKey: ['addresses'] }); },
    onError: () => toast.error('Failed to delete address'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/users/me/addresses/${id}/default`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const NAV = [
    { id: 'profile' as const, label: 'My Profile', icon: User },
    { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin },
    { id: 'password' as const, label: 'Change Password', icon: Lock },
  ];

  const openAddressModal = (editing: any = null) => {
    setAddressModal({ open: true, editing });
    addressForm.reset(editing || {});
  };

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
            <nav className="space-y-0.5">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-3 px-4 py-3 font-sans text-sm w-full text-left transition-colors ${tab === id ? 'bg-charcoal-950 text-white' : 'text-charcoal-700 hover:bg-cream-50'}`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
              <div className="border-t border-charcoal-100 pt-1 mt-1">
                {[
                  { to: '/account/orders', label: 'My Orders', icon: Package },
                  { to: '/wishlist', label: 'Wishlist', icon: Heart },
                  { to: '/account/loyalty', label: 'Loyalty Points', icon: Gift },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-charcoal-700 hover:bg-cream-50 transition-colors">
                    <Icon size={16} /> {label}
                  </Link>
                ))}
                <button onClick={() => logout()} className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {tab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h1 className="font-serif text-3xl text-charcoal-950 mb-8">My Profile</h1>
                  <form onSubmit={profileForm.handleSubmit(d => updateProfileMutation.mutate(d))} className="max-w-lg space-y-5">
                    <div>
                      <label className="label-xs">Full Name</label>
                      <input {...profileForm.register('name')} className="input-luxury" />
                      {profileForm.formState.errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{profileForm.formState.errors.name.message as string}</p>}
                    </div>
                    <div>
                      <label className="label-xs">Email Address</label>
                      <input value={profile?.email || ''} disabled className="input-luxury opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="label-xs">Mobile Number</label>
                      <input {...profileForm.register('phone')} className="input-luxury" />
                      {profileForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{profileForm.formState.errors.phone.message as string}</p>}
                    </div>
                    <button type="submit" disabled={updateProfileMutation.isPending} className="btn-primary px-10 py-3">
                      {updateProfileMutation.isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              )}

              {tab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="font-serif text-3xl text-charcoal-950">Saved Addresses</h1>
                    <button onClick={() => openAddressModal()} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs">
                      <Plus size={14} /> Add Address
                    </button>
                  </div>
                  {addressLoading ? (
                    <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
                  ) : !addresses?.length ? (
                    <div className="text-center py-16">
                      <MapPin size={40} className="mx-auto mb-4 text-charcoal-200" />
                      <p className="font-sans text-charcoal-500 text-sm mb-4">No saved addresses yet.</p>
                      <button onClick={() => openAddressModal()} className="btn-primary text-sm px-8 py-3">Add Your First Address</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr: any) => (
                        <div key={addr._id} className={`border p-5 relative ${addr.isDefault ? 'border-gold-400 bg-gold-50/30' : 'border-charcoal-100'}`}>
                          {addr.isDefault && <span className="absolute top-3 right-3 text-[10px] bg-gold-500 text-white px-2 py-0.5 uppercase tracking-wider font-sans">Default</span>}
                          <p className="font-sans font-semibold text-charcoal-950 text-sm">{addr.fullName}</p>
                          <p className="font-sans text-charcoal-600 text-sm mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="font-sans text-charcoal-600 text-sm">{addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="font-sans text-charcoal-500 text-xs mt-1">📞 {addr.phone}</p>
                          <div className="flex gap-3 mt-4">
                            {!addr.isDefault && (
                              <button onClick={() => setDefaultMutation.mutate(addr._id)} className="text-xs text-charcoal-500 hover:text-charcoal-900 underline font-sans">Set as Default</button>
                            )}
                            <button onClick={() => openAddressModal(addr)} className="flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-900 font-sans">
                              <Pencil size={11} /> Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(addr._id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-sans">
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'password' && (
                <motion.div key="password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h1 className="font-serif text-3xl text-charcoal-950 mb-8">Change Password</h1>
                  <form onSubmit={passwordForm.handleSubmit(d => changePasswordMutation.mutate(d))} className="max-w-lg space-y-5">
                    <div>
                      <label className="label-xs">Current Password</label>
                      <input type="password" {...passwordForm.register('currentPassword')} className="input-luxury" />
                      {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message as string}</p>}
                    </div>
                    <div>
                      <label className="label-xs">New Password</label>
                      <input type="password" {...passwordForm.register('newPassword')} className="input-luxury" />
                      {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message as string}</p>}
                    </div>
                    <div>
                      <label className="label-xs">Confirm New Password</label>
                      <input type="password" {...passwordForm.register('confirmPassword')} className="input-luxury" />
                      {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message as string}</p>}
                    </div>
                    <button type="submit" disabled={changePasswordMutation.isPending} className="btn-primary px-10 py-3">
                      {changePasswordMutation.isPending ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addressModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="bg-white w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-between p-6 border-b border-charcoal-100 flex-shrink-0">
                <h2 className="font-serif text-xl text-charcoal-950">{addressModal.editing ? 'Edit Address' : 'Add New Address'}</h2>
                <button onClick={() => setAddressModal({ open: false, editing: null })} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
              <form onSubmit={addressForm.handleSubmit(d => saveAddressMutation.mutate(d))} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs">Full Name *</label>
                    <input {...addressForm.register('fullName')} className="input-field" />
                    {addressForm.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.fullName.message as string}</p>}
                  </div>
                  <div>
                    <label className="label-xs">Phone *</label>
                    <input {...addressForm.register('phone')} className="input-field" />
                    {addressForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.phone.message as string}</p>}
                  </div>
                </div>
                <div>
                  <label className="label-xs">Address Line 1 *</label>
                  <input {...addressForm.register('line1')} placeholder="House/Flat No., Street, Area" className="input-field" />
                  {addressForm.formState.errors.line1 && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.line1.message as string}</p>}
                </div>
                <div>
                  <label className="label-xs">Address Line 2</label>
                  <input {...addressForm.register('line2')} placeholder="Landmark (optional)" className="input-field" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label-xs">City *</label>
                    <input {...addressForm.register('city')} className="input-field" />
                    {addressForm.formState.errors.city && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.city.message as string}</p>}
                  </div>
                  <div>
                    <label className="label-xs">State *</label>
                    <input {...addressForm.register('state')} className="input-field" />
                    {addressForm.formState.errors.state && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.state.message as string}</p>}
                  </div>
                  <div>
                    <label className="label-xs">Pincode *</label>
                    <input {...addressForm.register('pincode')} maxLength={6} className="input-field" />
                    {addressForm.formState.errors.pincode && <p className="text-red-500 text-xs mt-1">{addressForm.formState.errors.pincode.message as string}</p>}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-charcoal-700">
                  <input type="checkbox" {...addressForm.register('isDefault')} className="w-4 h-4 accent-gold-500" />
                  Set as default delivery address
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saveAddressMutation.isPending} className="btn-primary flex-1 py-3 text-sm disabled:opacity-60">
                    {saveAddressMutation.isPending ? 'Saving…' : addressModal.editing ? 'Update Address' : 'Save Address'}
                  </button>
                  <button type="button" onClick={() => setAddressModal({ open: false, editing: null })} className="flex-1 border border-charcoal-200 py-3 text-sm text-charcoal-700 hover:bg-cream-50">
                    Cancel
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white p-6 max-w-sm w-full">
              <h3 className="font-serif text-lg text-charcoal-950 mb-2">Remove Address?</h3>
              <p className="font-sans text-charcoal-500 text-sm mb-6">This address will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteAddressMutation.mutate(deleteConfirm)} disabled={deleteAddressMutation.isPending} className="flex-1 bg-red-500 text-white py-2.5 text-sm hover:bg-red-600 transition-colors disabled:opacity-50">Remove</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-charcoal-200 py-2.5 text-sm text-charcoal-700 hover:bg-cream-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
