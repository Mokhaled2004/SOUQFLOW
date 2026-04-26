'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Store, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.roleSelection');
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        router.push(`/${locale}/auth/login`);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Welcome, {user.username}!
          </h1>
          <p className="mt-2 text-neutral-600">{user.email}</p>
        </div>

        <h2 className="mb-4 text-xl font-bold text-neutral-900">{t('title')}</h2>
        <p className="mb-8 text-neutral-600">{t('subtitle')}</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href={`/${locale}/seller/onboarding`}
            className="group relative overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-sky-100">
                <Store className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-neutral-900">{t('seller.title')}</h3>
              <p className="text-neutral-600">{t('seller.description')}</p>
              <div className={`mt-6 flex items-center gap-2 text-sky-600 font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                {t('seller.cta')}
                <span>{isRTL ? '←' : '→'}</span>
              </div>
            </div>
          </Link>

          <Link
            href={`/${locale}/buyer/dashboard`}
            className="group relative overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white p-8 transition-all hover:border-pink-500 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-pink-100">
                <ShoppingBag className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-neutral-900">{t('buyer.title')}</h3>
              <p className="text-neutral-600">{t('buyer.description')}</p>
              <div className={`mt-6 flex items-center gap-2 text-pink-600 font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                {t('buyer.cta')}
                <span>{isRTL ? '←' : '→'}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
