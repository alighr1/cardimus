import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/guard";

export async function POST(req: Request) {
  const limited = rateLimit(req, "login", 10);
  if (limited) return limited;

  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const row = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as
    | { id: number; password_hash: string }
    | undefined;
  // Same error for unknown email and wrong password.
  if (!row || !verifyPassword(password, row.password_hash)) {
    return Response.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await createSession(row.id);
  return Response.json({ ok: true });
}
