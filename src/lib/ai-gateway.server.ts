import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

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

/** Traduz erros do gateway (créditos, limite) para mensagens em português. */
function traduzirErro(erro: unknown): Error {
  const texto = erro instanceof Error ? `${erro.message}` : String(erro);
  if (/402|payment required|insufficient|credits/i.test(texto)) {
    return new Error(
      "Créditos de IA esgotados no workspace. Use o modo local (sem IA) ou adicione créditos.",
    );
  }
  if (/429|rate.?limit/i.test(texto)) {
    return new Error("Muitas requisições de IA em sequência. Aguarde alguns segundos e tente novamente.");
  }
  return erro instanceof Error ? erro : new Error(texto);
}

export async function runAI(
  system: string,
  prompt: string,
  imagens: string[] = [],
): Promise<string> {
  const provider = getProvider();
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system,
      ...(imagens.length
        ? {
            messages: [
              {
                role: "user" as const,
                content: [
                  { type: "text" as const, text: prompt },
                  ...imagens.map((url) => ({ type: "image" as const, image: url })),
                ],
              },
            ],
          }
        : { prompt }),
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
  } catch (e) {
    throw traduzirErro(e);
  }
}

export async function runAIJson<T>(
  system: string,
  prompt: string,
  imagens: string[] = [],
): Promise<T> {
  const raw = await runAI(
    `${system}\n\nResponda SOMENTE com JSON válido, sem cercas de código e sem comentários.`,
    prompt,
    imagens,
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
