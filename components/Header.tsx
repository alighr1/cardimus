"use client";
import Link from "next/link";
import { useT } from "./LangProvider";

export function Header() {
  const { lang, setLang, t } = useT();
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">Cardimus</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/history" className="text-blue-400">{t("nav.history")}</Link>
        <div className="flex overflow-hidden rounded-lg bg-white/10 text-xs" role="group" aria-label="Language">
          {(["en", "tr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-2.5 py-1.5 ${lang === l ? "bg-blue-600 font-semibold" : "text-white/60"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
