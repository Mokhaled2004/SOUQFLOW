'use client';

import { useState } from 'react';
import { Save, X, CheckCircle } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import ShippingSection from './ShippingSection';
import { StoreInfoFormValues } from '@/types/store';

interface StoreInfoFormProps {
  storeSlug: string;
  storeId: number;
  initialValues: StoreInfoFormValues;
  initialSelectedGovs: Set<string>;
  initialShippingRates: Record<string, string>;
  onSaved: (updatedStore: any, updatedRates: Record<string, string>, updatedGovs: Set<string>) => void;
  onCancel: () => void;
  locale: string;
  isRTL: boolean;
}

export default function StoreInfoForm({
  storeSlug,
  storeId,
  initialValues,
  initialSelectedGovs,
  initialShippingRates,
  onSaved,
  onCancel,
  locale,
  isRTL,
}: StoreInfoFormProps) {
  const [form, setForm] = useState<StoreInfoFormValues>(initialValues);
  const [selectedGovs, setSelectedGovs] = useState<Set<string>>(new Set(initialSelectedGovs));
  const [shippingRates, setShippingRates] = useState<Record<string, string>>(initialShippingRates);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const handleImageUpload = async (
    file: File,
    field: 'storeLogo' | 'storeBanner',
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'stores');
      fd.append('storeId', String(storeId));
      fd.append('imageType', field === 'storeLogo' ? 'logo' : 'banner');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleGov = (id: string) => {
    setSelectedGovs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setShippingRates((r) => {
          const n = { ...r };
          delete n[id];
          return n;
        });
      } else {
        next.add(id);
        setShippingRates((r) => ({ ...r, [id]: '' }));
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [storeRes, shippingRes] = await Promise.all([
        fetch(`/api/seller/store/${storeSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
        fetch(`/api/seller/store/${storeSlug}/shipping`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rates: Array.from(selectedGovs)
              .filter((g) => shippingRates[g] !== '')
              .map((g) => ({ governorate: g, price: parseFloat(shippingRates[g]) || 0 })),
          }),
        }),
      ]);

      if (!storeRes.ok) throw new Error('Store save failed');
      const { store: updated } = await storeRes.json();

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onSaved(updated, shippingRates, selectedGovs);
      }, 1200);
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-7 shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`mb-6 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-black text-neutral-900">
          {locale === 'ar' ? 'تعديل معلومات المتجر' : 'Edit Store Information'}
        </h2>
        <button
          onClick={onCancel}
          className="rounded-xl p-2.5 text-neutral-400 border border-transparent transition-all hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={`mb-2 block text-sm font-bold text-neutral-700 ${isRTL ? 'text-right' : ''}`}>
              {locale === 'ar' ? 'وصف المتجر' : 'Store Description'}
            </label>
            <textarea
              value={form.storeDescription}
              onChange={(e) => setForm((f) => ({ ...f, storeDescription: e.target.value }))}
              rows={3}
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={locale === 'ar' ? 'صف متجرك...' : 'Describe your store...'}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <FormField label={locale === 'ar' ? 'رقم واتساب' : 'WhatsApp Number'} value={form.whatsappNumber} onChange={(v) => setForm((f) => ({ ...f, whatsappNumber: v }))} type="tel" placeholder="+20 123 456 7890" isRTL={isRTL} />
          <FormField label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" placeholder="store@example.com" isRTL={isRTL} />
          <FormField label={locale === 'ar' ? 'الموقع الرئيسي' : 'Primary Location'} value={form.primaryLocation} onChange={(v) => setForm((f) => ({ ...f, primaryLocation: v }))} placeholder={locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'} isRTL={isRTL} />
          <FormField label={locale === 'ar' ? 'نوع النشاط' : 'Business Type'} value={form.businessType} onChange={(v) => setForm((f) => ({ ...f, businessType: v }))} placeholder={locale === 'ar' ? 'مطعم، ملابس...' : 'Restaurant, Clothing...'} isRTL={isRTL} />
          <FormField label={locale === 'ar' ? 'الرقم الضريبي (اختياري)' : 'Tax ID (optional)'} value={form.taxId} onChange={(v) => setForm((f) => ({ ...f, taxId: v }))} placeholder="123-456-789" isRTL={isRTL} />
        </div>

        {/* Images */}
        <div className="border-t border-neutral-100 pt-6">
          <p className="mb-4 text-sm font-black text-neutral-900">
            {locale === 'ar' ? 'صور المتجر' : 'Store Images'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              label={locale === 'ar' ? 'شعار المتجر' : 'Store Logo'}
              value={form.storeLogo}
              uploading={logoUploading}
              onFileChange={(f) => handleImageUpload(f, 'storeLogo', setLogoUploading)}
              onUrlChange={(v) => setForm((fm) => ({ ...fm, storeLogo: v }))}
              locale={locale}
            />
            <ImageUploadField
              label={locale === 'ar' ? 'بانر المتجر' : 'Store Banner'}
              value={form.storeBanner}
              uploading={bannerUploading}
              onFileChange={(f) => handleImageUpload(f, 'storeBanner', setBannerUploading)}
              onUrlChange={(v) => setForm((fm) => ({ ...fm, storeBanner: v }))}
              locale={locale}
            />
          </div>
        </div>

        {/* Shipping */}
        <ShippingSection
          selectedGovs={selectedGovs}
          shippingRates={shippingRates}
          onToggle={toggleGov}
          onPriceChange={(id, price) => setShippingRates((r) => ({ ...r, [id]: price }))}
          locale={locale}
        />
      </div>

      {/* Actions */}
      <div className={`mt-8 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <button
          onClick={handleSave}
          disabled={saving || saveSuccess}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 shadow-md shadow-emerald-500/20 sm:flex-none"
        >
          {saveSuccess ? (
            <><CheckCircle className="h-5 w-5" />{locale === 'ar' ? 'تم!' : 'Saved!'}</>
          ) : saving ? (
            <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />{locale === 'ar' ? 'جاري...' : 'Saving...'}</>
          ) : (
            <><Save className="h-5 w-5" />{locale === 'ar' ? 'حفظ' : 'Save Changes'}</>
          )}
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-neutral-200 bg-white px-6 py-2.5 font-bold text-neutral-700 transition hover:bg-neutral-50 active:scale-[0.98] sm:flex-none"
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}

// ── Local helper — only used inside this form ────────────────────────────────
function FormField({ label, value, onChange, type = 'text', placeholder, isRTL }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  isRTL: boolean;
}) {
  return (
    <div>
      <label className={`mb-2 block text-sm font-bold text-neutral-700 ${isRTL ? 'text-right' : ''}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'text-right' : ''}`}
      />
    </div>
  );
}
