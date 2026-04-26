'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function SouqFlowFooter() {
  const t = useTranslations('landing.footer');
  const locale = useLocale();

  return (
    <footer 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="relative border-t border-neutral-100 bg-white px-6 py-16 lg:px-8"
    >
      {/* Static Top Border Accent */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="group mb-6 flex items-center shrink-0 transition-all active:scale-95 hover:opacity-80">
              <img 
                src="/images/logo.png" 
                alt="SouqFlow" 
                className="h-10 w-auto sm:h-14 object-contain"
              />
            </Link>
            <p className="max-w-xs text-base leading-relaxed text-neutral-500">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-neutral-900">
              {t('product')}
            </h4>
            <ul className="space-y-4 text-sm font-medium text-neutral-500">
              <li>
                <Link href={`/${locale}#features`} className="transition-colors hover:text-emerald-600">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#pricing`} className="transition-colors hover:text-emerald-600">
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-neutral-900">
              {t('company')}
            </h4>
            <ul className="space-y-4 text-sm font-medium text-neutral-500">
              <li>
                <Link href={`/${locale}#about`} className="transition-colors hover:text-emerald-600">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#contact`} className="transition-colors hover:text-emerald-600">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-neutral-900">
              {t('legal')}
            </h4>
            <ul className="space-y-4 text-sm font-medium text-neutral-500">
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">
                  {t('privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">
                  {t('terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-neutral-100 pt-8 md:flex-row">
          <p className="text-sm text-neutral-400">
            &copy; 2026 <span className="font-semibold text-neutral-900">SouqFlow</span>. {t('rights')}
          </p>
          
          {/* Subtle Accent Dots */}
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-lime-500/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}