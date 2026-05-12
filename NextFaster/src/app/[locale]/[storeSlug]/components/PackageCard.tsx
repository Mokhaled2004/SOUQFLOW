'use client';

import { Plus, Package, Tag } from 'lucide-react';
import { StorePackage } from '../types';
import { formatPrice } from '@/lib/pricing';

interface Props {
  package: StorePackage;
  locale: string;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export function PackageCard({ package: pkg, locale, onClick, onAddToCart }: Props) {
  const isAr = locale === 'ar';
  const realPrice = parseFloat(pkg.realPrice);
  const offerPrice = parseFloat(pkg.offerPrice);
  const savings = realPrice - offerPrice;
  const savingsPercent = Math.round((savings / realPrice) * 100);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-neutral-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/10 flex flex-col animate-in fade-in slide-in-from-bottom-6"
    >
      {/* Package image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50/50 shrink-0">
        {pkg.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-14 w-14 text-neutral-200" />
          </div>
        )}

        {/* Savings badge */}
        {savingsPercent > 0 && (
          <div className={`absolute top-3 flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-white shadow-lg shadow-emerald-900/20 ${isAr ? 'left-3' : 'right-3'}`}>
            <Tag className="h-3 w-3" />
            {savingsPercent}% {isAr ? 'توفير' : 'OFF'}
          </div>
        )}
      </div>

      {/* Content wrapper */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {pkg.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-relaxed text-neutral-400" title={pkg.description || ''}>
            {pkg.description}
          </p>
        </div>

        {/* Pricing/Action Area */}
        <div className={`mt-5 flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex flex-col ${isAr ? 'items-end' : 'items-start'}`}>
            {savings > 0 && (
              <span className="text-[10px] font-black line-through text-neutral-300">
                {realPrice.toFixed(2)} EGP
              </span>
            )}
            <span className="text-base font-black tracking-tight text-emerald-600">
              {formatPrice(offerPrice)} {isAr ? 'ج.م' : 'EGP'}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            aria-label={isAr ? 'أضف للسلة' : 'Add to cart'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/10 transition-all hover:bg-emerald-700 active:scale-90"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

