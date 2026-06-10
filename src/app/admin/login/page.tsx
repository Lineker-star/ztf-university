// To reset password: Go to Supabase Dashboard → Authentication → Users
// Find info@ztfuniversity.com → Click "Send password reset" or manually update password in Supabase Auth
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

type Stage = 'email' | 'password' | 'success';

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function StageIndicator({ stage }: { stage: Stage }) {
  const steps = [
    { key: 'email',    label: 'Email'    },
    { key: 'password', label: 'Password' },
    { key: 'success',  label: 'Access'   },
  ];
  const activeIdx = stage === 'email' ? 0 : stage === 'password' ? 1 : 2;

  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
            i < activeIdx  ? 'bg-green-500 text-white' :
            i === activeIdx ? 'bg-[#C9A84C] text-[#0A1628]' :
            'bg-white/10 text-gray-500'
          }`}>
            {i < activeIdx ? '✓' : i + 1}
          </div>
          <span className={`ml-1.5 text-xs hidden sm:block transition-colors ${
            i === activeIdx ? 'text-[#C9A84C] font-semibold' : 'text-gray-500'
          }`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="flex-1 h-px bg-white/10 mx-2" />}
        </div>
      ))}
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [stage, setStage]               = useState<Stage>('email');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const clearError = () => setError('');
  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fn();
  };

  // ── Stage 1: verify email exists ─────────────────────────────────
  const handleEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      const res  = await fetch('/api/portal/check-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!data.exists) {
        setError('No admin account found for this email.');
      } else {
        setStage('password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Stage 2: sign in with password ───────────────────────────────
  const handlePassword = async () => {
    if (!password) { setError('Enter your password.'); return; }
    setLoading(true);
    clearError();
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        setError('Incorrect password. Please try again.');
      } else {
        setStage('success');
        setTimeout(() => router.push('/admin'), 1200);
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="ZTF University Institute"
            width={70} height={70}
            className="object-contain mx-auto mb-4"
            priority
          />
          <h1 className="text-xl font-bold text-white font-heading">ZTF University Institute</h1>
          <p className="text-[#C9A84C] text-sm font-semibold mt-1 tracking-wide">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1F3C] rounded-2xl border border-[#C9A84C]/25 shadow-2xl p-7 sm:p-8">
          <StageIndicator stage={stage} />

          <AnimatePresence mode="wait">

            {/* ── Stage 1: Email ── */}
            {stage === 'email' && (
              <motion.div key="email" variants={fade} initial="initial" animate="animate" exit="exit">
                <h2 className="text-xl font-bold text-white font-heading mb-1">Sign In</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your admin email to continue.</p>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={onEnter(handleEmail)}
                      placeholder="admin@ztfuniversity.com"
                      autoFocus
                      className="w-full pl-9 pr-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] outline-none transition"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>
                  )}
                  <button
                    onClick={handleEmail}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50"
                  >
                    {loading ? 'Checking…' : 'Continue'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Stage 2: Password ── */}
            {stage === 'password' && (
              <motion.div key="password" variants={fade} initial="initial" animate="animate" exit="exit">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-5 h-5 text-[#C9A84C]" />
                  <h2 className="text-xl font-bold text-white font-heading">Enter Password</h2>
                </div>
                <p className="text-gray-400 text-sm mb-1">
                  Signing in as <strong className="text-[#C9A84C]">{email}</strong>
                </p>
                <button
                  onClick={() => { setStage('email'); clearError(); setPassword(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition mb-5 inline-block"
                >
                  ← Change email
                </button>
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={onEnter(handlePassword)}
                      placeholder="Your admin password"
                      autoFocus
                      className="w-full pl-9 pr-10 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>
                  )}
                  <button
                    onClick={handlePassword}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50"
                  >
                    {loading ? 'Signing in…' : 'Sign In to Admin'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="text-center text-xs text-gray-600 mt-2">
                    <Link href="/admin/login/reset" className="hover:text-gray-400 transition">
                      Forgot password?
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Stage 3: Success ── */}
            {stage === 'success' && (
              <motion.div
                key="success"
                variants={fade}
                initial="initial"
                animate="animate"
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                  className="bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
                  style={{ width: 72, height: 72 }}
                >
                  ✓
                </motion.div>
                <h2 className="text-xl font-bold text-white font-heading mb-2">Access Granted</h2>
                <p className="text-gray-400 text-sm">Redirecting to admin dashboard…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          ZTF University Institute — Admin Portal
        </p>
      </div>
    </div>
  );
}
