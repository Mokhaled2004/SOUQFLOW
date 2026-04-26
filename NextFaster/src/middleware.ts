import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

const locales = ['en', 'ar'];
const defaultLocale = 'ar';

// next-intl middleware handles locale detection and routing
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Routes that require authentication (matched against pathname without locale prefix)
const protectedPatterns = [
  /\/seller\/stores/,
  /\/seller\/onboarding/,
  /\/[^/]+\/admin/,
  /\/[^/]+\/products/,
  /\/[^/]+\/orders/,
  /\/[^/]+\/analytics/,
  /\/[^/]+\/settings/,
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Strip locale prefix to check protected routes
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, '');
  const isProtectedRoute = protectedPatterns.some(pattern => pattern.test(pathnameWithoutLocale));

  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value;
    const locale = pathname.split('/')[1] || defaultLocale;

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
  }

  // Always run intl middleware so requestLocale is set correctly for server components
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and uploaded files
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|images).*)',
  ],
};
