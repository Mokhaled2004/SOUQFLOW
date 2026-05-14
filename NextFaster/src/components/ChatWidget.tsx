'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Only show on the buyer dashboard
  const isDashboard = pathname === `/${locale}/buyer/dashboard`;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isDashboard) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      // Initialize an empty assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantText += chunk;
          
          // Update the last message with the accumulated text
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = assistantText;
            }
            return newMessages;
          });
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 font-sans sm:bottom-6 sm:right-6 sm:gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex h-[550px] max-h-[80vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] bg-white/90 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl ring-1 ring-neutral-200 sm:h-[500px] sm:w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-emerald-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">SouqFlowy</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Online Assistant</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-emerald-50 p-4">
                    <Sparkles className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-sm font-black text-neutral-900 uppercase">How can I help you today?</p>
                  <p className="mt-2 text-xs text-neutral-400">Ask about products, prices, or store availability.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200 shadow-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="markdown-content prose prose-sm max-w-none prose-emerald">
                        <ReactMarkdown 
                          components={{
                            a: ({ node, ...props }) => {
                              const isInternal = props.href?.startsWith('/');
                              if (isInternal) {
                                return <Link href={props.href!} className="text-emerald-600 font-black underline decoration-2 underline-offset-4 hover:text-emerald-700 transition-colors" {...props} />;
                              }
                              return <a target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-black underline decoration-2 underline-offset-4" {...props} />;
                            },
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
                            li: ({ children }) => <li className="list-none flex items-start gap-2"><span>•</span>{children}</li>
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 p-4 text-xs font-black uppercase tracking-widest text-neutral-400 ring-1 ring-neutral-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    SouqFlowy is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 pt-0">
              <div className="flex items-center gap-2 rounded-2xl bg-neutral-50 p-2 ring-1 ring-neutral-200 transition-all focus-within:ring-emerald-500/50 focus-within:bg-white">
                <input
                  type="text"
                  placeholder="Ask SouqFlowy..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-neutral-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-90 disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-900/40"
      >
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-7 w-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
