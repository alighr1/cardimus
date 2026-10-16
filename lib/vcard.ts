import type { Contact } from "./schema";
import { countryName } from "./countries";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);

export function toVCard(c: Contact): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const first = c.firstName ?? "";
  const last = c.lastName ?? "";
  lines.push(`N:${esc(last)};${esc(first)};;;`);
  lines.push(`FN:${esc([first, last].filter(Boolean).join(" ") || c.company || "Unknown")}`);
  if (c.company) lines.push(`ORG:${esc(c.company)}`);
  if (c.title) lines.push(`TITLE:${esc(c.title)}`);
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${esc(c.email)}`);
  if (c.phone) lines.push(`TEL;TYPE=WORK,VOICE:${esc(c.phone)}`);
  if (c.mobile) lines.push(`TEL;TYPE=CELL,VOICE:${esc(c.mobile)}`);
  if (c.website) lines.push(`URL:${esc(c.website)}`);
  if (c.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${esc(c.linkedin)}`);
  if (c.address || c.city || c.country) {
    lines.push(`ADR;TYPE=WORK:;;${esc(c.address ?? "")};${esc(c.city ?? "")};;;${esc(countryName(c.country) ?? "")}`);
  }
  if (c.notes) lines.push(`NOTE:${esc(c.notes)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** Share sheet on mobile when files are supported, otherwise a normal download. */
export async function exportVCard(c: Contact) {
  const name = [c.firstName, c.lastName].filter(Boolean).join("-") || "contact";
  const file = new File([toVCard(c)], `${name}.vcf`, { type: "text/vcard" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}
