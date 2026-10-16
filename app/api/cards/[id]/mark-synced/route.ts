import { authed } from "@/lib/guard";
import { getCard, markSynced } from "@/lib/cards";

// Used only by the one-time migration of old browser-cached cards that were already synced.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await authed(req, 120);
  if ("res" in a) return a.res;
  const id = (await params).id;
  const hubspotId = (await req.json().catch(() => ({}))).hubspotId;
  if (!getCard(a.user.id, id) || typeof hubspotId !== "string" || !/^\d+$/.test(hubspotId)) {
    return Response.json({ error: "Invalid" }, { status: 400 });
  }
  markSynced(a.user.id, id, hubspotId);
  return Response.json({ ok: true });
}
