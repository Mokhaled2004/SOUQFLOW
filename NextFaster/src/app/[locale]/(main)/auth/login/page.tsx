import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  const t = await getTranslations('auth.login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">
            {t('pageTitle')}
          </h1>
          <p className="text-neutral-600">{t('pageSubtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
