'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Settings, Package, Users, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

interface Store {
  id: number;
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  email?: string;
  phone?: string;
  primaryLocation?: string;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch('/api/seller/my-store');
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/${locale}/auth/login`);
            return;
          }
          throw new Error('Failed to fetch store');
        }
        const data = await response.json();
        setStore(data.store);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [locale, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${locale}`);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Store not found'}</p>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{store.storeName}</h1>
              <p className="mt-1 text-neutral-600">{store.storeDescription}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-red-600 transition-all hover:bg-red-100"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Products</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">0</p>
              </div>
              <Package className="h-12 w-12 text-sky-100" />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">0</p>
              </div>
              <Users className="h-12 w-12 text-green-100" />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">0 LE</p>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-100" />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Store Status</p>
                <p className="mt-2 text-lg font-bold text-green-600">Active</p>
              </div>
              <Settings className="h-12 w-12 text-orange-100" />
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Products Section */}
          <div className="rounded-lg border border-neutral-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-sky-600" />
              <h2 className="text-xl font-bold text-neutral-900">Products</h2>
            </div>
            <p className="mb-6 text-neutral-600">Manage your store products, pricing, and inventory</p>
            <Link
              href={`/${locale}/seller/products`}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
            >
              Manage Products
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Orders Section */}
          <div className="rounded-lg border border-neutral-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-900">Orders</h2>
            </div>
            <p className="mb-6 text-neutral-600">View and manage customer orders</p>
            <Link
              href={`/${locale}/seller/orders`}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
            >
              View Orders
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Analytics Section */}
          <div className="rounded-lg border border-neutral-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-neutral-900">Analytics</h2>
            </div>
            <p className="mb-6 text-neutral-600">View sales, revenue, and customer insights</p>
            <Link
              href={`/${locale}/seller/analytics`}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-600"
            >
              View Analytics
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Settings Section */}
          <div className="rounded-lg border border-neutral-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <Settings className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-neutral-900">Settings</h2>
            </div>
            <p className="mb-6 text-neutral-600">Update store information and preferences</p>
            <Link
              href={`/${locale}/seller/settings`}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Store Settings
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Store Info */}
        <div className="mt-12 rounded-lg border border-neutral-200 bg-white p-8">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Store Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-neutral-600">WhatsApp Number</p>
              <p className="mt-2 font-semibold text-neutral-900">{store.whatsappNumber}</p>
            </div>
            {store.email && (
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="mt-2 font-semibold text-neutral-900">{store.email}</p>
              </div>
            )}
            {store.phone && (
              <div>
                <p className="text-sm text-neutral-600">Phone</p>
                <p className="mt-2 font-semibold text-neutral-900">{store.phone}</p>
              </div>
            )}
            {store.primaryLocation && (
              <div>
                <p className="text-sm text-neutral-600">Location</p>
                <p className="mt-2 font-semibold text-neutral-900">{store.primaryLocation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
