'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Store, Search, Tag, MapPin, ChevronRight, Sparkles, Package } from 'lucide-react';
import Link from 'next/link';

interface StoreCard {
  id: number;
  storeName: string;
  slug: string;
  storeDescription: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  primaryLocation: string | null;
  categoryName: string | null;
  categoryId: number | null;
  hasOffers: boolean;
}

export default function BuyerDashboard() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [stores, setStores] = useState<StoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // New Marketplace states
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isPriceFilterEnabled, setIsPriceFilterEnabled] = useState(false);
  const [hasOfferOnly, setHasOfferOnly] = useState(false);
  const [isPackageOnly, setIsPackageOnly] = useState(false);

  useEffect(() => {
    fetch('/api/stores')
      .then((r) => r.ok ? r.json() : { stores: [] })
      .then((data) => setStores(data.stores ?? []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
    
    // Load shop categories dynamically from DB
    fetch('/api/store-categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllCategories(data))
      .catch(() => setAllCategories([]));
  }, []);

  // Fetch products or packages for marketplace
  useEffect(() => {
    if (activeTab === 'products') {
      setProductsLoading(true);
      const endpoint = isPackageOnly ? '/api/marketplace/packages' : '/api/marketplace/products';
      const params = new URLSearchParams({
        categoryId: activeCategory,
        ...(isPriceFilterEnabled ? {
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
        } : {}),
        hasOffer: hasOfferOnly.toString(),
        search,
      });
      fetch(`${endpoint}?${params.toString()}`)
        .then(r => r.ok ? r.json() : { products: [], packages: [] })
        .then(data => {
          const results = isPackageOnly ? data.packages : data.products;
          setAllProducts(results || []);
        })
        .catch(() => setAllProducts([]))
        .finally(() => setProductsLoading(false));
    }
  }, [activeTab, activeCategory, priceRange, isPriceFilterEnabled, hasOfferOnly, isPackageOnly, search]);

  // Unified shop categories list
  const displayCategories = [
    { id: 'all', name: isAr ? 'الكل' : 'All' },
    ...(activeTab === 'stores' ? [{ id: 'offers', name: isAr ? 'عروض' : 'Offers' }] : []),
    ...allCategories.map(c => ({ id: c.id.toString(), name: c.name }))
  ];

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      (s.storeDescription ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === 'all' ||
      (activeCategory === 'offers' ? s.hasOffers : s.categoryId?.toString() === activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
      <div className="min-h-screen bg-neutral-50" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-40">
        {/* Cinematic Background Blobs (Vibrant & Attractive) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-[10%] -top-[20%] h-[800px] w-[800px] animate-blob-slow rounded-full bg-emerald-100/40 mix-blend-multiply blur-[140px] opacity-70" />
          <div 
            className="absolute right-[-5%] top-[-10%] h-[600px] w-[600px] animate-blob-slow rounded-full bg-indigo-100/40 mix-blend-multiply blur-[140px] opacity-60" 
            style={{ animationDelay: '3s' }}
          />
          <div 
            className="absolute bottom-[-10%] left-[20%] h-[900px] w-[900px] animate-blob-slow rounded-full bg-sky-100/40 mix-blend-multiply blur-[140px] opacity-60" 
            style={{ animationDelay: '6s' }}
          />
          <div 
            className="absolute top-[30%] left-[40%] h-[400px] w-[400px] animate-blob-slow rounded-full bg-rose-50/30 mix-blend-multiply blur-[100px] opacity-40" 
            style={{ animationDelay: '9s' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-neutral-900/5 backdrop-blur-md px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ring-1 ring-neutral-900/10 transition-all hover:bg-neutral-900/10">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? 'اكتشف أفضل المتاجر في مصر' : 'Discover the best stores in Egypt'}
          </div>

          <h1 className="mb-8 text-5xl font-black text-neutral-900 sm:text-7xl tracking-tighter leading-tight">
            {isAr ? (
              <>تسوّق من <span className="bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">أفضل المتاجر</span></>
            ) : (
              <>Shop from the <br /><span className="bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">Best Stores</span></>
            )}
          </h1>
          
          <p className="mx-auto mb-12 max-w-xl text-base font-medium text-neutral-400 sm:text-lg leading-relaxed">
            {isAr
              ? 'آلاف المنتجات من متاجر موثوقة في جميع أنحاء مصر، اكتشف العروض الحصرية الآن'
              : 'Thousands of products from trusted stores across Egypt. Discover exclusive offers now.'}
          </p>

          {/* Search bar - Premium Glassmorphism */}
          <div className="mx-auto max-w-2xl">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/10 to-sky-500/10 opacity-0 blur-2xl transition duration-500 group-focus-within:opacity-100" />
              <div className="relative">
                <Search className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'right-6' : 'left-6'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'ما الذي تبحث عنه اليوم؟' : 'What are you looking for today?'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full rounded-[2rem] border border-neutral-100 bg-white/70 backdrop-blur-xl py-6 text-base font-bold text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] placeholder-neutral-300 transition-all focus:bg-white focus:border-emerald-500/30 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 ${isAr ? 'pr-16 pl-8 text-right' : 'pl-16 pr-8'}`}
                />
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-2xl bg-neutral-100 p-1.5 shadow-inner">
              <button
                onClick={() => { setActiveTab('stores'); setActiveCategory('all'); }}
                className={`rounded-xl px-8 py-2.5 text-sm font-black transition-all ${
                  activeTab === 'stores' 
                    ? 'bg-white text-emerald-600 shadow-lg' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {isAr ? 'المتاجر' : 'Stores'}
              </button>
              <button
                onClick={() => { setActiveTab('products'); setActiveCategory('all'); }}
                className={`rounded-xl px-8 py-2.5 text-sm font-black transition-all ${
                  activeTab === 'products' 
                    ? 'bg-white text-emerald-600 shadow-lg' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {isAr ? 'المنتجات' : 'Products'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex items-center justify-center gap-10">
            <div className="text-center">
              <p className="text-3xl font-black text-neutral-900">{stores.length}+</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'متجر نشط' : 'Active Stores'}</p>
            </div>
            <div className="h-10 w-px bg-neutral-100" />
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600">{stores.filter((s) => s.hasOffers).length}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'متاجر بعروض' : 'Stores with Offers'}</p>
            </div>
            <div className="h-10 w-px bg-neutral-100" />
            <div className="text-center">
              <p className="text-3xl font-black text-neutral-900">
                {displayCategories.length - (activeTab === 'stores' ? 2 : 1)}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'تصنيف' : 'Categories'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ── */}
      <div className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-6">
            {/* Category Row */}
            <div className="relative group">
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth">
                {displayCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 rounded-2xl px-6 py-2.5 text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-transparent'
                    }`}
                  >
                    {cat.id === 'offers' && <Tag className="h-3.5 w-3.5" />}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Row (Price & Offers) */}
            {activeTab === 'products' && (
              <div className={`flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-2 duration-500 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
                
                <div className="flex flex-wrap items-center gap-4">
                  {/* Advanced Price Toggle */}
                  <button
                    onClick={() => setIsPriceFilterEnabled(!isPriceFilterEnabled)}
                    className={`relative flex items-center gap-3 rounded-2xl px-6 py-3 transition-all duration-500 overflow-hidden group border ${
                      isPriceFilterEnabled 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity duration-500 ${isPriceFilterEnabled ? 'opacity-100' : 'group-hover:opacity-10'}`} />
                    <div className="relative flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${isPriceFilterEnabled ? 'border-white bg-white' : 'border-neutral-200 group-hover:border-emerald-300'}`}>
                        {isPriceFilterEnabled && <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? 'تصفية السعر' : 'Price Filter'}</span>
                    </div>
                  </button>

                  <div className="h-8 w-px bg-neutral-100 hidden sm:block" />

                  {/* Offers Only */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-xl border-2 transition-all duration-300 ${hasOfferOnly ? 'bg-rose-500 border-rose-500' : 'border-neutral-200 bg-white group-hover:border-rose-300'}`}>
                      <input
                        type="checkbox"
                        checked={hasOfferOnly}
                        onChange={(e) => setHasOfferOnly(e.target.checked)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {hasOfferOnly ? <Tag className="h-3.5 w-3.5 text-white" /> : <div className="h-1.5 w-1.5 rounded-full bg-neutral-200 group-hover:bg-rose-300 transition-colors" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-600 group-hover:text-rose-600 transition-colors">{isAr ? 'عروض فقط' : 'Exclusive Offers'}</span>
                    </div>
                  </label>

                  <div className="h-8 w-px bg-neutral-100 hidden sm:block" />

                  {/* Packages Only */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-xl border-2 transition-all duration-300 ${isPackageOnly ? 'bg-indigo-500 border-indigo-500' : 'border-neutral-200 bg-white group-hover:border-indigo-300'}`}>
                      <input
                        type="checkbox"
                        checked={isPackageOnly}
                        onChange={(e) => setIsPackageOnly(e.target.checked)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {isPackageOnly ? <Package className="h-3.5 w-3.5 text-white" /> : <div className="h-1.5 w-1.5 rounded-full bg-neutral-200 group-hover:bg-indigo-300 transition-colors" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-600 group-hover:text-indigo-600 transition-colors">{isAr ? 'باقات' : 'Packages'}</span>
                    </div>
                  </label>
                </div>

                {/* Animated Price Range Slider */}
                {isPriceFilterEnabled && (
                  <div className="flex-1 max-w-md flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{isAr ? 'الميزانية' : 'Budget Range'}</span>
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Math.max(0, Math.min(Number(e.target.value), priceRange[1] - 10)), priceRange[1]])}
                          className="w-12 bg-transparent text-right focus:outline-none"
                        />
                        <span className="opacity-30">/</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0] + 10, Math.min(Number(e.target.value), 10000))])}
                          className="w-12 bg-transparent text-left focus:outline-none"
                        />
                        <span className="text-[8px] opacity-70 uppercase">LE</span>
                      </div>
                    </div>
                    <div className="relative h-6 flex items-center group/slider">
                      <div className="absolute h-1.5 w-full bg-neutral-100 rounded-full" />
                      <div 
                        className="absolute h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300" 
                        style={{ 
                          left: `${(priceRange[0] / 10000) * 100}%`, 
                          right: `${100 - (priceRange[1] / 10000) * 100}%` 
                        }} 
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="1"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 10), priceRange[1]])}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="1"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 10)])}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Results count */}
        {!loading && !productsLoading && (
          <p className={`mb-5 text-sm text-neutral-500 ${isAr ? 'text-right' : ''}`}>
            {activeTab === 'stores' ? (
              <>
                {isAr ? `${filtered.length} متجر` : `${filtered.length} store${filtered.length !== 1 ? 's' : ''}`}
                {activeCategory !== 'all' && (
                  <span className="mx-1 font-bold text-emerald-600">
                    {' '}· {displayCategories.find((c) => c.id === activeCategory)?.name}
                  </span>
                )}
              </>
            ) : (
              <>
                {isAr ? `${allProducts.length} منتج` : `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''}`}
                {activeCategory !== 'all' && (
                  <span className="mx-1 font-bold text-emerald-600">
                    {' '}· {displayCategories.find((c) => c.id === activeCategory)?.name}
                  </span>
                )}
              </>
            )}
          </p>
        )}

        {/* Loading */}
        {(loading || productsLoading) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm">
                <div className="h-32 rounded-t-2xl bg-neutral-200" />
                <div className="p-4">
                  <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!(loading || productsLoading) && (activeTab === 'stores' ? filtered.length === 0 : allProducts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {activeTab === 'stores' ? <Store className="mb-4 h-16 w-16 text-neutral-200" /> : <Tag className="mb-4 h-16 w-16 text-neutral-200" />}
            <p className="text-base font-semibold text-neutral-400">
              {isAr ? 'لا توجد نتائج' : 'No results found'}
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); setMinPrice(''); setMaxPrice(''); setHasOfferOnly(false); }}
              className="mt-4 text-sm font-bold text-emerald-500 hover:text-emerald-600 underline"
            >
              {isAr ? 'مسح الفلتر' : 'Clear filters'}
            </button>
          </div>
        )}

        {/* Store Grid */}
        {activeTab === 'stores' && !loading && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((store) => (
              <Link
                key={store.id}
                href={`/${locale}/${store.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
              >
                {/* Offers badge */}
                {store.hasOffers && (
                  <div className={`absolute top-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg ${isAr ? 'left-3' : 'right-3 animate-bounce-subtle'}`}>
                    <Tag className="h-3 w-3" />
                    {isAr ? 'عرض خاص' : 'Hot Offer'}
                  </div>
                )}

                {/* Banner */}
                <div className="h-36 w-full overflow-hidden bg-neutral-100 shrink-0">
                  {store.storeBanner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.storeBanner}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                      <Store className="h-12 w-12 text-emerald-200" />
                    </div>
                  )}
                </div>

                {/* Info — grows to fill space */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Top row: Logo + Category/Location */}
                  <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    {/* Logo (Left in EN, Right in AR) */}
                    <div className="shrink-0 -mt-10">
                      <div className="relative h-20 w-20 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden ring-1 ring-neutral-100">
                        {store.storeLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={store.storeLogo}
                            alt={store.storeName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-50">
                            <Store className="h-10 w-10 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category + Location (Right in EN, Left in AR) */}
                    <div className={`flex flex-col gap-1.5 ${isAr ? 'items-start text-right' : 'items-end text-left'}`}>
                      {store.categoryName && (
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 whitespace-nowrap">
                          {store.categoryName}
                        </span>
                      )}
                      {store.primaryLocation && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold text-neutral-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="whitespace-nowrap uppercase">{store.primaryLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store name + description */}
                  <div className={`mt-2 ${isAr ? 'text-right' : 'text-left'}`}>
                    <h2 className="line-clamp-1 text-lg font-black text-neutral-900 group-hover:text-emerald-600 transition">
                      {store.storeName}
                    </h2>
                    {store.storeDescription && (
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium text-neutral-500 leading-relaxed uppercase">
                        {store.storeDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className={`flex items-center justify-between border-t border-neutral-50 bg-neutral-50/30 px-5 py-3.5 mt-auto transition-colors group-hover:bg-emerald-50/30 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                    {isAr ? 'زيارة المتجر' : 'Visit Store'}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-emerald-400 transition transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Product/Package Grid */}
        {activeTab === 'products' && !productsLoading && allProducts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {allProducts.map((p) => {
              const isPkg = p.isPackage;
              const linkHref = isPkg 
                ? `/${locale}/${p.storeSlug}?view=list&packages=true`
                : `/${locale}/${p.storeSlug}?view=detail&product=${p.slug}`;
              
              return (
                <Link
                  key={isPkg ? `pkg-${p.id}` : p.slug}
                  href={linkHref}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/5"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {isPkg ? <Package className="h-12 w-12 text-neutral-200" /> : <Tag className="h-12 w-12 text-neutral-200" />}
                      </div>
                    )}

                    {/* Badge */}
                    {isPkg ? (
                      <div className="absolute top-3 left-3 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-black text-white shadow-lg uppercase tracking-widest">
                        {isAr ? 'باقة' : 'Package'}
                      </div>
                    ) : p.offerPercentage > 0 && (
                      <div className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                        -{p.offerPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${isPkg ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {p.categoryName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full border border-neutral-100 bg-white overflow-hidden shadow-sm">
                          <img src={p.storeLogo || '/images/logo.png'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 truncate max-w-[80px]">
                          {p.storeName}
                        </span>
                      </div>
                    </div>

                    <h3 className="line-clamp-2 text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition">
                      {p.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        {(isPkg ? p.realPrice > p.price : p.offerPercentage > 0) && (
                          <span className="text-[10px] font-bold text-neutral-400 line-through">
                            {isPkg ? p.realPrice : p.price} LE
                          </span>
                        )}
                        <span className={`text-lg font-black ${isPkg ? 'text-emerald-600' : 'text-emerald-600'}`}>
                          {isPkg ? p.price : (p.offerPercentage > 0 
                            ? (Number(p.price) * (1 - p.offerPercentage / 100)).toFixed(2)
                            : p.price)} <span className="text-xs">{isAr ? 'ج.م' : 'LE'}</span>
                        </span>
                      </div>
                      <div className="rounded-xl bg-neutral-900 p-2 text-white shadow-md transition group-hover:bg-emerald-600 group-active:scale-95">
                        <ChevronRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </>
  );
}
