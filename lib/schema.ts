import { z } from "zod";

const str = z.string().nullable();

export const ContactSchema = z.object({
  isBusinessCard: z.boolean().describe("false if the image is not a business card"),
  firstName: str,
  lastName: str,
  title: str,
  company: str,
  email: str,
  phone: str.describe("main/office phone, as printed"),
  mobile: str,
  website: str,
  address: str,
  city: str,
  country: str,
  linkedin: str,
  notes: str.describe("other printed info (department, fax, tagline, ...)"),
  dialCodeInferred: z.boolean().optional().describe("true if a phone dial code was added that was not printed on the card"),
  confidence: z.enum(["low", "medium", "high"]),
});

export type Contact = z.infer<typeof ContactSchema>;

export const contactJsonSchema = z.toJSONSchema(ContactSchema);

export type SavedCard = {
  id: string;
  createdAt: number;
  contact: Contact;
  thumbnail: string; // data URL
  hubspotId?: string;
  syncError?: string;
};
