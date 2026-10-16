import { authed } from "@/lib/guard";
import { getCard, markSyncFailed, markSynced } from "@/lib/cards";
import { pushToHubSpot } from "@/lib/hubspot";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const a = await authed(req);
  if ("res" in a) return a.res;
  const id = (await params).id;
  const card = getCard(a.user.id, id);
  if (!card) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const campaignId = typeof body.campaignId === "string" && /^\d+$/.test(body.campaignId) ? body.campaignId : undefined;

  try {
    const r = await pushToHubSpot(card.contact, campaignId, `Cardimus - ${a.user.firstName} ${a.user.lastName}`);
    markSynced(a.user.id, id, r.contactId);
    return Response.json(r);
  } catch (err) {
    const message = err instanceof Error ? err.message : "HubSpot error";
    markSyncFailed(a.user.id, id, message); // card stays saved; retry any time
    console.error("hubspot sync failed:", message.slice(0, 120));
    return Response.json({ error: message }, { status: 502 });
  }
}
