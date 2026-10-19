/** Friendly, CRM-neutral messages for sync failures. Users never see raw API output or the CRM's brand name. */
export class CrmError extends Error {}

export const CRM_MSG = {
  email: "The email address isn't valid for the CRM. Check it and try again.",
  property: "The CRM is missing the “Added by” contact property. Ask an administrator to create it.",
  auth: "The CRM connection isn't authorised. Contact an administrator.",
  notConfigured: "The CRM connection isn't set up. Contact an administrator.",
  busy: "The CRM is busy right now. Try again shortly.",
  down: "The CRM isn't responding. Try again later.",
  rejected: "The CRM rejected this contact. Check the fields and try again.",
  campaigns: "Could not load campaigns from the CRM.",
} as const;

/** Map a raw API failure (status + body text) to a friendly message. */
export function friendlyCrmError(status: number | undefined, body: string): string {
  if (/INVALID_EMAIL/.test(body)) return CRM_MSG.email;
  if (/PROPERTY_DOESNT_EXIST/.test(body)) return CRM_MSG.property;
  if (status === 401 || status === 403) return CRM_MSG.auth;
  if (status === 429) return CRM_MSG.busy;
  if (status && status >= 500) return CRM_MSG.down;
  return CRM_MSG.rejected;
}

/** Clean up sync errors stored before messages were friendly (they contained raw API text). */
export function sanitizeStoredSyncError(raw: string): string {
  if (Object.values(CRM_MSG).includes(raw as never)) return raw;
  if (/HUBSPOT_TOKEN/.test(raw)) return CRM_MSG.notConfigured;
  const status = Number(/HubSpot (\d{3})/i.exec(raw)?.[1]) || undefined;
  return /hubspot|INVALID_|PROPERTY_/i.test(raw) ? friendlyCrmError(status, raw) : raw;
}
