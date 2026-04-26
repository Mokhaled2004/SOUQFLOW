'use client';

import { Edit2, Trash2, Image as ImageIcon, Tag, AlertCircle, Loader2, Check, Percent } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types/store';
import { calculateDiscountedPrice, formatPrice, isFree } from '@/lib/pricing';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  locale: string;
  isRTL: boolean;
  storeSlug?: string;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  locale,
  isRTL,
  storeSlug,
}: ProductCardProps) {
  const isAr = locale === 'ar';
  const offerPercentage = product.offerPercentage || 0;
  const imageUrl = (product as any).imageUrl || (product as any).image_url;
  const [showOfferEditor, setShowOfferEditor] = useState(false);
  const [offerValue, setOfferValue] = useState(offerPercentage);
  const [isOutOfStockState, setIsOutOfStockState] = useState(product.isOutOfStock === 1);
  const [saving, setSaving] = useState(false);

  const discountedPrice = calculateDiscountedPrice(product.price, offerValue);
  const isFreeProduct = isFree(offerValue);

  const handleSaveOffer = async () => {
    if (!storeSlug) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/seller/store/${storeSlug}/products/${product.slug}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerPercentage: offerValue,
          isOutOfStock: isOutOfStockState,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setShowOfferEditor(false);
    } catch (err) {
      alert(isAr ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`group relative h-full flex flex-col rounded-3xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 animate-in fade-in zoom-in-95 duration-500`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-neutral-50 p-2">
        <div className="h-full w-full overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-neutral-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${product.isOutOfStock === 1 ? 'opacity-40 grayscale-[0.5]' : ''}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-50">
              <ImageIcon className="h-8 w-8 text-neutral-200" />
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className={`absolute top-4 flex flex-col gap-1.5 ${isRTL ? 'left-4' : 'right-4'}`}>
          {product.isActive === 0 && (
            <span className="flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              {isAr ? 'غير نشط' : 'Inactive'}
            </span>
          )}
          {offerPercentage > 0 && !isFree(offerPercentage) && (
            <div className="flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200">
              <Tag className="h-3 w-3" />
              {offerPercentage}%
            </div>
          )}
          {isFree(offerPercentage) && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200">
              FREE
            </span>
          )}
          {product.isOutOfStock === 1 && (
            <div className="flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <AlertCircle className="h-3 w-3" />
              {isAr ? 'نفذ' : 'Out'}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="line-clamp-1 text-base font-black text-neutral-900 uppercase tracking-tight">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-relaxed text-neutral-400">{product.description}</p>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {offerPercentage > 0 && (
              <span className="text-[10px] font-black text-neutral-300 line-through decoration-rose-500/30">
                {formatPrice(parseFloat(product.price))} {isAr ? 'ج.م' : 'EGP'}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black tracking-tight ${isFree(offerPercentage) ? 'text-emerald-500' : offerPercentage > 0 ? 'text-rose-500' : 'text-neutral-900'}`}>
                {isFree(offerPercentage) ? (isAr ? 'مجاني' : 'FREE') : formatPrice(discountedPrice)}
              </span>
              {!isFree(offerPercentage) && (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'ج.م' : 'EGP'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Offer/Stock Editor */}
        {showOfferEditor ? (
          <div className="mt-4 space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1.5">
              <label className={`block text-[9px] font-black uppercase tracking-widest text-emerald-700 ${isAr ? 'text-right' : ''}`}>
                {isAr ? 'نسبة الخصم' : 'Offer Percentage'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={offerValue}
                  onChange={(e) => setOfferValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className={`w-full rounded-xl border-2 border-emerald-100 bg-white px-4 py-2.5 text-sm font-black text-neutral-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'text-right' : ''}`}
                />
                <Percent className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-300 ${isAr ? 'left-4' : 'right-4'}`} />
              </div>
            </div>

            <div className={`flex items-center justify-between gap-3 rounded-xl bg-white/60 p-3 ring-1 ring-emerald-100 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex flex-col ${isAr ? 'text-right' : ''}`}>
                 <span className="text-[9px] font-black uppercase tracking-tight text-neutral-400 leading-none mb-1">{isAr ? 'السعر النهائي' : 'Final Price'}</span>
                 <span className={`text-xs font-black ${isFree(offerValue) ? 'text-emerald-500' : 'text-neutral-900'}`}>
                   {isFree(offerValue) ? (isAr ? 'مجاني' : 'FREE') : `${formatPrice(discountedPrice)} ${isAr ? 'ج.م' : 'EGP'}`}
                 </span>
              </div>
              <label className="flex cursor-pointer items-center gap-2 group/stock">
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isOutOfStockState}
                    onChange={(e) => setIsOutOfStockState(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-emerald-100 bg-white transition-all checked:bg-emerald-500 checked:border-emerald-500 hover:border-emerald-200"
                  />
                  <Check className="absolute h-3 w-3 scale-0 text-white transition-transform peer-checked:scale-100" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 group-hover/stock:text-emerald-600 transition-colors">
                  {isAr ? 'نفذ' : 'Stock'}
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveOffer}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isAr ? 'حفظ' : 'Save')}
              </button>
              <button
                onClick={() => {
                  setShowOfferEditor(false);
                  setOfferValue(offerPercentage);
                  setIsOutOfStockState(product.isOutOfStock === 1);
                }}
                className="flex-1 rounded-xl bg-white border border-neutral-100 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-all hover:bg-neutral-50 active:scale-95"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick badges display if not editing */}
            {(offerPercentage > 0 || product.isOutOfStock === 1) && (
              <div className={`mt-4 flex flex-wrap gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                {offerPercentage > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1 border border-rose-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-rose-600">
                      {offerPercentage}% {isAr ? 'خصم' : 'off'}
                    </span>
                  </div>
                )}
                {product.isOutOfStock === 1 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2 py-1 border border-neutral-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-neutral-500">
                      {isAr ? 'نفذ المخزون' : 'Sold Out'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className={`mt-auto pt-6 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setShowOfferEditor(true)}
                className="group flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-amber-100 bg-amber-50/50 py-3 transition-all hover:bg-amber-100 hover:border-amber-200 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm ring-1 ring-amber-100 group-hover:scale-110 transition-transform">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{isAr ? 'عرض' : 'Offer'}</span>
              </button>
              
              <button
                onClick={onEdit}
                className="group flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 py-3 transition-all hover:bg-emerald-100 hover:border-emerald-200 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                  <Edit2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{isAr ? 'تعديل' : 'Edit'}</span>
              </button>

              <button
                onClick={onDelete}
                className="group flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50/50 py-3 transition-all hover:bg-rose-100 hover:border-rose-200 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm ring-1 ring-rose-100 group-hover:scale-110 transition-transform">
                  <Trash2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">{isAr ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
