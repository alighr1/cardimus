"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaptureButtons } from "@/components/CaptureButtons";
import { scanFile } from "@/lib/scan";
import { saveDraft } from "@/lib/storage";
import { UnsyncedPanel } from "@/components/UnsyncedPanel";
import { useT } from "@/components/LangProvider";
import { CampaignSelect, getStoredCampaign } from "@/components/CampaignSelect";

export default function ScanPage() {
  const router = useRouter();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [campaignId, setCampaignId] = useState("");
  useEffect(() => setCampaignId(getStoredCampaign()), []);

  async function onFile(file: File) {
    setError("");
    setBusy(true);
    try {
      const { id, contact, thumbnail } = await scanFile(file);
      await saveDraft({ id, contact, thumbnail });
      router.push("/review"); // the contact is already stored; this is the details page to check and correct it
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <CampaignSelect value={campaignId} onChange={setCampaignId} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("scan.title")}</h1>
        <p className="mt-2 text-sm text-white/60">{t("scan.subtitle")}</p>
      </div>
      {busy ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
          <p className="text-sm text-white/70">{t("scan.reading")}</p>
        </div>
      ) : (
        <CaptureButtons onFile={onFile} />
      )}
      {error && <p className="rounded-xl bg-red-500/15 p-3 text-center text-sm text-red-300">{error}</p>}
      <UnsyncedPanel refreshKey={0} campaignId={campaignId} />
    </div>
  );
}
