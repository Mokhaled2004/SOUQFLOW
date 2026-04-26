'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  accountName?: string;
  statusMessage?: string;
  chatMessage?: string;
  avatar?: string;
  isRTL?: boolean;
  locale?: string;
}

// WhatsApp SVG icon (official green logo)
function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        d="M23.5 8.5A10.44 10.44 0 0 0 16 5.5C10.75 5.5 6.5 9.75 6.5 15c0 1.64.43 3.24 1.25 4.65L6.5 26.5l7.05-1.85A10.44 10.44 0 0 0 16 25.5c5.25 0 9.5-4.25 9.5-9.5 0-2.54-.99-4.93-2.78-6.72l-.22-.28zM16 23.75c-1.4 0-2.77-.37-3.97-1.08l-.28-.17-2.93.77.78-2.86-.18-.3A8.69 8.69 0 0 1 7.25 15c0-4.83 3.93-8.75 8.75-8.75 2.34 0 4.54.91 6.19 2.56A8.7 8.7 0 0 1 24.75 15c0 4.83-3.92 8.75-8.75 8.75zm4.8-6.56c-.26-.13-1.55-.77-1.79-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.03-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.56-1.45-1.82-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.14s.92 2.49 1.05 2.66c.13.17 1.81 2.76 4.38 3.87.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.51-.62 1.72-1.22.21-.6.21-1.11.15-1.22-.06-.11-.23-.17-.49-.3z"
        fill="white"
      />
    </svg>
  );
}

export default function WhatsAppButton({
  phoneNumber,
  accountName = 'Support',
  statusMessage,
  chatMessage,
  avatar,
  isRTL = false,
  locale = 'en',
}: WhatsAppButtonProps) {
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultChatMessage = isAr ? 'مرحباً، كيف يمكنني مساعدتك؟' : 'Hello, how can we help you?';
  const defaultStatus = isAr ? 'متاح 24 × 7' : 'Available 24 × 7';
  const placeholder = isAr ? 'اكتب شيئاً...' : 'Type something...';

  const displayMessage = chatMessage || defaultChatMessage;
  const displayStatus = statusMessage || defaultStatus;

  // Current time for the chat bubble timestamp
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    const msg = inputValue.trim() || displayMessage;
    const encoded = encodeURIComponent(msg);
    // Clean phone number (remove spaces, dashes, +)
    const clean = phoneNumber.replace(/[\s\-\(\)]/g, '');
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
    setInputValue('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      className={`fixed bottom-6 z-50 ${isRTL ? 'left-6' : 'right-6'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Chat popup */}
      {isOpen && (
        <div
          className={`absolute bottom-20 ${isRTL ? 'left-0' : 'right-0'} w-[320px] rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 bg-white`}
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Header — dark green like WhatsApp */}
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatar ? (
                <img src={avatar} alt={accountName} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-lg font-bold text-white">
                  {accountName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075E54] bg-[#25D366]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{accountName}</p>
              <p className="text-xs text-green-200">{displayStatus}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="shrink-0 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat body — WhatsApp wallpaper style */}
          <div
            className="px-4 py-5 min-h-[140px]"
            style={{
              background: '#ECE5DD',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8bdb4' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Store message bubble */}
            <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
                <p className="text-xs font-semibold text-[#075E54] mb-0.5">{accountName}</p>
                <p className="text-sm text-neutral-800">{displayMessage}</p>
                <div className={`mt-1 flex items-center gap-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <span className="text-[10px] text-neutral-400">{timeStr}</span>
                  {/* Double tick */}
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5l3 3 5-7" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 5l3 3 5-7" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 border-t border-neutral-200 bg-[#F0F0F0] px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 rounded-full border-0 bg-white px-4 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none shadow-sm"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              onClick={handleSend}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow transition hover:bg-[#1ebe5d] active:scale-95"
            >
              <Send className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button with pulse ring */}
      <div className="relative">
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:bg-[#1ebe5d] hover:shadow-xl active:scale-95"
          title={isAr ? 'تواصل معنا عبر واتساب' : 'Chat with us on WhatsApp'}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <WhatsAppIcon size={28} />
          )}
        </button>
      </div>
    </div>
  );
}
