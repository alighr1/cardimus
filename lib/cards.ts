import { randomUUID } from "node:crypto";
import { db } from "./db";
import { sanitizeStoredSyncError } from "./crm";
import { ContactSchema, type Contact, type SavedCard } from "./schema";

type Row = {
  id: string;
  contact: string;
  thumbnail: string;
  hubspot_id: string | null;
  sync_error: string | null;
  created_at: number;
};

const toCard = (r: Row): SavedCard => ({
  id: r.id,
  createdAt: r.created_at,
  contact: ContactSchema.parse(JSON.parse(r.contact)),
  thumbnail: r.thumbnail,
  hubspotId: r.hubspot_id ?? undefined,
  syncError: r.sync_error ? sanitizeStoredSyncError(r.sync_error) : undefined,
});

const COLS = "id, contact, thumbnail, hubspot_id, sync_error, created_at";

export function createCard(userId: number, contact: Contact, thumbnail = "", createdAt = Date.now(), id: string = randomUUID()) {
  db.prepare("INSERT OR IGNORE INTO cards (id, user_id, contact, thumbnail, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id,
    userId,
    JSON.stringify(contact),
    thumbnail,
    createdAt,
  );
  return id;
}

export const listCards = (userId: number): SavedCard[] =>
  (db.prepare(`SELECT ${COLS} FROM cards WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as Row[]).map(toCard);

export const getCard = (userId: number, id: string): SavedCard | null => {
  const r = db.prepare(`SELECT ${COLS} FROM cards WHERE user_id = ? AND id = ?`).get(userId, id) as Row | undefined;
  return r ? toCard(r) : null;
};

/** Rescan: swap in a freshly read contact and photo, keeping the card's id and HubSpot link. */
export const replaceCard = (userId: number, id: string, contact: Contact, thumbnail: string) =>
  db
    .prepare("UPDATE cards SET contact = ?, thumbnail = CASE WHEN ? != '' THEN ? ELSE thumbnail END, sync_error = NULL WHERE user_id = ? AND id = ?")
    .run(JSON.stringify(contact), thumbnail, thumbnail, userId, id).changes > 0;

export const updateContact = (userId: number, id: string, contact: Contact) =>
  db.prepare("UPDATE cards SET contact = ? WHERE user_id = ? AND id = ?").run(JSON.stringify(contact), userId, id).changes > 0;

export const markSynced = (userId: number, id: string, hubspotId: string) =>
  db.prepare("UPDATE cards SET hubspot_id = ?, sync_error = NULL WHERE user_id = ? AND id = ?").run(hubspotId, userId, id);

export const markSyncFailed = (userId: number, id: string, error: string) =>
  db.prepare("UPDATE cards SET sync_error = ? WHERE user_id = ? AND id = ?").run(error.slice(0, 500), userId, id);

/** Only synced cards can be deleted, so a failed sync never loses a contact. */
export function deleteSyncedCard(userId: number, id: string): "deleted" | "unsynced" | "missing" {
  const card = getCard(userId, id);
  if (!card) return "missing";
  if (!card.hubspotId) return "unsynced";
  db.prepare("DELETE FROM cards WHERE user_id = ? AND id = ?").run(userId, id);
  return "deleted";
}
