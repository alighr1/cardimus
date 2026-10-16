import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/guard";

const Body = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: Request) {
  const limited = rateLimit(req, "register", 10);
  if (limited) return limited;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const u = parsed.data;
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(u.email)) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const { lastInsertRowid } = db
    .prepare(
      "INSERT INTO users (email, password_hash, first_name, last_name, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(u.email, hashPassword(u.password), u.firstName, u.lastName, Date.now());
  await createSession(Number(lastInsertRowid));
  return Response.json({ ok: true });
}
