'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Eye, EyeOff, LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SouqFlowLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/souqflow/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error || 'Invalid credentials'); 
        return; 
      }
      router.push(`/${locale}/admin/dashboard`);
    } catch {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 font-sans selection:bg-emerald-500/10">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-[100px] animate-pulse" />
        <div className="absolute -right-20 -bottom-20 h-[500px] w-[500px] rounded-full bg-emerald-50 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo Section */}
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
            className="inline-block"
          >
            <img src="/images/logo.png" alt="SouqFlow" className="h-32 sm:h-36 w-auto object-contain drop-shadow-xl" />
          </motion.div>
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
              Internal Command Center
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="group relative">
          <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 blur-2xl transition duration-1000 group-hover:opacity-100" />
          
          <div className="relative rounded-[3rem] border border-neutral-200 bg-white/90 p-8 shadow-2xl shadow-neutral-900/5 backdrop-blur-2xl sm:p-12">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-widest">Sign In</h2>
                <p className="mt-1 text-xs font-bold text-neutral-400">Security Clearance Required</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-[10px] font-black uppercase tracking-widest text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Email Authority</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@souqflow.com"
                    className="w-full rounded-2xl border border-neutral-100 bg-neutral-50/50 py-5 pl-14 pr-5 text-sm font-black text-neutral-900 placeholder-neutral-300 outline-none transition-all focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Access Credential</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-neutral-100 bg-neutral-50/50 py-5 pl-14 pr-14 text-sm font-black text-neutral-900 placeholder-neutral-300 outline-none transition-all focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 transition-colors hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-neutral-900 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-neutral-900/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Authorize Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-5 border-t border-neutral-100 pt-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Authorized Personnel Only
              </p>
              <a 
                href={`/${locale}/admin/signup`} 
                className="text-xs font-black uppercase tracking-widest text-neutral-900 transition-colors hover:text-emerald-600"
              >
                Request Access
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[9px] font-black uppercase tracking-[0.4em] text-neutral-300">
        &copy; {new Date().getFullYear()} SOUQFLOW ENTERPRISE &bull; SECURE CORE V3.0
      </div>
    </div>
  );
}
