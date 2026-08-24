/**
 * Banco de questões extraídas dos PDFs das provas, salvo na conta do usuário.
 * Serve como fonte reutilizável para as demais telas (revisão, prova interativa, IA).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Questao } from "./ai.functions";

type LinhaQuestao = {
  id: string;
  prova: string | null;
  numero: number | null;
  banca: string | null;
  grupo: string | null;
  materia: string | null;
  assunto: string | null;
  enunciado: string;
  alternativas: unknown;
  explicacao: string | null;
  origem: string | null;
};

function anoDoNome(nome: string | null) {
  const m = nome?.match(/(19|20)\d{2}/);
  const n = m ? Number(m[0]) : 0;
  return n >= 1990 && n <= new Date().getFullYear() + 1 ? n : undefined;
}

function paraQuestao(l: LinhaQuestao): Questao {
  const alternativas = Array.isArray(l.alternativas)
    ? (l.alternativas as Questao["alternativas"])
    : [];
  const ano = anoDoNome(l.prova);
  const titulo = [l.materia, l.assunto, l.banca, ano ? String(ano) : ""]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" · ");
  return {
    id: l.id,
    banca: l.banca ?? "",
    grupo: (l.grupo as Questao["grupo"]) ?? "Conhecimento Geral",
    materia: l.materia ?? "",
    ...(l.assunto ? { assunto: l.assunto } : {}),
    ...(ano ? { ano } : {}),
    ...(titulo ? { titulo } : {}),
    ...(l.origem ? { origem: l.origem } : {}),
    ...(l.prova ? { prova: l.prova } : {}),
    ...(typeof l.numero === "number" ? { numero: l.numero } : {}),
    enunciado: l.enunciado,
    alternativas,
    explicacao: l.explicacao ?? "",
  } as Questao;
}


function paraLinha(q: Questao, userId: string) {
  return {
    user_id: userId,
    id: q.id,
    prova: q.prova ?? null,
    numero: q.numero ?? null,
    banca: q.banca ?? null,
    grupo: q.grupo ?? null,
    materia: q.materia ?? null,
    assunto: q.assunto ?? null,
    enunciado: q.enunciado ?? "",
    alternativas: q.alternativas ?? [],
    explicacao: q.explicacao ?? "",
    origem: q.origem ?? null,
  };
}

const SELECT =
  "id, prova, numero, banca, grupo, materia, assunto, enunciado, alternativas, explicacao, origem";

/** Todas as questões extraídas do usuário. */
export const listarQuestoesExtraidas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("questoes_extraidas")
      .select(SELECT)
      .order("prova", { ascending: true })
      .order("numero", { ascending: true })
      .limit(2000);
    if (error) throw new Error(error.message);
    return ((data ?? []) as LinhaQuestao[]).map(paraQuestao);
  });

/** Grava (ou atualiza) em lote as questões de uma prova. */
export const salvarQuestoesExtraidas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { questoes: Questao[] }) => data)
  .handler(async ({ data, context }) => {
    const linhas = data.questoes.slice(0, 500).map((q) => paraLinha(q, context.userId));
    if (!linhas.length) return { salvas: 0 };
    const { error } = await context.supabase
      .from("questoes_extraidas")
      .upsert(linhas, { onConflict: "user_id,id" });
    if (error) throw new Error(error.message);
    return { salvas: linhas.length };
  });

/** Remove todas as questões de uma prova (ao reanexar ou excluir o PDF). */
export const removerQuestoesDaProva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prova: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("questoes_extraidas")
      .delete()
      .eq("user_id", context.userId)
      .eq("prova", data.prova);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
