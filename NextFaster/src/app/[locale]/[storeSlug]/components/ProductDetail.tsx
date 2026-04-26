'use client';

import { ArrowLeft, Package, Plus, ShoppingCart, Tag } from 'lucide-react';
import { StoreProduct, StoreInfo } from '../types';
import { ProductCard } from './ProductCard';
import { calculateDiscountedPrice, formatPrice, isFree } from '@/lib/pricing';

interface Props {
  product: StoreProduct;
  related: StoreProduct[];
  store: StoreInfo;
  locale: string;
  onBack: () => void;
  onRelatedClick: (p: StoreProduct) => void;
  onAddToCart: (p: StoreProduct) => void;
}

export function ProductDetail({ product, related, store, locale, onBack, onRelatedClick, onAddToCart }: Props) {
  const isAr = locale === 'ar';
  const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
  const hasOffer = product.offerPercentage > 0;
  const isFreeProduct = isFree(product.offerPercentage);
  const isOutOfStock = product.isOutOfStock === 1;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 font-sans sm:px-6 lg:px-8 animate-in fade-in duration-700">

      {/* ── BACK BUTTON ─────────────────────────────────────────── */}
      <div className={`mb-8 flex ${isAr ? 'justify-end' : 'justify-start'}`}>
        <button
          onClick={onBack}
          className={`group flex items-center gap-2 rounded-2xl border border-neutral-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-neutral-500 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 active:scale-95 ${isAr ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${isAr ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          {isAr ? 'العودة للمتجر' : 'Back to Shop'}
        </button>
      </div>

      {/* ── MAIN PRODUCT CARD ───────────────────────────────────── */}
      <div className={`grid gap-10 overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-2xl shadow-emerald-900/5 ring-1 ring-neutral-100 sm:p-10 lg:grid-cols-2 ${isAr ? 'direction-rtl' : ''}`}>

        {/* Product Image Section */}
        <div className={`relative aspect-square overflow-hidden rounded-3xl bg-neutral-50 ${isAr ? 'lg:order-2' : ''}`}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-1000 hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
              loading="eager"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-20 w-20 text-neutral-100" />
            </div>
          )}
          
          {/* Status Badges */}
          <div className={`absolute top-6 flex flex-col gap-3 ${isAr ? 'left-6' : 'right-6'}`}>
             {hasOffer && !isFreeProduct && (
                <div className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-900/20">
                  <Tag className="h-3.5 w-3.5" />
                  {product.offerPercentage}% {isAr ? 'خصم' : 'OFF'}
                </div>
             )}
             {isOutOfStock && (
                <div className="rounded-full bg-neutral-900/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-xl">
                  {isAr ? 'نفذت الكمية' : 'Sold Out'}
                </div>
             )}
          </div>
        </div>

        {/* Product Info Section */}
        <div className={`flex flex-col justify-center gap-6 ${isAr ? 'lg:order-1 text-right' : ''}`}>
          <div>
            <div className={`mb-4 flex items-center gap-2 ${isAr ? 'justify-end' : ''}`}>
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  {isOutOfStock ? (isAr ? 'غير متوفر' : 'Unavailable') : (isAr ? 'متوفر الآن' : 'In Stock Now')}
               </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">{product.name}</h1>
            <p className="mt-6 text-base font-medium leading-relaxed text-neutral-500">{product.description}</p>
          </div>

          <div className="h-px w-full bg-neutral-100 my-2" />

          {/* Pricing Area */}
          <div className="space-y-1">
            {hasOffer && (
              <p className="text-xs font-black uppercase tracking-widest text-neutral-300 line-through">
                {parseFloat(product.price).toFixed(2)} EGP
              </p>
            )}
            <div className={`flex items-baseline gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className={`text-4xl font-black tracking-tighter ${isFreeProduct ? 'text-emerald-600' : hasOffer ? 'text-rose-600' : 'text-neutral-900'}`}>
                {isFreeProduct ? (isAr ? 'مجاني' : 'FREE') : formatPrice(discountedPrice)}
              </span>
              {!isFreeProduct && (
                <span className="text-sm font-black uppercase tracking-widest text-neutral-400">
                  {isAr ? 'ج.م' : 'EGP'}
                </span>
              )}
            </div>
          </div>

          {/* Purchase Controls */}
          <div className={`mt-4 flex flex-col gap-4 sm:flex-row ${isAr ? 'sm:flex-row-reverse' : ''}`}>
             <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex flex-1 items-center justify-center gap-3 rounded-2xl px-10 py-5 text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
                isOutOfStock
                  ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 shadow-none'
                  : 'bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 hover:shadow-emerald-900/30'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? (isAr ? 'نفذت الكمية' : 'Sold Out') : (isAr ? 'إضافة للسلة' : 'Add to cart')}
            </button>
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-neutral-50 border border-neutral-100">
               <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                 {isAr ? 'متجر موثق' : 'Verified Store'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-24">
          <div className={`mb-10 flex items-center justify-between border-b border-neutral-100 pb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
              {isAr ? 'قد يعجبك أيضاً' : 'You might also like'}
            </h2>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
               <Plus className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.slice(0, 8).map((p, i) => (
              <ProductCard
                key={p.slug}
                product={p}
                loading={i < 4 ? 'eager' : 'lazy'}
                locale={locale}
                onClick={() => onRelatedClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
