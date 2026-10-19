"use client";
import { useEffect } from "react";
import { useT } from "./LangProvider";
import { migrateLegacyCards, setStorageUser } from "@/lib/storage";

export function UserBar({ userId, name }: { userId: number; name: string }) {
  // Scope the on-device cache to this account (set during render so children's effects see it).
  setStorageUser(userId);
  const { t } = useT();

  useEffect(() => {
    migrateLegacyCards().then((n) => n && window.dispatchEvent(new Event("cards-changed")));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="mb-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
      <span className="truncate text-white/70">{name}</span>
      <button onClick={logout} className="text-blue-400">{t("nav.logout")}</button>
    </div>
  );
}
