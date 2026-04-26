import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Store, ShoppingBag } from 'lucide-react';

export default async function RoleSelectionPage() {
  const t = await getTranslations('auth.roleSelection');
  const locale = await getLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 selection:bg-emerald-100 animate-in fade-in duration-1000 overflow-hidden relative">
      
      {/* ── BACKGROUND DECOR ────────────────────────────────────── */}
      <div className="absolute top-0 left-0 h-full w-full pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-emerald-500/[0.03] blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-emerald-500/[0.05] blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 shadow-sm border border-emerald-100/50">
             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
             {isRTL ? 'خطوة البداية' : 'Start Your Journey'}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl text-balance">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-xl text-lg font-medium text-neutral-500">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* SELLER CARD */}
          <Link
            href={`/${locale}/seller/onboarding`}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(5,150,105,0.1)] ring-1 ring-neutral-200 hover:ring-emerald-200 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex flex-col h-full">
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 shadow-xl shadow-neutral-900/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900">{t('seller.title')}</h2>
              <p className="mb-10 text-base font-medium leading-relaxed text-neutral-500">{t('seller.description')}</p>
              
              <div className={`mt-auto flex items-center justify-between font-black uppercase tracking-[0.2em] text-[11px] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-3 text-emerald-600">
                   {t('seller.cta')}
                   <div className={`h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 transition-transform group-hover:translate-x-2 ${isRTL ? 'group-hover:-translate-x-2' : ''}`}>
                      <span className="text-white text-lg leading-none">{isRTL ? '←' : '→'}</span>
                   </div>
                </div>
              </div>
            </div>
          </Link>

          {/* BUYER CARD */}
          <Link
            href={`/${locale}/buyer/dashboard`}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] ring-1 ring-neutral-200 hover:ring-neutral-400 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex flex-col h-full">
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 shadow-xl shadow-emerald-900/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900">{t('buyer.title')}</h2>
              <p className="mb-10 text-base font-medium leading-relaxed text-neutral-500">{t('buyer.description')}</p>
              
              <div className={`mt-auto flex items-center justify-between font-black uppercase tracking-[0.2em] text-[11px] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-3 text-neutral-900 group-hover:text-emerald-600 transition-colors">
                   {t('buyer.cta')}
                   <div className={`h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-900/20 group-hover:bg-emerald-600 transition-all group-hover:translate-x-2 ${isRTL ? 'group-hover:-translate-x-2' : ''}`}>
                      <span className="text-white text-lg leading-none">{isRTL ? '←' : '→'}</span>
                   </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* FOOTER BADGE */}
        <div className="mt-16 flex items-center justify-center gap-6 opacity-30">
           <div className="h-px w-12 bg-neutral-900" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-900">SouqFlow</p>
           <div className="h-px w-12 bg-neutral-900" />
        </div>
      </div>
    </div>
  );
}
