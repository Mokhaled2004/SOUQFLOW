'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('landing.hero');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white px-4 py-20 sm:py-32 lg:px-8">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 animate-float rounded-full bg-emerald-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 animate-float rounded-full bg-teal-100 opacity-40 blur-3xl [animation-delay:2s]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge - Using Emerald & Pulse Glow */}
        <div className={`mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 ring-1 ring-emerald-200 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <Zap className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">{t('badge')}</span>
        </div>

        {/* Main Headline - Using Gradient Shift */}
        <h1 className={`mb-6 animate-slide-up text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-7xl ${isAr ? 'text-right' : 'text-center'}`}>
          {t('title').split(' ').map((word, i) => (
            // Applying gradient to the last word or specific focus if you prefer
            <span key={i} className={i === t('title').split(' ').length - 1 ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift" : ""}>
              {word}{' '}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p className={`mb-10 animate-slide-up text-lg text-neutral-600 sm:text-xl [animation-delay:150ms] ${isAr ? 'text-right' : 'text-center'}`}>
          {t('subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col gap-4 sm:flex-row sm:justify-center animate-slide-up [animation-delay:300ms] ${isAr ? 'sm:flex-row-reverse' : ''}`}>
          <Link
            href={`/${locale}/auth/signup`}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 active:scale-95"
          >
            {/* Continuous shine sweep — always running */}
            <span className="absolute inset-0 -translate-x-full animate-[shine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative z-10 flex items-center gap-2">
              {t('cta.primary')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-8 py-4 font-semibold text-neutral-900 transition-all hover:border-emerald-200 hover:bg-emerald-50 active:scale-95"
          >
            {t('cta.secondary')}
          </Link>
        </div>

        {/* Trust message */}
        <div className="mt-10 animate-fade-in [animation-delay:500ms]">
          <p className="text-sm text-neutral-400 tracking-widest uppercase font-medium">
            {isAr ? 'موثوق به من قِبَل البائعين المصريين' : 'Trusted by Egyptian sellers across the country'}
          </p>
        </div>
      </div>
    </section>
  );
}