'use client';

import { useMemo } from 'react';
import { ShoppingCart, Search, ArrowRight, Package } from 'lucide-react';
import { StoreProduct, StorePackage, StoreInfo, CatalogCategory, packageToCartProduct } from '../types';
import { ProductCard } from './ProductCard';
import { PackageCard } from './PackageCard';
import { CategoryBar } from './CategoryBar';

interface Props {
  store: StoreInfo;
  catalog: CatalogCategory[];
  products: StoreProduct[];
  packages: StorePackage[];
  loading: boolean;
  locale: string;
  selectedSubcategory: string;
  showDiscountsOnly: boolean;
  showPackagesOnly: boolean;
  onProductClick: (p: StoreProduct) => void;
  onAddToCart: (p: StoreProduct) => void;
  onSubcategoryClick: (slug: string) => void;
  onAllClick: () => void;
  onDiscountsClick: () => void;
  onPackagesClick: () => void;
}

export function ProductList({
  store, catalog, products, packages, loading, locale,
  selectedSubcategory, showDiscountsOnly, showPackagesOnly, onProductClick, onAddToCart,
  onSubcategoryClick, onAllClick, onDiscountsClick, onPackagesClick,
}: Props) {
  const isAr = locale === 'ar';

  // 3 random products for the hero preview — more vertical space for banner
  const heroProducts = useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [products.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const showHero = store.storeDescription || store.storeBanner;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 font-sans sm:px-6 lg:px-8">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      {showHero && (
        <div className={`relative mb-10 overflow-hidden rounded-[2.5rem] bg-white p-5 shadow-xl shadow-neutral-900/[0.02] ring-1 ring-neutral-100 sm:p-8 ${isAr ? 'direction-rtl' : ''}`}>
          {/* Background Decor */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className={`relative grid gap-8 ${
            store.storeBanner && heroProducts.length > 0
              ? 'lg:grid-cols-[1.1fr_1.8fr_0.9fr] lg:items-center'
              : store.storeBanner
              ? 'lg:grid-cols-2 lg:items-center'
              : 'lg:grid-cols-1'
          }`}>

            {/* Col 1 — Branding */}
            <div className={`flex flex-col ${isAr ? 'lg:order-3 text-right' : ''}`}>
               <div className={`mb-3 inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-100 ${isAr ? 'self-end' : ''}`}>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {isAr ? 'متجر معتمد' : 'Verified Store'}
               </div>
               <h1 className="text-3xl font-black leading-tight text-neutral-900 uppercase tracking-tight sm:text-4xl lg:text-5xl">
                 {store.storeName}
               </h1>
               <div className="mt-4 flex flex-col gap-3">
                  <p className="max-w-md text-xs font-bold leading-relaxed text-neutral-500/80 sm:text-sm">
                    {store.storeDescription}
                  </p>
                  <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                     <div className="flex -space-x-3">
                        {[1,2,3,4].map((i) => (
                           <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-neutral-100 ring-1 ring-neutral-100 shadow-sm" />
                        ))}
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        {isAr ? 'أكثر من 1000 عميل' : '1k+ shoppers'}
                     </p>
                  </div>
               </div>
            </div>

            {/* Col 2 — Focal Banner */}
            {store.storeBanner && (
              <div className={`group relative overflow-hidden rounded-2xl shadow-xl shadow-neutral-900/5 ring-1 ring-white/20 transition-transform duration-500 hover:scale-[1.01] aspect-[16/9] lg:aspect-[16/8] ${isAr ? 'lg:order-2' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.storeBanner}
                  alt={store.storeName}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            )}

            {/* Col 3 — Featured Highlights */}
            {heroProducts.length > 0 && (
              <div className={`sm:col-span-full lg:col-span-1 ${isAr ? 'lg:order-1' : ''}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest text-neutral-300 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? 'أبرز المنتجات' : 'Featured Today'}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {heroProducts.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => onProductClick(p)}
                      className={`group flex items-center gap-4 rounded-[1.25rem] border border-neutral-100 bg-white p-3 text-left transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.03] active:scale-95 ${isAr ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-100">
                        {p.image_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                          : <div className="flex h-full w-full items-center justify-center text-neutral-300"><Search className="h-5 w-5" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{p.name}</p>
                        <div className={`mt-0.5 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] font-black text-emerald-600">{parseFloat(p.price).toFixed(2)}</span>
                          <div className="h-1 w-1 rounded-full bg-neutral-200" />
                          <span className="truncate text-[9px] font-bold text-neutral-400 capitalize">{p.subcategory_slug.replace(/-/g, ' ')}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CATEGORY BAR ─────────────────────────────────────────────── */}
      <CategoryBar
        catalog={catalog}
        selectedSubcategory={selectedSubcategory}
        showDiscountsOnly={showDiscountsOnly}
        showPackagesOnly={showPackagesOnly}
        locale={locale}
        onSubcategoryClick={onSubcategoryClick}
        onAllClick={onAllClick}
        onDiscountsClick={onDiscountsClick}
        onPackagesClick={onPackagesClick}
      />

      {/* ── PRODUCT COUNT ────────────────────────────────────────────── */}
      <div className={`mb-10 flex items-center justify-between border-b border-neutral-100 pb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex flex-col ${isAr ? 'items-end' : 'items-start'}`}>
           <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
             {showPackagesOnly ? (isAr ? 'الحزم المتوفرة' : 'Available Packages') : (isAr ? 'جميع المنتجات' : 'All Products')}
           </h2>
           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
             {loading
               ? (isAr ? 'جاري التحميل...' : 'Loading catalog...')
               : showPackagesOnly
               ? `${isAr ? 'اكتشف' : 'Explore'} ${packages.length.toLocaleString()} ${isAr ? 'حزمة' : packages.length === 1 ? 'package' : 'packages'}`
               : `${isAr ? 'اكتشف' : 'Explore'} ${products.length.toLocaleString()} ${isAr ? 'منتج' : products.length === 1 ? 'product' : 'products'}`}
           </p>
        </div>
      </div>

      {/* ── PACKAGES GRID ────────────────────────────────────────────── */}
      {showPackagesOnly && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-100 border-t-emerald-600" />
            </div>
          ) : packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <Package className="h-12 w-12 text-neutral-200" />
               <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                 {isAr ? 'لا توجد حزم حالياً' : 'No packages found'}
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  locale={locale}
                  onClick={() => {}}
                  onAddToCart={(e) => { e.stopPropagation(); onAddToCart(packageToCartProduct(pkg)); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS GRID ────────────────────────────────────────────── */}
      {!showPackagesOnly && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-100 border-t-emerald-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <Search className="h-12 w-12 text-neutral-200" />
               <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                 {isAr ? 'لم يتم العثور على منتجات' : 'No products found'}
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  loading={i < 12 ? 'eager' : 'lazy'}
                  locale={locale}
                  onClick={() => onProductClick(p)}
                  onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
