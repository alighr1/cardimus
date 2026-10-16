import { extractContact, type Extraction, type MediaType } from "./claude";
import { extractContactGemini } from "./gemini";

/** AI_PROVIDER=gemini | claude (default claude) */
export function extract(base64: string, mediaType: MediaType): Promise<Extraction> {
  return process.env.AI_PROVIDER === "gemini"
    ? extractContactGemini(base64, mediaType)
    : extractContact(base64, mediaType);
}
