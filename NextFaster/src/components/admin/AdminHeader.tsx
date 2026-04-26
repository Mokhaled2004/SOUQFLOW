'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, LayoutGrid, LogOut, ChevronRight, Store as StoreIcon } from 'lucide-react';
import { Store } from '@/types/store';
import LanguageToggle from '@/components/LanguageToggle';

interface AdminHeaderProps {
  store: Store;
  locale: string;
  isRTL: boolean;
  onLogout: () => void;
}

export default function AdminHeader({ store, locale, isRTL, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className={`flex h-14 items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* Brand + breadcrumb */}
          <div className={`flex min-w-0 items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href={`/${locale}`}
              className={`flex shrink-0 items-center gap-2 transition-transform hover:scale-[1.02] ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <img src="/images/logo.png" alt="SouqFlow Logo" className="h-8 sm:h-9 w-auto object-contain" />

            </Link>
            <ChevronRight className={`h-4 w-4 shrink-0 text-neutral-300 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="truncate text-sm font-bold text-neutral-700 max-w-[120px] sm:max-w-xs">
              {store.storeName}
            </span>
          </div>

          {/* Actions */}
          <div className={`flex shrink-0 items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageToggle />
            <Link
              href={`/${locale}/seller/stores`}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:px-4 sm:py-2.5 sm:text-sm shadow-sm"
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'متاجري' : 'My Stores'}</span>
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 px-3 py-1.5 text-xs font-bold transition-all hover:bg-red-100 sm:px-4 sm:py-2.5 sm:text-sm shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'خروج' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Store sub-row */}
        <div className={`flex items-center gap-3 border-t border-neutral-100 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 shadow-sm border border-emerald-100/50">
            <StoreIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : ''}`}>
            <p className="truncate text-sm font-black text-neutral-900">{store.storeName}</p>
            {store.storeDescription && (
              <p className="truncate text-xs font-medium text-neutral-500">{store.storeDescription}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
