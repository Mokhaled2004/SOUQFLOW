'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { StoreProduct } from '../types';

interface Props {
  searchTerm: string;
  searchResults: StoreProduct[];
  isOpen: boolean;
  locale: string;
  onChange: (value: string) => void;
  onSelect: (product: StoreProduct) => void;
  onClose: () => void;
}

export function SearchDropdown({ searchTerm, searchResults, isOpen, locale, onChange, onSelect, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0" ref={wrapperRef}>
      <div className="relative flex-grow">
        <div className="relative">
          <Input
            ref={inputRef}
            autoCapitalize="off"
            autoCorrect="off"
            type="text"
            placeholder={locale === 'ar' ? 'ابحث...' : 'Search...'}
            value={searchTerm}
            onChange={(e) => onChange(e.target.value)}
            className="pr-12 font-sans font-medium sm:w-[300px] md:w-[375px]"
          />
          <X
            className={cn('absolute right-7 top-2 h-5 w-5 cursor-pointer text-muted-foreground', { hidden: !isOpen })}
            onClick={() => { onChange(''); onClose(); }}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full border border-gray-200 bg-white shadow-lg">
            <ScrollArea className="h-[300px]">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.slug}
                    className="flex cursor-pointer items-center p-2 hover:bg-gray-100"
                    onClick={() => { onSelect(item); inputRef.current?.blur(); }}
                  >
                    {item.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.image_url} alt="" className="h-10 w-10 object-cover pr-2" />
                      : <div className="h-10 w-10 shrink-0 bg-gray-100" />}
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'لا نتائج' : 'No results found'}</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
