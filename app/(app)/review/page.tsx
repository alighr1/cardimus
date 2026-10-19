"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { exportVCard } from "@/lib/vcard";
import { getStoredCampaign } from "@/components/CampaignSelect";
import { CaptureButtons } from "@/components/CaptureButtons";
import { scanFile } from "@/lib/scan";
import { useT } from "@/components/LangProvider";
import { loadDraft, saveCard, saveDraft, syncCard, type Draft } from "@/lib/storage";

export default function ReviewPage() {
  const router = useRouter();
  const { t } = useT();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [rescanning, setRescanning] = useState(false);

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

  async function rescan(file: File) {
    setStatus("");
    setBusy(true);
    try {
      const r = await scanFile(file, draft!.id);
      const updated = { ...draft!, id: r.id, contact: r.contact, thumbnail: r.thumbnail };
      setDraft(updated);
      await saveDraft(updated);
      setRescanning(false);
      setStatus(t("review.rescanned"));
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : t("review.rescanFailed")}`);
    }
    setBusy(false);
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
      <img src={draft.thumbnail} alt={t("review.cardAlt")} className="mx-auto max-h-40 rounded-xl" />
      {draft.contact.dialCodeInferred && (
        <p className="rounded-xl bg-yellow-500/15 p-3 text-sm text-yellow-200">
          {t("review.dialWarning")}
        </p>
      )}
      {rescanning ? (
        <div className="rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-sm text-white/70">{t("review.rescanHint")}</p>
          <CaptureButtons onFile={rescan} disabled={busy} />
          <button onClick={() => setRescanning(false)} disabled={busy} className="mt-2 w-full py-2 text-sm text-white/50">
            {t("review.cancel")}
          </button>
        </div>
      ) : (
        <button onClick={() => setRescanning(true)} disabled={busy} className="rounded-xl bg-white/10 py-2.5 text-sm font-medium disabled:opacity-50">
          {t("review.rescan")}
        </button>
      )}
      {busy && rescanning && <p className="text-center text-sm text-white/70">{t("scan.reading")}</p>}
      <ContactForm value={draft.contact} onChange={(contact) => setDraft({ ...draft, contact })} />

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 bg-[#0b0f17]/95 px-4 py-3 backdrop-blur">
        {status && <p className="text-center text-sm text-white/80">{status}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={() => run(t("review.saved"), async () => void (await save()))} className="rounded-xl bg-blue-600 py-3 font-semibold disabled:opacity-50">
            {t("review.save")}
          </button>
          <button disabled={busy} onClick={() => run("", () => exportVCard(draft.contact))} className="rounded-xl bg-white/10 py-3 font-medium disabled:opacity-50">
            {t("review.addToContacts")}
          </button>
        </div>
        <button
          disabled={busy}
          onClick={() =>
            run("", async () => {
              const saved = await save(); // persist edits in the database first, so a failed sync never loses them
              const r = await syncCard(saved.id!, getStoredCampaign() || undefined);
              await save({ ...saved, hubspotId: r.contactId });
              return t("review.synced");
            })
          }
          className="rounded-xl bg-orange-500/90 py-3 font-medium disabled:opacity-50"
        >
          {draft.hubspotId ? t("review.update") : t("review.push")}
        </button>
        <button onClick={() => router.push("/")} className="py-2 text-sm text-white/50">{t("review.scanAnother")}</button>
      </div>
    </div>
  );
}
