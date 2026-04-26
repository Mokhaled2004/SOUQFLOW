import { Link } from "@/components/ui/link";
import { getCollections } from "@/lib/queries";
import { SearchDropdownComponent } from "@/components/search-dropdown";
import { MenuIcon } from "lucide-react";
import { Suspense } from "react";
import { Cart } from "@/components/cart";
import { AuthServer } from "@/app/auth.server";
import { Toaster } from "sonner";
import { WelcomeToast } from "@/app/welcome-toast";

export const revalidate = 86400;

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allCollections = await getCollections();

  return (
    <>
      <div>
        <header className="fixed top-0 z-10 flex h-[90px] w-[100vw] flex-grow items-center justify-between border-b-2 border-accent2 bg-background p-2 pb-[4px] pt-2 sm:h-[70px] sm:flex-row sm:gap-4 sm:p-4 sm:pb-[4px] sm:pt-0">
          <div className="flex flex-grow flex-col">
            <div className="absolute right-2 top-2 flex justify-end pt-2 font-sans text-sm hover:underline sm:relative sm:right-0 sm:top-0">
              <Suspense
                fallback={
                  <button className="flex flex-row items-center gap-1">
                    <div className="h-[20px]" />
                    <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
                      <polygon points="0,0 5,6 10,0"></polygon>
                    </svg>
                  </button>
                }
              >
                <AuthServer />
              </Suspense>
            </div>
            <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <Link
                prefetch={true}
                href="/storefront"
                className="text-4xl font-bold text-accent1"
              >
                NextFaster
              </Link>
              <div className="items flex w-full flex-row items-center justify-between gap-4">
                <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                  <SearchDropdownComponent />
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="relative">
                    <Link
                      prefetch={true}
                      href="/order"
                      className="text-lg text-accent1 hover:underline"
                    >
                      ORDER
                    </Link>
                    <Suspense>
                      <Cart />
                    </Suspense>
                  </div>
                  <Link
                    prefetch={true}
                    href="/order-history"
                    className="hidden text-lg text-accent1 hover:underline md:block"
                  >
                    ORDER HISTORY
                  </Link>
                  <Link
                    prefetch={true}
                    href="/order-history"
                    aria-label="Order History"
                    className="block text-lg text-accent1 hover:underline md:hidden"
                  >
                    <MenuIcon />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-grow font-mono pt-[85px] sm:pt-[70px]">
          <aside className="fixed left-0 hidden w-64 min-w-64 max-w-64 overflow-y-auto border-r p-4 md:block md:h-full">
            <h2 className="border-b border-accent1 text-sm font-semibold text-accent1">
              Choose a Category
            </h2>
            <ul className="flex flex-col items-start justify-center">
              {allCollections.map((collection) => (
                <li key={collection.slug} className="w-full">
                  <Link
                    prefetch={true}
                    href={`/storefront/${collection.slug}`}
                    className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <main
            className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4 pt-0 md:pl-64"
            id="main-content"
          >
            {children}
          </main>
        </div>
      </div>
      <footer className="fixed bottom-0 flex h-12 w-screen flex-col items-center justify-between space-y-2 border-t border-gray-400 bg-background px-4 font-sans text-[11px] sm:h-6 sm:flex-row sm:space-y-0">
        <div className="flex flex-wrap justify-center space-x-2 pt-2 sm:justify-start">
          <span className="hover:bg-accent2 hover:underline">Home</span>
          <span>|</span>
          <span className="hover:bg-accent2 hover:underline">FAQ</span>
          <span>|</span>
          <span className="hover:bg-accent2 hover:underline">Returns</span>
          <span>|</span>
          <span className="hover:bg-accent2 hover:underline">Careers</span>
          <span>|</span>
          <span className="hover:bg-accent2 hover:underline">Contact</span>
        </div>
        <div className="text-center sm:text-right">
          By using this website, you agree to check out the{" "}
          <Link
            href="https://github.com/ethanniser/NextFaster"
            className="font-bold text-accent1 hover:underline"
            target="_blank"
          >
            Source Code
          </Link>
        </div>
      </footer>
      <Suspense fallback={null}>
        <Toaster closeButton />
        <WelcomeToast />
      </Suspense>
    </>
  );
}
