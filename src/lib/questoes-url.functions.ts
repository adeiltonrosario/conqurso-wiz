/**
 * Busca questões a partir de um endereço (URL) público, sem gastar IA.
 * A página é baixada no servidor e devolvida como texto simples; a separação
 * em enunciado/alternativas acontece no aparelho, com o mesmo extrator dos PDFs.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { baixarPagina, htmlParaTexto, tituloDaPagina, urlSchema } from "./html-texto";

/** Páginas que só entregam conteúdo depois do login. */
const PEDEM_LOGIN = /qconcursos|tecconcursos|estrategiaconcursos|granconcursos|aprovaconcursos/i;

export const buscarQuestoesPorUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: urlSchema }).parse(d))
  .handler(async ({ data }) => {
    let r: { html?: string; erro?: string };
    try {
      r = await baixarPagina(data.url);
    } catch {
      return { ok: false as const, erro: "Não consegui abrir esse endereço. Confira o link." };
    }
    if (r.erro || !r.html) {
      const exige = PEDEM_LOGIN.test(data.url);
      return {
        ok: false as const,
        erro: exige
          ? "Esse site exige login e bloqueia a leitura automática. Copie as questões e cole em “Incluir → Nova questão”."
          : (r.erro ?? "Não consegui ler essa página."),
      };
    }
    const texto = htmlParaTexto(r.html);
    if (texto.length < 200) {
      return {
        ok: false as const,
        erro: "Não achei texto nessa página (pode exigir login ou ser só imagem). Copie as questões e cole em “Incluir → Nova questão”.",
      };
    }
    return {
      ok: true as const,
      texto,
      titulo: tituloDaPagina(r.html) || new URL(data.url).hostname,
      url: data.url,
      chars: texto.length,
    };
  });
