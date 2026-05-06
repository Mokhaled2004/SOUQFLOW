'use client';

import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationButtonProps {
  storeId?: number;
  locale?: string;
  className?: string;
}

export default function NotificationButton({ storeId, locale = 'ar', className = '' }: NotificationButtonProps) {
  const { permission, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications(storeId);
  const isAr = locale === 'ar';

  if (permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-400 sm:px-4 sm:py-2.5 ${className}`}>
        <BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span className="hidden sm:inline">{isAr ? 'الإشعارات محظورة' : 'Notifications blocked'}</span>
      </div>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      title={isSubscribed
        ? (isAr ? 'إيقاف الإشعارات' : 'Disable notifications')
        : (isAr ? 'تفعيل الإشعارات' : 'Enable notifications')}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 sm:px-4 sm:py-2.5 shadow-sm ${
        isSubscribed
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
      ) : isSubscribed ? (
        <BellRing className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
      ) : (
        <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
      )}
      {/* Text hidden on mobile, visible on sm+ */}
      <span className="hidden sm:inline">
        {isSubscribed
          ? (isAr ? 'الإشعارات مفعّلة' : 'Notifications on')
          : (isAr ? 'تفعيل الإشعارات' : 'Enable notifications')}
      </span>
    </button>
  );
}
