'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError(t('login.emailRequired'));
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(t('login.invalidEmail'));
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError(t('login.passwordRequired'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (data.user.isStoreOwner) {
        window.location.href = `/${locale}/seller/stores`;
      } else {
        window.location.href = `/${locale}/dashboard`;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Reusable Emerald Input Class
  const inputClass = `w-full rounded-xl border border-neutral-200 bg-white/80 py-3.5 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`;

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">
            {t('login.emailLabel')}
          </label>
          <div className="relative group">
            <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <label className="text-sm font-bold text-neutral-700">
              {t('login.passwordLabel')}
            </label>
            {/* Optional: Add "Forgot Password?" link here if you have it in translations */}
          </div>
          <div className="relative group">
            <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 py-4 font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-neutral-200"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {t('login.loginButton')}
              <ArrowRight className={`h-5 w-5 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </>
          )}
        </button>

        <p className="text-center text-sm font-medium text-neutral-500">
          {t('login.noAccount')}{' '}
          <Link href={`/${locale}/auth/signup`} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-emerald-500/30 underline-offset-4">
            {t('login.signup')}
          </Link>
        </p>
      </form>
    </div>
  );
}