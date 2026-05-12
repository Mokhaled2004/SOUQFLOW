'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  isAr?: boolean;
  className?: string;
}

export default function CustomDropdown({ value, options, onChange, placeholder, isAr, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-2.5 text-sm font-black transition-all active:scale-[0.98] ${
          isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/5'
        } ${isAr ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2.5 truncate ${isAr ? 'flex-row-reverse' : ''}`}>
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute z-[100] mt-2 w-full min-w-[200px] overflow-hidden rounded-[1.5rem] border border-neutral-100 bg-white p-2 shadow-2xl shadow-emerald-900/10 ${isAr ? 'right-0' : 'left-0'}`}
          >
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-black transition-all ${
                    value === option.value
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  } ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-2.5 truncate ${isAr ? 'flex-row-reverse' : ''}`}>
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                  {value === option.value && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
