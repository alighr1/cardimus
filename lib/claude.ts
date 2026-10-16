import Anthropic from "@anthropic-ai/sdk";
import { ContactSchema, contactJsonSchema, type Contact } from "./schema";

export type Extraction = { contact: Contact; raw: string; model: string };

export const PROMPT = `Extract the contact details printed on this business card.
- Copy text exactly as printed, preserving spelling and diacritics.
- Split the person's name into firstName and lastName.
- Use null for anything not printed on the card. Never guess or invent values.
- Write every phone/mobile number in international format: "+<dial code> <number>" (for example +90 212 555 01 23).
  - If the card already prints a dial code, keep it.
  - If it does not, work out the country from the card (printed country, city, address, postal code, website domain such as .com.tr / .de, or the company's known home country) and add that country's dial code. Drop a local leading trunk "0" when you add the code (0212 555 01 23 in Turkey becomes +90 212 555 01 23).
  - Set dialCodeInferred to true if you added a dial code that was not printed on the card, otherwise false.
  - If you cannot determine the country with reasonable confidence, leave the number exactly as printed and set dialCodeInferred to false.
- Put a person's direct mobile number in "mobile" and the office/main line in "phone".
- Write "country" as the English country name (for example "Türkiye", "Germany", "United States of America"), not an abbreviation. If it is not printed, infer it from the city/address/phone prefix/website domain when you are confident, otherwise null.
- Put anything else useful (department, fax, tagline, second language text) in "notes".
- If the image is not a business card, set isBusinessCard to false and everything else to null.`;

export type MediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

let client: Anthropic | undefined;

export async function extractContact(base64: string, mediaType: MediaType): Promise<Extraction> {
  client ??= new Anthropic();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
    max_tokens: 2000,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: contactJsonSchema as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("The model declined to read this image.");
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No response from model.");
  return { contact: ContactSchema.parse(JSON.parse(text.text)), raw: text.text, model: response.model };
}
