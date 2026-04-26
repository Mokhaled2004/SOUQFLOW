'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Edit3, Store, Package, ShoppingBag, ClipboardList, BarChart2, Loader2, AlertCircle } from 'lucide-react';

import AdminHeader from '@/components/admin/AdminHeader';
import StoreInfoCard from '@/components/admin/StoreInfoCard';
import StoreInfoForm from '@/components/admin/StoreInfoForm';
import CatalogSection from '@/components/admin/CatalogSection';
import ProductsSection from '@/components/admin/ProductsSection';
import PackagesSection from '@/components/admin/PackagesSection';
import OrdersSection from '@/components/admin/OrdersSection';
import StoreSettingsSection from '@/components/admin/StoreSettingsSection';
import { Store as StoreType, ShippingRate, StoreInfoFormValues, CatalogCategory } from '@/types/store';

type Tab = 'store' | 'products' | 'packages' | 'orders' | 'settings';

const TABS: { id: Tab; labelEn: string; labelAr: string; icon: React.ReactNode }[] = [
  { id: 'store',    labelEn: 'Store',     labelAr: 'المتجر',    icon: <Store className="h-4 w-4" /> },
  { id: 'products', labelEn: 'Products',  labelAr: 'المنتجات',  icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'packages', labelEn: 'Packages',  labelAr: 'الباقات',   icon: <Package className="h-4 w-4" /> },
  { id: 'orders',   labelEn: 'Orders',    labelAr: 'الطلبات',   icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'settings', labelEn: 'Analytics', labelAr: 'التحليلات', icon: <BarChart2 className="h-4 w-4" /> },
];

export default function StoreAdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const storeSlug = params.storeSlug as string;
  const isRTL = locale === 'ar';
  const isAr = locale === 'ar';

  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGovs, setSelectedGovs] = useState<Set<string>>(new Set());
  const [shippingRates, setShippingRates] = useState<Record<string, string>>({});
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('store');

  useEffect(() => {
    const load = async () => {
      try {
        const [storeRes, ratesRes, catalogRes] = await Promise.all([
          fetch(`/api/seller/store/${storeSlug}`),
          fetch(`/api/seller/store/${storeSlug}/shipping`),
          fetch(`/api/seller/store/${storeSlug}/catalog`),
        ]);
        if (!storeRes.ok) {
          if (storeRes.status === 401) { router.push(`/${locale}/auth/login`); return; }
          throw new Error('Failed to load store');
        }
        const { store: s } = await storeRes.json();
        setStore(s);

        if (ratesRes.ok) {
          const { rates } = await ratesRes.json();
          const rateMap: Record<string, string> = {};
          const govSet = new Set<string>();
          rates.forEach((r: ShippingRate) => { rateMap[r.governorate] = String(r.price); govSet.add(r.governorate); });
          setShippingRates(rateMap);
          setSelectedGovs(govSet);
        }
        if (catalogRes.ok) {
          const { catalog: cat } = await catalogRes.json();
          setCatalog(cat);
        }
      } catch {
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeSlug, locale, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}`);
  };

  const handleSaved = (updatedStore: StoreType, updatedRates: Record<string, string>, updatedGovs: Set<string>) => {
    setStore(updatedStore);
    setShippingRates(updatedRates);
    setSelectedGovs(updatedGovs);
    setShowForm(false);
  };

  const profilePct = store
    ? Math.round(([store.email, store.phone, store.primaryLocation, store.storeDescription, store.businessType].filter(Boolean).length / 5) * 100)
    : 0;

  const formInitialValues: StoreInfoFormValues = {
    storeDescription: store?.storeDescription || '',
    whatsappNumber: store?.whatsappNumber || '',
    email: store?.email || '',
    primaryLocation: store?.primaryLocation || '',
    businessType: store?.businessType || '',
    taxId: store?.taxId || '',
    storeLogo: store?.storeLogo || '',
    storeBanner: store?.storeBanner || '',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50/50 px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-neutral-900/5 animate-in zoom-in-95">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">{isAr ? 'خطأ في التحميل' : 'Store Not Found'}</h2>
          <p className="mb-8 text-sm font-medium text-neutral-500 leading-relaxed">{error || 'Unable to locate this store. Make sure the URL is correct or try switching stores.'}</p>
          <Link href={`/${locale}/seller/stores`} className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 py-3.5 font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-xl shadow-neutral-200">
            {isAr ? 'العودة للمتاجر' : 'Return to My Stores'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader store={store} locale={locale} isRTL={isRTL} onLogout={handleLogout} />

      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">

        {/* Profile completion banner — only on store tab */}
        {activeTab === 'store' && profilePct < 100 && !showForm && (
          <div className={`mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm font-black text-emerald-800">
                {isAr ? `إعداد المتجر الجميل الخاص بك: مكتمل بنسبة ${profilePct}%` : `Store Setup: ${profilePct}% Complete`}
              </p>
              <div className="mt-3 hidden sm:block h-2 w-full overflow-hidden rounded-full bg-emerald-200/50">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${profilePct}%` }} />
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] shadow-md shadow-emerald-600/20 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Edit3 className="h-4 w-4" />
              {isAr ? 'إكمال الإعدادات' : 'Complete Setup'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className={`mb-8 flex overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm p-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
              className={`flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-3 text-[11px] font-bold transition-all sm:flex-row sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border border-transparent'
              } ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {tab.icon}
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'store' && (
          showForm ? (
            <StoreInfoForm
              storeSlug={storeSlug}
              storeId={store.id}
              initialValues={formInitialValues}
              initialSelectedGovs={selectedGovs}
              initialShippingRates={shippingRates}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
              locale={locale}
              isRTL={isRTL}
            />
          ) : (
            <div className="space-y-6">
              <StoreInfoCard
                store={store}
                selectedGovs={selectedGovs}
                shippingRates={shippingRates}
                onEdit={() => setShowForm(true)}
                locale={locale}
                isRTL={isRTL}
              />
              <CatalogSection
                storeSlug={storeSlug}
                catalog={catalog}
                onCatalogChange={setCatalog}
                locale={locale}
                isRTL={isRTL}
              />
            </div>
          )
        )}

        {activeTab === 'products' && (
          <ProductsSection
            storeSlug={storeSlug}
            storeId={store.id}
            catalog={catalog}
            locale={locale}
            isRTL={isRTL}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesSection
            storeSlug={storeSlug}
            storeId={store.id}
            locale={locale}
            isRTL={isRTL}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersSection
            storeSlug={storeSlug}
            locale={locale}
            isRTL={isRTL}
          />
        )}

        {activeTab === 'settings' && (
          <StoreSettingsSection
            storeSlug={storeSlug}
            locale={locale}
            isRTL={isRTL}
          />
        )}
      </main>
    </div>
  );
}
