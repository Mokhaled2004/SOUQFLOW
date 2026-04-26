'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Phone, MapPin, Loader2, ChevronDown } from 'lucide-react';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';

export default function SignupForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Dropdown State
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9+\-\s()]{7,}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation logic remains the same...
    if (!email.trim()) { setError(t('signup.emailRequired')); setLoading(false); return; }
    if (!validateEmail(email)) { setError(t('signup.invalidEmail')); setLoading(false); return; }
    if (!password.trim()) { setError(t('signup.passwordRequired')); setLoading(false); return; }
    if (password.length < 6) { setError(t('signup.passwordTooShort')); setLoading(false); return; }
    if (password !== confirmPassword) { setError(t('signup.passwordMismatch')); setLoading(false); return; }
    if (!name.trim()) { setError(t('signup.nameRequired')); setLoading(false); return; }
    if (!phone.trim()) { setError(isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required'); setLoading(false); return; }
    if (!validatePhone(phone)) { setError(isAr ? 'رقم هاتف غير صالح' : 'Please enter a valid phone number'); setLoading(false); return; }
    if (!governorate) { setError(isAr ? 'يرجى اختيار المحافظة' : 'Please select your governorate'); setLoading(false); return; }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, username: name, phone, governorate,
          locationDetail: locationDetail.trim() || null,
          location: governorate, isStoreOwner: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Signup failed'); setLoading(false); return; }
      window.location.href = `/${locale}/auth/role-selection`;
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = (rtl = isRTL) =>
    `w-full rounded-xl border border-neutral-200 bg-white/80 py-3.5 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${rtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`;

  return (
    <div className="w-full max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email, Password, Name, Phone fields stay as they are... */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{t('signup.emailLabel')}</label>
          <div className="relative group">
            <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass()} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{t('signup.passwordLabel')}</label>
            <div className="relative group">
              <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass()} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{t('signup.confirmPasswordLabel')}</label>
            <div className="relative group">
              <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass()} />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{t('signup.nameLabel')}</label>
          <div className="relative group">
            <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="text" placeholder={t('signup.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} className={inputClass()} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
          <div className="relative group">
            <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="tel" placeholder="+20 123 456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass()} />
          </div>
        </div>

        {/* CUSTOM STYLED DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{isAr ? 'المحافظة' : 'Governorate'}</label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`${inputClass()} flex items-center justify-between group`}
          >
            <div className="flex items-center gap-3">
              <MapPin className={`h-5 w-5 text-neutral-400 group-focus-within:text-emerald-500 ${isOpen ? 'text-emerald-500' : ''}`} />
              <span className={governorate ? 'text-neutral-900' : 'text-neutral-400'}>
                {governorate || (isAr ? 'اختر المحافظة' : 'Select your governorate')}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-2 shadow-2xl shadow-emerald-900/10 animate-in fade-in zoom-in-95">
              <div className="sticky top-0 z-10 bg-white pb-1 border-b border-neutral-50 mb-1">
                 <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    {isAr ? 'المحافظات المتاحة' : 'Available Governorates'}
                 </p>
              </div>
              {EGYPT_GOVERNORATES.map((g) => {
                const name = isAr ? g.nameAr : g.name;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGovernorate(name);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${isRTL ? 'text-right' : 'text-left'} ${governorate === name ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-neutral-600'}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-700 px-1">{isAr ? 'العنوان التفصيلي (اختياري)' : 'Detailed Address (optional)'}</label>
          <div className="relative group">
            <MapPin className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="text" placeholder={isAr ? 'الحي، الشارع، رقم المبنى...' : 'District, street, building no...'} value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} className={inputClass()} />
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 py-4 font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-neutral-200"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t('signup.createAccount')} <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} /></>}
        </button>

        <p className="text-center text-sm font-medium text-neutral-600">
          {t('signup.haveAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            {t('signup.login')}
          </Link>
        </p>
      </form>
    </div>
  );
}