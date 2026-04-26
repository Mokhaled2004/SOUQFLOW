'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, MessageCircle, ShoppingCart, BarChart3, Users } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const featureKeys = [
  { key: 'zeroCommission', icon: TrendingUp, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-500' },
  { key: 'easySetup', icon: Zap, bgColor: 'bg-teal-100', iconColor: 'text-teal-600', hoverBorder: 'hover:border-teal-500' },
  { key: 'whatsapp', icon: MessageCircle, bgColor: 'bg-lime-100', iconColor: 'text-lime-600', hoverBorder: 'hover:border-lime-500' },
  { key: 'unlimited', icon: ShoppingCart, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-500' },
  { key: 'analytics', icon: BarChart3, bgColor: 'bg-teal-100', iconColor: 'text-teal-600', hoverBorder: 'hover:border-teal-500' },
  { key: 'arabicFirst', icon: Users, bgColor: 'bg-lime-100', iconColor: 'text-lime-600', hoverBorder: 'hover:border-lime-500' },
] as const;

export default function FeaturesSection() {
  const t = useTranslations('landing.features');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section id="features" className="relative px-4 py-20 sm:py-32 lg:px-8 bg-neutral-50/50">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header with Scroll Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            {t('subtitle')}
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="h-1.5 w-12 rounded-full bg-emerald-500" />
            <div className="h-1.5 w-4 rounded-full bg-teal-400" />
            <div className="h-1.5 w-2 rounded-full bg-lime-400" />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ key, icon: Icon, bgColor, iconColor, hoverBorder }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1, // This creates the staggered effect on scroll
                ease: "easeOut" 
              }}
              className={`group relative rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 ${hoverBorder} hover:shadow-xl hover:shadow-neutral-200/50 flex flex-col items-center text-center`}
            >
              {/* Icon Container */}
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${bgColor}`}>
                <Icon className={`h-7 w-7 ${iconColor}`} />
              </div>

              {/* Text Content */}
              <h3 className="mb-3 text-xl font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                {t(`${key}.title`)}
              </h3>
              <p className="leading-relaxed text-neutral-600">
                {t(`${key}.description`)}
              </p>

              {/* Subtle Decorative Element using your pulse-glow animation */}
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <div className={`h-1.5 w-1.5 rounded-full ${iconColor.replace('text', 'bg')} animate-pulse-glow`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}