import { Suspense } from 'react';
import { AuthServer } from '@/app/auth.server';
import { Toaster } from 'sonner';

/**
 * Layout for the public store page.
 * Wraps children so we can use server-side AuthServer (same as storefront/layout.tsx).
 * Does NOT include the SouqFlow global header/footer — the store page renders its own.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <Toaster closeButton />
      </Suspense>
    </>
  );
}

// Export AuthServer so the client page can import it via a server boundary
export { AuthServer };
