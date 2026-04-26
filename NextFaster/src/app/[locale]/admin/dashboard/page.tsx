'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Store, ShoppingBag, DollarSign, TrendingUp,
  LogOut, Settings, ChevronDown, CheckCircle, XCircle, Save, Search, Menu, X, RefreshCw,
} from 'lucide-react';

interface StoreRow {
  id: number;
  name: string;
  slug: string;
  isActive: number;
  createdAt: string;
  category: string;
  totalOrders: number;
  totalSubtotal: string;
  feesCollected: string;
  storeNetRevenue: string;
}

interface Overview {
  totalStores: number;
  totalOrders: number;
  totalSubtotal: string;
  totalFees: string;
  totalNetRevenue: string;
}

export default function SouqFlowDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [platformFee, setPlatformFee] = useState('0');
  const [feeInput, setFeeInput] = useState('0');
  const [savingFee, setSavingFee] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');
  const [expandedStoreId, setExpandedStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch('/api/souqflow/auth/me');
        if (!meRes.ok) { router.push(`/${locale}/admin/login`); return; }
        const meData = await meRes.json();
        setAdminName(meData.admin?.name ?? '');

        const dashRes = await fetch('/api/souqflow/dashboard');
        if (!dashRes.ok) throw new Error('Failed to load dashboard');
        const data = await dashRes.json();
        setOverview(data.overview);
        setStores(data.stores);
        setPlatformFee(data.platformFee);
        setFeeInput(data.platformFee);
      } catch {
        router.push(`/${locale}/admin/login`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, locale]);

  const handleSaveFee = async () => {
    setSavingFee(true);
    setFeeMsg('');
    try {
      const res = await fetch('/api/souqflow/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePerOrder: parseFloat(feeInput) }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setPlatformFee(feeInput);
      setFeeMsg('Saved!');
      const dashRes = await fetch('/api/souqflow/dashboard');
      if (dashRes.ok) {
        const data = await dashRes.json();
        setOverview(data.overview);
        setStores(data.stores);
      }
      setTimeout(() => setFeeMsg(''), 3000);
    } catch {
      setFeeMsg('Failed to save');
    } finally {
      setSavingFee(false);
    }
  };

  const handleToggleStore = async (storeId: number, currentIsActive: number) => {
    setTogglingId(storeId);
    try {
      const newIsActive = currentIsActive === 1 ? 0 : 1;
      const res = await fetch(`/api/souqflow/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      setStores((prev) => prev.map((s) => s.id === storeId ? { ...s, isActive: newIsActive } : s));
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const allCategories = Array.from(new Set(stores.map((s) => s.category))).sort();

  const filteredStores = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !categoryFilter || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 selection:bg-emerald-100 selection:text-emerald-900">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-10">
            <Link href={`/${locale}/admin/dashboard`} className="transition-transform active:scale-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="SouqFlow" className="h-10 w-auto object-contain" />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
               <NavLink active icon={<TrendingUp className="h-4 w-4" />}>Overview</NavLink>
               <NavLink icon={<Store className="h-4 w-4" />}>Stores</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">System Admin</span>
               <span className="text-sm font-black tracking-tight text-neutral-900">{adminName}</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`group flex h-12 w-12 items-center justify-center rounded-2xl border transition-all active:scale-90 ${menuOpen ? 'bg-neutral-900 border-neutral-900 text-white shadow-xl shadow-neutral-900/20' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform" />}
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-4 w-48 rounded-[1.5rem] border border-neutral-100 bg-white p-2 shadow-2xl shadow-neutral-900/10 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-neutral-50 mb-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Logged in as</p>
                     <p className="text-xs font-black truncate">{adminName}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/souqflow/auth/logout', { method: 'POST' });
                      router.push(`/${locale}/admin/login`);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        
        {/* ── SUMMARY SECTION ───────────────────────────────────────── */}
        <div className="mb-12 flex flex-col sm:flex-row items-end justify-between gap-6">
           <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border border-emerald-100/50">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Platform Real-Time Control
              </span>
              <h2 className="text-4xl font-black tracking-tighter text-neutral-900">System Dashboard</h2>
           </div>

           {/* Platform Fee Tool */}
           <div className="w-full sm:w-auto rounded-[2rem] bg-white p-4 shadow-xl shadow-emerald-900/5 ring-1 ring-neutral-100">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">EGP</span>
                   <input
                     type="number"
                     min="0"
                     step="0.5"
                     value={feeInput}
                     onChange={(e) => setFeeInput(e.target.value)}
                     className="w-full sm:w-40 rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-14 pr-4 text-sm font-black text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                   />
                 </div>
                 <button
                   onClick={handleSaveFee}
                   disabled={savingFee || feeInput === platformFee}
                   className="flex h-full w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-900/20"
                 >
                   {savingFee ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                   Update Fee
                 </button>
              </div>
              {feeMsg && (
                <div className={`mt-3 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top-1 ${feeMsg === 'Saved!' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {feeMsg}
                </div>
              )}
           </div>
        </div>

        {/* ── OVERVIEW STATS GRID ─────────────────────────────────── */}
        {overview && (
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Store className="h-6 w-6 text-emerald-600" />}
              label="Active Stores"
              value={overview.totalStores.toString()}
              desc="Physical & Digital"
            />
            <StatCard
              icon={<ShoppingBag className="h-6 w-6 text-emerald-600" />}
              label="Historical Orders"
              value={overview.totalOrders.toString()}
              desc="Total volume generated"
            />
            <StatCard
              icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
              label="Gross Revenue"
              value={`${parseFloat(overview.totalSubtotal).toFixed(2)} EGP`}
              desc="Total across all merchants"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
              label="Platform Fees"
              value={`${parseFloat(overview.totalFees).toFixed(2)} EGP`}
              desc="Total net revenue collected"
              highlight
            />
          </div>
        )}

        {/* ── STORES MANAGEMENT TABLE ───────────────────────────── */}
        <div className="rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-emerald-900/5 ring-1 ring-neutral-100 overflow-hidden">
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-2xl bg-neutral-900 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
               </div>
               <div>
                 <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase tracking-widest">Merchant Network</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-1">Managing {filteredStores.length} stores on platform</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-6 pr-10 text-xs font-black uppercase tracking-widest text-neutral-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                <input
                  type="text"
                  placeholder="SEARCH STORES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-11 pr-6 text-xs font-black placeholder-neutral-300 focus:border-emerald-500 focus:bg-white outline-none transition-all sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 px-2 pb-2">
            {filteredStores.length === 0 ? (
              <div className="py-24 text-center">
                 <div className="mx-auto h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-neutral-200" />
                 </div>
                 <p className="text-sm font-black uppercase tracking-widest text-neutral-300">No merchants found</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.id} className="group border-none mb-1">
                  {/* Store Card Row */}
                  <div
                    onClick={() => setExpandedStoreId(expandedStoreId === store.id ? null : store.id)}
                    className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 hover:bg-neutral-50 ${expandedStoreId === store.id ? 'bg-neutral-50 shadow-inner' : ''}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                       {/* Name & Slug */}
                       <div className="flex items-center gap-5 flex-1 min-w-[200px]">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] shadow-sm ring-1 transition-all group-hover:scale-110 ${store.isActive === 1 ? 'bg-emerald-50 ring-emerald-100' : 'bg-rose-50 ring-rose-100'}`}>
                             {store.isActive === 1 
                               ? <CheckCircle className="h-6 w-6 text-emerald-600" /> 
                               : <XCircle className="h-6 w-6 text-rose-500" />}
                          </div>
                          <div>
                            <p className="text-lg font-black tracking-tight text-neutral-900 group-hover:text-emerald-600 transition-colors">{store.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">/{store.slug}</span>
                               <span className="h-1 w-1 rounded-full bg-neutral-200" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">{store.category}</span>
                            </div>
                          </div>
                       </div>

                       {/* Stats Grid */}
                       <div className="grid grid-cols-3 gap-8 lg:gap-16 pr-4">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-300 mb-1">Orders</p>
                            <p className="text-sm font-black text-neutral-900">{store.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-300 mb-1">Total Rev</p>
                            <p className="text-sm font-black text-emerald-600">{parseFloat(store.totalSubtotal).toFixed(2)} <span className="text-[10px]">EGP</span></p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-300 mb-1">Fees</p>
                            <p className="text-sm font-black text-rose-500">{parseFloat(store.feesCollected).toFixed(2)} <span className="text-[10px]">EGP</span></p>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-end lg:w-10">
                          <ChevronDown className={`h-5 w-5 text-neutral-300 transition-transform duration-500 ${expandedStoreId === store.id ? 'rotate-180 text-emerald-600' : ''}`} />
                       </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {expandedStoreId === store.id && (
                    <div className="px-8 pb-10 pt-2 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-2 gap-6 rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-xl shadow-neutral-900/5 sm:grid-cols-4">
                        <DetailStat label="Orders volume" value={store.totalOrders.toString()} />
                        <DetailStat label="Gross Revenue" value={`${parseFloat(store.totalSubtotal).toFixed(2)} EGP`} />
                        <DetailStat label="Total Platform Fees" value={`${parseFloat(store.feesCollected).toFixed(2)} EGP`} color="text-rose-500" />
                        <DetailStat label="Merchant Payout" value={`${parseFloat(store.storeNetRevenue).toFixed(2)} EGP`} color="text-emerald-600" />
                      </div>
                      
                      <div className="mt-8 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <a
                             href={`/${locale}/${store.slug}`}
                             target="_blank"
                             className="group flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-lg shadow-neutral-900/10"
                           >
                             <Store className="h-3.5 w-3.5" />
                             Preview Store
                           </a>
                           <a
                             href={`/${locale}/admin/stores/${store.id}/orders`}
                             className="group flex items-center gap-2 rounded-2xl border border-neutral-100 bg-white px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-neutral-600 transition-all hover:bg-neutral-50 active:scale-95"
                           >
                             <ShoppingBag className="h-3.5 w-3.5" />
                             Order Logs
                           </a>
                        </div>


                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStore(store.id, store.isActive); }}
                          disabled={togglingId === store.id}
                          className={`sm:ml-auto flex items-center gap-2 rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                            store.isActive === 1
                              ? 'bg-rose-500 text-white shadow-rose-900/20 hover:bg-rose-600'
                              : 'bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700'
                          }`}
                        >
                          {togglingId === store.id
                            ? <RefreshCw className="h-4 w-4 animate-spin" />
                            : store.isActive === 1
                              ? <XCircle className="h-4 w-4" />
                              : <CheckCircle className="h-4 w-4" />}
                          {store.isActive === 1 ? 'Disable Access' : 'Restore Access'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, desc, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] ${highlight ? 'bg-neutral-900 border-neutral-900 shadow-neutral-900/20' : 'bg-white border-neutral-100 shadow-neutral-900/5 hover:border-emerald-200'}`}>
      <div className="relative z-10">
         <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] ${highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            {icon}
         </div>
         <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-neutral-400' : 'text-neutral-400'}`}>{label}</p>
         <p className={`mt-2 text-3xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-neutral-900'}`}>{value}</p>
         <p className={`mt-4 text-[10px] font-medium leading-relaxed opacity-60 ${highlight ? 'text-neutral-300' : 'text-neutral-500'}`}>{desc}</p>
      </div>
      {highlight && (
         <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-[60px]" />
      )}
    </div>
  );
}

function NavLink({ children, active, icon }: { children: React.ReactNode; active?: boolean; icon: React.ReactNode }) {
   return (
      <Link href="#" className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'}`}>
         {icon}
         {children}
      </Link>
   );
}

function DetailStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className={`text-lg font-black tracking-tight ${color || 'text-neutral-900'}`}>{value}</p>
    </div>
  );
}
