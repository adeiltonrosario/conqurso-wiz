/**
 * Busca o texto de uma lei a partir de um endereço (URL) público, sem gastar IA.
 * A página é baixada no servidor e convertida em texto simples, pronto para o
 * mesmo reconhecimento de artigos usado no texto colado (lerVadeMecum).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_BYTES = 5_000_000;

const urlSchema = z
  .string()
  .trim()
  .min(8)
  .max(2000)
  .refine((valor) => {
    let u: URL;
    try {
      u = new URL(valor);
    } catch {
      return false;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "0.0.0.0" ||
      host === "[::1]" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return host.includes(".");
  }, "Endereço inválido");

const ENTIDADES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ordm: "º",
  ordf: "ª",
  sect: "§",
  deg: "º",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  laquo: "«",
  raquo: "»",
  rsquo: "'",
  lsquo: "'",
  ldquo: '"',
  rdquo: '"',
};

function decodificar(texto: string) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (inteiro, nome: string) => ENTIDADES[nome.toLowerCase()] ?? inteiro);
}

/** HTML → texto simples, preservando as quebras que separam artigos e incisos. */
export function htmlParaTexto(html: string) {
  let t = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|iframe|svg|nav|footer|header|form|select)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6]|td|table|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  t = decodificar(t);
  return t
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n")
    .trim();
}

function tituloDaLei(texto: string) {
  const m = texto.match(
    /(LEI\s+(COMPLEMENTAR\s+)?N[º°.\s]*\s*[\d.]+[^\n]{0,60}|DECRETO[- ]LEI\s+N[º°.\s]*\s*[\d.]+[^\n]{0,60}|C[ÓO]DIGO\s+[A-ZÇÃÕÁÉÍÓÚ ]{3,60}|CONSTITUI[ÇC][ÃA]O[^\n]{0,60})/i,
  );
  return (m?.[0] ?? "").replace(/\s+/g, " ").trim();
}

/** Bytes 0x80–0x9F do windows-1252 (o restante é igual ao latin-1). */
const CP1252 = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090''\"\"•–—˜™š›œ\u009dž Ÿ";

/** Converte bytes latin-1 / windows-1252 em texto, sem TextDecoder. */
function decodificarLatin1(bytes: Uint8Array) {
  let saida = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    const bloco = bytes.subarray(i, i + 8192);
    let parte = "";
    for (const b of bloco) parte += b >= 0x80 && b <= 0x9f ? CP1252[b - 0x80] : String.fromCharCode(b);
    saida += parte;
  }
  return saida;
}

async function baixar(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ConcurseiroInteligente/1.0)",
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
    },
    redirect: "follow",
  });
  if (!res.ok) return { erro: `A página respondeu ${res.status}.` as string };
  const tipo = res.headers.get("content-type") ?? "";
  if (/pdf|image|audio|video|octet-stream/i.test(tipo)) {
    return { erro: "Esse link não é uma página de texto. Anexe o PDF em “Upload de PDF para leis”." };
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return { erro: "A página é grande demais. Abra a lei em partes ou cole o texto." };
  }
  const bytes = new Uint8Array(buffer);
  // Planalto e diários antigos servem em latin-1; o runtime de borda só decodifica UTF-8,
  // então a conversão latin-1/cp1252 é feita aqui, sem depender do TextDecoder.
  const charset = /charset=([\w-]+)/i.exec(tipo)?.[1]?.toLowerCase();
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const meta = /charset=["']?([\w-]+)/i.exec(utf8.slice(0, 4000))?.[1]?.toLowerCase();
  const declarado = charset ?? meta ?? "";
  const antigo = /8859|1252|latin/i.test(declarado);
  if (!antigo && declarado.includes("utf") && !utf8.includes("\uFFFD")) return { html: utf8 };
  const latin = decodificarLatin1(bytes);
  // menos caracteres de erro ganha (empate favorece UTF-8, que é o caso moderno)
  const erros = (s: string) => (s.match(/\uFFFD/g) ?? []).length;
  const html = antigo || erros(latin) < erros(utf8) ? latin : utf8;
  return { html };
}

/** Baixa uma URL informada pelo candidato e devolve o texto da lei. */
export const buscarLeiPorUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: urlSchema }).parse(d))
  .handler(async ({ data }) => {
    const r = await baixar(data.url);
    if ("erro" in r) return { ok: false as const, erro: r.erro };
    const texto = htmlParaTexto(r.html!);
    if (texto.length < 200) {
      return {
        ok: false as const,
        erro: "Não foi possível ler texto nessa página (pode exigir login ou ser só imagem).",
      };
    }
    return {
      ok: true as const,
      titulo: tituloDaLei(texto),
      texto,
      chars: texto.length,
      url: data.url,
    };
  });

const ERAS: [number, number][] = [
  [1995, 1998],
  [1999, 2002],
  [2004, 2006],
  [2007, 2010],
  [2011, 2014],
  [2015, 2018],
  [2019, 2022],
  [2023, 2026],
];

/** Endereços prováveis da lei no site do Planalto. */
export function candidatosPlanalto(numero: string, ano: number, complementar: boolean) {
  const n = numero.replace(/\D/g, "");
  const base = "https://www.planalto.gov.br/ccivil_03";
  const arq = complementar ? `lcp${n}` : `l${n}`;
  const urls: string[] = [];
  const era = ERAS.find(([de, ate]) => ano >= de && ano <= ate);
  if (era) {
    const pasta = complementar ? "lcp" : "lei";
    urls.push(`${base}/_ato${era[0]}-${era[1]}/${ano}/${pasta}/${arq}.htm`);
  }
  urls.push(`${base}/leis/${complementar ? "lcp" : ""}${complementar ? `/lcp${n}` : `l${n}`}.htm`);
  urls.push(`${base}/leis/${arq}.htm`);
  urls.push(`${base}/leis/${arq.toUpperCase()}.htm`);
  return [...new Set(urls)];
}

/** Tenta achar a lei oficial no Planalto pelo número e ano. */
export const buscarLeiOficial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        numero: z.string().trim().min(1).max(20),
        ano: z.number().int().min(1900).max(2100),
        complementar: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const urls = candidatosPlanalto(data.numero, data.ano, data.complementar ?? false);
    for (const url of urls) {
      try {
        const r = await baixar(url);
        if ("erro" in r) continue;
        const texto = htmlParaTexto(r.html!);
        if (texto.length > 500 && /Art\.?\s*1/i.test(texto)) {
          return {
            ok: true as const,
            titulo: tituloDaLei(texto),
            texto,
            chars: texto.length,
            url,
          };
        }
      } catch {
        // tenta o próximo endereço
      }
    }
    return {
      ok: false as const,
      erro: "Não encontrei essa lei automaticamente. Cole o link da lei no campo acima.",
    };
  });
