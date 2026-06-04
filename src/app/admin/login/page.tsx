'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield, RefreshCw } from 'lucide-react';

type Stage = 'email' | 'totp-setup' | 'totp-verify' | 'password' | 'success';

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function StageIndicator({ stage }: { stage: Stage }) {
  const steps = [
    { key: 'email', label: 'Email' },
    { key: 'totp', label: 'Authenticate' },
    { key: 'password', label: 'Access' },
  ];
  const activeIdx =
    stage === 'email' ? 0
    : stage === 'totp-setup' || stage === 'totp-verify' ? 1
    : 2;

  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
            i < activeIdx ? 'bg-green-500 text-white' :
            i === activeIdx ? 'bg-[#C9A84C] text-[#0A1628]' :
            'bg-white/10 text-gray-500'
          }`}>
            {i < activeIdx ? '✓' : i + 1}
          </div>
          <span className={`ml-1.5 text-xs hidden sm:block transition-colors ${i === activeIdx ? 'text-[#C9A84C] font-semibold' : 'text-gray-500'}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="flex-1 h-px bg-white/10 mx-2" />}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, autoFocus = false, maxLength, inputMode, onKeyDown }:
  { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; maxLength?: number; inputMode?: 'numeric'; onKeyDown?: (e: React.KeyboardEvent) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        inputMode={inputMode}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] focus:outline-none transition"
      />
    </div>
  );
}

// TOTP countdown (30s period)
function TotpCountdown() {
  const [secs, setSecs] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  useEffect(() => {
    const t = setInterval(() => setSecs(30 - (Math.floor(Date.now() / 1000) % 30)), 500);
    return () => clearInterval(t);
  }, []);
  const pct = ((30 - secs) / 30) * 100;
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <RefreshCw className="w-3.5 h-3.5 text-[#C9A84C]" />
      <span>Code refreshes in: <strong className="text-[#C9A84C]">{secs}s</strong></span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#C9A84C] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // TOTP setup data
  const [qrCode, setQrCode] = useState('');
  const [formattedSecret, setFormattedSecret] = useState('');
  const [totpSecret, setTotpSecret] = useState(''); // ephemeral, for first-time setup

  const clearError = () => setError('');

  // ─── STAGE 1: Email submit ────────────────────────────────────
  const handleEmail = async () => {
    if (!email || !email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true); clearError();
    try {
      const res = await fetch('/api/admin/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!data.exists) { setError('No admin account found for this email.'); setLoading(false); return; }

      if (data.totp_enabled) {
        setStage('totp-verify');
      } else {
        // First time — generate TOTP secret + QR code
        const setupRes = await fetch('/api/admin/setup-totp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        const setupData = await setupRes.json();
        if (!setupData.success) { setError('Failed to generate authenticator code. Please try again.'); setLoading(false); return; }
        setQrCode(setupData.qrCode);
        setFormattedSecret(setupData.formattedSecret);
        setTotpSecret(setupData.secret);
        setStage('totp-setup');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // ─── STAGE 2A/2B: Verify TOTP code ───────────────────────────
  const handleTotpVerify = async () => {
    const code = totpCode.replace(/\s/g, '');
    if (code.length !== 6 || !/^\d+$/.test(code)) { setError('Enter the 6-digit code from Google Authenticator.'); return; }
    setLoading(true); clearError();
    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: code,
          ...(totpSecret ? { secret: totpSecret } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTotpCode('');
        setStage('password');
      } else {
        setError(data.error || 'Invalid code. Please check your authenticator app and try again.');
      }
    } catch { setError('Verification failed. Please try again.'); }
    finally { setLoading(false); }
  };

  // ─── STAGE 3: Password → Supabase auth ────────────────────────
  const handlePassword = async () => {
    if (!password) { setError('Enter your password.'); return; }
    setLoading(true); clearError();
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        setError('Incorrect password. Please try again.');
      } else {
        setStage('success');
        setTimeout(() => router.push('/admin'), 1200);
      }
    } catch { setError('Sign-in failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => { if (e.key === 'Enter') fn(); };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/images/logo.png" alt="ZTF University Institute" width={70} height={70} className="object-contain mx-auto mb-4" priority />
          <h1 className="text-xl font-bold text-white font-heading">ZTF University Institute</h1>
          <p className="text-[#C9A84C] text-sm font-semibold mt-1 tracking-wide">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1F3C] rounded-2xl border border-[#C9A84C]/25 shadow-2xl p-7 sm:p-8">
          <StageIndicator stage={stage} />

          <AnimatePresence mode="wait">

            {/* ── STAGE 1: Email ── */}
            {stage === 'email' && (
              <motion.div key="email" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
                <h2 className="text-xl font-bold text-white font-heading mb-1">Sign In</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your admin email to continue.</p>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={onEnter(handleEmail)}
                      placeholder="admin@ztfuniversity.com" autoFocus
                      className="w-full pl-9 pr-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] outline-none transition"
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
                  <button onClick={handleEmail} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50">
                    {loading ? 'Checking...' : 'Continue'} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 2A: TOTP Setup (first time) ── */}
            {stage === 'totp-setup' && (
              <motion.div key="totp-setup" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-[#C9A84C]" />
                  <h2 className="text-xl font-bold text-white font-heading">Set Up Google Authenticator</h2>
                </div>
                <p className="text-gray-400 text-sm mb-5">This is a one-time setup to secure your account.</p>

                <ol className="space-y-2 mb-5 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-[#C9A84C] text-[#0A1628] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Download <strong className="text-white">Google Authenticator</strong> on your phone (App Store or Google Play)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-[#C9A84C] text-[#0A1628] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>Open the app → tap <strong className="text-white">"+"</strong> → tap <strong className="text-white">"Scan QR code"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-[#C9A84C] text-[#0A1628] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Scan the QR code below, then enter the 6-digit code shown in the app</span>
                  </li>
                </ol>

                {/* QR Code */}
                {qrCode && (
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-lg inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCode} alt="Google Authenticator QR Code" width={200} height={200} />
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">Can&apos;t scan? Enter this code manually:</p>
                    <code className="mt-1.5 px-4 py-2 bg-[#162845] border border-white/10 rounded-xl text-[#C9A84C] text-xs font-mono tracking-widest select-all text-center">
                      {formattedSecret}
                    </code>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">6-Digit Code from Authenticator App</label>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={onEnter(handleTotpVerify)}
                      placeholder="000000" autoFocus
                      className="w-full px-4 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-center text-2xl font-mono tracking-[0.4em] focus:border-[#C9A84C] outline-none transition"
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
                  <button onClick={handleTotpVerify} disabled={loading || totpCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Activate'} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setStage('email'); clearError(); setTotpCode(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-300 transition py-1">
                    ← Use a different email
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 2B: TOTP Verify (returning user) ── */}
            {stage === 'totp-verify' && (
              <motion.div key="totp-verify" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-[#C9A84C]" />
                  <h2 className="text-xl font-bold text-white font-heading">Enter Authenticator Code</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Open <strong className="text-white">Google Authenticator</strong> on your phone and enter the 6-digit code for <strong className="text-[#C9A84C]">ZTF University Institute</strong>.
                </p>

                <div className="space-y-4">
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={onEnter(handleTotpVerify)}
                    placeholder="000000" autoFocus
                    className="w-full px-4 py-4 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-center text-3xl font-mono tracking-[0.5em] focus:border-[#C9A84C] outline-none transition"
                  />
                  <TotpCountdown />
                  {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
                  <button onClick={handleTotpVerify} disabled={loading || totpCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify Code'} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setStage('email'); clearError(); setTotpCode(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-300 transition py-1">
                    ← Use a different email
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 3: Password ── */}
            {stage === 'password' && (
              <motion.div key="password" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-5 h-5 text-[#C9A84C]" />
                  <h2 className="text-xl font-bold text-white font-heading">Enter Password</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Authenticator verified ✓ — one last step for <strong className="text-[#C9A84C]">{email}</strong>
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={onEnter(handlePassword)}
                      placeholder="Your admin password" autoFocus
                      className="w-full pl-9 pr-10 py-3 bg-[#162845] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[#C9A84C] outline-none transition"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
                  <button onClick={handlePassword} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold py-3 rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Sign In to Admin'} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 4: Success ── */}
            {stage === 'success' && (
              <motion.div key="success" variants={fadeVariants} initial="initial" animate="animate"
                className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                  className="w-18 h-18 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
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
          ZTF University Institute — Admin Portal · Secured with Google Authenticator
        </p>
      </div>
    </div>
  );
}
