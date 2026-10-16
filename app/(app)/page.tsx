"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaptureButtons } from "@/components/CaptureButtons";
import { prepareImage } from "@/lib/image";
import { ApiError, postJson } from "@/lib/api";
import { saveDraft } from "@/lib/storage";
import { UnsyncedPanel } from "@/components/UnsyncedPanel";
import { CampaignSelect, getStoredCampaign } from "@/components/CampaignSelect";
import type { Contact } from "@/lib/schema";

// Debug mode: show the raw AI response on screen instead of moving to the review screen.
// On in development, off in production. Override at build time with NEXT_PUBLIC_DEBUG_SCAN=1 (on) or 0 (off).
const DEBUG =
  process.env.NEXT_PUBLIC_DEBUG_SCAN === "1" ||
  (process.env.NEXT_PUBLIC_DEBUG_SCAN !== "0" && process.env.NODE_ENV !== "production");

export default function ScanPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [log, setLog] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [campaignId, setCampaignId] = useState("");
  useEffect(() => setCampaignId(getStoredCampaign()), []);

  async function onFile(file: File) {
    setError("");
    setLog("");
    setBusy(true);
    const lines = [`file: ${file.name || "(camera)"} ${file.type} ${Math.round(file.size / 1024)}KB`];
    const show = () => DEBUG && setLog(lines.join("\n"));
    try {
      const { base64, mediaType, thumbnail } = await prepareImage(file);
      lines.push(`resized: ${Math.round((base64.length * 0.75) / 1024)}KB ${mediaType}`);
      show();
      const t = Date.now();
      const { contact, cardId, debug } = await postJson<{ contact: Contact; cardId?: string; debug?: unknown }>("/api/extract", {
        image: base64,
        mediaType,
        thumbnail,
      });
      lines.push(`response in ${Date.now() - t}ms`, JSON.stringify(debug, null, 2), "--- parsed contact ---", JSON.stringify(contact, null, 2));
      if (cardId) {
        // The server already stored it in SQLite; it stays under "Unsynced Contacts" until it reaches HubSpot.
        lines.push(`--- saved in database (id ${cardId}, unsynced) ---`);
        setRefreshKey((k) => k + 1);
      }
      if (DEBUG) {
        show();
        setBusy(false);
        return;
      }
      if (!contact.isBusinessCard) throw new Error("That doesn't look like a business card. Try again.");
      await saveDraft({ id: cardId, contact, thumbnail });
      router.push("/review");
    } catch (e) {
      lines.push(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
      if (e instanceof ApiError && e.debug) lines.push(JSON.stringify(e.debug, null, 2));
      show();
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <CampaignSelect value={campaignId} onChange={setCampaignId} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Scan a business card</h1>
        <p className="mt-2 text-sm text-white/60">Take a photo or pick one. AI reads the details for you.</p>
      </div>
      {busy ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
          <p className="text-sm text-white/70">Reading card…</p>
        </div>
      ) : (
        <CaptureButtons onFile={onFile} />
      )}
      {error && <p className="rounded-xl bg-red-500/15 p-3 text-center text-sm text-red-300">{error}</p>}
      {DEBUG && log && (
        <pre className="max-h-[50dvh] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-black/60 p-3 text-xs text-green-300">
          {log}
        </pre>
      )}
      <UnsyncedPanel refreshKey={refreshKey} campaignId={campaignId} />
    </div>
  );
}
