'use client';

import { Truck } from 'lucide-react';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';

interface ShippingSectionProps {
  selectedGovs: Set<string>;
  shippingRates: Record<string, string>;
  onToggle: (id: string) => void;
  onPriceChange: (id: string, price: string) => void;
  locale: string;
}

export default function ShippingSection({
  selectedGovs,
  shippingRates,
  onToggle,
  onPriceChange,
  locale,
}: ShippingSectionProps) {
  return (
    <div className="border-t border-neutral-100 pt-5">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <Truck className="h-4 w-4 text-sky-500" />
        {locale === 'ar' ? 'مناطق الشحن وأسعارها' : 'Shipping Areas & Prices'}
      </p>
      <p className="mb-4 text-xs text-neutral-500">
        {locale === 'ar'
          ? 'اختر المحافظات التي تشحن إليها وحدد سعر الشحن لكل منها'
          : 'Select governorates you ship to and set a price for each'}
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EGYPT_GOVERNORATES.map((gov) => (
          <div
            key={gov.id}
            className={`rounded-lg border p-3 transition ${
              selectedGovs.has(gov.id)
                ? 'border-sky-400 bg-sky-50'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedGovs.has(gov.id)}
                onChange={() => onToggle(gov.id)}
                className="h-4 w-4 rounded border-neutral-300 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-neutral-800">
                {locale === 'ar' ? gov.nameAr : gov.name}
              </span>
            </label>

            {selectedGovs.has(gov.id) && (
              <div className="mt-2 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={shippingRates[gov.id] || ''}
                  onChange={(e) => onPriceChange(gov.id, e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="shrink-0 text-xs text-neutral-500">LE</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
