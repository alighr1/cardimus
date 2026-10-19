import { prepareImage } from "./image";
import { postJson } from "./api";
import type { Contact } from "./schema";

export type ScanResult = { id: string; contact: Contact; thumbnail: string };

/** Resize a photo, read it with the AI, and store the result. Pass replaceId to rescan an existing card. */
export async function scanFile(file: File, replaceId?: string): Promise<ScanResult> {
  const { base64, mediaType, thumbnail } = await prepareImage(file);
  const r = await postJson<{ contact: Contact; cardId?: string }>("/api/extract", {
    image: base64,
    mediaType,
    thumbnail,
    replaceId,
  });
  if (!r.cardId) throw new Error("That doesn't look like a business card. Try again with a clearer photo.");
  return { id: r.cardId, contact: r.contact, thumbnail };
}
