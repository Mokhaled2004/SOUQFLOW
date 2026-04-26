import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: {
    template: "%s | SouqFlow",
    default: "SouqFlow",
  },
  description: "The zero-commission platform for Egyptian sellers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const isArabic = pathname.startsWith("/ar");
  const lang = isArabic ? "ar" : "en";
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className="h-full">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex flex-col overflow-y-auto overflow-x-hidden antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
