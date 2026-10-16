import { authed } from "@/lib/guard";
import { deleteSyncedCard, updateContact } from "@/lib/cards";
import { ContactSchema } from "@/lib/schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const a = await authed(req);
  if ("res" in a) return a.res;
  const parsed = ContactSchema.safeParse((await req.json().catch(() => ({}))).contact);
  if (!parsed.success) return Response.json({ error: "Invalid contact" }, { status: 400 });
  const ok = updateContact(a.user.id, (await params).id, parsed.data);
  return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const a = await authed(req);
  if ("res" in a) return a.res;
  const result = deleteSyncedCard(a.user.id, (await params).id);
  if (result === "unsynced") {
    return Response.json({ error: "This contact isn't synced to HubSpot yet, so it can't be deleted." }, { status: 409 });
  }
  return result === "deleted" ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
}
