'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'mgmt_portal_attempts';

type Stage = 'email' | 'password' | 'success';

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

function getLockoutData(): { count: number; since: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, since: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, since: 0 };
  }
}

function setLockoutData(count: number, since: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, since }));
}

function clearLockout() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function ManagementLoginPage() {
  const router = useRouter();
  const [stage, setStage]               = useState<Stage>('email');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [lockoutMinutes, setLockoutMinutes] = useState(0);

  const checkLockout = useCallback(() => {
    const { count, since } = getLockoutData();
    if (count >= MAX_ATTEMPTS && since) {
      const elapsed = Date.now() - since;
      if (elapsed < LOCKOUT_MS) {
        const remaining = Math.ceil((LOCKOUT_MS - elapsed) / 60000);
        setLockoutMinutes(remaining);
        return true;
      }
      clearLockout();
    }
    setLockoutMinutes(0);
    return false;
  }, []);

  useEffect(() => {
    checkLockout();
    const interval = setInterval(checkLockout, 30000);
    return () => clearInterval(interval);
  }, [checkLockout]);

  const clearError = () => setError('');

  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fn();
  };

  // ── Stage 1: verify email ────────────────────────────────────────
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
        setError('Access denied. Unauthorized email address.');
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
    if (checkLockout()) return;
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
        const { count, since } = getLockoutData();
        const newCount = count + 1;
        const newSince = since || Date.now();
        setLockoutData(newCount, newSince);
        if (newCount >= MAX_ATTEMPTS) {
          setLockoutData(newCount, Date.now());
          checkLockout();
          setError(`Too many failed attempts. Try again in 15 minutes.`);
        } else {
          const remaining = MAX_ATTEMPTS - newCount;
          setError(`Incorrect password. Access denied. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
        }
      } else {
        clearLockout();
        setStage('success');
        setTimeout(() => router.push('/iuztf-management'), 1200);
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutMinutes > 0;

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo + branding */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="IU-ZTF"
            width={50} height={50}
            className="object-contain mx-auto mb-3"
            priority
          />
          <p className="text-[#C9A84C] text-xs font-bold tracking-[0.25em] uppercase mb-1">IU-ZTF</p>
          <h1 className="text-lg font-bold text-white font-heading">Management Portal</h1>
          <p className="text-gray-500 text-xs mt-1 tracking-wide">Authorized Personnel Only</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1F3C] rounded-2xl border border-[#C9A84C]/20 shadow-2xl p-7 sm:p-8">

          {/* Lockout banner */}
          {isLocked && (
            <div className="flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-semibold">Access Temporarily Locked</p>
                <p className="text-red-400/80 text-xs mt-0.5">
                  Too many failed attempts. Try again in {lockoutMinutes} minute{lockoutMinutes === 1 ? '' : 's'}.
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Stage 1: Email ── */}
            {stage === 'email' && (
              <motion.div key="email" variants={fade} initial="initial" animate="animate" exit="exit">
                <h2 className="text-xl font-bold text-white font-heading mb-1">IU-ZTF Management Portal</h2>
                <p className="text-gray-400 text-sm mb-6">Authorized Personnel Only</p>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={onEnter(handleEmail)}
                      placeholder="Email address"
                      autoFocus
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:border-[#C9A84C] outline-none transition"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                  )}
                  <button
                    onClick={handleEmail}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying…' : 'Continue'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Stage 2: Password ── */}
            {stage === 'password' && (
              <motion.div key="password" variants={fade} initial="initial" animate="animate" exit="exit">
                <h2 className="text-xl font-bold text-white font-heading mb-1">Enter Password</h2>
                <p className="text-gray-400 text-sm mb-1">
                  Signing in as <strong className="text-[#C9A84C] break-all">{email}</strong>
                </p>
                <button
                  onClick={() => { setStage('email'); clearError(); setPassword(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition mb-5 inline-block"
                >
                  ← Change email
                </button>
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={onEnter(handlePassword)}
                      placeholder="Password"
                      autoFocus
                      autoComplete="current-password"
                      disabled={isLocked}
                      className="w-full pl-9 pr-10 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:border-[#C9A84C] outline-none transition disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                  )}
                  <button
                    onClick={handlePassword}
                    disabled={loading || isLocked}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50"
                  >
                    {loading ? 'Authenticating…' : 'Sign In to Portal'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="text-center text-xs text-gray-700 mt-1">
                    <Link href="/iuztf-management/login/reset" className="hover:text-gray-500 transition">
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
                  className="w-[72px] h-[72px] bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl text-white"
                >
                  ✓
                </motion.div>
                <h2 className="text-xl font-bold text-white font-heading mb-2">Access Granted</h2>
                <p className="text-gray-400 text-sm">Redirecting to management portal…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Watermark */}
        <p className="text-center text-[10px] text-gray-800 mt-6 tracking-widest uppercase select-none">
          Authorized Access Only — Unauthorized use is prohibited
        </p>

      </div>
    </div>
  );
}
