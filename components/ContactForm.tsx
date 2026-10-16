"use client";
import { useMemo } from "react";
import type { Contact } from "@/lib/schema";
import { COUNTRIES, matchCountry } from "@/lib/countries";
import { SearchSelect } from "./SearchSelect";

const FIELDS: { key: keyof Contact; label: string; type?: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "mobile", label: "Mobile", type: "tel" },
  { key: "website", label: "Website", type: "url" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "linkedin", label: "LinkedIn", type: "url" },
  { key: "notes", label: "Notes" },
];

export function ContactForm({ value, onChange }: { value: Contact; onChange: (c: Contact) => void }) {
  // The stored country may be free text the list can't match; keep it selectable so nothing is lost.
  const current = value.country ?? "";
  const matched = matchCountry(current);
  const countryOptions = useMemo(
    () => [
      { value: "", label: "—" },
      ...(current && !matched ? [{ value: current, label: `${current} (not in list)` }] : []),
      ...COUNTRIES.map((c) => ({ value: c.value, label: c.name })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current && !matched ? current : ""],
  );

  return (
    <div className="grid grid-cols-1 gap-3">
      {FIELDS.map(({ key, label, type }) =>
        key === "country" ? (
          <div key={key} className="block">
            <span className="text-xs text-white/50">{label}</span>
            <div className="mt-1">
              <SearchSelect
                options={countryOptions}
                value={matched?.value ?? current}
                onChange={(v) => onChange({ ...value, country: v || null })}
                placeholder="Select country…"
              />
            </div>
          </div>
        ) : (
        <label key={key} className="block">
          <span className="text-xs text-white/50">{label}</span>
          <input
            type={type ?? "text"}
            value={(value[key] as string | null) ?? ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value || null })}
            className="mt-1 w-full rounded-xl bg-white/10 px-3 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        ),
      )}
    </div>
  );
}
