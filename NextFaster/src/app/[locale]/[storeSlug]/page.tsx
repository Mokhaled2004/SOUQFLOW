'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import { View, StoreProduct } from './types';
import { useStoreData } from './useStoreData';
import { useCart } from './useCart';

import { StoreHeader } from './components/StoreHeader';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { CartView } from './components/CartView';
import { StoreFooter } from './components/StoreFooter';

export default function StorePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const storeSlug = params.storeSlug as string;

  const { store, catalog, products, packages, loading, productsLoading, notFound, loadProducts } = useStoreData(storeSlug);
  const { cart, addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart, totalItems, totalPrice } = useCart(storeSlug);

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false);
  const [showPackagesOnly, setShowPackagesOnly] = useState(false);

  // Derive view from URL — no local state needed so language changes preserve it
  const rawView = (searchParams.get('view') as View) || 'list';
  const productSlugFromUrl = searchParams.get('product') ?? '';

  // Once products are loaded, restore selectedProduct from URL if needed
  useEffect(() => {
    if (rawView === 'detail' && productSlugFromUrl && products.length > 0 && !selectedProduct) {
      const found = products.find((p) => p.slug === productSlugFromUrl);
      if (found) setSelectedProduct(found);
    }
  }, [rawView, productSlugFromUrl, products, selectedProduct]);

  // 'detail' is only valid when we have a selected product; fall back to list otherwise
  const view: View = rawView === 'detail' && !selectedProduct ? 'list' : rawView;

  // search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StoreProduct[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // auth
  const [authUser, setAuthUser] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; phone: string; location: string | null; governorate: string | null; locationDetail: string | null } | null>(null);

  // Update URL when view changes — view is derived from URL so no local state needed
  const updateView = (newView: View) => {
    const newParams = new URLSearchParams(searchParams);
    if (newView === 'list') {
      newParams.delete('view');
      newParams.delete('product');
    } else {
      newParams.set('view', newView);
    }
    const qs = newParams.toString();
    router.push(qs ? `?${qs}` : '?', { scroll: false });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setAuthUser(data?.user?.username ?? null);
        if (data?.user) setUserInfo({ username: data.user.username, phone: data.user.phone ?? '', location: data.user.location ?? '', governorate: data.user.governorate ?? null, locationDetail: data.user.locationDetail ?? null });
        setAuthLoaded(true);
      })
      .catch(() => setAuthLoaded(true));
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    const q = searchTerm.toLowerCase();
    setSearchResults(products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    ));
  }, [searchTerm, products]);

  const handleSubcategoryClick = (slug: string) => {
    const next = slug === selectedSubcategory ? '' : slug;
    setSelectedSubcategory(next);
    setShowDiscountsOnly(false);
    updateView('list');
    setSelectedProduct(null);
    loadProducts(next);
  };

  const handleDiscountsClick = () => {
    setShowDiscountsOnly(!showDiscountsOnly);
    setSelectedSubcategory('');
    setShowPackagesOnly(false);
    updateView('list');
    setSelectedProduct(null);
    loadProducts('');
  };

  const handlePackagesClick = () => {
    setShowPackagesOnly(!showPackagesOnly);
    setSelectedSubcategory('');
    setShowDiscountsOnly(false);
    updateView('list');
    setSelectedProduct(null);
    loadProducts('');
  };

  const handleProductClick = (p: StoreProduct) => {
    setSelectedProduct(p);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', 'detail');
    newParams.set('product', p.slug);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const handleLogoClick = () => {
    updateView('list');
    setSelectedProduct(null);
    setSearchTerm('');
    setSelectedSubcategory('');
    setShowDiscountsOnly(false);
    setShowPackagesOnly(false);
    loadProducts('');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
          {/* Main spinning loader */}
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    const isAr = locale === 'ar';
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-50 px-4 text-center selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-1000">
        
        {/* Animated Background Decor */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="group relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-neutral-200 transition-transform duration-500 hover:scale-110">
            <div className="absolute inset-2 rounded-2xl bg-emerald-50 opacity-50 group-hover:bg-emerald-100 transition-colors" />
            <span className="relative text-5xl">🔐</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              {isAr ? 'هذا المتجر غير متاح حالياً' : 'This store is currently unavailable'}
            </h1>
            <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-neutral-500">
              {isAr
                ? 'تم إيقاف تشغيل هذا المتجر مؤقتاً لتحديث المخزون أو إجراء صيانة. يرجى المحاولة لاحقاً.'
                : 'This store has been temporarily deactivated for maintenance or inventory updates. Please check back later.'}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <button
               onClick={() => window.location.reload()}
               className="flex items-center justify-center rounded-2xl bg-neutral-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-neutral-900/20 transition-all hover:bg-neutral-800 active:scale-95"
            >
               {isAr ? 'تحديث الصفحة' : 'Refresh Page'}
            </button>
            <button
               onClick={() => router.push(`/${locale}`)}
               className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 transition-all hover:bg-neutral-50 active:scale-95"
            >
               {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>

        <div className="fixed bottom-10 flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              Secured by SouqFlow
           </span>
        </div>
      </div>
    );
  }

  const displayedProducts = searchTerm ? searchResults : products;
  const relatedProducts = selectedProduct
    ? products.filter((p) => p.subcategory_slug === selectedProduct.subcategory_slug && p.slug !== selectedProduct.slug)
    : [];

  // Filter products by discount if showDiscountsOnly is true
  const filteredProducts = showDiscountsOnly
    ? displayedProducts.filter((p) => p.offerPercentage > 0)
    : displayedProducts;

  return (
    <>
      <div>
        <StoreHeader
          store={store}
          locale={locale}
          searchTerm={searchTerm}
          searchResults={searchResults}
          isSearchOpen={isSearchOpen}
          totalCartItems={totalItems}
          authUser={authUser}
          authLoaded={authLoaded}
          onSearchChange={(v) => { setSearchTerm(v); setIsSearchOpen(v.length > 0); if (v.length > 0) { updateView('list'); setSelectedProduct(null); } }}
          onSearchSelect={(p) => { setSelectedProduct(p); const np = new URLSearchParams(searchParams); np.set('view','detail'); np.set('product', p.slug); router.push(`?${np.toString()}`, { scroll: false }); setSearchTerm(p.name); setIsSearchOpen(false); }}
          onSearchClose={() => setIsSearchOpen(false)}
          onLogoClick={handleLogoClick}
          onMenuClick={() => {}}
          onViewChange={updateView}
          onLogout={handleLogout}
        />

        <div className="flex flex-grow font-sans pt-16">
          <main className="min-h-screen flex-1 overflow-y-auto" id="main-content">
            {view === 'cart' && (
              <CartView
                cart={cart}
                store={store}
                locale={locale}
                totalPrice={totalPrice}
                userInfo={userInfo}
                onRemove={removeFromCart}
                onClear={clearCart}
                onBack={() => updateView('list')}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
              />
            )}

            {view === 'detail' && selectedProduct && (
              <ProductDetail
                product={selectedProduct}
                related={relatedProducts}
                store={store}
                locale={locale}
                onBack={() => updateView('list')}
                onRelatedClick={handleProductClick}
                onAddToCart={(p) => { addToCart(p); }}
              />
            )}

            {(view === 'list' || view === 'history') && (
              <ProductList
                store={store}
                catalog={catalog}
                products={filteredProducts}
                packages={packages}
                loading={productsLoading}
                locale={locale}
                selectedSubcategory={selectedSubcategory}
                showDiscountsOnly={showDiscountsOnly}
                showPackagesOnly={showPackagesOnly}
                onProductClick={handleProductClick}
                onAddToCart={(p) => addToCart(p)}
                onSubcategoryClick={handleSubcategoryClick}
                onAllClick={handleLogoClick}
                onDiscountsClick={handleDiscountsClick}
                onPackagesClick={handlePackagesClick}
              />
            )}
          </main>
        </div>
      </div>

      <StoreFooter store={store} locale={locale} />
    </>
  );
}
