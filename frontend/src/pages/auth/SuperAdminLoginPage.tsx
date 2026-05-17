import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { SUPER_BASE, SUPER_ADMIN_LOGIN_SLUG } from '@config/admin';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      navigate(from || `${SUPER_BASE}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const { user: u } = useAuthStore.getState();
      if (!u || u.role !== 'super_admin') {
        await logout();
        setError('Access denied. Super Admin credentials required.');
        return;
      }
      navigate(from || `${SUPER_BASE}/dashboard`, { replace: true });
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-600/30 bg-gold-900/20 mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="font-display text-3xl tracking-[0.4em] text-white mb-1">ELVA</p>
          <p className="text-[10px] tracking-[0.5em] uppercase font-sans" style={{ color: '#d97706' }}>
            Super Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border p-8 space-y-5" style={{ background: '#0f0f1a', borderColor: '#1e1e3a' }}>
          {error && (
            <div className="border text-xs px-4 py-3 font-sans" style={{ background: 'rgba(127,29,29,0.3)', borderColor: 'rgba(153,27,27,0.5)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2 font-sans" style={{ color: '#6b7280' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 text-sm focus:outline-none transition-colors font-sans text-white"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
              onFocus={e => (e.target.style.borderColor = '#d97706')}
              onBlur={e => (e.target.style.borderColor = '#2d2d4e')}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2 font-sans" style={{ color: '#6b7280' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 text-sm focus:outline-none transition-colors font-sans text-white"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
              onFocus={e => (e.target.style.borderColor = '#d97706')}
              onBlur={e => (e.target.style.borderColor = '#2d2d4e')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-sans font-medium tracking-[0.2em] uppercase transition-all mt-2 text-black disabled:opacity-50"
            style={{ background: loading ? '#92400e' : '#d97706' }}
          >
            {loading ? 'Verifying...' : 'Access Super Portal'}
          </button>
        </form>

        <p className="text-center text-[10px] mt-6 font-sans tracking-wide" style={{ color: '#374151' }}>
          This portal is for authorized super administrators only.<br />
          All access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
