import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/authStore';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 5,
  duration: Math.random() * 8 + 6,
}));

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = searchParams.get('redirect') || (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate(from, { replace: true });
      toast.success('Welcome back to ELUNORA');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { isNew } = await loginWithGoogle();
      navigate(from, { replace: true });
      toast.success(isNew ? 'Welcome to ELUNORA!' : 'Welcome back to ELUNORA');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Google sign-in failed';
      if (msg !== 'popup-closed-by-user') toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0C0308 0%, #1A0810 35%, #0E0520 65%, #080310 100%)' }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #C4607A 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-5%] right-[5%] w-[400px] h-[400px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #9B59B6 0%, transparent 70%)' }} />
      </div>

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#D4A853' : p.id % 3 === 1 ? '#C4607A' : 'rgba(255,255,255,0.6)',
          }}
          animate={{ y: [-15, 15, -15], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grain texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: '200px 200px' }} />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-block">
            <span className="font-serif text-4xl text-white tracking-[0.15em]">ELUNORA</span>
            <div className="h-px w-12 mx-auto mt-1" style={{ background: 'linear-gradient(90deg, transparent, #D4A853, transparent)' }} />
          </Link>
          <p className="text-xs tracking-[0.4em] uppercase mt-3 font-sans"
            style={{ color: 'rgba(212,168,83,0.7)' }}>Handcrafted Gifting</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1000 }}
        >
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="mb-7">
              <h2 className="font-serif text-2xl text-white mb-1">Welcome back</h2>
              <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Sign in to your ELUNORA account
              </p>
            </div>

            {/* Google Sign-In */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-sans text-sm font-medium transition-all mb-6"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.90)',
              }}
            >
              {isGoogleLoading ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                </svg>
              )}
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>or continue with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-sans text-xs mb-2 uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full py-3 px-4 rounded-xl font-sans text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: errors.email ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.90)',
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(212,168,83,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onBlur={e => { e.currentTarget.style.border = errors.email ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs mt-1.5 font-sans">{errors.email.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-sans text-xs uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>Password</label>
                  <Link to="/forgot-password" className="font-sans text-xs transition-colors"
                    style={{ color: 'rgba(212,168,83,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#D4A853')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,168,83,0.7)')}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full py-3 px-4 pr-11 rounded-xl font-sans text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: errors.password ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.90)',
                    }}
                    onFocus={e => { e.currentTarget.style.border = '1px solid rgba(212,168,83,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e => { e.currentTarget.style.border = errors.password ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs mt-1.5 font-sans">{errors.password.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input {...register('rememberMe')} type="checkbox"
                  className="w-4 h-4 rounded accent-yellow-500"
                  style={{ accentColor: '#D4A853' }} />
                <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Keep me signed in for 30 days</span>
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-sans text-sm font-semibold tracking-wide mt-2 transition-all"
                style={{
                  background: isLoading ? 'rgba(212,168,83,0.5)' : 'linear-gradient(135deg, #D4A853 0%, #C4903A 100%)',
                  color: isLoading ? 'rgba(0,0,0,0.5)' : '#0C0308',
                  boxShadow: isLoading ? 'none' : '0 8px 32px rgba(212,168,83,0.30)',
                }}
              >
                {isLoading ? (
                  <motion.div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black/60"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </motion.button>
            </form>

            <p className="text-center font-sans text-sm mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Don't have an account?{' '}
              <Link to="/register"
                className="font-medium transition-colors"
                style={{ color: '#D4A853' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0C47A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4A853')}>
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['256-bit SSL', 'Privacy First', 'No Spam'].map(badge => (
            <div key={badge} className="flex items-center gap-1.5">
              <Sparkles size={10} style={{ color: 'rgba(212,168,83,0.5)' }} />
              <span className="font-sans text-[10px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
