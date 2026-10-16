"use client";
import { useCallback, useEffect, useState } from "react";
import { listCards, syncCard } from "@/lib/storage";
import type { SavedCard } from "@/lib/schema";

const nameOf = (c: SavedCard) =>
  [c.contact.firstName, c.contact.lastName].filter(Boolean).join(" ") || c.contact.company || "Unnamed";

/** Lists cached contacts that haven't been pushed to HubSpot yet, with per-card and bulk sync. */
export function UnsyncedPanel({ refreshKey, campaignId }: { refreshKey: number; campaignId: string }) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reload = useCallback(
    async () => setCards((await listCards()).filter((c) => !c.hubspotId)),
    [],
  );
  useEffect(() => {
    reload().catch(() => {});
    window.addEventListener("cards-changed", reload);
    return () => window.removeEventListener("cards-changed", reload);
  }, [reload, refreshKey]);

  async function sync(card: SavedCard) {
    setSyncing((s) => new Set(s).add(card.id));
    setErrors((e) => ({ ...e, [card.id]: "" }));
    try {
      await syncCard(card.id, campaignId || undefined); // server stores the result; the card is never deleted
    } catch (e) {
      setErrors((x) => ({ ...x, [card.id]: e instanceof Error ? e.message : "Failed" }));
    }
    setSyncing((s) => {
      const n = new Set(s);
      n.delete(card.id);
      return n;
    });
    await reload();
  }

  async function syncAll() {
    for (const c of cards) await sync(c);
  }

  if (cards.length === 0) return null;

  return (
    <section className="rounded-xl bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Unsynced Contacts ({cards.length})</h2>
        <button
          onClick={syncAll}
          disabled={syncing.size > 0}
          className="rounded-lg bg-orange-500/90 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Sync all
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {cards.map((c) => (
          <li key={c.id} className="rounded-lg bg-black/30 p-2">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{nameOf(c)}</span>
                <span className="block truncate text-xs text-white/50">
                  {[c.contact.title, c.contact.company, c.contact.email].filter(Boolean).join(" · ")}
                  {c.contact.dialCodeInferred ? " · ⚠️ dial code guessed" : ""}
                </span>
              </span>
              <button
                onClick={() => sync(c)}
                disabled={syncing.has(c.id)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {syncing.has(c.id) ? "Syncing…" : "Sync"}
              </button>
            </div>
            {(errors[c.id] || c.syncError) && (
              <p className="mt-1 break-words text-xs text-red-300">Last sync failed: {errors[c.id] || c.syncError}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
