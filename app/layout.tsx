import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">Cardimus</Link>
          <Link href="/history" className="text-sm text-blue-400">History</Link>
        </header>
        <main className="flex flex-1 flex-col pb-6">{children}</main>
        <RegisterSW />
      </body>
    </html>
  );
}
