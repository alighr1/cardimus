import { authed } from "@/lib/guard";
import { listCampaigns } from "@/lib/hubspot";
import { CRM_MSG } from "@/lib/crm";

export async function GET(req: Request) {
  const a = await authed(req);
  if ("res" in a) return a.res;
  try {
    return Response.json({ campaigns: await listCampaigns() });
  } catch (err) {
    return Response.json({ error: err instanceof Error && err.name !== "TypeError" ? err.message : CRM_MSG.campaigns }, { status: 502 });
  }
}
