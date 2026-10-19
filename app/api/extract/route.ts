import Anthropic from "@anthropic-ai/sdk";
import type { MediaType } from "@/lib/claude";
import { extract } from "@/lib/extract";
import { authed } from "@/lib/guard";
import { createCard, replaceCard } from "@/lib/cards";
import { matchCountry } from "@/lib/countries";
import { splitEmails } from "@/lib/emails";

export const maxDuration = 60;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BASE64 = 6_000_000; // ~4.5MB image
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const a = await authed(req, 20);
  if ("res" in a) return a.res;

  let body: { image?: string; mediaType?: string; thumbnail?: string; replaceId?: string };
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

  try {
    const { contact } = await extract(body.image, body.mediaType as MediaType);
    // Normalise the AI's country to a code from our list (unmatched text is kept so the user can fix it).
    contact.country = matchCountry(contact.country)?.value ?? contact.country;
    // One card can print several emails: keep them all, and make "email" a single address.
    const first = splitEmails(contact.email)[0];
    contact.emails = splitEmails(first, contact.emails, contact.email);
    contact.email = first ?? contact.emails[0] ?? null;
    if (!contact.isBusinessCard) return Response.json({ contact });

    // Save on the server right away so the contact survives even if the browser cache is cleared.
    const thumb =
      typeof body.thumbnail === "string" && body.thumbnail.startsWith("data:image/jpeg;base64,") && body.thumbnail.length < 200_000
        ? body.thumbnail
        : "";
    // With replaceId this is a rescan: update that card instead of creating a new one.
    const replaced = body.replaceId && UUID.test(body.replaceId) && replaceCard(a.user.id, body.replaceId, contact, thumb);
    const cardId = replaced ? body.replaceId : createCard(a.user.id, contact, thumb);
    return Response.json({ contact, cardId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("extract failed:", msg.slice(0, 500));
    if (err instanceof Anthropic.RateLimitError || /429|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
      return Response.json({ error: "AI rate limit reached, try again shortly." }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Server API key is invalid." }, { status: 500 });
    }
    if (/503|UNAVAILABLE/i.test(msg)) {
      return Response.json({ error: "The AI model is overloaded right now. Try again in a minute." }, { status: 503 });
    }
    return Response.json({ error: "Could not read the card. Try a clearer photo." }, { status: 502 });
  }
}
