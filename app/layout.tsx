import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { LangProvider } from "@/components/LangProvider";
import { Header } from "@/components/Header";
import { LANG_COOKIE, LANGS, detectLang, type Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Cardimus",
  description: "Scan business cards with AI",
  appleWebApp: { capable: true, title: "Cardimus", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f17",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Saved choice wins; otherwise follow the browser language (Turkish if it asks for it).
  const saved = (await cookies()).get(LANG_COOKIE)?.value as Lang | undefined;
  const lang: Lang = saved && LANGS.includes(saved) ? saved : detectLang((await headers()).get("accept-language"));
  return (
    <html lang={lang}>
      <body className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <LangProvider initial={lang}>
          <Header />
          <main className="flex flex-1 flex-col pb-6">{children}</main>
        </LangProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
