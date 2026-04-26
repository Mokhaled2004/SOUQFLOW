'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogCategory } from '../types';

interface Props {
  catalog: CatalogCategory[];
  selectedSubcategory: string;
  locale: string;
  showDiscountsOnly: boolean;
  showPackagesOnly: boolean;
  onSubcategoryClick: (slug: string) => void;
  onAllClick: () => void;
  onDiscountsClick: () => void;
  onPackagesClick: () => void;
}

export function CategoryBar({ catalog, selectedSubcategory, locale, showDiscountsOnly, showPackagesOnly, onSubcategoryClick, onAllClick, onDiscountsClick, onPackagesClick }: Props) {
  const isAr = locale === 'ar';
  const [openCat, setOpenCat] = useState<number | null>(null);

  // Max 8 categories shown
  const visibleCats = catalog.slice(0, 8);

  const isAllSelected = !selectedSubcategory && !showDiscountsOnly && !showPackagesOnly;

  const handleCatClick = (cat: CatalogCategory) => {
    if (cat.subcategories.length === 0) return;
    setOpenCat(openCat === cat.id ? null : cat.id);
  };

  const handleSubClick = (slug: string) => {
    onSubcategoryClick(slug);
    setOpenCat(null);
  };

  const isCatActive = (cat: CatalogCategory) =>
    cat.subcategories.some((s) => s.slug === selectedSubcategory);

  return (
    <div className="mb-10">
      {/* ── Category Pill Container ── */}
      {/* We use flex-wrap and overflow-visible to ensure dropdowns aren't clipped */}
      <div className={`flex flex-wrap items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
        {/* "All" pill */}
        <button
          onClick={() => { onAllClick(); setOpenCat(null); }}
          className={cn(
            'rounded-2xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm',
            isAllSelected
              ? 'bg-neutral-900 text-white shadow-neutral-900/10'
              : 'bg-white border border-neutral-100 text-neutral-500 hover:border-emerald-200 hover:text-emerald-600',
          )}
        >
          {isAr ? 'الكل' : 'All Shop'}
        </button>

        {/* "Discounts" pill */}
        <button
          onClick={() => { onDiscountsClick(); setOpenCat(null); }}
          className={cn(
            'rounded-2xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border',
            showDiscountsOnly
              ? 'bg-rose-500 text-white border-rose-500 shadow-rose-900/10'
              : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100',
          )}
        >
          {isAr ? 'خصومات' : 'Discounts'}
        </button>

        {/* "Packages" pill */}
        <button
          onClick={() => { onPackagesClick(); setOpenCat(null); }}
          className={cn(
            'rounded-2xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border',
            showPackagesOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-900/10'
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100',
          )}
        >
          {isAr ? 'حزم' : 'Packages'}
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Category pills */}
        {visibleCats.map((cat) => {
          const active = isCatActive(cat);
          const isOpen = openCat === cat.id;

          return (
            <div key={cat.id} className="relative">
              <button
                onClick={() => handleCatClick(cat)}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border',
                  active || isOpen
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-neutral-100 text-neutral-500 hover:border-emerald-200 hover:text-emerald-600',
                )}
              >
                {cat.name}
                {cat.subcategories.length > 0 && (
                  <ChevronDown className={cn('h-3 w-3 transition-transform duration-300', isOpen && 'rotate-180')} />
                )}
              </button>

              {/* Real Floating Dropdown Popover */}
              {isOpen && cat.subcategories.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenCat(null)} />
                  <div className={cn(
                    "absolute top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-[1.5rem] border border-neutral-100 bg-white/90 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300",
                    isAr ? "right-0" : "left-0"
                  )}>
                    <div className="space-y-1">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.slug}
                          onClick={() => handleSubClick(sub.slug)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all hover:bg-emerald-50/50 hover:text-emerald-700',
                            selectedSubcategory === sub.slug
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-neutral-500',
                            isAr && 'flex-row-reverse text-right',
                          )}
                        >
                          <div className={cn("h-1.5 w-1.5 rounded-full", selectedSubcategory === sub.slug ? "bg-emerald-500 animate-pulse" : "bg-neutral-200")} />
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
