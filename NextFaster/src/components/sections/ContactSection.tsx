'use client';

import { useTranslations } from 'next-intl';

export default function ContactSection() {
  const t = useTranslations('landing.contactUs');

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-50 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-teal-50 blur-3xl opacity-50 pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">{t('title')}</h2>
          <p className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">{t('subtitle')}</p>
        </div>

        <form className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-neutral-200/50 border border-neutral-100 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">{t('nameLabel')}</label>
              <input type="text" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" placeholder="..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">{t('emailLabel')}</label>
              <input type="email" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" placeholder="..." />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">{t('messageLabel')}</label>
            <textarea rows={4} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none" placeholder="..."></textarea>
          </div>

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 active:scale-[0.98]">
            {t('submitButton')}
          </button>
        </form>
      </div>
    </section>
  );
}
