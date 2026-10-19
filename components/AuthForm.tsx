"use client";
import { useState } from "react";
import Link from "next/link";
import { useT } from "./LangProvider";
import { translateServerMessage } from "@/lib/i18n";

const input = "mt-1 w-full rounded-xl bg-white/10 px-3 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";
  const { t, lang } = useT();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      window.location.href = "/"; // full reload so the layout picks up the session
    } else {
      setError(translateServerMessage(data.error ?? "Something went wrong", lang));
      setBusy(false);
    }
  }

  const field = (name: string, label: string, type = "text", required = true, auto?: string) => (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      <input name={name} type={type} required={required} autoComplete={auto} minLength={name === "password" && register ? 8 : undefined} className={input} />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-3">
      <h1 className="mb-2 text-center text-2xl font-bold">{register ? t("auth.createAccount") : t("auth.logIn")}</h1>
      {register && (
        <div className="grid grid-cols-2 gap-3">
          {field("firstName", t("auth.firstName"), "text", true, "given-name")}
          {field("lastName", t("auth.lastName"), "text", true, "family-name")}
        </div>
      )}
      {field("email", t("auth.email"), "email", true, "email")}
      {field("password", register ? t("auth.passwordNew") : t("auth.password"), "password", true, register ? "new-password" : "current-password")}
      {error && <p className="rounded-xl bg-red-500/15 p-3 text-center text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="mt-2 rounded-xl bg-blue-600 py-3.5 text-base font-semibold disabled:opacity-50">
        {busy ? "…" : register ? t("auth.register") : t("auth.logIn")}
      </button>
      <p className="text-center text-sm text-white/60">
        {register ? t("auth.haveAccount") : t("auth.noAccount")}
        <Link href={register ? "/login" : "/register"} className="text-blue-400">
          {register ? t("auth.logIn") : t("auth.register")}
        </Link>
      </p>
    </form>
  );
}
