import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import SouqFlowHeader from '@/components/SouqFlowHeader';
import SouqFlowFooter from '@/components/SouqFlowFooter';

const locales = ['en', 'ar'];

export const metadata: Metadata = {
  title: 'SouqFlow - Sell Online for Free',
  description: 'The zero-commission platform for Egyptian sellers',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
