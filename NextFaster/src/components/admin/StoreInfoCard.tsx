import { Edit3, Phone, Mail, MapPin, Briefcase, FileText, Truck } from 'lucide-react';
import InfoRow from './InfoRow';
import { Store } from '@/types/store';
import { EGYPT_GOVERNORATES } from '@/constants/egypt-governorates';

interface StoreInfoCardProps {
  store: Store;
  selectedGovs: Set<string>;
  shippingRates: Record<string, string>;
  onEdit: () => void;
  locale: string;
  isRTL: boolean;
}

export default function StoreInfoCard({
  store,
  selectedGovs,
  shippingRates,
  onEdit,
  locale,
  isRTL,
}: StoreInfoCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-7 shadow-sm">
      <div className={`mb-6 flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-black text-neutral-900">
          {locale === 'ar' ? 'معلومات المتجر' : 'Store Information'}
        </h2>
        <button
          onClick={onEdit}
          className="shrink-0 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm"
        >
          <Edit3 className="h-4 w-4" />
          {locale === 'ar' ? 'تعديل' : 'Edit'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow icon={<Phone className="h-4 w-4" />} label={locale === 'ar' ? 'واتساب' : 'WhatsApp'} value={store.whatsappNumber} isRTL={isRTL} />
        <InfoRow icon={<Mail className="h-4 w-4" />} label={locale === 'ar' ? 'البريد' : 'Email'} value={store.email} isRTL={isRTL} />
        <InfoRow icon={<MapPin className="h-4 w-4" />} label={locale === 'ar' ? 'الموقع' : 'Location'} value={store.primaryLocation} isRTL={isRTL} />
        <InfoRow icon={<Briefcase className="h-4 w-4" />} label={locale === 'ar' ? 'نوع النشاط' : 'Business Type'} value={store.businessType} isRTL={isRTL} />
        <InfoRow icon={<FileText className="h-4 w-4" />} label={locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID'} value={store.taxId} isRTL={isRTL} />
      </div>

      {selectedGovs.size > 0 && (
        <div className="mt-5 border-t border-neutral-100 pt-5">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className={`mb-3 inline-flex items-center gap-2 text-sm font-bold text-neutral-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Truck className="h-4 w-4 text-emerald-500" />
              {locale === 'ar' ? 'مناطق الشحن' : 'Shipping Areas'}
            </p>
          </div>
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            {Array.from(selectedGovs).map((g) => {
              const gov = EGYPT_GOVERNORATES.find((x) => x.id === g);
              return (
                <span key={g} className="rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100/50">
                  {locale === 'ar' ? gov?.nameAr : gov?.name} — {shippingRates[g] || '?'} LE
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
