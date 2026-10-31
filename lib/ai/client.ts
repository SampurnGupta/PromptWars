import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export interface AIResponse<T = unknown> {
  data: T;
  provider: "gemini" | "groq" | "fallback";
  model: string;
  latencyMs: number;
}

// Sanitize user-provided or external text to prevent prompt injection
export function sanitizeUntrustedInput(text: string, maxLen = 8000): string {
  if (!text) return "";
  let clean = text.slice(0, maxLen);
  // Neutralize common delimiter break attempts
  clean = clean.replace(/```/g, "'''");
  clean = clean.replace(/<system>[\s\S]*?<\/system>/gi, "");
  return clean;
}

export async function generateStructuredAI<T>(
  systemPrompt: string,
  userContent: string,
  responseSchemaHint: string,
  fallbackGenerator: () => T
): Promise<AIResponse<T>> {
  const startTime = Date.now();
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Gemini if configured or selected
  if ((provider === "gemini" || !groqKey) && geminiKey && geminiKey.length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const fullPrompt = `${systemPrompt}\n\nSTRICT JSON OUTPUT FORMAT REQUIRED: ${responseSchemaHint}\n\nINPUT DATA:\n${sanitizeUntrustedInput(userContent)}`;
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as T;

      return {
        data: parsed,
        provider: "gemini",
        model: "gemini-1.5-flash",
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn("Gemini generation failed, checking alternatives:", err);
    }
  }

  // 2. Try Groq if configured
  if (groqKey && groqKey.length > 5) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `${systemPrompt}\nReturn STRICT valid JSON only matching schema: ${responseSchemaHint}` },
          { role: "user", content: sanitizeUntrustedInput(userContent) },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw) as T;
      return {
        data: parsed,
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn("Groq generation failed, using fallback:", err);
    }
  }

  // 3. Fallback deterministic generator
  return {
    data: fallbackGenerator(),
    provider: "fallback",
    model: "deterministic-heuristic-engine",
    latencyMs: Date.now() - startTime,
  };
}

