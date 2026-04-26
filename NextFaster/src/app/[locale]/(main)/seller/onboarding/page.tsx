import { getTranslations, getLocale } from 'next-intl/server';
import SellerOnboardingForm from '@/components/seller/SellerOnboardingForm';

export default async function SellerOnboardingPage() {
  const t = await getTranslations('seller.onboarding');
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-50/30 px-4 py-8 sm:py-12 relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background Aesthetics */}
      <div className="absolute right-0 top-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-50 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute left-0 bottom-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-teal-50 blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="mb-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            {t('pageTitle')}
          </h1>
          <p className="text-sm font-medium text-neutral-500 sm:text-base">{t('pageSubtitle')}</p>
        </div>
        <SellerOnboardingForm />
      </div>
    </div>
  );
}
