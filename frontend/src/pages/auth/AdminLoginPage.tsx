import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { ADMIN_BASE, SUPER_BASE } from '@config/admin';

const ADMIN_ROLES = ['admin', 'super_admin', 'support', 'marketing', 'inventory'];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user && ADMIN_ROLES.includes(user.role)) {
      const dest = from || (user.role === 'super_admin' ? `${SUPER_BASE}/dashboard` : `${ADMIN_BASE}/dashboard`);
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const { user: u } = useAuthStore.getState();
      if (!u || !ADMIN_ROLES.includes(u.role)) {
        await logout();
        setError('Access denied. Admin credentials required.');
        return;
      }
      const dest = from || (u.role === 'super_admin' ? `${SUPER_BASE}/dashboard` : `${ADMIN_BASE}/dashboard`);
      navigate(dest, { replace: true });
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-4xl tracking-[0.4em] text-white mb-2">ELVA</p>
          <p className="text-charcoal-500 text-[10px] tracking-[0.4em] uppercase font-sans">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-charcoal-900 border border-charcoal-800 p-8 space-y-5">
          {error && (
            <div className="bg-red-950/50 border border-red-800/60 text-red-400 text-xs px-4 py-3 font-sans">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] text-charcoal-500 uppercase tracking-widest mb-2 font-sans">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-charcoal-800 border border-charcoal-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors font-sans placeholder-charcoal-600"
            />
          </div>

          <div>
            <label className="block text-[10px] text-charcoal-500 uppercase tracking-widest mb-2 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-charcoal-800 border border-charcoal-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white py-3 text-xs font-sans font-medium tracking-[0.2em] uppercase transition-colors mt-2"
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </form>

        <p className="text-center text-charcoal-700 text-[10px] mt-6 font-sans tracking-wide">
          Unauthorized access is strictly prohibited and monitored.
        </p>
      </div>
    </div>
  );
}
