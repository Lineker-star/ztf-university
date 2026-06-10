// To reset password: Go to Supabase Dashboard → Authentication → Users
// Find ztfuniversityinstitute@gmail.com → Click "Send password reset" or manually update password in Supabase Auth
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail } from 'lucide-react';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/iuztf-management/login`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/images/logo.png" alt="ZTF University Institute" width={70} height={70} className="object-contain mx-auto mb-4" priority />
          <h1 className="text-xl font-bold text-white font-heading">ZTF University Institute</h1>
          <p className="text-[#C9A84C] text-sm font-semibold mt-1 tracking-wide">Password Reset</p>
        </div>

        <div className="bg-[#0D1F3C] rounded-2xl border border-[#C9A84C]/25 shadow-2xl p-7 sm:p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading mb-2">Email Sent</h2>
              <p className="text-gray-400 text-sm mb-6">
                A password reset link has been sent to <strong className="text-[#C9A84C]">{email}</strong>.
                Check your inbox and follow the link to set a new password.
              </p>
              <Link href="/iuztf-management/login" className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-white text-sm transition">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white font-heading mb-1">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your admin email to receive a reset link.</p>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    placeholder="ztfuniversityinstitute@gmail.com"
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] outline-none transition"
                  />
                </div>
                {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <Link href="/iuztf-management/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">ZTF University Institute — Admin Portal</p>
      </div>
    </div>
  );
}
