import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

const COOKIE = "session";
// 400 days is the longest lifetime browsers allow for a cookie (Chrome caps it there).
const SESSION_MS = 400 * 24 * 60 * 60 * 1000;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

async function setCookie(token: string, expires: number) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies need HTTPS. Set COOKIE_SECURE=0 only if you must run production over plain http.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "1" : process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_MS;
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha(token), userId, expires);
  await setCookie(token, expires);
}

/** Sliding expiry: every API call by an active user pushes the session out again (route handlers only). */
export async function renewSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return;
  const expires = Date.now() + SESSION_MS;
  const changed = db
    .prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = ? AND expires_at > ? AND expires_at < ?")
    .run(expires, sha(token), Date.now(), expires - RENEW_AFTER_MS).changes;
  if (changed) await setCookie(token, expires);
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha(token));
  jar.delete(COOKIE);
}

/** The logged-in user for this request, or null. */
export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.first_name, u.last_name
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(sha(token), Date.now()) as
    | { id: number; email: string; first_name: string; last_name: string }
    | undefined;
  return row ? { id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name } : null;
}
