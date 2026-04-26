'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Package, BarChart2 } from 'lucide-react';

interface AnalyticsRow {
  period: string;
  totalOrders: number;
  totalSubtotal: string;
  totalPlatformFees: string;
}

interface TopProduct {
  productSlug: string | null;
  name: string;
  totalQty: number;
  totalRevenue: string;
}

interface Summary {
  totalOrders: number;
  totalSubtotal: string;
  totalFees: string;
}

interface Props {
  storeSlug: string;
  locale: string;
  isRTL: boolean;
}

type Period = 'day' | 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, { en: string; ar: string }> = {
  day:   { en: 'Daily',   ar: 'يومي' },
  week:  { en: 'Weekly',  ar: 'أسبوعي' },
  month: { en: 'Monthly', ar: 'شهري' },
  all:   { en: 'All Time', ar: 'كل الوقت' },
};

export default function StoreSettingsSection({ storeSlug, locale, isRTL }: Props) {
  const isAr = locale === 'ar';
  const [period, setPeriod] = useState<Period>('day');
  const [loading, setLoading] = useState(true);
  const [platformFee, setPlatformFee] = useState('0');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const fetchData = async (p: Period) => {
    setLoading(true);
    try {
      const queryPeriod = p === 'all' ? 'day' : p;
      const res = await fetch(`/api/seller/store/${storeSlug}/analytics?period=${queryPeriod}`);
      if (!res.ok) {
        console.error('Analytics API error:', res.status, await res.text());
        return;
      }
      const data = await res.json();
      setPlatformFee(data.platformFee);
      setSummary(data.summary);
      setAnalytics(data.analytics);
      setTopProducts(data.topProducts);
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(period); }, [storeSlug, period]);

  const handlePeriod = (p: Period) => { setPeriod(p); };

  // Format period label based on period type
  const formatPeriodLabel = (periodStr: string, periodType: Period): string => {
    if (periodType === 'day') {
      return periodStr; // YYYY-MM-DD
    } else if (periodType === 'week') {
      // Format: "2026-W17" -> "Week 17, 2026"
      const match = periodStr.match(/(\d{4})-W(\d{2})/);
      if (match) {
        const year = match[1];
        const week = parseInt(match[2], 10);
        return isAr ? `الأسبوع ${week}، ${year}` : `Week ${week}, ${year}`;
      }
      return periodStr;
    } else if (periodType === 'month') {
      // Format: "2026-01" -> "January 2026"
      const date = new Date(periodStr + '-01');
      const monthName = date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
      return monthName;
    }
    return periodStr;
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>

      {/* Fee Stats */}
      <div className="rounded-2xl border border-neutral-100 bg-gradient-to-br from-emerald-900 to-neutral-900 p-6 shadow-lg shadow-emerald-900/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <DollarSign className="w-64 h-64 text-white" />
        </div>
        <div className={`relative z-10 mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner border border-white/5 backdrop-blur-md">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-black text-white">{isAr ? 'رسوم المنصة' : 'Platform Fees'}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FeeCard
            label={isAr ? 'الرسوم لكل طلب' : 'Fee per order'}
            value={`${platformFee} ${isAr ? 'ج.م' : 'EGP'}`}
            sub={isAr ? 'محدد بواسطة SouqFlow' : 'Set by SouqFlow'}
            color="emerald"
          />
          <FeeCard
            label={isAr ? 'إجمالي الطلبات' : 'Total orders'}
            value={summary?.totalOrders.toString() ?? '—'}
            color="purple"
          />
          <FeeCard
            label={isAr ? 'إجمالي الرسوم' : 'Total fees'}
            value={summary ? `${parseFloat(summary.totalFees).toFixed(2)} ${isAr ? 'ج.م' : 'EGP'}` : '—'}
            color="orange"
          />
        </div>
      </div>

      {/* Analytics */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:border-neutral-200">
        <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50/80 shadow-inner border border-emerald-100/50">
              <BarChart2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-neutral-900">{isAr ? 'التحليلات' : 'Analytics'}</h3>
          </div>
          {/* Period tabs */}
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {(['day', 'week', 'month', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriod(p)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  period === p
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
                }`}
              >
                {isAr ? PERIOD_LABELS[p].ar : PERIOD_LABELS[p].en}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        {summary && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{isAr ? 'الطلبات' : 'Orders'}</p>
              <p className="mt-2 text-2xl font-black text-neutral-900">{summary.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{isAr ? 'الإيرادات' : 'Revenue'}</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">{parseFloat(summary.totalSubtotal).toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{isAr ? 'الرسوم' : 'Fees'}</p>
              <p className="mt-2 text-2xl font-black text-orange-500">{parseFloat(summary.totalFees).toFixed(2)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : analytics.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">
            {isAr ? 'لا توجد بيانات بعد' : 'No data yet'}
          </div>
        ) : (
          /* Analytics table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className={`pb-2 text-xs font-semibold text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isAr ? 'الفترة' : 'Period'}
                  </th>
                  <th className="pb-2 text-center text-xs font-semibold text-neutral-400">
                    {isAr ? 'الطلبات' : 'Orders'}
                  </th>
                  <th className="pb-2 text-center text-xs font-semibold text-neutral-400">
                    {isAr ? 'الإيرادات' : 'Revenue'}
                  </th>
                  <th className={`pb-2 text-xs font-semibold text-neutral-400 ${isRTL ? 'text-left' : 'text-right'}`}>
                    {isAr ? 'الرسوم' : 'Fees'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {analytics.map((row) => (
                  <tr key={row.period} className="hover:bg-neutral-50">
                    <td className={`py-2.5 font-medium text-neutral-800 ${isRTL ? 'text-right' : ''}`}>
                      {formatPeriodLabel(row.period, period)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                        <ShoppingBag className="h-3 w-3" />
                        {row.totalOrders}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {parseFloat(row.totalSubtotal).toFixed(2)}
                      </span>
                    </td>
                    <td className={`py-2.5 font-semibold text-orange-600 ${isRTL ? 'text-left' : 'text-right'}`}>
                      {parseFloat(row.totalPlatformFees).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:border-neutral-200">
        <div className={`mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50/80 shadow-inner border border-emerald-100/50">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-black text-neutral-900">{isAr ? 'الأكثر مبيعاً' : 'Top Selling Products'}</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : topProducts.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            {isAr ? 'لا توجد مبيعات بعد' : 'No sales yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className={`pb-2 text-xs font-semibold text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isAr ? 'المنتج' : 'Product'}
                  </th>
                  <th className="pb-2 text-center text-xs font-semibold text-neutral-400">
                    {isAr ? 'الكمية' : 'Qty Sold'}
                  </th>
                  <th className={`pb-2 text-xs font-semibold text-neutral-400 ${isRTL ? 'text-left' : 'text-right'}`}>
                    {isAr ? 'الإيراد' : 'Revenue'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {topProducts.map((p, i) => (
                  <tr key={p.productSlug ?? i} className="hover:bg-neutral-50">
                    <td className={`py-2.5 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 shadow-sm">
                          {i + 1}
                        </span>
                        <span className="font-bold text-neutral-800 truncate max-w-[140px] sm:max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                        <Package className="h-3 w-3" />
                        {p.totalQty}
                      </span>
                    </td>
                    <td className={`py-2.5 font-semibold text-green-600 ${isRTL ? 'text-left' : 'text-right'}`}>
                      {parseFloat(p.totalRevenue).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FeeCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color: 'emerald' | 'purple' | 'orange';
}) {
  const colors = {
    emerald: 'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-inner',
    purple: 'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-inner',
    orange: 'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-inner',
  };
  return (
    <div className={`rounded-lg p-3 ${colors[color]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="mt-0.5 text-base font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}
