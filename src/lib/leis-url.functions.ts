/**
 * Busca o texto de uma lei a partir de um endereço (URL) público, sem gastar IA.
 * A página é baixada no servidor e convertida em texto simples, pronto para o
 * mesmo reconhecimento de artigos usado no texto colado (lerVadeMecum).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { baixarPagina, htmlParaTexto, urlSchema } from "./html-texto";
import { consolidarTexto, removerTachados } from "./legislacao-consolidar";

export { htmlParaTexto };

function tituloDaLei(texto: string) {
  const m = texto.match(
    /(LEI\s+(COMPLEMENTAR\s+)?N[º°.\s]*\s*[\d.]+[^\n]{0,60}|DECRETO[- ]LEI\s+N[º°.\s]*\s*[\d.]+[^\n]{0,60}|C[ÓO]DIGO\s+[A-ZÇÃÕÁÉÍÓÚ ]{3,60}|CONSTITUI[ÇC][ÃA]O[^\n]{0,60})/i,
  );
  return (m?.[0] ?? "").replace(/\s+/g, " ").trim();
}

async function baixar(url: string) {
  const r = await baixarPagina(url);
  if (r.erro) return { erro: r.erro };
  return { html: r.html };
}

/** Baixa uma URL informada pelo candidato e devolve o texto da lei. */
export const buscarLeiPorUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: urlSchema }).parse(d))
  .handler(async ({ data }) => {
    let r: Awaited<ReturnType<typeof baixar>>;
    try {
      r = await baixar(data.url);
    } catch {
      r = { erro: "" };
    }
    if ("erro" in r)
      return {
        ok: false as const,
        erro:
          r.erro ||
          "Não foi possível acessar o conteúdo da legislação. Verifique o endereço eletrônico ou tente novamente.",
      };
    const { html, tachados } = removerTachados(r.html!);
    const bruto = htmlParaTexto(html);
    if (bruto.length < 200) {
      return {
        ok: false as const,
        erro: "Não foi possível acessar o conteúdo da legislação. Verifique o endereço eletrônico ou tente novamente.",
      };
    }
    const { texto, relatorio } = consolidarTexto(bruto, tachados);
    if (!relatorio.artigosImportados) {
      return {
        ok: false as const,
        erro: "Não foi possível identificar com segurança a estrutura dos artigos. A importação automática foi interrompida para evitar erros no texto legal.",
      };
    }
    return {
      ok: true as const,
      titulo: tituloDaLei(texto),
      texto,
      chars: texto.length,
      url: data.url,
      relatorio,
      consultadoEm: new Date().toISOString(),
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
