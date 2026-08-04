import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const MODEL = "openai/gpt-5.6-sol";

function getProvider() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export async function runAI(system: string, prompt: string): Promise<string> {
  const provider = getProvider();
  const result = streamText({
    model: provider.responses(MODEL),
    system,
    prompt,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return await result.text;
}

export async function runAIJson<T>(system: string, prompt: string): Promise<T> {
  const raw = await runAI(
    `${system}\n\nResponda SOMENTE com JSON válido, sem cercas de código e sem comentários.`,
    prompt,
  );
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
