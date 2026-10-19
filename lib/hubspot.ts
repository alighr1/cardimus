import type { Contact } from "./schema";
import { countryForHubSpot } from "./countries";
import { CRM_MSG, CrmError, friendlyCrmError } from "./crm";
import { splitEmails } from "./emails";

const BASE = "https://api.hubapi.com";

async function hs<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    // Log only the status and error codes (the body can contain personal data); users get a friendly message.
    console.error("crm request failed:", res.status, [...new Set(body.match(/[A-Z]{4,}(?:_[A-Z]+)+/g) ?? [])].join(","));
    throw new CrmError(friendlyCrmError(res.status, body));
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

type Search = { results: { id: string }[] };
const search = (object: string, property: string, value: string) =>
  hs<Search>(`/crm/v3/objects/${object}/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: property, operator: "EQ", value }] }],
      limit: 1,
    }),
  });

const domainOf = (url: string | null) => {
  if (!url) return null;
  try {
    return new URL(/^https?:\/\//.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const clean = (o: Record<string, string | null>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Record<string, string>;

export type Campaign = { id: string; name: string; status?: string };

/** All marketing campaigns (id is the CRM object id used for associations). Needs marketing.campaigns.read. */
export async function listCampaigns(): Promise<Campaign[]> {
  type Page = {
    results: { properties: { hs_name?: string; hs_object_id: string; hs_campaign_status?: string } }[];
    paging?: { next?: { after: string } };
  };
  const out: Campaign[] = [];
  let after: string | undefined;
  do {
    const page = await hs<Page>(`/marketing/v3/campaigns?limit=100${after ? `&after=${after}` : ""}`);
    for (const r of page.results) {
      out.push({ id: r.properties.hs_object_id, name: r.properties.hs_name ?? "(unnamed)", status: r.properties.hs_campaign_status });
    }
    after = page.paging?.next?.after;
  } while (after);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Internal name of the HubSpot contact property that records who scanned the card. */
export const ADDED_BY_PROPERTY = process.env.HUBSPOT_ADDED_BY_PROPERTY ?? "added_by";

export async function pushToHubSpot(c: Contact, campaignId?: string, addedBy?: string) {
  if (!process.env.HUBSPOT_TOKEN) throw new CrmError(CRM_MSG.notConfigured);
  const email = splitEmails(c.email)[0] ?? null; // the CRM accepts exactly one address

  const contactProps = clean({
    firstname: c.firstName,
    lastname: c.lastName,
    jobtitle: c.title,
    email,
    phone: c.phone,
    mobilephone: c.mobile,
    website: c.website,
    address: c.address,
    city: c.city,
    country: countryForHubSpot(c.country),
    company: c.company,
    ...(addedBy ? { [ADDED_BY_PROPERTY]: addedBy } : {}),
  });

  // Upsert contact by email (when there is one)
  let contactId: string | undefined;
  if (email) contactId = (await search("contacts", "email", email)).results[0]?.id;
  if (contactId) {
    await hs(`/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: contactProps }),
    });
  } else {
    contactId = (
      await hs<{ id: string }>("/crm/v3/objects/contacts", {
        method: "POST",
        body: JSON.stringify({ properties: contactProps }),
      })
    ).id;
  }

  // Company: find by domain, else by name, else create; then associate
  let companyId: string | undefined;
  if (c.company) {
    const domain = domainOf(c.website);
    if (domain) companyId = (await search("companies", "domain", domain)).results[0]?.id;
    if (!companyId) companyId = (await search("companies", "name", c.company)).results[0]?.id;
    if (!companyId) {
      companyId = (
        await hs<{ id: string }>("/crm/v3/objects/companies", {
          method: "POST",
          body: JSON.stringify({
            properties: clean({
              name: c.company,
              domain,
              phone: c.phone,
              address: c.address,
              city: c.city,
              country: countryForHubSpot(c.country),
            }),
          }),
        })
      ).id;
    }
    await hs(`/crm/v4/objects/contacts/${contactId}/associations/default/companies/${companyId}`, {
      method: "PUT",
    });
  }

  if (campaignId) {
    await hs(`/crm/v4/objects/contacts/${contactId}/associations/default/campaigns/${campaignId}`, {
      method: "PUT",
    });
  }

  return { contactId, companyId, campaignId };
}
