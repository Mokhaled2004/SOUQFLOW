'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, Search, AlertCircle, Clock, CheckCircle, XCircle, Truck, Package, 
  ClipboardList, ShoppingBag, Calendar, User, Phone, MapPin, DollarSign 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from './CustomDropdown';
import CustomCalendar from './CustomCalendar';

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
  pending: 'border-yellow-100 bg-yellow-50 text-yellow-700',
  confirmed: 'border-blue-100 bg-blue-50 text-blue-700',
  preparing: 'border-purple-100 bg-purple-50 text-purple-700',
  delivered: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  cancelled: 'border-red-100 bg-red-50 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  confirmed: <CheckCircle className="h-3.5 w-3.5" />,
  preparing: <Package className="h-3.5 w-3.5" />,
  delivered: <Truck className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

type DateFilterType = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';

export default function OrdersSection({ storeSlug, locale, isRTL }: Props) {
  const isAr = locale === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customDate, setCustomDate] = useState('');
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

    // Date filtering logic
    let matchesDate = true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();

    if (dateFilter === 'daily') {
      matchesDate = orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      matchesDate = orderDate >= oneWeekAgo;
    } else if (dateFilter === 'monthly') {
      matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'custom' && customDate) {
      matchesDate = orderDate.toDateString() === new Date(customDate).toDateString();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filterOptions = [
    { value: '', label: isAr ? 'جميع الحالات' : 'All Statuses' },
    ...STATUS_OPTIONS.map((s) => ({
      value: s,
      label: isAr ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1),
      icon: STATUS_ICONS[s],
    })),
  ];

  const dateFilterOptions = [
    { value: 'all', label: isAr ? 'جميع الأوقات' : 'All Time', icon: <Calendar className="h-3.5 w-3.5" /> },
    { value: 'daily', label: isAr ? 'اليوم' : 'Daily', icon: <Clock className="h-3.5 w-3.5" /> },
    { value: 'weekly', label: isAr ? 'هذا الأسبوع' : 'Weekly', icon: <Calendar className="h-3.5 w-3.5" /> },
    { value: 'monthly', label: isAr ? 'هذا الشهر' : 'Monthly', icon: <Calendar className="h-3.5 w-3.5" /> },
    { value: 'custom', label: isAr ? 'بتاريخ محدد' : 'By Date', icon: <Calendar className="h-3.5 w-3.5" /> },
  ];

  const statusOptions = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: isAr ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1),
    icon: STATUS_ICONS[s],
  }));

  return (
    <div className="rounded-[1.5rem] sm:rounded-[2.5rem] border border-neutral-100 bg-white shadow-2xl shadow-emerald-900/5 transition-all hover:border-neutral-200">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-5 sm:p-8 cursor-pointer hover:bg-neutral-50/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center gap-4 sm:gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl sm:rounded-[1.5rem] bg-neutral-900 text-white shadow-xl shadow-neutral-900/10">
            <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 uppercase tracking-widest">{isAr ? 'مركز الطلبات' : 'Order Control'}</h2>
            <div className="mt-1 flex items-center gap-2">
               <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAr ? `${filteredOrders.length} طلب` : `${filteredOrders.length} Orders`}
               </span>
            </div>
          </div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-50 transition-all ${isExpanded ? 'rotate-180 text-emerald-600 bg-emerald-50' : 'text-neutral-400'}`}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-50 p-4 sm:p-8">
          {error && (
            <div className={`mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-black uppercase tracking-widest text-red-700 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Filters Area */}
          <div className="mb-8 space-y-4">
            <div className={`flex flex-col gap-3 lg:flex-row lg:items-center ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300 ${isRTL ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث...' : 'SEARCH...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 text-xs font-black placeholder-neutral-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`}
                />
              </div>

              <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <CustomDropdown
                  value={statusFilter}
                  options={filterOptions}
                  onChange={setStatusFilter}
                  isAr={isAr}
                  className="w-full sm:w-44"
                  placeholder={isAr ? 'الحالة' : 'Status'}
                />
                <CustomDropdown
                  value={dateFilter}
                  options={dateFilterOptions}
                  onChange={(val) => setDateFilter(val as DateFilterType)}
                  isAr={isAr}
                  className="w-full sm:w-44"
                  placeholder={isAr ? 'الوقت' : 'Timeframe'}
                />
              </div>
            </div>

            {/* Custom Date Picker */}
            {dateFilter === 'custom' && (
              <div 
                className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-[1.5rem] border border-neutral-100 bg-neutral-50 p-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
              >
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{isAr ? 'تاريخ محدد:' : 'DATE:'}</span>
                <CustomCalendar
                  value={customDate}
                  onChange={setCustomDate}
                  isAr={isAr}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                 <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
                 <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-emerald-600" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Syncing...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center">
               <div className="mx-auto h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
                  <ShoppingBag className="h-8 w-8 text-neutral-200" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest text-neutral-300">No data found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="group rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-100 bg-white transition-all hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 cursor-pointer ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {/* Top part on mobile: Order # and basic info */}
                    <div className={`flex items-center gap-3 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-50 text-[10px] font-black text-neutral-400 border border-neutral-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                        #{order.id}
                      </div>

                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <p className="text-sm sm:text-base font-black tracking-tight text-neutral-900 truncate uppercase">{order.customerName}</p>
                        <div className={`mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                           <span className="text-[10px] font-bold text-neutral-400 tracking-widest">{order.customerPhone}</span>
                           <span className="hidden sm:block h-1 w-1 rounded-full bg-neutral-200" />
                           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom part on mobile: Status and Chevron */}
                    <div className={`flex items-center justify-between sm:justify-end gap-3 sm:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex flex-col items-end sm:hidden ${isRTL ? 'items-start' : 'items-end'}`}>
                         <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300">{isAr ? 'الإجمالي' : 'Revenue'}</p>
                         <p className="text-sm font-black text-emerald-600 tracking-tight">{parseFloat(order.total).toFixed(2)} LE</p>
                      </div>

                      <div className={`hidden lg:flex flex-col items-end gap-1 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                         <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300">Revenue</p>
                         <p className="text-base font-black text-emerald-600 tracking-tight">{parseFloat(order.total).toFixed(2)} <span className="text-xs uppercase">EGP</span></p>
                      </div>

                      <div onClick={(e) => e.stopPropagation()} className="shrink-0 w-28 sm:w-40">
                        <CustomDropdown
                          value={order.status}
                          options={statusOptions}
                          onChange={(val) => handleStatusChange(order.id, val)}
                          isAr={isAr}
                          className={STATUS_COLORS[order.status]}
                        />
                      </div>

                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${expandedOrderId === order.id ? 'bg-neutral-900 text-white rotate-180 shadow-lg' : 'bg-neutral-50 text-neutral-300 group-hover:text-emerald-600 group-hover:bg-emerald-50'}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`border-t border-neutral-50 bg-neutral-50/50 p-5 sm:p-8 ${isRTL ? 'text-right' : ''}`}>
                          <div className={`grid gap-6 sm:grid-cols-2 ${isRTL ? 'direction-rtl' : ''}`}>
                            {/* Simple Customer Info (Old Look) */}
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                <User className="h-3 w-3" /> {isAr ? 'بيانات العميل' : 'Customer Info'}
                              </p>
                              <div className="space-y-0.5">
                                <p className="text-sm font-black text-neutral-900 uppercase">{order.customerName}</p>
                                <p className="text-xs font-bold text-neutral-500">{order.customerPhone}</p>
                                <p className="text-xs font-bold text-neutral-500 leading-relaxed">{order.customerLocation}</p>
                              </div>
                            </div>

                            {/* Simple Pricing (Old Look) */}
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                <DollarSign className="h-3 w-3" /> {isAr ? 'التسعير' : 'Financials'}
                              </p>
                              <div className="space-y-1.5">
                                <div className={`flex justify-between text-xs font-bold text-neutral-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span>{isAr ? 'المجموع' : 'Subtotal'}</span>
                                  <span>{parseFloat(order.subtotal).toFixed(2)} LE</span>
                                </div>
                                <div className={`flex justify-between text-xs font-bold text-neutral-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span>{isAr ? 'الشحن' : 'Shipping'}</span>
                                  <span>{parseFloat(order.shippingFee).toFixed(2)} LE</span>
                                </div>
                                <div className={`flex justify-between text-sm font-black text-emerald-600 border-t border-neutral-200 mt-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                                  <span>{parseFloat(order.total).toFixed(2)} LE</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Inventory List (Full Names, No Truncation) */}
                          <div className="mt-6 space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                              <Package className="h-3 w-3" /> {isAr ? 'المنتجات' : 'Items'}
                            </p>
                            <div className="grid gap-2">
                              {order.items.map((item) => (
                                <div key={item.id} className={`flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-neutral-100 shadow-sm`}>
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-neutral-900 uppercase leading-tight">{item.name}</p>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                                      {item.quantity} × {item.unitPrice} LE
                                    </p>
                                  </div>
                                  <div className="flex justify-end pt-1 border-t border-neutral-50">
                                    <span className="text-xs font-black text-neutral-900">{parseFloat(item.lineTotal).toFixed(2)} LE</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
