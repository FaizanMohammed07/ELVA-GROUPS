import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '@store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone || undefined, password: data.password, referralCode: data.referralCode || undefined });
      navigate('/');
      toast.success('Welcome to ELVA! 🎁');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-950 flex-col items-center justify-center p-12 text-center">
        <p className="text-gold-400 text-xs tracking-[0.5em] uppercase font-sans mb-6">Join ELVA</p>
        <h1 className="font-serif text-5xl text-white leading-tight mb-4">
          Begin your<br />gifting journey
        </h1>
        <p className="font-sans text-charcoal-400 max-w-xs">
          Create your account and earn 100 bonus loyalty points on your first order.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-6 text-center">
          {['Free Shipping', 'Early Access', 'Loyalty Points'].map(b => (
            <div key={b} className="border border-charcoal-800 p-4">
              <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="font-serif text-3xl text-charcoal-950">ELVA</Link>
          </div>
          <h2 className="font-serif text-3xl text-charcoal-950 mb-8">Create Account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
              <input {...register('name')} placeholder="Your full name" className="input-luxury" />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Email *</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-luxury" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
              <input {...register('phone')} type="tel" placeholder="9876543210" className="input-luxury" />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="input-luxury pr-10"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Confirm Password *</label>
              <input {...register('confirmPassword')} type="password" placeholder="Confirm your password" className="input-luxury" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Referral Code (Optional)</label>
              <input {...register('referralCode')} placeholder="Enter referral code" className="input-luxury" />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 mt-2">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-sans text-xs text-charcoal-400 mt-4">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-charcoal-950">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-charcoal-950">Privacy Policy</Link>.
          </p>

          <p className="text-center font-sans text-sm text-charcoal-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-charcoal-950 font-medium hover:text-gold-600 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
