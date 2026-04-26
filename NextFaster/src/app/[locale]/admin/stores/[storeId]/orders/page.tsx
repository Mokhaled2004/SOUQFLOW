'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft, Search, Clock, CheckCircle, XCircle, Truck, Package, ChevronDown, RefreshCw,
} from 'lucide-react';

interface OrderItem {
  id: number;
  itemType: string;
  name: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  status: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_THEMES: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  preparing: { color: 'text-purple-600', bg: 'bg-purple-50', icon: <Package className="h-3.5 w-3.5" /> },
  delivered: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Truck className="h-3.5 w-3.5" /> },
  cancelled: { color: 'text-rose-600', bg: 'bg-rose-50', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

export default function StoreOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const storeId = params.storeId as string;

  const [storeName, setStoreName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch('/api/souqflow/auth/me');
        if (!meRes.ok) { router.push(`/${locale}/admin/login`); return; }

        const res = await fetch(`/api/souqflow/stores/${storeId}/orders`);
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        setOrders(data.orders || []);

        const dashRes = await fetch('/api/souqflow/dashboard');
        if (dashRes.ok) {
          const dash = await dashRes.json();
          const store = dash.stores.find((s: { id: number; name: string }) => s.id === parseInt(storeId));
          if (store) setStoreName(store.name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId, locale, router]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.id.toString().includes(searchQuery);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.subtotal), 0);
  const byStatus = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 selection:bg-emerald-100 selection:text-emerald-900">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
          <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl h-14 items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => router.push(`/${locale}/admin/dashboard`)}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-500 transition-all hover:border-neutral-900 hover:text-neutral-900 active:scale-90"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black tracking-tight text-neutral-900">
                  {storeName || `Store #${storeId}`}
                </h1>
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-600">Merchant</span>
             </div>
          </div>

          <div className="text-right">
             <p className="text-sm font-black tracking-tight text-emerald-600">{totalRevenue.toFixed(2)} EGP</p>
             <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400 -mt-1">Revenue</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-[10px] font-black uppercase tracking-widest text-rose-500">
            {error}
          </div>
        )}

        {/* ── STATUS FILTER PILLS ──────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((s) => {
             const active = statusFilter === s;
             const theme = STATUS_THEMES[s];
             return (
               <button
                 key={s}
                 onClick={() => setStatusFilter(active ? '' : s)}
                 className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                   active
                     ? `${theme.bg} ${theme.color} ring-1 ring-current`
                     : 'bg-white border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'
                 }`}
               >
                 <span className={active ? 'animate-pulse' : 'text-neutral-200'}>{theme.icon}</span>
                 {s}
                 <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[8px] ${active ? 'bg-white/40' : 'bg-neutral-50'}`}>
                   {byStatus[s]}
                 </span>
               </button>
             );
          })}
        </div>

        {/* ── SEARCH HUB ───────────────────────────────────────────── */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
             <Search className="h-4 w-4 text-neutral-300" />
          </div>
          <input
            type="text"
            placeholder="FILTER BY NAME, PHONE OR ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-white border border-neutral-100 shadow-sm py-3.5 pl-11 pr-6 text-[10px] font-black uppercase tracking-widest placeholder-neutral-200 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        {/* ── ORDERS LOG ──────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-neutral-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
              {orders.length === 0 ? 'Empty log' : 'No records'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((order) => {
              const theme = STATUS_THEMES[order.status] || { bg: 'bg-neutral-50', color: 'text-neutral-500', icon: <Package className="h-3.5 w-3.5" /> };
              return (
                <div key={order.id} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100 shadow-sm transition-all hover:bg-neutral-50/50">
                  <div
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white font-mono text-[9px] font-black shadow-lg shadow-neutral-900/10">
                       #{order.id}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black tracking-tight text-neutral-900 uppercase">{order.customerName}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{order.customerPhone}</p>
                    </div>

                    <div className="hidden shrink-0 md:block">
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="shrink-0 text-right px-2">
                      <p className="text-sm font-black tracking-tight text-neutral-900">{parseFloat(order.total).toFixed(2)} EGP</p>
                    </div>

                    <div className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest ${theme.bg} ${theme.color}`}>
                      {theme.icon}
                      <span className="hidden sm:inline">{order.status}</span>
                    </div>

                    <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-300 transition-transform ${expandedId === order.id ? 'rotate-180 text-emerald-600' : ''}`} />
                  </div>

                  {expandedId === order.id && (
                    <div className="border-t border-neutral-100 bg-white p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-neutral-300 mb-2">Client Info</p>
                          <div className="space-y-1 text-[10px] font-bold text-neutral-600 uppercase">
                             <p className="text-neutral-900">{order.customerName}</p>
                             <p>{order.customerPhone}</p>
                             <p className="leading-relaxed">{order.customerLocation}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-neutral-300 mb-2">Pricing</p>
                          <div className="space-y-1.5 text-[9px] font-black uppercase tracking-widest">
                            <div className="flex justify-between text-neutral-400">
                               <span>Subtotal</span>
                               <span>{parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            {parseFloat(order.shippingFee) > 0 && (
                              <div className="flex justify-between text-neutral-400">
                                <span>Ship</span>
                                <span>{parseFloat(order.shippingFee).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-neutral-50 pt-2 text-neutral-900 text-[10px]">
                               <span>Total</span>
                               <span className="text-emerald-600">{parseFloat(order.total).toFixed(2)} EGP</span>
                            </div>
                          </div>
                        </div>

                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-neutral-300 mb-2">Order Manifest</p>
                           <div className="space-y-1.5">
                             {order.items.map((item) => (
                               <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-[9px] font-bold uppercase">
                                 <p className="text-neutral-700">{item.name} × {item.quantity}</p>
                                 <p className="text-neutral-900">{parseFloat(item.lineTotal).toFixed(2)}</p>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
