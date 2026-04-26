'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Store, Search, Tag, MapPin, ChevronRight, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    fetch('/api/stores')
      .then((r) => r.ok ? r.json() : { stores: [] })
      .then((data) => setStores(data.stores ?? []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  // Build unique category list from stores
  const categories = [
    { id: 'all', name: isAr ? 'الكل' : 'All' },
    { id: 'offers', name: isAr ? 'عروض' : 'Offers' },
    ...Array.from(
      new Map(
        stores
          .filter((s) => s.categoryName)
          .map((s) => [s.categoryName!, { id: s.categoryName!, name: s.categoryName! }])
      ).values()
    ),
  ];

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      (s.storeDescription ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === 'all' ||
      (activeCategory === 'offers' ? s.hasOffers : s.categoryName === activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white border-b border-neutral-100 py-24 sm:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] top-[10%] h-[500px] w-[500px] animate-blob rounded-full bg-emerald-100/50 mix-blend-multiply blur-3xl" />
          <div 
            className="absolute -right-[10%] top-[20%] h-[500px] w-[500px] animate-blob rounded-full bg-teal-100/50 mix-blend-multiply blur-3xl opacity-70" 
            style={{ animationDelay: '2s' }}
          />
          <div 
            className="absolute bottom-[0%] left-[20%] h-[500px] w-[500px] animate-blob rounded-full bg-sky-100/50 mix-blend-multiply blur-3xl opacity-70" 
            style={{ animationDelay: '4s' }}
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          
          {/* Floating Grid/Dots */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: '0.05' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-100">
            <Sparkles className="h-4 w-4" />
            {isAr ? 'اكتشف أفضل المتاجر في مصر' : 'Discover the best stores in Egypt'}
          </div>

          <h1 className="mb-6 text-4xl font-black text-neutral-900 sm:text-6xl tracking-tight">
            {isAr ? (
              <>تسوّق من <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">أفضل المتاجر</span></>
            ) : (
              <>Shop from the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Best Stores</span></>
            )}
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-base font-medium text-neutral-500 sm:text-lg">
            {isAr
              ? 'آلاف المنتجات من متاجر موثوقة في جميع أنحاء مصر، اكتشف العروض الحصرية الآن'
              : 'Thousands of products from trusted stores across Egypt. Discover exclusive offers now.'}
          </p>

          {/* Search bar - Thicker */}
          <div className="mx-auto max-w-2xl">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20 blur transition duration-300 group-hover:opacity-30" />
              <div className="relative">
                <Search className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-emerald-500 ${isAr ? 'right-5' : 'left-5'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'ما الذي تبحث عنه اليوم؟' : 'What are you looking for today?'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full rounded-2xl border-2 border-neutral-100 bg-white py-5 text-base font-bold text-neutral-900 shadow-xl placeholder-neutral-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6'}`}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-10">
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
              <p className="text-3xl font-black text-neutral-900">{categories.length - 2}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'تصنيف' : 'Categories'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ── */}
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-xl px-5 py-2 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95'
                }`}
              >
                {cat.id === 'offers' && <Tag className="h-3.5 w-3.5" />}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Store Grid ── */}
      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Results count */}
        {!loading && (
          <p className={`mb-5 text-sm text-neutral-500 ${isAr ? 'text-right' : ''}`}>
            {isAr
              ? `${filtered.length} متجر`
              : `${filtered.length} store${filtered.length !== 1 ? 's' : ''}`}
            {activeCategory !== 'all' && (
              <span className="mx-1 font-bold text-emerald-600">
                {' '}· {categories.find((c) => c.id === activeCategory)?.name}
              </span>
            )}
          </p>
        )}

        {/* Loading */}
        {loading && (
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
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Store className="mb-4 h-16 w-16 text-neutral-200" />
            <p className="text-base font-semibold text-neutral-400">
              {isAr ? 'لا توجد متاجر' : 'No stores found'}
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 text-sm font-bold text-emerald-500 hover:text-emerald-600 underline"
            >
              {isAr ? 'مسح الفلتر' : 'Clear filters'}
            </button>
          </div>
        )}

        {/* Store cards */}
        {!loading && filtered.length > 0 && (
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
      </main>
    </div>
  );
}
