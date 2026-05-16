import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@api/auth.api';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Valid email required') });
type ForgotForm = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }: ForgotForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
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
        <Link to="/login" className="inline-flex items-center gap-2 text-charcoal-500 hover:text-charcoal-950 font-sans text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {sent ? (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Check Your Email</h2>
            <p className="font-sans text-charcoal-500 mb-6">
              We've sent a password reset link to <strong>{getValues('email')}</strong>.
              Please check your inbox.
            </p>
            <p className="font-sans text-xs text-charcoal-400">
              Didn't receive it? Check your spam folder or{' '}
              <button onClick={() => setSent(false)} className="text-gold-600 hover:text-gold-700 transition-colors">
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Mail size={40} className="text-charcoal-300 mb-4" />
              <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Forgot Password?</h2>
              <p className="font-sans text-charcoal-500 text-sm">
                No worries. Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-luxury" autoFocus />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message as string}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
