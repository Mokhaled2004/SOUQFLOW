'use client';

import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationButtonProps {
  storeId?: number;
  className?: string;
}

export default function NotificationButton({ storeId, className = '' }: NotificationButtonProps) {
  const { permission, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications(storeId);

  if (permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-400 ${className}`}>
        <BellOff className="h-4 w-4" />
        الإشعارات محظورة
      </div>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
        isSubscribed
          ? 'border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          : 'border border-neutral-100 bg-white text-neutral-500 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isSubscribed ? 'الإشعارات مفعّلة' : 'تفعيل الإشعارات'}
    </button>
  );
}
