import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@api/auth.api';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }: { password: string; confirmPassword: string }) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset link is invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {done ? (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Password Reset!</h2>
            <p className="font-sans text-charcoal-500 mb-6">Your password has been updated successfully. Redirecting to login...</p>
            <Link to="/login" className="btn-primary px-10 py-3">Sign In</Link>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">New Password</h2>
            <p className="font-sans text-charcoal-500 text-sm mb-8">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">New Password</label>
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
                {errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message as string}</p>}
              </div>

              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                <input {...register('confirmPassword')} type="password" placeholder="Confirm your new password" className="input-luxury" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message as string}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
