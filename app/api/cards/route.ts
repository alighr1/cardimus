import { z } from "zod";
import { authed } from "@/lib/guard";
import { createCard, listCards } from "@/lib/cards";
import { ContactSchema } from "@/lib/schema";

export async function GET(req: Request) {
  const a = await authed(req, 120);
  if ("res" in a) return a.res;
  return Response.json({ cards: listCards(a.user.id) });
}

const Body = z.object({
  id: z.string().uuid().optional(),
  contact: ContactSchema,
  thumbnail: z.string().max(200_000).default(""),
  createdAt: z.number().int().positive().optional(),
});

/** Create a card (also used to migrate cards from the old browser-only cache). */
export async function POST(req: Request) {
  const a = await authed(req, 120);
  if ("res" in a) return a.res;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid card" }, { status: 400 });
  const b = parsed.data;
  return Response.json({ id: createCard(a.user.id, b.contact, b.thumbnail, b.createdAt, b.id) });
}
