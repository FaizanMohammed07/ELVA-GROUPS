import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@api/auth.api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-gold-500 mx-auto mb-4 animate-spin" />
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Verifying...</h2>
            <p className="font-sans text-charcoal-500">Please wait while we verify your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Email Verified!</h2>
            <p className="font-sans text-charcoal-500 mb-6">Your email has been verified successfully. You can now access all features.</p>
            <Link to="/" className="btn-primary px-10 py-3">Continue Shopping</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-charcoal-950 mb-3">Verification Failed</h2>
            <p className="font-sans text-charcoal-500 mb-6">This verification link is invalid or has expired.</p>
            <Link to="/login" className="btn-primary px-10 py-3">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
