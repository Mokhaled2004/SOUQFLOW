'use client';

import { useLocale } from 'next-intl';
import { ShoppingBag, LogOut, User, X, Save, Loader2, Menu, ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  phone: string;
  governorate: string | null;
  locationDetail: string | null;
}

interface Props {
  authUser: string | null;
  authLoaded: boolean;
  onLogout: () => void;
}

export function AuthDropdown({ authUser, authLoaded, onLogout }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Editable fields
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when profile is open
  useEffect(() => {
    if (profileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [profileOpen]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const u = data.user as UserProfile;
        setProfile(u);
        setUsername(u.username ?? '');
        setPhone(u.phone ?? '');
        setGovernorate(u.governorate ?? '');
        setLocationDetail(u.locationDetail ?? '');
      }
    } catch { /* ignore */ } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenProfile = () => {
    setMenuOpen(false);
    setProfileOpen(true);
    fetchProfile();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, governorate, locationDetail }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (!authLoaded) {
    return <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse" />;
  }

  // Not logged in
  if (!authUser) {
    const redirectTo = typeof window !== 'undefined' ? window.location.pathname : '';
    const loginHref = `/${locale}/auth/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;
    return (
      <a
        href={loginHref}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
      >
        <User className="h-4 w-4" />
        {isAr ? 'تسجيل الدخول' : 'Log in'}
      </a>
    );
  }

  return (
    <>
      {/* Profile slide-in panel */}
      {profileOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setProfileOpen(false)}
          />
          <div className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl outline-none animate-in duration-500 ease-out ${isAr ? 'mr-0 ml-auto slide-in-from-left' : 'ml-auto slide-in-from-right'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-neutral-100 px-6 py-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                  {isAr ? 'ملفي الشخصي' : 'My Profile'}
                </h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'إدارة بيانات الحساب' : 'Manage account info'}</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="group rounded-full bg-neutral-50 p-2 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
              >
                <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-100 border-t-emerald-600 shadow-sm" />
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-400 animate-pulse">{isAr ? 'جاري التحميل...' : 'Syncing Profile...'}</p>
                </div>
              ) : (
                <div className="space-y-8 pb-10">
                  {/* Email (Read Only) */}
                  <div className="group">
                    <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                       <div className="absolute inset-0 rounded-2xl bg-neutral-100/50 blur-sm" />
                       <div className="relative flex items-center rounded-2xl border border-neutral-100 bg-neutral-50/50 px-5 py-4 ring-1 ring-neutral-100/50">
                         <span className="text-sm font-bold text-neutral-500">{profile?.email}</span>
                       </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="group">
                    <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'الاسم' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full rounded-2xl border-2 border-neutral-100 bg-white px-5 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isAr ? 'text-right' : ''}`}
                      placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                    />
                  </div>

                  {/* Phone */}
                  <div className="group">
                    <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'رقم الهاتف' : 'Contact Phone'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-2xl border-2 border-neutral-100 bg-white px-5 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isAr ? 'text-right' : ''}`}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  {/* Governorate */}
                  <div className="group">
                    <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'المحافظة' : 'Governorate'}
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={governorate}
                        onChange={setGovernorate}
                        isRTL={isAr}
                        placeholder={isAr ? 'اختر المحافظة' : 'Select governorate'}
                        options={EGYPT_GOVERNORATES.map((g) => ({
                          value: isAr ? g.nameAr : g.name,
                          label: isAr ? g.nameAr : g.name,
                        }))}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="group">
                    <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'العنوان التفصيلي' : 'Detailed address'}
                    </label>
                    <textarea
                      value={locationDetail}
                      onChange={(e) => setLocationDetail(e.target.value)}
                      rows={4}
                      className={`w-full resize-none rounded-2xl border-2 border-neutral-100 bg-white px-5 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isAr ? 'text-right' : ''}`}
                      placeholder={isAr ? 'الحي، الشارع، رقم المبنى...' : 'District, street, building no...'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 bg-white p-6 pb-10">
              <button
                onClick={handleSave}
                disabled={saving || loadingProfile}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-6 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : saved ? (
                  <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                    <span>✓</span>
                    <span>{isAr ? 'تم الحفظ بنجاح!' : 'Update Successful!'}</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {isAr ? 'حفظ التغييرات' : 'Save changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hamburger trigger + dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`group flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50/50 p-1.5 pr-3 transition-all hover:bg-neutral-100 active:scale-95 ${isAr ? 'flex-row-reverse pl-3 pr-1.5' : ''}`}
          aria-label="Menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-100 group-hover:ring-emerald-200 group-hover:text-emerald-500">
            <User className="h-4 w-4" />
          </div>
          <Menu className="h-4 w-4 text-neutral-400" />
        </button>

        {menuOpen && (
          <div className={`absolute top-full mt-2 w-56 origin-top rounded-2xl border border-neutral-100 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in duration-200 ${isAr ? 'left-0' : 'right-0'}`}>
            {/* Username header */}
            <div className={`mb-1 flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-100">
                <span className="text-sm font-black text-emerald-600 uppercase">
                  {authUser?.charAt(0)}
                </span>
              </div>
              <div className={`min-w-0 flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                <p className="truncate text-sm font-black text-neutral-900">{authUser}</p>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{isAr ? 'نشط' : 'Active Account'}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="space-y-1">
              <button
                onClick={handleOpenProfile}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-neutral-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 group-hover:bg-emerald-100">
                   <User className="h-4 w-4 text-emerald-600" />
                </div>
                {isAr ? 'ملفي الشخصي' : 'My Profile'}
              </button>

              <a
                href={`/${locale}/profile?tab=orders`}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-neutral-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 group-hover:bg-emerald-100">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                </div>
                {isAr ? 'طلباتي' : 'My Orders'}
              </a>

              {/* Mobile Language Switcher */}
              <div className="sm:hidden">
                <div className="my-1 border-t border-neutral-50" />
                <MobileLanguageOption locale={locale} />
              </div>

              <div className="my-1 border-t border-neutral-50" />

              <button
                onClick={() => { setMenuOpen(false); onLogout(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100/50">
                  <LogOut className="h-4 w-4" />
                </div>
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Custom Dropdown Component ─────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  isRTL
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  isRTL: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative w-full ${isRTL ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`w-full flex items-center justify-between rounded-2xl border-2 border-neutral-100 bg-white px-4 py-3.5 text-sm font-bold text-neutral-900 transition-all hover:bg-neutral-50 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
              className={`w-full block px-4 py-3 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === '' ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                className={`w-full block px-4 py-3 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === opt.value ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
function MobileLanguageOption({ locale }: { locale: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const newPathname = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const qs = searchParams.toString();
  const href = qs ? `${newPathname}?${qs}` : newPathname;
  const isAr = locale === 'ar';

  return (
    <Link
      href={href}
      scroll={false}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-neutral-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 ${isAr ? 'flex-row-reverse' : ''}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
        <Globe className="h-4 w-4 text-emerald-600" />
      </div>
      {locale === 'en' ? 'العربية' : 'English'}
    </Link>
  );
}
