import { getUser, renewSession, type User } from "./auth";

const hits = new Map<string, number[]>();

/** In-memory sliding-window rate limit. Returns a 429 response when exceeded. */
export function rateLimit(req: Request, bucket: string, limitPerMinute: number): Response | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= limitPerMinute) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }
  recent.push(now);
  hits.set(key, recent);
  return null;
}

/** API guard: requires a logged-in user, plus a per-IP rate limit. */
export async function guard(req: Request, limitPerMinute = 20): Promise<Response | null> {
  if (!(await getUser())) return Response.json({ error: "Please log in." }, { status: 401 });
  return rateLimit(req, new URL(req.url).pathname, limitPerMinute);
}

/** Like guard, but also returns the logged-in user. */
export async function authed(req: Request, limitPerMinute = 30): Promise<{ user: User } | { res: Response }> {
  const user = await getUser();
  if (!user) return { res: Response.json({ error: "Please log in." }, { status: 401 }) };
  const limited = rateLimit(req, new URL(req.url).pathname, limitPerMinute);
  if (limited) return { res: limited };
  await renewSession();
  return { user };
}
