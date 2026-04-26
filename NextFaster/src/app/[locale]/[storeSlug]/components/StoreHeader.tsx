'use client';

import { ShoppingCart, Search, X } from 'lucide-react';
import { StoreInfo, StoreProduct, View } from '../types';
import { AuthDropdown } from './AuthDropdown';
import LanguageToggle from '@/components/LanguageToggle';
import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  store: StoreInfo;
  locale: string;
  searchTerm: string;
  searchResults: StoreProduct[];
  isSearchOpen: boolean;
  totalCartItems: number;
  authUser: string | null;
  authLoaded: boolean;
  onSearchChange: (v: string) => void;
  onSearchSelect: (p: StoreProduct) => void;
  onSearchClose: () => void;
  onLogoClick: () => void;
  onMenuClick: () => void;
  onViewChange: (v: View) => void;
  onLogout: () => void;
}

export function StoreHeader({
  store, locale, searchTerm, searchResults, isSearchOpen,
  totalCartItems, authUser, authLoaded,
  onSearchChange, onSearchSelect, onSearchClose,
  onLogoClick, onViewChange, onLogout,
}: Props) {
  const isRTL = locale === 'ar';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onSearchClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onSearchClose]);

  return (
    <header className={cn(
      "fixed top-0 z-40 w-full transition-all duration-500",
      scrolled 
        ? "bg-white/80 backdrop-blur-xl border-b border-neutral-100 shadow-[0_4px_30px_rgb(0,0,0,0.03)] h-16 sm:h-20" 
        : "bg-white border-b border-transparent h-20 sm:h-24"
    )}>
      <div className={`mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8 ${isRTL ? 'flex-row-reverse' : ''}`}>

        {/* Left — logo + store name */}
        <button
          onClick={onLogoClick}
          className={`group flex shrink-0 items-center gap-3 transition-transform active:scale-95 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            {store.storeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.storeLogo} alt={store.storeName} className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-white bg-white object-cover shadow-sm ring-1 ring-neutral-100 transition-all group-hover:rounded-xl" />
            ) : (
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-white bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100 group-hover:rounded-xl transition-all">
                <span className="text-sm sm:text-base font-black uppercase">{store.storeName[0]}</span>
              </div>
            )}
          </div>
          <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-black uppercase tracking-tight text-neutral-900 group-hover:text-emerald-600 transition-colors leading-none">{store.storeName}</p>
            {store.primaryLocation && (
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-neutral-500 transition-colors">{store.primaryLocation}</p>
            )}
          </div>
        </button>

        {/* Center — search */}
        <div className="relative flex-1 group" ref={dropdownRef}>
          <div className="relative">
            <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن منتجك المفضل...' : 'Search for products...'}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full rounded-2xl border-2 border-neutral-100 bg-neutral-50/50 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-300 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
            />
            {searchTerm && (
              <button
                onClick={() => { onSearchChange(''); onSearchClose(); }}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-300 transition-all hover:bg-rose-50 hover:text-rose-500 ${isRTL ? 'left-3' : 'right-3'}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isSearchOpen && (
            <div className="absolute top-full z-50 mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl shadow-neutral-900/10">
                <ScrollArea className="max-h-[400px]">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((item) => (
                        <button
                          key={item.slug}
                          className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all hover:bg-neutral-50 active:scale-[0.99] ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          onClick={() => { onSearchSelect(item); }}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200">
                            {item.image_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={item.image_url} alt="" className="h-full w-full object-cover transition-transform hover:scale-110" />
                              : <div className="flex h-full w-full items-center justify-center text-neutral-300"><Search className="h-5 w-5" /></div>}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-black text-neutral-900 uppercase tracking-tight">{item.name}</p>
                            <p className="text-xs font-black text-emerald-600">{parseFloat(item.price).toFixed(2)} <span className="text-[10px] uppercase">{locale === 'ar' ? 'ج.م' : 'EGP'}</span></p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center grayscale opacity-50">
                       <Search className="h-8 w-8 text-neutral-300 mb-2" />
                       <p className="text-xs font-black uppercase tracking-widest text-neutral-400">{locale === 'ar' ? 'لم نجد أي منتجات' : 'No products found'}</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        {/* Right — cart + language + auth */}
        <div className={`flex shrink-0 items-center gap-2 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Cart */}
          <button
            onClick={() => onViewChange('cart')}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-100 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-100 active:scale-90"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
            {totalCartItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-in zoom-in items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white shadow-lg ring-2 ring-white">
                {totalCartItems}
              </span>
            )}
          </button>

          <div className="hidden sm:block">
             <LanguageToggle />
          </div>

          <AuthDropdown authUser={authUser} authLoaded={authLoaded} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
