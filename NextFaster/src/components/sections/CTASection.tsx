'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function CTASection() {
  const t = useTranslations('landing.cta');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 sm:py-32">
      {/* 1. Light Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[10%] h-[400px] w-[400px] animate-float rounded-full bg-emerald-50 blur-[120px]" />
        <div className="absolute right-[10%] bottom-[10%] h-[400px] w-[400px] animate-float rounded-full bg-teal-50 blur-[120px] [animation-delay:3s]" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        {/* 2. Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-100/50 px-4 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isAr ? 'ابدأ رحلتك اليوم' : 'Start your journey today'}</span>
        </motion.div>

        {/* 3. Main Headline with Gradient Shift */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl"
        >
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift">
            {t('title')}
          </span>
        </motion.h2>

        {/* 4. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-12 max-w-2xl text-lg font-medium text-neutral-600 sm:text-xl"
        >
          {t('subtitle')}
        </motion.p>

        {/* 5. Interactive Button Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <Link
            href={`/${locale}/auth/signup`}
            className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-500 px-12 text-xl font-black text-white transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 active:scale-95"
          >
            <span className="relative z-10">{t('button')}</span>
            {isAr ? (
              <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-2" />
            ) : (
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
            )}
            
            {/* Shimmer effect from your config */}
            <div className="absolute inset-0 -translate-x-full animate-[shine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </Link>

          {/* 6. Secondary Trust Info */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-neutral-200" />
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              {isAr ? 'انضم إلى +٥٠٠ بائع نشط' : 'Join +500 active sellers'}
            </p>
          </div>
        </motion.div>

        {/* 7. Decorative Accent Lines */}
        <div className="mt-20 flex justify-center gap-3 opacity-20">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-glow" />
        </div>
      </div>
    </section>
  );
}