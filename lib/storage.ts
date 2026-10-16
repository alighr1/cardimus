import { get, set, del, keys, getMany } from "idb-keyval";
import { getJson, postJson, sendJson } from "./api";
import type { Contact, SavedCard } from "./schema";

export type Draft = { id?: string; contact: Contact; thumbnail: string; hubspotId?: string };

// Only the in-progress draft lives in the browser (scoped per user). Cards live in the server's SQLite database.
let uid = "anon";
export const setStorageUser = (id: number) => {
  uid = String(id);
};

export const saveDraft = (d: Draft) => set(`draft:${uid}`, d);
export const loadDraft = () => get<Draft>(`draft:${uid}`);

export const listCards = async () => (await getJson<{ cards: SavedCard[] }>("/api/cards")).cards;

export async function saveCard(d: Draft): Promise<{ id: string }> {
  if (d.id) {
    await sendJson("PUT", `/api/cards/${d.id}`, { contact: d.contact });
    return { id: d.id };
  }
  return postJson<{ id: string }>("/api/cards", { contact: d.contact, thumbnail: d.thumbnail });
}

export const deleteCard = (id: string) => sendJson("DELETE", `/api/cards/${id}`);

export const syncCard = (id: string, campaignId?: string) =>
  postJson<{ contactId: string; companyId?: string }>(`/api/cards/${id}/sync`, { campaignId });

/** One-time upload of cards left in the old browser-only cache, so nothing is lost. Safe to re-run. */
export async function migrateLegacyCards() {
  const mine = `card:${uid}:`;
  const legacy = (await keys()).filter(
    (k): k is string => typeof k === "string" && k.startsWith("card:") && (k.startsWith(mine) || /^card:[0-9a-f-]{36}$/.test(k)),
  );
  if (!legacy.length) return 0;
  const cards = await getMany<SavedCard>(legacy);
  let moved = 0;
  for (let i = 0; i < legacy.length; i++) {
    const c = cards[i];
    if (!c) continue;
    try {
      await postJson("/api/cards", { id: c.id, contact: c.contact, thumbnail: c.thumbnail, createdAt: c.createdAt });
      if (c.hubspotId) await postJson(`/api/cards/${c.id}/mark-synced`, { hubspotId: c.hubspotId }).catch(() => {});
      await del(legacy[i]); // only removed after the server accepted it
      moved++;
    } catch {
      /* keep it locally and retry on next load */
    }
  }
  return moved;
}
