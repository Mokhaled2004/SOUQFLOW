'use client';

import { Plus, Package } from 'lucide-react';
import { StorePackage } from '../types';

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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 shrink-0">
        {pkg.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Savings badge */}
        {savingsPercent > 0 && (
          <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            {savingsPercent}%
          </div>
        )}
      </div>

      {/* Name + description — fixed height */}
      <div className="px-4 pt-4 h-20 overflow-hidden shrink-0">
        <h3 className="font-bold text-gray-900 group-hover:text-accent1 line-clamp-1">{pkg.name}</h3>
        {pkg.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 leading-4" title={pkg.description}>{pkg.description}</p>
        )}
      </div>

      {/* Price + button — always at the same position */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-xs line-through text-gray-400 h-4 leading-4">
            {savings > 0 ? `${realPrice.toFixed(2)} ${isAr ? 'ج.م' : 'EGP'}` : ''}
          </span>
          <span className="text-base font-bold text-red-600 leading-5">
            {offerPrice.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
          </span>
        </div>

        <button
          onClick={onAddToCart}
          aria-label={isAr ? 'أضف للسلة' : 'Add to cart'}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent1 text-white shadow transition hover:opacity-80 active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
