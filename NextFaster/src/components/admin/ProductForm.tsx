'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, ChevronDown } from 'lucide-react';
import { Product, CatalogSubcategory } from '@/types/store';

interface ProductFormProps {
  storeSlug: string;
  storeId: number;
  subcategories: (CatalogSubcategory & { categoryName: string })[];
  product?: Product | null;
  onSave: (values: any) => Promise<void>;
  onCancel: () => void;
  locale: string;
  isRTL: boolean;
}

export default function ProductForm({
  storeSlug,
  storeId,
  subcategories,
  product,
  onSave,
  onCancel,
  locale,
  isRTL,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    subcategorySlug: (product as any)?.subcategorySlug || (product as any)?.subcategory_slug || '',
    imageUrl: (product as any)?.imageUrl || (product as any)?.image_url || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>((product as any)?.imageUrl || (product as any)?.image_url || null);

  const isAr = locale === 'ar';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('storeId', String(storeId));
      formDataObj.append('imageType', 'product');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (err) {
      setError(isAr ? 'فشل رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(isAr ? 'اسم المنتج مطلوب' : 'Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError(isAr ? 'الوصف مطلوب' : 'Description is required');
      return;
    }
    if (!formData.price.trim()) {
      setError(isAr ? 'السعر مطلوب' : 'Price is required');
      return;
    }
    if (!formData.subcategorySlug) {
      setError(isAr ? 'الفئة مطلوبة' : 'Category is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(isAr ? 'فشل حفظ المنتج' : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-7 shadow-sm transition-all max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`mb-8 flex items-center justify-between border-b border-neutral-100 pb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onCancel}
            className="rounded-xl p-2.5 text-neutral-400 border border-transparent transition-all hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 active:scale-95"
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-xl font-black text-neutral-900">
            {product ? (isAr ? 'تعديل المنتج' : 'Edit Product') : (isAr ? 'منتج جديد' : 'New Product')}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'صورة المنتج' : 'Product Image'}
          </label>
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center transition-all hover:border-emerald-300 hover:bg-emerald-50/10">
            {imagePreview ? (
              <div className="relative h-48 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-contain drop-shadow-sm"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-neutral-50 rounded-full">
                  <Upload className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-sm font-bold text-neutral-500">
                  {isAr ? 'اسحب الصورة هنا أو انقر للاختيار' : 'Drag image here or click to select'}
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="mt-4 inline-block cursor-pointer rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-95 shadow-sm shadow-emerald-500/20"
            >
              {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختر صورة' : 'Choose Image')}
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'اسم المنتج' : 'Product Name'}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={isAr ? 'مثال: برجر دجاج' : 'e.g. Chicken Burger'}
            className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'text-right' : ''}`}
          />
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'الوصف' : 'Description'}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={isAr ? 'وصف المنتج...' : 'Product description...'}
            rows={4}
            className={`w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'text-right' : ''}`}
          />
        </div>

        {/* Price */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'السعر (ج.م)' : 'Price (EGP)'}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'الفئة' : 'Category'}
          </label>
          <CustomSelect
            value={formData.subcategorySlug}
            onChange={(val) => setFormData((prev) => ({ ...prev, subcategorySlug: val }))}
            placeholder={isAr ? 'اختر فئة' : 'Select a category'}
            options={subcategories.map((sub) => ({
              value: sub.slug,
              label: `${sub.categoryName} - ${sub.name}`
            }))}
            isRTL={isRTL}
          />
        </div>

        {/* Actions */}
        <div className={`flex flex-col gap-3 pt-6 border-t border-neutral-100 sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] shadow-md shadow-emerald-500/20"
          >
            {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-6 py-3 font-bold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98]"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
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
        className={`w-full flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all hover:bg-neutral-50 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
              className={`w-full block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === '' ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                className={`w-full block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === opt.value ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
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
