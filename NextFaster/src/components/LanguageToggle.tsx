'use client';

import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { Suspense } from 'react';

function LanguageToggleInner() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const otherLocale = locale === 'en' ? 'ar' : 'en';

  // Replace the current locale segment in the pathname
  const newPathname = pathname.replace(`/${locale}`, `/${otherLocale}`);

  // Preserve existing query params
  const qs = searchParams.toString();
  const href = qs ? `${newPathname}?${qs}` : newPathname;

  return (
    <Link
      href={href}
      scroll={false}
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-bold tracking-wide">
        {locale === 'en' ? 'EN' : 'ع'}
      </span>
    </Link>
  );
}

export default function LanguageToggle() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-2">
        <Globe className="h-4 w-4 text-neutral-400" />
      </div>
    }>
      <LanguageToggleInner />
    </Suspense>
  );
}
