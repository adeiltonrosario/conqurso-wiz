/**
 * Leitura de páginas públicas (HTML → texto simples), compartilhada pela busca
 * de leis por endereço e pela busca de questões por endereço. Sem IA.
 */
import { z } from "zod";

const MAX_BYTES = 5_000_000;

/** Aceita apenas endereços públicos http/https (bloqueia rede interna). */
export const urlSchema = z
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

// Vogais acentuadas e cedilha: &Oacute; → Ó, &ccedil; → ç (maiúsculas e minúsculas).
const ACENTOS: Record<string, string> = { acute: "\u0301", grave: "\u0300", circ: "\u0302", tilde: "\u0303", uml: "\u0308", cedil: "\u0327" };

function entidade(nome: string) {
  const fixa = ENTIDADES[nome] ?? ENTIDADES[nome.toLowerCase()];
  if (fixa) return fixa;
  const m = /^([A-Za-z])(acute|grave|circ|tilde|uml|cedil)$/.exec(nome);
  if (m) return (m[1]! + ACENTOS[m[2]!]).normalize("NFC");
  return null;
}

function decodificar(texto: string) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (inteiro, nome: string) => entidade(nome) ?? inteiro)
    .normalize("NFC");
}

/** HTML → texto simples, preservando as quebras que separam artigos e questões. */
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

/** Título da página (tag <title>), quando existir. */
export function tituloDaPagina(html: string) {
  const m = /<title[^>]*>([\s\S]{1,200}?)<\/title>/i.exec(html);
  return m ? decodificar(String(m[1])).replace(/\s+/g, " ").trim() : "";
}

/** Bytes 0x80–0x9F do windows-1252 (o restante é igual ao latin-1). */
const CP1252 =
  "\u20ac\u0081\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u008d\u017d\u008f" +
  "\u0090\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u009d\u017e\u0178";

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

/** Baixa uma página pública e devolve o HTML já decodificado. */
export async function baixarPagina(url: string): Promise<{ html?: string; erro?: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ConcurseiroInteligente/1.0)",
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    const erro =
      res.status === 401 || res.status === 403
        ? "Essa página exige login e não deixa ler automaticamente. Copie as questões e cole em “Incluir”."
        : `A página respondeu ${res.status}.`;
    return { erro };
  }
  const tipo = res.headers.get("content-type") ?? "";
  if (/pdf|image|audio|video|octet-stream/i.test(tipo)) {
    return { erro: "Esse link não é uma página de texto. Anexe o PDF em “Incluir”." };
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return { erro: "A página é grande demais. Abra em partes ou cole o texto." };
  }
  const bytes = new Uint8Array(buffer);
  // Sites antigos servem em latin-1; o runtime de borda só decodifica UTF-8,
  // então a conversão latin-1/cp1252 é feita aqui, sem depender do TextDecoder.
  const charset = /charset=([\w-]+)/i.exec(tipo)?.[1]?.toLowerCase();
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const meta = /charset=["']?([\w-]+)/i.exec(utf8.slice(0, 4000))?.[1]?.toLowerCase();
  const declarado = charset ?? meta ?? "";
  const antigo = /8859|1252|latin/i.test(declarado);
  if (!utf8.includes("\uFFFD") && !antigo) return { html: utf8 };
  const latin = decodificarLatin1(bytes);
  const erros = (s: string) => (s.match(/\uFFFD/g) ?? []).length;
  // latin-1 nunca gera caractere de erro: se o UTF-8 falhou, a página é cp1252.
  const html = antigo || erros(utf8) > 0 || erros(latin) < erros(utf8) ? latin : utf8;
  return { html };
}
