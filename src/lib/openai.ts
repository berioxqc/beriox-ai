import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { jsonrepair } from "jsonrepair";

// S'assurer que la clé API est disponible
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({ apiKey });

type Schema = Record<string, unknown>;

export async function callText(system: string, user: string, model = "gpt-4o") {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.2
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function callJson(system: string, user: string, schema?: Schema, model = "gpt-4o-mini") {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user + "\nRéponds uniquement en JSON valide." }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" } as any
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    try {
      const repaired = jsonrepair(raw);
      return JSON.parse(repaired);
    } catch (e2) {
      logger.error({ raw }, "Failed to parse JSON from OpenAI");
      throw e2;
    }
  }
}


