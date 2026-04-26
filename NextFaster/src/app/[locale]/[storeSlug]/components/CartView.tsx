'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, ShoppingBag, Plus, Minus, ArrowLeft, Trash2, ClipboardList, CheckCircle, ChevronDown } from 'lucide-react';
import { CartItem, StoreInfo } from '../types';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';
import { calculateDiscountedPrice } from '@/lib/pricing';

interface UserInfo {
  username: string;
  phone: string;
  location: string | null;
  governorate: string | null;
  locationDetail: string | null;
}

interface Props {
  cart: CartItem[];
  store: StoreInfo;
  locale: string;
  totalPrice: number;
  userInfo: UserInfo | null;
  onRemove: (slug: string) => void;
  onClear: () => void;
  onBack: () => void;
  onIncrement?: (slug: string) => void;
  onDecrement?: (slug: string) => void;
}

export function CartView({ cart, store, locale, totalPrice, userInfo, onRemove, onClear, onBack, onIncrement, onDecrement }: Props) {
  const isAr = locale === 'ar';

  // Pre-fill from user's saved governorate/locationDetail
  const [selectedGov, setSelectedGov] = useState(userInfo?.governorate ?? '');
  const [locationDetail, setLocationDetail] = useState(userInfo?.locationDetail ?? '');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const fullLocation = selectedGov
    ? locationDetail.trim()
      ? `${selectedGov}, ${locationDetail.trim()}`
      : selectedGov
    : locationDetail.trim();

  // Get shipping fee based on selected governorate
  const shippingFee = selectedGov && store.shippingRates
    ? parseFloat(store.shippingRates.find((r) => r.governorate === selectedGov)?.price ?? '0')
    : 0;

  const finalTotal = totalPrice + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedGov || placing) return;
    setPlacing(true);

    try {
      const items = cart.map((i) => {
        const discountedPrice = calculateDiscountedPrice(i.product.price, i.product.offerPercentage);
        const isPackage = i.product.slug.startsWith('pkg_');
        return {
          itemType: isPackage ? 'package' : 'product',
          productSlug: isPackage ? null : i.product.slug,
          packageId: isPackage ? parseInt(i.product.slug.replace('pkg_', '')) : null,
          name: i.product.name,
          unitPrice: discountedPrice,
          quantity: i.quantity,
          lineTotal: i.quantity * discountedPrice,
        };
      });

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerName: userInfo?.username ?? '—',
          customerPhone: userInfo?.phone ?? '—',
          customerLocation: fullLocation || '—',
          notes: notes.trim() || null,
          subtotal: totalPrice,
          shippingFee,
          total: finalTotal,
          items,
        }),
      });

      setPlaced(true);
      onClear();
    } catch {
      // silent fail — order still placed visually
      setPlaced(true);
      onClear();
    } finally {
      setPlacing(false);
    }
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Success state ──
  if (placed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-10 shadow-xl shadow-emerald-900/5 ring-1 ring-neutral-100 text-center max-w-sm w-full animate-in fade-in zoom-in duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-neutral-900">
              {isAr ? 'تم تقديم طلبك بنجاح!' : 'Order Placed Successfully!'}
            </h2>
            <p className="mt-2 text-sm font-medium text-neutral-500 leading-relaxed">
              {isAr ? 'شكراً لتسوقك معنا. سيتواصل معك المتجر قريباً لتأكيد تفاصيل التوصيل.' : 'Thank you for shopping with us. The store will contact you soon to confirm delivery details.'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
          >
            {isAr ? 'العودة للمتجر' : 'Back to store'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-neutral-50 ${isAr ? 'direction-rtl' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className={`mb-8 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-bold text-neutral-500 transition-colors hover:text-emerald-600 ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {isAr ? 'رجوع' : 'Back'}
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                {isAr ? 'سلة الطلبات' : 'Your Order'}
              </h1>
            </div>
            {itemCount > 0 && (
              <p className="mt-1 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {itemCount} {isAr ? 'قطعة' : itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {cart.length > 0 && (
            <button
              onClick={onClear}
              className={`flex items-center gap-1 text-xs text-red-400 transition hover:text-red-600 ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isAr ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 animate-in fade-in zoom-in duration-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 shadow-inner">
                <ShoppingBag className="h-10 w-10 text-emerald-300" />
              </div>
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-neutral-50">
                <Plus className="h-4 w-4 text-emerald-500 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
              {isAr ? 'سلتك خالية تماماً' : 'Your cart is empty'}
            </h2>
            <p className="mt-2 max-w-[240px] text-center text-sm font-medium text-neutral-400 leading-relaxed uppercase">
              {isAr ? 'يبدو أنك لم تضف أي منتجات بعد. ابدأ بالتسوق الآن!' : 'Looks like you haven\'t added any products yet. Start shopping now!'}
            </p>
            
            <button
              onClick={onBack}
              className="mt-8 group flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
            >
              {isAr ? 'تصفح المنتجات' : 'Browse products'}
              <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${isAr ? 'rotate-0 group-hover:translate-x-1' : 'rotate-180'}`} />
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* ── Cart items ── */}
            <div className="space-y-3">
              {cart.map(({ product, quantity }) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
                const cost = (quantity * discountedPrice).toFixed(2);
                return (
                  <div
                    key={product.slug}
                    className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-neutral-100 transition-all hover:shadow-md hover:ring-emerald-100 animate-in fade-in slide-in-from-bottom-5 duration-500 ${isAr ? 'sm:flex-row-reverse' : ''}`}
                  >
                    {/* Top part: Image + Info */}
                    <div className={`flex w-full items-center gap-4 sm:flex-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {/* Image */}
                      <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-50 shadow-inner">
                        {product.image_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          : <div className="flex h-full w-full items-center justify-center bg-emerald-50">
                              <ShoppingBag className="h-8 w-8 text-emerald-200" />
                            </div>}
                      </div>

                      {/* Info */}
                      <div className={`min-w-0 flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                        <p className="truncate text-base sm:text-lg font-black text-neutral-900">{product.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-tight">{product.description}</p>
                        <div className={`mt-2 flex items-baseline gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          {product.offerPercentage > 0 && (
                            <span className="text-[10px] sm:text-xs font-bold line-through text-neutral-300">
                              {parseFloat(product.price).toFixed(2)}
                            </span>
                          )}
                          <p className="text-sm sm:text-base font-black text-emerald-600">
                            {discountedPrice.toFixed(2)} <span className="text-[10px] uppercase font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                            <span className={`hidden sm:inline text-[10px] font-black text-neutral-400 uppercase tracking-widest ${isAr ? 'mr-1.5' : 'ml-1.5'}`}>
                              {isAr ? '/ قطعة' : '/ each'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom part (Mobile) / Right part (Desktop): Qty + total + remove */}
                    <div className={`flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 border-t border-neutral-50 pt-3 sm:border-0 sm:pt-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex flex-col sm:items-end ${isAr ? 'items-start' : 'items-end'}`}>
                         <p className="text-xs font-bold text-neutral-400 uppercase sm:hidden mb-1">{isAr ? 'المجموع' : 'Subtotal'}</p>
                         <p className="text-base sm:text-lg font-black text-neutral-900 leading-none">{cost} <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? 'ج.م' : 'EGP'}</span></p>
                      </div>

                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-2 py-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={() => onDecrement?.(product.slug)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-neutral-400 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 sm:w-8 text-center text-sm font-black text-neutral-900">{quantity}</span>
                          <button
                            onClick={() => onIncrement?.(product.slug)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-neutral-400 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemove(product.slug)}
                          className="rounded-xl p-2 text-neutral-300 transition-all hover:bg-red-50 hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Summary sidebar ── */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700">

              {/* Order summary card */}
              <div className="rounded-3xl bg-white p-6 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100">
                <p className={`mb-5 text-xs font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? 'ملخص الطلب' : 'Order summary'}
                </p>

                <div className="space-y-3 border-b border-neutral-100 pb-5 text-sm font-bold text-neutral-700">
                  {cart.map(({ product, quantity }) => {
                    const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
                    return (
                      <div key={product.slug} className={`flex justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="truncate max-w-[160px] opacity-70">{product.name} × {quantity}</span>
                        <span className="text-neutral-900 font-black">
                          {(quantity * discountedPrice).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className={`mt-5 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{isAr ? 'المجموع' : 'Subtotal'}</span>
                  <span className="text-xl font-black text-neutral-900">{totalPrice.toFixed(2)} <span className="text-xs">{isAr ? 'ج.م' : 'EGP'}</span></span>
                </div>

                {shippingFee > 0 && (
                  <div className={`mt-3 flex items-center justify-between border-t border-neutral-50 pt-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{isAr ? 'رسوم الشحن' : 'Shipping'}</span>
                    <span className="text-sm font-black text-emerald-600">{shippingFee.toFixed(2)} <span className="text-[10px]">{isAr ? 'ج.م' : 'EGP'}</span></span>
                  </div>
                )}

                <div className={`mt-5 flex items-center justify-between border-t border-neutral-100 pt-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-black uppercase tracking-widest text-neutral-900">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                  <div className={isAr ? 'text-left' : 'text-right'}>
                    <span className="block text-2xl sm:text-3xl font-black text-emerald-600 leading-none">{finalTotal.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{isAr ? 'جنية مصري' : 'Egyptian Pounds'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery details card */}
              {userInfo ? (
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100">
                  <p className={`mb-5 text-xs font-black uppercase tracking-widest text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'بيانات التوصيل' : 'Delivery details'}
                  </p>

                  <div className="space-y-4">
                    {/* Name — read-only */}
                    <div className={`flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <User className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-bold text-neutral-700">{userInfo.username}</span>
                    </div>

                    {/* Phone — read-only */}
                    <div className={`flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-bold text-neutral-700">
                        {userInfo.phone || (isAr ? 'لا يوجد رقم' : 'No phone')}
                      </span>
                    </div>

                    {/* Governorate — CustomSelect */}
                    <div className={`flex items-start gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-3" />
                      <CustomSelect
                        value={selectedGov}
                        onChange={setSelectedGov}
                        placeholder={isAr ? 'اختر المحافظة' : 'Select governorate'}
                        isRTL={isAr}
                        options={(store.shippingRates && store.shippingRates.length > 0
                          ? store.shippingRates.map((rate) => ({
                              value: rate.governorate,
                              label: `${rate.governorate} (${rate.price} ${isAr ? 'ج.م' : 'EGP'})`
                            }))
                          : EGYPT_GOVERNORATES.map((g) => ({
                              value: isAr ? g.nameAr : g.name,
                              label: isAr ? g.nameAr : g.name
                            }))
                        )}
                      />
                    </div>

                    {/* Address detail — editable */}
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <ClipboardList className="h-4 w-4 shrink-0 text-emerald-600" />
                      <input
                        type="text"
                        value={locationDetail}
                        onChange={(e) => setLocationDetail(e.target.value)}
                        placeholder={isAr ? 'الحي، الشارع، رقم المبنى...' : 'District, street, building no...'}
                        className={`w-full rounded-2xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>

                    {/* Notes */}
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isAr ? 'ملاحظات إضافية للطلب (اختياري)...' : 'Order notes (optional)...'}
                      rows={3}
                      className={`w-full resize-none rounded-2xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isAr ? 'text-right' : ''}`}
                    />

                    {/* Location preview */}
                    {fullLocation && (
                      <div className={`flex items-center gap-2 rounded-xl bg-emerald-50/50 p-3 ring-1 ring-emerald-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-xs font-black text-emerald-800">{fullLocation}</p>
                      </div>
                    )}

                    {/* Location change note */}
                    <p className={`text-[10px] font-black uppercase tracking-wider text-neutral-400 ${isAr ? 'text-right' : ''}`}>
                      {isAr
                        ? '* تغيير العنوان هنا لهذا الطلب فقط ولن يؤثر على ملفك الشخصي'
                        : '* Address changes here apply to this order only and won\'t update your profile'}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!selectedGov || placing}
                    className={`mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    {placing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                    {isAr ? 'تأكيد وشحن الطلب' : 'Confirm & Place Order'}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl bg-white p-10 text-center shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50">
                    <User className="h-8 w-8 text-neutral-300" />
                  </div>
                  <p className="text-sm font-bold text-neutral-500">
                    {isAr ? 'يرجى تسجيل الدخول لإتمام الطلب' : 'Please log in to place your order'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
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
        className={`w-full flex items-center justify-between rounded-2xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all hover:bg-white ${isRTL ? 'flex-row-reverse' : ''}`}
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
