import { supabase } from "@/integrations/supabase/client";
import { salvarEstado } from "./sync.functions";
import { limparTextosLocais } from "./anexos-store";

/**
 * Limpeza total do acervo pedida pelo usuário (questões + leis), preservando
 * edital, matérias, bancas, cargos, trilha e flashcards.
 * - Nuvem: roda uma única vez por conta (marca gravada no armazenamento).
 * - Aparelho: roda uma única vez por aparelho, para que dados antigos em cache
 *   não subam de volta para a conta.
 */
export const LIMPEZA_ACERVO = "2026-11-01";
const BUCKET = "anexos";
const MARCA = `.limpeza-${LIMPEZA_ACERVO}`;
const FLAG_LOCAL = "concurseiro:limpeza-acervo";

export const ACERVO_VAZIO = {
  questoes: [],
  leis: "",
  gramatica: [],
  provas: [],
  edital: [],
  simulado: [],
  extraidas: [],
};

const LOCAIS: Record<string, unknown> = {
  "concurseiro:acervo": ACERVO_VAZIO,
  "concurseiro:revisao": { cards: {} },
  "concurseiro:leituras": [],
  "concurseiro:favoritos": [],
  "concurseiro:ocultos": { artigos: [], paragrafos: [], trechos: [] },
};
const EVENTOS = ["acervo:mudou", "revisao:mudou", "leituras:mudou", "favoritos:mudou", "ocultos:mudou"];

/** Retorna true quando a nuvem foi limpa agora (o chamador deve ignorar a cópia antiga). */
export async function limparAcervoNaNuvem(): Promise<boolean> {
  const { data: sessao } = await supabase.auth.getSession();
  const uid = sessao.session?.user.id;
  if (!uid) return false;

  const { data: arquivos, error: erroLista } = await supabase.storage
    .from(BUCKET)
    .list(uid, { limit: 1000 });
  if (erroLista) throw erroLista;
  if ((arquivos ?? []).some((f) => f.name === MARCA)) return false;

  const { error: erroQuestoes } = await supabase
    .from("questoes_extraidas")
    .delete()
    .eq("user_id", uid);
  if (erroQuestoes) throw erroQuestoes;

  await salvarEstado({ data: { chave: "acervo", json: JSON.stringify(ACERVO_VAZIO) } });
  await salvarEstado({ data: { chave: "revisao", json: JSON.stringify({ cards: {} }) } });
  await salvarEstado({ data: { chave: "leituras", json: "[]" } });

  const caminhos = (arquivos ?? []).map((f) => `${uid}/${f.name}`);
  if (caminhos.length) {
    const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
    if (error) throw error;
  }

  const { error: erroMarca } = await supabase.storage
    .from(BUCKET)
    .upload(`${uid}/${MARCA}`, new Blob(["ok"], { type: "text/plain" }), { upsert: true });
  if (erroMarca) throw erroMarca;
  return true;
}

/** Apaga o cache local de questões e leis uma única vez neste aparelho. */
export async function limparAcervoLocal(forcar = false) {
  if (!forcar && window.localStorage.getItem(FLAG_LOCAL) === LIMPEZA_ACERVO) return;
  for (const [chave, valor] of Object.entries(LOCAIS)) {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  }
  await limparTextosLocais();
  window.localStorage.setItem(FLAG_LOCAL, LIMPEZA_ACERVO);
  EVENTOS.forEach((e) => window.dispatchEvent(new Event(e)));
}
