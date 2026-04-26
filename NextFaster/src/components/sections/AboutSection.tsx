'use client';

import { useTranslations } from 'next-intl';
import { Users, Target, Shield } from 'lucide-react';

export default function AboutSection() {
  const t = useTranslations('landing.aboutUs');

  return (
    <section id="about" className="py-24 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3 text-center">{t('title')}</h2>
          <p className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
            {t('subtitle')}
          </p>
          <p className="text-lg text-neutral-600 leading-relaxed">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: t('values.community.title'), desc: t('values.community.desc') },
            { icon: Target, title: t('values.innovation.title'), desc: t('values.innovation.desc') },
            { icon: Shield, title: t('values.trust.title'), desc: t('values.trust.desc') },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <item.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
              <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
