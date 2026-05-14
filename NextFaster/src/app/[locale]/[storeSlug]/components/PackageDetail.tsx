'use client';

import { ArrowLeft, Package, Plus, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react';
import { StorePackage, StoreInfo, packageToCartProduct } from '../types';
import { formatPrice } from '@/lib/pricing';
import ImageGallery from './ImageGallery';

interface Props {
  pkg: StorePackage;
  store: StoreInfo;
  locale: string;
  onBack: () => void;
  onAddToCart: (p: any) => void;
  onItemClick: (p: any) => void;
}

export function PackageDetail({ pkg, store, locale, onBack, onAddToCart, onItemClick }: Props) {
  const isAr = locale === 'ar';
  const realPrice = parseFloat(pkg.realPrice);
  const offerPrice = parseFloat(pkg.offerPrice);
  const hasOffer = realPrice > offerPrice;
  const savings = realPrice - offerPrice;
  const savingsPercent = Math.round((savings / realPrice) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-20 font-sans sm:px-6 lg:px-8 animate-in fade-in duration-700">

      {/* ── BACK BUTTON ─────────────────────────────────────────── */}
      <div className={`mb-6 flex ${isAr ? 'justify-end' : 'justify-start'}`}>
        <button
          onClick={onBack}
          className={`group flex items-center gap-2 rounded-2xl border border-neutral-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-neutral-500 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 active:scale-95 ${isAr ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${isAr ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          {isAr ? 'العودة للمتجر' : 'Back to Shop'}
        </button>
      </div>

      {/* ── MAIN PACKAGE CARD ───────────────────────────────────── */}
      <div className={`grid gap-8 overflow-hidden rounded-[2rem] bg-white p-5 shadow-2xl shadow-emerald-900/5 ring-1 ring-neutral-100 sm:p-8 lg:grid-cols-2 ${isAr ? 'direction-rtl' : ''}`}>

        {/* Package Image Section */}
        <div className={`relative flex flex-col gap-4 ${isAr ? 'lg:order-2' : ''}`}>
          <ImageGallery 
            images={pkg.images && pkg.images.length > 0 ? pkg.images : (pkg.imageUrl ? [pkg.imageUrl] : [])} 
            name={pkg.name}
            isAr={isAr}
          />
          
          {/* Status Badges */}
          <div className={`absolute top-5 flex flex-col gap-2 z-10 ${isAr ? 'left-5' : 'right-5'}`}>
             {hasOffer && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-900/20">
                  <Tag className="h-3 w-3" />
                  {savingsPercent}% {isAr ? 'توفير' : 'SAVINGS'}
                </div>
             )}
          </div>
        </div>

        {/* Package Info Section */}
        <div className={`flex flex-col justify-center gap-5 ${isAr ? 'lg:order-1 text-right' : ''}`}>
          <div>
            <div className={`mb-3 flex items-center gap-2 ${isAr ? 'justify-end' : ''}`}>
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  {isAr ? 'باقة حصرية' : 'Exclusive Package'}
               </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">{pkg.name}</h1>
            <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-400">{pkg.description}</p>
          </div>

          {/* Items List */}
          {pkg.items && pkg.items.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                {isAr ? 'محتويات الباقة (اضغط للمزيد)' : 'What\'s inside (Click for details)'}
              </p>
              <div className="grid gap-2">
                {pkg.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onItemClick(item.product)}
                    className={`group/item flex items-center gap-3 rounded-xl bg-neutral-50 p-2.5 ring-1 ring-neutral-100 transition-all hover:bg-white hover:ring-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-neutral-100">
                      {item.product.image_url ? (
                        <img 
                          src={item.product.image_url} 
                          alt="" 
                          className="h-full w-full object-cover transition-transform group-hover/item:scale-110" 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-50">
                          <Package className="h-3 w-3 text-neutral-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-black text-neutral-900 uppercase group-hover/item:text-emerald-600 transition-colors">{item.product.name}</p>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        {item.quantity} x {isAr ? 'وحدة' : 'Unit'}
                      </p>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 opacity-40 group-hover/item:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-px w-full bg-neutral-100 my-1" />

          {/* Pricing Area */}
          <div className="space-y-1">
            {hasOffer && (
              <p className="text-xs font-black uppercase tracking-widest text-neutral-300 line-through">
                {formatPrice(realPrice)} {isAr ? 'ج.م' : 'EGP'}
              </p>
            )}
            <div className={`flex items-baseline gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-4xl font-black tracking-tighter text-emerald-600">
                {formatPrice(offerPrice)}
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-neutral-400">
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          {/* Purchase Controls */}
          <div className={`mt-2 flex flex-col gap-4 sm:flex-row ${isAr ? 'sm:flex-row-reverse' : ''}`}>
             <button
              onClick={() => onAddToCart(packageToCartProduct(pkg))}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-emerald-900/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-900/30 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              {isAr ? 'إضافة للسلة' : 'Add to cart'}
            </button>
            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-neutral-50 border border-neutral-100">
               <Package className="h-4 w-4 text-neutral-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                 {pkg.items?.length || 0} {isAr ? 'منتجات' : 'Items'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
