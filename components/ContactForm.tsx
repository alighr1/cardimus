"use client";
import { useEffect, useMemo } from "react";
import type { Contact } from "@/lib/schema";
import { COUNTRIES, matchCountry } from "@/lib/countries";
import { localizedCountry } from "@/lib/i18n";
import { splitEmails } from "@/lib/emails";
import { useT } from "./LangProvider";
import { SearchSelect } from "./SearchSelect";

const FIELDS: { key: keyof Contact; label: Parameters<ReturnType<typeof useT>["t"]>[0]; type?: string }[] = [
  { key: "firstName", label: "field.firstName" },
  { key: "lastName", label: "field.lastName" },
  { key: "title", label: "field.title" },
  { key: "company", label: "field.company" },
  { key: "email", label: "field.email", type: "email" },
  { key: "phone", label: "field.phone", type: "tel" },
  { key: "mobile", label: "field.mobile", type: "tel" },
  { key: "website", label: "field.website", type: "url" },
  { key: "address", label: "field.address" },
  { key: "city", label: "field.city" },
  { key: "country", label: "field.country" },
  { key: "linkedin", label: "field.linkedin", type: "url" },
  { key: "notes", label: "field.notes" },
];

export function ContactForm({ value, onChange }: { value: Contact; onChange: (c: Contact) => void }) {
  // The stored country may be free text the list can't match; keep it selectable so nothing is lost.
  const { t, lang } = useT();
  const current = value.country ?? "";
  const matched = matchCountry(current);
  const countryOptions = useMemo(
    () => [
      { value: "", label: "—" },
      ...(current && !matched ? [{ value: current, label: t("field.notInList", { c: current }) }] : []),
      ...COUNTRIES.map((c) => ({ value: c.value, label: localizedCountry(c.value, c.name, lang) })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current && !matched ? current : "", lang],
  );

  // A card can print several emails; the CRM takes one, so with more than one the user picks which.
  const emailList = useMemo(() => splitEmails(value.emails, value.email), [value.emails, value.email]);
  const emailKey = emailList.join("|");
  const emailOptions = useMemo(() => emailList.map((e) => ({ value: e, label: e })), [emailKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const emailPicked = emailList.includes(value.email ?? "");
  useEffect(() => {
    // e.g. an older card whose email field holds "a@x.com, b@x.com": settle on one valid address.
    if (emailList.length > 1 && !emailPicked) onChange({ ...value, email: emailList[0], emails: emailList });
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 gap-3">
      {FIELDS.map(({ key, label, type }) =>
        key === "email" && emailList.length > 1 ? (
          <div key={key} className="block">
            <span className="text-xs text-white/50">{t(label)}</span>
            <div className="mt-1">
              <SearchSelect
                options={emailOptions}
                value={emailPicked ? (value.email as string) : emailList[0]}
                onChange={(v) => onChange({ ...value, email: v || emailList[0], emails: emailList })}
              />
            </div>
            <span className="mt-1 block text-xs text-yellow-200/80">{t("field.emailPick")}</span>
          </div>
        ) : key === "country" ? (
          <div key={key} className="block">
            <span className="text-xs text-white/50">{t(label)}</span>
            <div className="mt-1">
              <SearchSelect
                options={countryOptions}
                value={matched?.value ?? current}
                onChange={(v) => onChange({ ...value, country: v || null })}
                placeholder={t("field.selectCountry")}
              />
            </div>
          </div>
        ) : (
        <label key={key} className="block">
          <span className="text-xs text-white/50">{t(label)}</span>
          <input
            type={type ?? "text"}
            value={(value[key] as string | null) ?? ""}
            onChange={(e) =>
              onChange(
                key === "email"
                  ? { ...value, email: e.target.value || null, emails: e.target.value ? [e.target.value] : [] }
                  : { ...value, [key]: e.target.value || null },
              )
            }
            className="mt-1 w-full rounded-xl bg-white/10 px-3 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        ),
      )}
    </div>
  );
}
