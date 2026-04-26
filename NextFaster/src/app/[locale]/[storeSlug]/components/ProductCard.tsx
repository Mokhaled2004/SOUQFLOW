'use client';

import { Plus, Package, Tag } from 'lucide-react';
import { StoreProduct } from '../types';
import { calculateDiscountedPrice, formatPrice, isFree } from '@/lib/pricing';

interface Props {
  product: StoreProduct;
  loading: 'eager' | 'lazy';
  locale: string;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export function ProductCard({ product, loading, locale, onClick, onAddToCart }: Props) {
  const isAr = locale === 'ar';
  const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
  const hasOffer = product.offerPercentage > 0;
  const isFreeProduct = isFree(product.offerPercentage);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-neutral-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/10 flex flex-col animate-in fade-in slide-in-from-bottom-6"
    >
      {/* Product image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50/50 shrink-0">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading={loading}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${product.isOutOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-14 w-14 text-neutral-200" />
          </div>
        )}

        {/* Status Badges */}
        <div className={`absolute top-3 flex flex-col gap-2 ${isAr ? 'left-3' : 'right-3'}`}>
          {hasOffer && !isFreeProduct && (
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-white shadow-lg shadow-rose-900/20">
              <Tag className="h-3 w-3" />
              {product.offerPercentage}% {isAr ? 'خصم' : 'OFF'}
            </div>
          )}
          {isFreeProduct && (
            <div className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-white shadow-lg shadow-emerald-900/20">
              FREE
            </div>
          )}
          {product.isOutOfStock === 1 && (
            <div className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-white backdrop-blur-md">
              {isAr ? 'نفذت الكمية' : 'Sold Out'}
            </div>
          )}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-relaxed text-neutral-400" title={product.description}>
            {product.description}
          </p>
        </div>

        {/* Pricing/Action Area */}
        <div className={`mt-5 flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex flex-col ${isAr ? 'items-end' : 'items-start'}`}>
            {hasOffer && (
              <span className="text-[10px] font-black line-through text-neutral-300">
                {parseFloat(product.price).toFixed(2)} EGP
              </span>
            )}
            <span className={`text-base font-black tracking-tight ${isFreeProduct ? 'text-emerald-600' : hasOffer ? 'text-rose-600' : 'text-neutral-900'}`}>
              {isFreeProduct ? (isAr ? 'مجاني' : 'FREE') : `${formatPrice(discountedPrice)} ${isAr ? 'ج.م' : 'EGP'}`}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={product.isOutOfStock === 1}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-xl transition-all active:scale-90 ${
              product.isOutOfStock === 1
                ? 'cursor-not-allowed bg-neutral-100 text-neutral-300'
                : 'bg-emerald-600 text-white shadow-emerald-900/10 hover:bg-emerald-700'
            }`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

