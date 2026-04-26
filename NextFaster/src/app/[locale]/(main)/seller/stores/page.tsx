'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Store, Plus, Trash2, AlertTriangle, X, Loader2, ArrowRight } from 'lucide-react';

interface StoreData {
  id: number;
  slug: string;
  storeName: string;
  storeDescription: string;
}

export default function SellerStoresPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<StoreData | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/seller/my-stores');
        if (!response.ok) {
          if (response.status === 401) { router.push(`/${locale}/auth/login`); return; }
          throw new Error('Failed to fetch stores');
        }
        const data = await response.json();
        setStores(data.stores);
      } catch {
        setError(isAr ? 'فشل تحميل المتاجر' : 'Failed to load stores');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [locale, router, isAr]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== deleteTarget.storeName) {
      setDeleteError(isAr ? 'اسم المتجر غير مطابق' : 'Store name does not match');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/seller/store/${deleteTarget.slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || (isAr ? 'فشل الحذف' : 'Delete failed'));
        return;
      }
      // Remove from list and close modal
      setStores((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmText('');
    } catch {
      setDeleteError(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again');
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-neutral-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm font-bold text-neutral-400 animate-pulse">{isAr ? 'جاري تحميل متاجرك...' : 'Loading your stores...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/30" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-emerald-900/10 border border-neutral-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900">
                    {isAr ? 'حذف المتجر' : 'Delete Store'}
                  </h2>
                  <p className="text-sm font-medium text-neutral-400">
                    {isAr ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning */}
            <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100/50">
              <p className="text-sm font-medium text-red-800 leading-relaxed">
                {isAr
                  ? `سيتم حذف متجر "${deleteTarget.storeName}" بشكل نهائي مع جميع المنتجات والطلبات والبيانات المرتبطة به.`
                  : `Store "${deleteTarget.storeName}" will be permanently deleted along with all its products, orders, and associated data.`
                }
              </p>
            </div>

            {/* Confirm by typing name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-neutral-700">
                {isAr
                  ? `اكتب اسم المتجر للتأكيد: "${deleteTarget.storeName}"`
                  : `Type the store name to confirm: "${deleteTarget.storeName}"`
                }
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError(''); }}
                placeholder={deleteTarget.storeName}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder-neutral-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-400/10 transition-all font-medium"
              />
              {deleteError && (
                <p className="mt-2 text-sm font-medium text-red-600 animate-in fade-in">{deleteError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl bg-neutral-100 py-3.5 text-sm font-bold text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting || deleteConfirmText !== deleteTarget.storeName}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-red-200"
              >
                {deleting
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <Trash2 className="h-5 w-5" />
                }
                {isAr ? 'حذف نهائي' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="border-b border-neutral-100 bg-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-50 blur-3xl opacity-50 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            {isAr ? 'متاجري' : 'My Stores'}
          </h1>
          <p className="mt-2 text-base font-medium text-neutral-500">
            {isAr ? 'اختر متجرًا للإدارة واستمتع بتحقيق المبيعات' : 'Select a store to manage or create a new one'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">{error}</div>
        )}

        {stores.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-100 bg-white py-24 shadow-xl shadow-emerald-900/5 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-6">
              <Store className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="mt-2 text-2xl font-black text-neutral-900">
              {isAr ? 'لا توجد متاجر بعد' : 'No stores yet'}
            </h2>
            <p className="mt-3 text-neutral-500 font-medium max-w-sm text-center px-4 leading-relaxed">
              {isAr ? 'أنشئ متجرك الأول في دقائق وابدأ البيع لآلاف العملاء بدون أي عمولة.' : 'Create your first store in minutes and start selling to thousands of customers with zero commission.'}
            </p>
            <Link
              href={`/${locale}/seller/onboarding`}
              className="mt-8 relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 px-8 py-4 font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-xl shadow-neutral-200 group"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              {isAr ? 'إنشاء متجر' : 'Create Store'}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store, i) => (
              <div
                key={store.id}
                className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/10 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${(i % 10) * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                {/* Delete button — top right/left */}
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(store); setDeleteConfirmText(''); setDeleteError(''); }}
                  className={`absolute ${isAr ? 'left-4' : 'right-4'} top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 bg-white/80 backdrop-blur md:outline outline-1 outline-neutral-100 shadow-sm`}
                  title={isAr ? 'حذف المتجر' : 'Delete store'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Card content — links to admin */}
                <Link href={`/${locale}/${store.slug}/admin`} className="relative block h-full p-8 z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Store className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">{store.storeName}</h3>
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-relaxed text-neutral-500">{store.storeDescription}</p>
                  
                  <div className={`mt-8 flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-emerald-600 transition-colors`}>
                    {isAr ? 'الدخول لإدارة المتجر' : 'Enter Management'}
                    <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </Link>
              </div>
            ))}

            {/* Create New Store card */}
            <Link
              href={`/${locale}/seller/onboarding`}
              className="group flex min-h-[240px] items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-900/5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${(stores.length % 10) * 50}ms` }}
            >
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="font-bold text-neutral-500 group-hover:text-emerald-700 transition-colors">
                  {isAr ? 'إنشاء متجر جديد' : 'Create New Store'}
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
