'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Upload, AlertCircle, ChevronDown, X } from 'lucide-react';
import { Product, CatalogCategory } from '@/types/store';

interface ProductFormProps {
  storeSlug: string;
  storeId: number;
  categories: CatalogCategory[];
  product?: Product | null;
  onSave: (values: any) => Promise<void>;
  onCancel: () => void;
  locale: string;
  isRTL: boolean;
}

export default function ProductForm({
  storeSlug,
  storeId,
  categories,
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
    subcategorySlug: (product as any)?.subcategory_slug || (product as any)?.subcategorySlug || '',
    categorySlug: (product as any)?.category_slug || (product as any)?.categorySlug || '',
    imageUrl: (product as any)?.imageUrl || (product as any)?.image_url || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>((product as any)?.imageUrl || (product as any)?.image_url || null);

  const isAr = locale === 'ar';

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      setError(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
    }
  }, [isAr]);

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
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

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(isAr ? 'فشل حفظ المنتج' : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Flatten categories and subcategories for the dropdown
  const categoryOptions = [
    { value: 'none', label: isAr ? 'بدون فئة' : 'No Category' },
    ...categories.flatMap((cat) => [
      { value: `cat:${cat.slug}`, label: cat.name },
      ...cat.subcategories.map((sub) => ({
        value: `sub:${sub.slug}`,
        label: `   └─ ${sub.name}`
      }))
    ])
  ];

  const currentSelection = formData.subcategorySlug 
    ? `sub:${formData.subcategorySlug}` 
    : formData.categorySlug 
      ? `cat:${formData.categorySlug}` 
      : 'none';

  const handleCategoryChange = (val: string) => {
    if (val === 'none') {
      setFormData(prev => ({ ...prev, categorySlug: '', subcategorySlug: '' }));
    } else if (val.startsWith('cat:')) {
      setFormData(prev => ({ ...prev, categorySlug: val.replace('cat:', ''), subcategorySlug: '' }));
    } else if (val.startsWith('sub:')) {
      const slug = val.replace('sub:', '');
      setFormData(prev => ({ ...prev, subcategorySlug: slug, categorySlug: '' }));
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
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' 
                : 'border-neutral-200 bg-neutral-50/30 hover:border-emerald-300 hover:bg-emerald-50/10'
            } p-8 text-center`}
          >
            {imagePreview ? (
              <div className="relative group mx-auto h-52 w-full max-w-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 hover:scale-110 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className={`p-5 rounded-3xl transition-all duration-300 ${dragActive ? 'bg-emerald-500 text-white scale-110 rotate-12 shadow-xl shadow-emerald-500/20' : 'bg-white text-neutral-400 shadow-sm'}`}>
                  <Upload className={`h-10 w-10 ${dragActive ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <p className="text-base font-black text-neutral-900">
                    {isAr ? 'اسحب الصورة هنا' : 'Drag image here'}
                  </p>
                  <p className="mt-1 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    {isAr ? 'أو انقر للاختيار من جهازك' : 'Or click to browse files'}
                  </p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              id="image-upload"
              title=""
            />
            
            {!imagePreview && (
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 active:scale-95">
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختر صورة' : 'Choose Image')}
                </span>
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
            {isAr ? 'PNG, JPG, WebP حتى 5 ميجابايت' : 'PNG, JPG, WebP up to 5MB'}
          </p>
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
            className={`w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all ${isRTL ? 'text-right' : ''}`}
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
            className={`w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all ${isRTL ? 'text-right' : ''}`}
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
            className={`w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-bold text-neutral-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isAr ? 'الفئة' : 'Category'}
          </label>
          <CustomSelect
            value={currentSelection}
            onChange={handleCategoryChange}
            placeholder={isAr ? 'اختر فئة' : 'Select a category'}
            options={categoryOptions}
            isRTL={isRTL}
          />
        </div>

        {/* Actions */}
        <div className={`flex flex-col gap-4 pt-8 border-t border-neutral-100 sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-[2] rounded-2xl bg-neutral-900 px-8 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-neutral-900/10"
          >
            {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ المنتج' : 'Save Product')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-8 py-5 text-sm font-black uppercase tracking-widest text-neutral-500 transition-all hover:bg-neutral-50 active:scale-[0.98]"
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
        className={`w-full flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all hover:bg-neutral-50 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                className={`w-full block px-5 py-3 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === opt.value ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
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
