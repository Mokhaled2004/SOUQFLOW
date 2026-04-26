'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogCategory } from '../types';

interface SidebarListProps {
  catalog: CatalogCategory[];
  selectedSubcategory: string;
  onSubcategoryClick: (slug: string) => void;
}

function SidebarList({ catalog, selectedSubcategory, onSubcategoryClick }: SidebarListProps) {
  return (
    <ul className="flex flex-col items-start justify-center">
      {catalog.map((cat) => (
        <li key={cat.id} className="w-full">
          <span className="block w-full py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {cat.name}
          </span>
          {cat.subcategories.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => onSubcategoryClick(sub.slug)}
              className={cn(
                'block w-full py-1 pl-2 text-left text-xs text-gray-800 hover:bg-accent2 hover:underline',
                selectedSubcategory === sub.slug && 'bg-accent2 font-semibold underline',
              )}
            >
              {sub.name}
            </button>
          ))}
        </li>
      ))}
    </ul>
  );
}

interface Props extends SidebarListProps {
  locale: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function StoreSidebar({ catalog, selectedSubcategory, onSubcategoryClick, locale, mobileOpen, onMobileClose }: Props) {
  const heading = locale === 'ar' ? 'اختر فئة' : 'Choose a Category';
  const isRTL = locale === 'ar';

  return (
    <>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className={`absolute top-0 flex h-full w-64 flex-col overflow-y-auto bg-background p-4 shadow-xl ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex-1 border-b border-accent1 pb-1 text-sm font-semibold text-accent1">{heading}</h2>
              <button onClick={onMobileClose} className="ml-2 text-gray-500 hover:text-gray-800" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarList catalog={catalog} selectedSubcategory={selectedSubcategory} onSubcategoryClick={(s) => { onSubcategoryClick(s); onMobileClose(); }} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`fixed hidden w-64 min-w-64 max-w-64 overflow-y-auto p-4 md:block md:h-full ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}`}>
        <h2 className="border-b border-accent1 text-sm font-semibold text-accent1">{heading}</h2>
        <SidebarList catalog={catalog} selectedSubcategory={selectedSubcategory} onSubcategoryClick={onSubcategoryClick} />
      </aside>
    </>
  );
}
