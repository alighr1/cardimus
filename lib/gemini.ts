import { GoogleGenAI } from "@google/genai";
import { PROMPT, type Extraction, type MediaType } from "./claude";
import { ContactSchema, contactJsonSchema } from "./schema";

let ai: GoogleGenAI | undefined;

// Gemini rejects the "$schema" keyword that zod adds.
const { $schema: _omit, ...schema } = contactJsonSchema as Record<string, unknown>;

export async function extractContactGemini(base64: string, mediaType: MediaType): Promise<Extraction> {
  ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
  const request = {
    model,
    contents: [{ inlineData: { mimeType: mediaType, data: base64 } }, { text: PROMPT }],
    config: { responseMimeType: "application/json", responseJsonSchema: schema },
  };
  // 503 "high demand" is transient on the free tier: retry a few times with backoff.
  let response;
  for (let attempt = 0; ; attempt++) {
    try {
      response = await ai.models.generateContent(request);
      break;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (attempt >= 3 || !/503|UNAVAILABLE/i.test(msg)) throw e;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
    }
  }
  if (!response.text) throw new Error("No response from model.");
  return { contact: ContactSchema.parse(JSON.parse(response.text)), raw: response.text, model };
}
