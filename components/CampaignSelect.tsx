"use client";
import { useEffect, useMemo, useState } from "react";
import { getJson } from "@/lib/api";
import { SearchSelect } from "./SearchSelect";

const KEY = "campaignId";
export const getStoredCampaign = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

/** Global HubSpot campaign picker. The choice is stored on the device and used for every sync. */
export function CampaignSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getJson<{ campaigns: typeof campaigns }>("/api/campaigns")
      .then((r) => setCampaigns(r.campaigns))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load campaigns"));
  }, []);

  const options = useMemo(
    () => [{ value: "", label: "No campaign" }, ...campaigns.map((c) => ({ value: c.id, label: c.name }))],
    [campaigns],
  );

  return (
    <div className="block">
      <span className="text-xs text-white/50">HubSpot campaign (applies to all synced contacts)</span>
      <div className="mt-1">
        <SearchSelect
          options={options}
          value={value}
          onChange={(v) => {
            localStorage.setItem(KEY, v);
            onChange(v);
          }}
        />
      </div>
      {error && <span className="mt-1 block break-words text-xs text-red-300">{error}</span>}
    </div>
  );
}
