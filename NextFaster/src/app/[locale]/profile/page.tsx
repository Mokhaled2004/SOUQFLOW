'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ShoppingBag, ChevronDown, Package, Clock, CheckCircle,
  XCircle, Truck, ArrowLeft, User, Save, Loader2,
  ClipboardList, Eye, EyeOff,
} from 'lucide-react';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';

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
  notes: string | null;
  status: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  phone: string;
  governorate: string | null;
  locationDetail: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  preparing: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />,
  confirmed: <CheckCircle className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />,
  preparing: <Package className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />,
  delivered: <Truck className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />,
  cancelled: <XCircle className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />,
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

function ProfilePageInner() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';

  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);

  // ── Profile state ──
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Orders state ──
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push(`/${locale}/auth/login?redirect=/${locale}/profile`);
          return;
        }
        const meData = await meRes.json();
        const u = meData.user as UserProfile;
        setProfile(u);
        setUsername(u.username ?? '');
        setPhone(u.phone ?? '');
        setGovernorate(u.governorate ?? '');
        setLocationDetail(u.locationDetail ?? '');

        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body: Record<string, string> = { username, phone, governorate, locationDetail };
      if (newPassword.trim()) body.password = newPassword.trim();

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        setNewPassword('');
        setTimeout(() => setSaved(false), 2500);
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-neutral-100 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-neutral-50 ${isAr ? 'direction-rtl' : ''} animate-in fade-in duration-700`}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">

        {/* Page header */}
        <div className={`mb-10 flex flex-row items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
           <div className={`flex items-center gap-3 sm:gap-5 ${isAr ? 'flex-row-reverse' : ''}`}>
             {/* Avatar placeholder */}
             <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-white shadow-xl ring-1 ring-neutral-100 shrink-0">
               <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-xl sm:text-2xl font-black text-emerald-600 uppercase">
                  {profile?.username?.charAt(0)}
               </div>
             </div>
             <div className={isAr ? 'text-right' : ''}>
               <h1 className="text-xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none whitespace-nowrap">
                 {isAr ? `${profile?.username}، مرحباً` : `Hi, ${profile?.username}`}
               </h1>
             </div>
           </div>

           <button
             onClick={() => router.back()}
             className={`flex h-9 sm:h-10 items-center gap-2 rounded-xl bg-white px-3 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 shadow-sm ring-1 ring-neutral-100 transition-all hover:bg-neutral-50 hover:text-emerald-600 active:scale-95 shrink-0 ${isAr ? 'flex-row' : ''}`}
           >
             <ArrowLeft className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isAr ? 'rotate-180 order-2' : ''}`} />
             <span className="hidden xs:inline">{isAr ? 'العودة للمتجر ' : 'Back to Store'}</span>
             <span className="inline xs:hidden uppercase">{isAr ? 'عودة' : 'Back'}</span>
           </button>
        </div>

        {/* Tabs */}
        <div className={`mb-10 flex gap-2 rounded-2xl bg-white p-1.5 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 active:scale-95'
            }`}
          >
            <User className="h-4 w-4" />
            {isAr ? 'ملفي الشخصي' : 'My Profile'}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 active:scale-95'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {isAr ? 'طلباتي' : 'My Orders'}
            {orders.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/5 ring-1 ring-neutral-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className={`flex items-center gap-4 bg-neutral-50/50 p-6 sm:p-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/50 text-emerald-600 ring-1 ring-emerald-100">
                 <User className="h-6 w-6" />
              </div>
              <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">{isAr ? 'معلوماتي الشخصية' : 'Personal Information'}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'إدارة بيانات حسابك وتفضيلاتك' : 'Manage your account details & preferences'}</p>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'الاسم' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'text-right' : ''}`}
                    placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'text-right' : ''}`}
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'المحافظة' : 'Governorate'}
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={governorate}
                      onChange={setGovernorate}
                      isRTL={isAr}
                      placeholder={isAr ? 'اختر المحافظة' : 'Select governorate'}
                      options={EGYPT_GOVERNORATES.map((g) => ({
                        value: isAr ? g.nameAr : g.name,
                        label: isAr ? g.nameAr : g.name,
                      }))}
                    />
                  </div>
                </div>

                {/* Location detail */}
                <div>
                  <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'العنوان التفصيلي' : 'Detailed Address'}
                  </label>
                  <input
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    className={`w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'text-right' : ''}`}
                    placeholder={isAr ? 'الحي، الشارع، رقم المبنى...' : 'District, street, building no...'}
                  />
                </div>

                {/* New password */}
                <div className="sm:col-span-2">
                  <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'كلمة مرور جديدة' : 'Security Checkpoint'}
                    <span className="mx-2 font-black text-neutral-300"> | </span>
                    <span className="font-bold text-neutral-300 lowercase">{isAr ? 'اتركها فارغة إذا لم تريد التغيير' : 'leave blank to keep current'}</span>
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-2xl border-2 border-neutral-100 bg-white py-4 text-sm font-bold text-neutral-900 shadow-sm placeholder-neutral-300 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isAr ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12'}`}
                      placeholder={isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-neutral-300 transition-colors hover:text-emerald-500 ${isAr ? 'left-4' : 'right-4'}`}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-5 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : saved ? (
                  <>{isAr ? '✓ تم تحديث البيانات بنجاح' : '✓ Profile Updated Successfuly'}</>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {isAr ? 'حفظ كافة التغييرات' : 'Save all changes'}
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/5 ring-1 ring-neutral-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className={`flex items-center gap-4 bg-neutral-50/50 p-6 sm:p-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/50 text-emerald-600 ring-1 ring-emerald-100">
                 <ShoppingBag className="h-6 w-6" />
              </div>
              <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">{isAr ? 'تاريخ الطلبات' : 'Order History'}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {isAr ? `لديك ${orders.length} طلب سابق في سجلنا` : `You have ${orders.length} previous orders tracked`}
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in duration-700">
                <div className="relative mb-6">
                   <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-20" />
                   <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-200">
                      <ShoppingBag className="h-10 w-10" />
                   </div>
                </div>
                <p className="text-xl font-black text-neutral-900 uppercase tracking-tight">{isAr ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}</p>
                <p className="mt-2 max-w-xs text-xs font-black uppercase tracking-widest text-neutral-400 leading-relaxed">
                  {isAr ? 'ابدأ التسوق من أفضل المتاجر المصرية لملء هذه المساحة' : 'Start shopping from Egypt\'s best stores to fill this space'}
                </p>
                <button
                   onClick={() => router.push(`/${locale}/buyer/dashboard`)}
                   className="mt-8 rounded-xl bg-emerald-600 px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                >
                  {isAr ? 'تصفح المتاجر الآن' : 'Browse Stores Now'}
                </button>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.03]">
                      {/* Order summary row */}
                      <div
                        className={`flex cursor-pointer items-center gap-4 p-5 sm:p-6 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-50 text-sm font-black text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          #{order.id}
                        </div>

                        <div className={`min-w-0 flex-1 ${isAr ? 'text-right' : ''}`}>
                          <p className="truncate text-sm font-black text-neutral-900 uppercase tracking-tight">
                            {order.items.map((i) => i.name).join(', ')}
                          </p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">{formatDate(order.createdAt)}</p>
                        </div>

                        <div className={`flex flex-col items-end gap-2 ${isAr ? 'items-start' : ''}`}>
                           <span className="shrink-0 text-base font-black text-neutral-900 whitespace-nowrap">
                             {parseFloat(order.total).toFixed(2)} <span className="text-[10px] uppercase text-neutral-400">{isAr ? 'ج.م' : 'EGP'}</span>
                           </span>

                           <div className={`group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-700'}`}>
                             {STATUS_ICONS[order.status]}
                             <span className="">
                               {isAr ? STATUS_LABELS_AR[order.status] : order.status}
                             </span>
                           </div>
                        </div>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 team transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600">
                          <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedOrderId === order.id && (
                        <div className={`border-t border-neutral-100 bg-neutral-50/30 p-5 sm:p-8 animate-in slide-in-from-top-4 duration-500 ${isAr ? 'text-right' : ''}`}>
                          <div className="grid gap-8 sm:grid-cols-2">
                             {/* Items List */}
                             <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
                               <div className={`mb-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                 <Package className="h-4 w-4 text-emerald-600" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'تفاصيل السلة' : 'Basket Details'}</p>
                               </div>
                               <div className="space-y-4">
                                 {order.items.map((item) => (
                                   <div key={item.id} className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                                     <div className={`min-w-0 flex-1 ${isAr ? 'text-right' : ''}`}>
                                        <p className="truncate text-sm font-bold text-neutral-900">{item.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Qty: {item.quantity}</p>
                                     </div>
                                     <span className="shrink-0 text-sm font-black text-neutral-700">
                                       {parseFloat(item.lineTotal).toFixed(2)} <span className="text-[9px] uppercase">{isAr ? 'ج.م' : 'EGP'}</span>
                                     </span>
                                   </div>
                                 ))}
                               </div>
                               
                               {/* Pricing summary */}
                               <div className="mt-8 space-y-2 border-t border-dashed border-neutral-200 pt-6">
                                  <div className={`flex justify-between text-xs font-bold text-neutral-500 ${isAr ? 'flex-row-reverse' : ''}`}>
                                    <span>{isAr ? 'سعر المنتجات' : 'Base Amount'}</span>
                                    <span>{parseFloat(order.subtotal).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                  </div>
                                  {parseFloat(order.shippingFee) > 0 && (
                                    <div className={`flex justify-between text-xs font-bold text-neutral-500 ${isAr ? 'flex-row-reverse' : ''}`}>
                                      <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                                      <span>{parseFloat(order.shippingFee).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                  )}
                                  <div className={`flex justify-between border-t border-neutral-100 pt-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-sm font-black uppercase tracking-tight text-neutral-900">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                                    <span className="text-xl font-black text-emerald-600">
                                      {parseFloat(order.total).toFixed(2)} <span className="text-xs">{isAr ? 'ج.م' : 'EGP'}</span>
                                    </span>
                                  </div>
                               </div>
                             </div>

                             {/* Logistics & Notes */}
                             <div className="space-y-6">
                               <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
                                 <div className={`mb-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                   <Truck className="h-4 w-4 text-emerald-600" />
                                   <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'معلومات التوصيل' : 'Logistics'}</p>
                                 </div>
                                 <p className="text-sm font-bold leading-relaxed text-neutral-700">{order.customerLocation}</p>
                               </div>

                               {order.notes && order.notes.trim() && (
                                 <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-100 border-l-4 border-emerald-500">
                                   <div className={`mb-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                     <ClipboardList className="h-4 w-4 text-emerald-600" />
                                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isAr ? 'ملاحظات العميل' : 'Special Instructions'}</p>
                                   </div>
                                   <p className="text-sm font-bold text-neutral-700 italic border-l-2 border-neutral-100 pl-4">"{order.notes}"</p>
                                 </div>
                               )}
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    }>
      <ProfilePageInner />
    </Suspense>
  );
}

// ── Custom Dropdown Component ─────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  isRTL
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  isRTL: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative w-full ${isRTL ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`w-full flex items-center justify-between rounded-2xl border-2 border-neutral-100 bg-white px-4 py-4 text-sm font-bold text-neutral-900 transition-all hover:bg-neutral-50 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
              className={`w-full block px-4 py-3 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === '' ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                className={`w-full block px-4 py-3 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === opt.value ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
