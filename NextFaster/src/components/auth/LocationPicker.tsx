'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, X } from 'lucide-react';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  isRTL: boolean;
}

export default function LocationPicker({ value, onChange, isRTL }: LocationPickerProps) {
  const t = useTranslations('auth');
  const [input, setInput] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const predefinedLocations = [
    { id: 'cairo', label: t('signup.cairo') },
    { id: 'giza', label: t('signup.giza') },
    { id: 'alexandria', label: t('signup.alexandria') },
  ];

  const filteredLocations = predefinedLocations.filter((loc) =>
    loc.label.toLowerCase().includes(input.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectLocation = (location: { id: string; label: string }) => {
    setInput(location.label);
    onChange(location.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInput('');
    onChange('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className={`absolute top-3 h-5 w-5 text-neutral-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={t('signup.typeLocation')}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`w-full rounded-lg border border-neutral-300 bg-white py-3 text-neutral-900 placeholder-neutral-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute top-3 h-5 w-5 text-neutral-400 hover:text-neutral-600 ${isRTL ? 'left-3' : 'right-3'}`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-10">
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => handleSelectLocation(location)}
              className="w-full px-4 py-3 text-left hover:bg-sky-50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0 border-neutral-100"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-900">{location.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && input && filteredLocations.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-10 px-4 py-3 text-neutral-500 text-sm">
          {t('signup.noLocations')}
        </div>
      )}
    </div>
  );
}
