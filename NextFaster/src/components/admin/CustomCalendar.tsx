'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from './Portal';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  isAr?: boolean;
}

export default function CustomCalendar({ value, onChange, isAr }: Props) {
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [isOpen, setIsOpen] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const dayNamesEn = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dayNamesAr = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
      
      days.push(
        <button
          key={d}
          onClick={() => handleDateSelect(d)}
          className={`group relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${
            isSelected 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
              : 'text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          {d}
          {isToday && !isSelected && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-emerald-500" />}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-2.5 text-xs font-black transition-all hover:border-emerald-500 active:scale-[0.98] ${isOpen ? 'ring-4 ring-emerald-500/10 border-emerald-500' : ''} ${isAr ? 'flex-row-reverse' : ''}`}
      >
        <CalendarIcon className="h-4 w-4 text-emerald-500" />
        <span className="text-neutral-900 tracking-widest uppercase">
          {value ? new Date(value).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (isAr ? 'اختر التاريخ' : 'SELECT DATE')}
        </span>
      </button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] bg-neutral-900/40 backdrop-blur-sm" 
                onClick={() => setIsOpen(false)} 
              />
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border border-neutral-100 bg-white p-6 shadow-2xl pointer-events-auto"
                >
                  {/* Header */}
                  <div className={`mb-4 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button onClick={handlePrevMonth} className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-50 hover:text-emerald-600 transition-colors">
                      <ChevronLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-900">
                      {isAr ? monthNamesAr[currentDate.getMonth()] : monthNamesEn[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </p>
                    <button onClick={handleNextMonth} className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-50 hover:text-emerald-600 transition-colors">
                      <ChevronRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className={`mb-2 grid grid-cols-7 gap-1 text-center ${isAr ? 'direction-rtl' : ''}`}>
                    {(isAr ? dayNamesAr : dayNamesEn).map((d) => (
                      <div key={d} className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className={`grid grid-cols-7 gap-1 ${isAr ? 'direction-rtl' : ''}`}>
                    {renderDays()}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex justify-between border-t border-neutral-50 pt-3">
                    <button 
                      onClick={() => handleDateSelect(new Date().getDate())} 
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {isAr ? 'اليوم' : 'TODAY'}
                    </button>
                    <button 
                      onClick={() => { onChange(''); setIsOpen(false); }} 
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {isAr ? 'مسح' : 'CLEAR'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
