const EMAIL_RE = /[^\s,;<>()"'|]+@[^\s,;<>()"'|]+\.[^\s,;<>()"'|]+/g;

/** Every distinct email address found in the given strings/lists (one card can print several). */
export function splitEmails(...parts: (string | string[] | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const p of parts.flat()) {
    for (const m of (p ?? "").match(EMAIL_RE) ?? []) {
      const e = m.replace(/[.:]+$/, "");
      if (!out.some((x) => x.toLowerCase() === e.toLowerCase())) out.push(e);
    }
  }
  return out;
}
