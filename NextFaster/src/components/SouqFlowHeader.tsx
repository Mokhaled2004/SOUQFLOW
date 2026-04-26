'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import LanguageToggle from './LanguageToggle';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ShoppingBag, ChevronDown, RefreshCw, Store, Menu, X } from 'lucide-react';

export default function SouqFlowHeader() {
  const locale = useLocale();
  const t = useTranslations('landing.nav');
  const tFooter = useTranslations('landing.footer');
  const router = useRouter();
  const isAr = locale === 'ar';

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch { /* not authenticated */ } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Close dropdown/menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push(`/${locale}`);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const closeAll = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      dir={isAr ? 'rtl' : 'ltr'}
      className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md animate-fade-in"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">

          {/* Brand with Logo */}
          <Link href={`/${locale}`} className="group flex items-center shrink-0 transition-all active:scale-95 hover:opacity-80">
            <img 
              src="/images/logo.png" 
              alt="SouqFlow" 
              className="h-10 w-auto sm:h-14 object-contain"
            />
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <Link href={`/${locale}#features`} className="text-sm font-bold text-neutral-600 transition-colors hover:text-emerald-600 cursor-pointer">
              {tFooter('features')}
            </Link>
            <Link href={`/${locale}#about`} className="text-sm font-bold text-neutral-600 transition-colors hover:text-emerald-600 cursor-pointer">
              {tFooter('about')}
            </Link>
            <Link href={`/${locale}#pricing`} className="text-sm font-bold text-neutral-600 transition-colors hover:text-emerald-600 cursor-pointer">
              {tFooter('pricing')}
            </Link>
            <Link href={`/${locale}#contact`} className="text-sm font-bold text-neutral-600 transition-colors hover:text-emerald-600 cursor-pointer">
              {tFooter('contact')}
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />

            {!loading && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="max-w-[140px] truncate">{user.username}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-2xl z-50 overflow-hidden animate-slide-up">
                    <Link
                      href={`/${locale}/profile?tab=profile`}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700 border-b border-neutral-100 transition-colors"
                    >
                      <User className="h-4 w-4 text-emerald-500" />
                      {isAr ? 'ملفي الشخصي' : 'My Profile'}
                    </Link>
                    <Link
                      href={`/${locale}/profile?tab=orders`}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700 border-b border-neutral-100 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 text-emerald-500" />
                      {isAr ? 'طلباتي' : 'My Orders'}
                    </Link>
                    {user.isStoreOwner && (
                      <Link
                        href={`/${locale}/seller/stores`}
                        onClick={closeAll}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700 border-b border-neutral-100 transition-colors"
                      >
                        <Store className="h-4 w-4 text-emerald-500" />
                        {isAr ? 'متاجري' : 'My Stores'}
                      </Link>
                    )}
                    <Link
                      href={`/${locale}/auth/role-selection`}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 border-b border-neutral-100"
                    >
                      <RefreshCw className="h-4 w-4 text-neutral-400" />
                      {isAr ? 'تغيير الدور' : 'Switch Role'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {isAr ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <Link
                href={`/${locale}/auth/signup`}
                className="group relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-white bg-emerald-500 rounded-full text-sm transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">{t('getStarted')}</span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ) : null}
          </div>

          {/* Mobile right side */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden border-t border-neutral-100 bg-white shadow-2xl animate-slide-down"
        >
          <div className="px-4 py-2 border-b border-neutral-100">
            <Link
              href={`/${locale}#features`}
              onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              {tFooter('features')}
            </Link>
            <Link
              href={`/${locale}#about`}
              onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              {tFooter('about')}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              {tFooter('pricing')}
            </Link>
            <Link
              href={`/${locale}#contact`}
              onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              {tFooter('contact')}
            </Link>
          </div>

          {!loading && user ? (
            <div className="px-4 py-3 space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-3 border-b border-neutral-100 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 truncate max-w-[200px]">{user.username}</p>
                  <p className="text-xs text-neutral-400 truncate max-w-[200px]">{user.email}</p>
                </div>
              </div>

              <Link
                href={`/${locale}/profile?tab=profile`}
                onClick={closeAll}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                <User className="h-4 w-4 text-emerald-500" />
                {isAr ? 'ملفي الشخصي' : 'My Profile'}
              </Link>
              <Link
                href={`/${locale}/profile?tab=orders`}
                onClick={closeAll}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                {isAr ? 'طلباتي' : 'My Orders'}
              </Link>
              {user.isStoreOwner && (
                <Link
                  href={`/${locale}/seller/stores`}
                  onClick={closeAll}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                >
                  <Store className="h-4 w-4 text-emerald-500" />
                  {isAr ? 'متاجري' : 'My Stores'}
                </Link>
              )}
              <Link
                href={`/${locale}/auth/role-selection`}
                onClick={closeAll}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
              >
                <RefreshCw className="h-4 w-4 text-neutral-400" />
                {isAr ? 'تغيير الدور' : 'Switch Role'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" />
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          ) : !loading ? (
            <div className="px-4 py-6">
              <Link
                href={`/${locale}/auth/signup`}
                onClick={closeAll}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3.5 font-bold text-white text-sm transition active:scale-[0.98] hover:bg-emerald-600 shadow-lg shadow-emerald-100"
              >
                {t('getStarted')}
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}