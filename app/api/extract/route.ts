import Anthropic from "@anthropic-ai/sdk";
import type { MediaType } from "@/lib/claude";
import { extract } from "@/lib/extract";
import { authed } from "@/lib/guard";
import { createCard } from "@/lib/cards";
import { matchCountry } from "@/lib/countries";

export const maxDuration = 60;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BASE64 = 6_000_000; // ~4.5MB image

export async function POST(req: Request) {
  const a = await authed(req, 20);
  if ("res" in a) return a.res;

  let body: { image?: string; mediaType?: string; thumbnail?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.image || !body.mediaType || !ALLOWED.includes(body.mediaType)) {
    return Response.json({ error: "Missing or unsupported image" }, { status: 400 });
  }
  if (body.image.length > MAX_BASE64) {
    return Response.json({ error: "Image too large" }, { status: 413 });
  }

  const provider = process.env.AI_PROVIDER === "gemini" ? "gemini" : "claude";
  const started = Date.now();
  const info = () => ({ provider, ms: Date.now() - started, imageKB: Math.round((body.image!.length * 0.75) / 1024) });

  try {
    const { contact, raw, model } = await extract(body.image, body.mediaType as MediaType);
    // Normalise the AI's country to a code from our list (unmatched text is kept so the user can fix it).
    contact.country = matchCountry(contact.country)?.value ?? contact.country;
    // Save right away on the server so the contact survives even if the browser cache is cleared.
    const thumb = typeof body.thumbnail === "string" && body.thumbnail.startsWith("data:image/jpeg;base64,") && body.thumbnail.length < 200_000 ? body.thumbnail : "";
    const cardId = contact.isBusinessCard ? createCard(a.user.id, contact, thumb) : undefined;
    return Response.json({ contact, cardId, debug: { ...info(), model, raw } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("extract failed:", msg.slice(0, 500));
    const debug = { ...info(), detail: msg.slice(0, 2000) };
    if (err instanceof Anthropic.RateLimitError || /429|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
      return Response.json({ error: "AI rate limit reached, try again shortly.", debug }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Server API key is invalid.", debug }, { status: 500 });
    }
    if (/503|UNAVAILABLE/i.test(msg)) {
      return Response.json({ error: "The AI model is overloaded right now. Try again in a minute.", debug }, { status: 503 });
    }
    return Response.json({ error: "Could not read the card. Try a clearer photo.", debug }, { status: 502 });
  }
}
