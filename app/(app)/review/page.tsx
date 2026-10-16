"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { exportVCard } from "@/lib/vcard";
import { getStoredCampaign } from "@/components/CampaignSelect";
import { loadDraft, saveCard, saveDraft, syncCard, type Draft } from "@/lib/storage";

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadDraft().then((d) => (d ? setDraft(d) : router.replace("/")));
  }, [router]);

  if (!draft) return null;

  async function save(next = draft!) {
    const card = await saveCard(next);
    const updated = { ...next, id: card.id };
    setDraft(updated);
    await saveDraft(updated);
    return updated;
  }

  async function run(label: string, fn: () => Promise<string | void>) {
    setBusy(true);
    setStatus("");
    try {
      setStatus((await fn()) ?? label);
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Failed"}`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={draft.thumbnail} alt="Scanned card" className="mx-auto max-h-40 rounded-xl" />
      {draft.contact.dialCodeInferred && (
        <p className="rounded-xl bg-yellow-500/15 p-3 text-sm text-yellow-200">
          The phone dial code wasn&apos;t on the card. AI guessed it from the country/address, so please double-check it.
        </p>
      )}
      <ContactForm value={draft.contact} onChange={(contact) => setDraft({ ...draft, contact })} />

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 bg-[#0b0f17]/95 px-4 py-3 backdrop-blur">
        {status && <p className="text-center text-sm text-white/80">{status}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={() => run("✅ Saved", async () => void (await save()))} className="rounded-xl bg-blue-600 py-3 font-semibold disabled:opacity-50">
            Save
          </button>
          <button disabled={busy} onClick={() => run("", () => exportVCard(draft.contact))} className="rounded-xl bg-white/10 py-3 font-medium disabled:opacity-50">
            Add to contacts
          </button>
        </div>
        <button
          disabled={busy}
          onClick={() =>
            run("", async () => {
              const saved = await save(); // persist edits in the database first, so a failed sync never loses them
              const r = await syncCard(saved.id!, getStoredCampaign() || undefined);
              await save({ ...saved, hubspotId: r.contactId });
              return "✅ Synced to HubSpot";
            })
          }
          className="rounded-xl bg-orange-500/90 py-3 font-medium disabled:opacity-50"
        >
          {draft.hubspotId ? "Update in HubSpot" : "Push to HubSpot"}
        </button>
        <button onClick={() => router.push("/")} className="py-2 text-sm text-white/50">Scan another</button>
      </div>
    </div>
  );
}
