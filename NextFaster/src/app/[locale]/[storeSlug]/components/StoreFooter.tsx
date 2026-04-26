'use client';

import Link from 'next/link';
import { MapPin, Zap, Phone, Truck } from 'lucide-react';
import { StoreInfo } from '../types';

interface Props {
  store: StoreInfo;
  locale: string;
}

export function StoreFooter({ store, locale }: Props) {
  const isAr = locale === 'ar';

  return (
    <footer className="mt-20 border-t border-neutral-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid gap-12 lg:grid-cols-4">

          {/* Store Brand Section */}
          <div className={`col-span-1 lg:col-span-1 flex flex-col gap-5 ${isAr ? 'flex-row-reverse items-end text-right' : 'items-start'}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              {store.storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.storeLogo}
                  alt={store.storeName}
                  className="h-10 w-10 rounded-2xl border border-neutral-100 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-sm font-black text-emerald-600">
                    {store.storeName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-lg font-black tracking-tighter text-neutral-900">{store.storeName}</span>
            </div>

            {store.storeDescription && (
              <p className="max-w-xs text-xs font-medium leading-relaxed text-neutral-400">
                {store.storeDescription}
              </p>
            )}

            <div className={`flex flex-col gap-2 ${isAr ? 'items-end' : 'items-start'}`}>
              {store.primaryLocation && (
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span>{store.primaryLocation}</span>
                </div>
              )}
              {store.phone && (
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <Phone className="h-3 w-3 text-emerald-500" />
                  <a href={`tel:${store.phone}`} className="hover:text-emerald-600 transition-colors">
                    {store.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Rates Section */}
          {store.shippingRates && store.shippingRates.length > 0 && (
            <div className="col-span-1 lg:col-span-2">
              <div className={`mb-6 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Truck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-900">
                  {isAr ? 'مناطق التوصيل' : 'Shipping Areas'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {store.shippingRates.map((rate) => (
                  <div key={rate.governorate} className={`flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 border border-neutral-100/50 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] font-black uppercase tracking-tight text-neutral-500">{rate.governorate}</span>
                    <div className={`flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[11px] font-black text-neutral-900">
                        {parseFloat(rate.price).toFixed(2)}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        {isAr ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Branding Section */}
          <div className={`col-span-1 flex flex-col justify-between ${isAr ? 'items-end text-right' : 'items-start'}`}>
            <div className="space-y-4">
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Zap className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  {isAr ? 'مدعوم بـ' : 'Powered by'}
                </span>
              </div>
              <Link
                href={`/${locale}`}
                className="group flex flex-col pt-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt="SouqFlow"
                  className="h-8 w-auto object-contain transition-opacity hover:opacity-80"
                />
                <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-300">
                  {isAr ? 'منصة التجارة الإلكترونية' : 'E-commerce platform'}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className={`mt-16 flex flex-col items-center justify-between gap-6 border-t border-neutral-100 pt-10 sm:flex-row ${isAr ? 'sm:flex-row-reverse' : ''}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
            © {new Date().getFullYear()} {store.storeName}. {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <div className="flex items-center gap-6">
             {/* Simple visual decor or social placeholders can go here */}
             <div className="h-2 w-2 rounded-full bg-emerald-500/20" />
             <div className="h-2 w-2 rounded-full bg-emerald-500/40" />
             <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
