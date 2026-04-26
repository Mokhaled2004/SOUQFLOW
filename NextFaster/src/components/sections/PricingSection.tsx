'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function PricingSection() {
  const t = useTranslations('landing.pricing');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const featureKeys = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'] as const;

  return (
    <section id="pricing" className="bg-white px-4 py-20 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`mb-16 ${isAr ? 'text-right' : 'text-center'}`}
        >
          <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative group rounded-3xl border border-neutral-200 bg-white p-1 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-emerald-200/20"
        >
          {/* Animated Gradient Border Overlay */}
          <div className="absolute -inset-[2px] -z-10 rounded-[calc(1.5rem+2px)] bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 opacity-20 transition-opacity group-hover:opacity-100 group-hover:animate-gradient-shift bg-[length:200%_auto]" />

          <div className="rounded-[calc(1.5rem-1px)] bg-white p-8 sm:p-12">
            <div className="mb-8 text-center">
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-bold text-emerald-700 uppercase tracking-widest">
                {t('free.title')}
              </span>
              <p className={`mt-4 text-neutral-500 font-medium ${isAr ? 'text-right' : 'text-center'}`}>{t('free.description')}</p>
            </div>

            <div className={`mb-10 ${isAr ? 'text-right' : 'text-center'}`}>
              <div className="relative inline-block">
                <div className="mb-2 text-7xl font-black tracking-tighter text-neutral-900">
                  {t('free.price')}
                </div>
                <div className="absolute -right-8 top-2 h-3 w-3 animate-ping rounded-full bg-lime-400" />
              </div>
              <p className="text-lg font-bold text-emerald-600 uppercase tracking-tighter">{t('free.perOrder')}</p>
            </div>

            {/* Feature List */}
            <div className={`mb-10 grid gap-4 sm:grid-cols-2 ${isAr ? 'text-right' : 'text-left'}`}>
              {featureKeys.map((key, index) => (
                <motion.div 
                  key={key} 
                  initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
                    <Check className="h-4 w-4 font-bold text-white" />
                  </div>
                  <span className="text-neutral-700 font-medium">{t(`free.${key}`)}</span>
                </motion.div>
              ))}
            </div>

            {/* Action Button */}
            <Link
              href={`/${locale}/auth/signup`}
              className="group relative block w-full overflow-hidden rounded-2xl bg-neutral-900 py-5 text-center font-black text-white transition-all hover:bg-neutral-800 active:scale-[0.98]"
            >
              {/* Continuous shine sweep — always running */}
              <span className="relative z-10 text-lg uppercase tracking-tight">{t('free.cta')}</span>
            </Link>
          </div>
        </motion.div>
        

      </div>
    </section>
  );
}