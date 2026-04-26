'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, AlertCircle, Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

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

interface Props {
  storeSlug: string;
  locale: string;
  isRTL: boolean;
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  preparing: <Package className="h-3 w-3" />,
  delivered: <Truck className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export default function OrdersSection({ storeSlug, locale, isRTL }: Props) {
  const isAr = locale === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [storeSlug]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/store/${storeSlug}/orders`);
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/seller/store/${storeSlug}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.id.toString().includes(searchQuery);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all overflow-hidden hover:border-neutral-200">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-5 sm:p-7 cursor-pointer hover:bg-neutral-50/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100/80 shadow-inner border border-neutral-200/50">
            <ChevronDown
              className={`h-5 w-5 text-neutral-600 transition-transform ${isExpanded ? '' : isRTL ? 'rotate-180' : '-rotate-90'}`}
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900">{isAr ? 'الطلبات' : 'Orders'}</h2>
            <p className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
              {isAr ? `${filteredOrders.length} طلب` : `${filteredOrders.length} orders`}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 p-4 sm:p-6">
          {error && (
            <div className={`mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Filters */}
          <div className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={isAr ? 'ابحث باسم العميل أو الهاتف أو رقم الطلب...' : 'Search by name, phone or order #...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`}
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="">{isAr ? 'جميع الحالات' : 'All statuses'}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{isAr ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              {isAr ? 'لا توجد طلبات' : 'No orders yet'}
            </div>
          ) : (
            <div className="space-y-3 overflow-x-auto">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-200 overflow-hidden min-w-full sm:min-w-0">
                  {/* Order row — scrollable on mobile */}
                  <div
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-neutral-50 transition overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {/* Order # */}
                    <span className="text-xs font-mono text-neutral-400 shrink-0">#{order.id}</span>

                    {/* Customer */}
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                      <p className="font-semibold text-neutral-900 text-xs sm:text-sm truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-500 hidden sm:block">{order.customerPhone}</p>
                    </div>

                    {/* Total */}
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 shrink-0 whitespace-nowrap">
                      {parseFloat(order.total).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                    </span>

                    {/* Status badge + selector */}
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`rounded-full px-2 sm:px-3 py-1.5 text-xs font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm ${STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-700'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{isAr ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date — hidden on mobile */}
                    <span className="text-xs text-neutral-400 shrink-0 hidden md:block whitespace-nowrap">{formatDate(order.createdAt)}</span>

                    <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded order details */}
                  {expandedOrderId === order.id && (
                    <div className={`border-t border-neutral-100 bg-neutral-50 p-3 sm:p-4 overflow-x-auto ${isRTL ? 'text-right' : ''}`}>
                      <div className={`grid gap-4 sm:grid-cols-2 min-w-full ${isRTL ? 'text-right' : ''}`}>
                        {/* Customer info */}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-500 mb-2">{isAr ? 'بيانات العميل' : 'Customer Info'}</p>
                          <p className="text-sm text-neutral-700 truncate">{order.customerName}</p>
                          <p className="text-sm text-neutral-700 truncate">{order.customerPhone}</p>
                          <p className="text-sm text-neutral-700 break-words">{order.customerLocation}</p>
                          <p className="text-xs text-neutral-400 mt-1 whitespace-nowrap">{formatDate(order.createdAt)}</p>
                        </div>

                        {/* Pricing */}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-500 mb-2">{isAr ? 'التسعير' : 'Pricing'}</p>
                          <div className={`flex justify-between text-sm text-neutral-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span>{isAr ? 'المجموع' : 'Subtotal'}</span>
                            <span className="shrink-0">{parseFloat(order.subtotal).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                          </div>
                          <div className={`flex justify-between text-sm text-neutral-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span>{isAr ? 'الشحن' : 'Shipping'}</span>
                            <span className="shrink-0">{parseFloat(order.shippingFee).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                          </div>
                          <div className={`flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-200 mt-1 pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                            <span className="shrink-0">{parseFloat(order.total).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-neutral-500 mb-2">{isAr ? 'المنتجات' : 'Items'}</p>
                        <div className="space-y-1 overflow-x-auto">
                          {order.items.map((item) => (
                            <div key={item.id} className={`flex items-center justify-between text-sm whitespace-nowrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="text-neutral-700 truncate">{item.name} × {item.quantity}</span>
                              <span className="font-medium text-neutral-900 shrink-0">{parseFloat(item.lineTotal).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
