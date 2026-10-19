"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCard, listCards, saveDraft } from "@/lib/storage";
import type { SavedCard } from "@/lib/schema";
import { useT } from "@/components/LangProvider";

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useT();
  const [cards, setCards] = useState<SavedCard[] | null>(null);
  const [q, setQ] = useState("");

  const [error, setError] = useState("");
  useEffect(() => {
    listCards().then(setCards).catch((e) => setError(e instanceof Error ? e.message : t("history.loadFailed")));
  }, []);

  if (error) return <p className="py-10 text-center text-red-300">{error}</p>;
  if (!cards) return null;
  const needle = q.toLowerCase();
  const shown = cards.filter((c) => JSON.stringify(c.contact).toLowerCase().includes(needle));

  async function open(c: SavedCard) {
    await saveDraft({ id: c.id, contact: c.contact, thumbnail: c.thumbnail, hubspotId: c.hubspotId });
    router.push("/review");
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("history.search")}
        className="rounded-xl bg-white/10 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {shown.length === 0 && <p className="py-10 text-center text-white/50">{t("history.empty")}</p>}
      {shown.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <button onClick={() => open(c)} className="flex flex-1 items-center gap-3 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.thumbnail} alt="" className="h-12 w-16 rounded object-cover" />
            <span>
              <span className="block font-medium">{[c.contact.firstName, c.contact.lastName].filter(Boolean).join(" ") || t("history.unnamed")}</span>
              <span className="block text-xs text-white/50">{[c.contact.title, c.contact.company].filter(Boolean).join(" · ")}</span>
            </span>
          </button>
          {c.hubspotId ? (
            <button
              aria-label={t("history.delete")}
              onClick={async () => {
                if (!confirm(t("history.confirmDelete"))) return;
                try {
                  await deleteCard(c.id);
                  setCards(await listCards());
                } catch (e) {
                  alert(e instanceof Error ? e.message : t("history.deleteFailed"));
                }
              }}
              className="px-2 text-white/40"
            >
              ✕
            </button>
          ) : (
            <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] text-orange-300">{t("history.unsynced")}</span>
          )}
        </div>
      ))}
    </div>
  );
}
