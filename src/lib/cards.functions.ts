/**
 * Cards de estudo criados pelo próprio candidato (pergunta, resposta e imagem).
 * Ficam salvos na conta do usuário para aparecer em qualquer aparelho.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CardProprio = {
  id: string;
  pergunta: string;
  resposta: string;
  explicacao: string;
  materia: string;
  assunto: string;
  /** Link direto da imagem (quando o usuário colou uma URL). */
  imagemUrl: string;
  /** Caminho no armazenamento privado (quando enviou do aparelho). */
  imagemPath: string;
};

type Linha = {
  id: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
  materia: string | null;
  assunto: string | null;
  imagem_url: string | null;
  imagem_path: string | null;
};

const SELECT = "id, pergunta, resposta, explicacao, materia, assunto, imagem_url, imagem_path";

function paraCard(l: Linha): CardProprio {
  return {
    id: l.id,
    pergunta: l.pergunta,
    resposta: l.resposta,
    explicacao: l.explicacao ?? "",
    materia: l.materia ?? "",
    assunto: l.assunto ?? "",
    imagemUrl: l.imagem_url ?? "",
    imagemPath: l.imagem_path ?? "",
  };
}

export const listarCards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cards_estudo")
      .select(SELECT)
      .order("criado_em", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Linha[]).map(paraCard);
  });

export const salvarCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { card: CardProprio }) => data)
  .handler(async ({ data, context }) => {
    const c = data.card;
    const pergunta = c.pergunta.trim();
    const resposta = c.resposta.trim();
    if (!pergunta || !resposta) throw new Error("Pergunta e resposta são obrigatórias.");

    const linha = {
      id: c.id,
      user_id: context.userId,
      pergunta: pergunta.slice(0, 4000),
      resposta: resposta.slice(0, 4000),
      explicacao: c.explicacao.trim().slice(0, 4000) || null,
      materia: c.materia.trim().slice(0, 400) || null,
      assunto: c.assunto.trim().slice(0, 400) || null,
      imagem_url: c.imagemUrl.trim().slice(0, 2000) || null,
      imagem_path: c.imagemPath.trim().slice(0, 500) || null,
    };

    const { data: salvo, error } = await context.supabase
      .from("cards_estudo")
      .upsert(linha, { onConflict: "id" })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return paraCard(salvo as Linha);
  });

export const removerCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("cards_estudo")
      .delete()
      .eq("user_id", context.userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
