/**
 * Busca questões reais na Quest API (quest.api.br). A chave fica só no servidor.
 * Cada questão é convertida para o formato do acervo, com gabarito oficial.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { htmlParaTexto } from "./html-texto";

const BASE = "https://api.quest.api.br/v1";

type ItemQuest = {
  id: string;
  numero?: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string | null;
  prova?: { orgao?: string; cargo?: string; ano?: string; banca?: string };
  classificacao?: { materia?: string; assunto?: string };
  textos_associados?: unknown[];
  anulada?: boolean;
  tipo?: string;
};

export type QuestaoQuestApi = {
  id: string;
  banca: string;
  ano?: number;
  orgao: string;
  cargo: string;
  materiaApi: string;
  assuntoApi: string;
  numero?: number;
  enunciado: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  temGabarito: boolean;
};

function texto(html: string) {
  return htmlParaTexto(html ?? "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textoAssociado(t: unknown): string {
  if (!t || typeof t !== "object") return typeof t === "string" ? texto(t) : "";
  const o = t as Record<string, unknown>;
  const v = o["texto"] ?? o["conteudo"] ?? o["html"];
  return typeof v === "string" ? texto(v) : "";
}

const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "em", "a", "o", "à", "ao", "na", "no", "para", "com"]);

/** "DIREITO CONSTITUCIONAL" -> "Direito Constitucional" (formato do catálogo da Quest API). */
export function tituloQuest(s: string) {
  return s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

/** Converte o nome da banca do edital para o nome usado na Quest API. */
export function bancaQuest(b: string) {
  const n = b.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/CEBRASPE|CESPE/.test(n)) return "CESPE CEBRASPE";
  if (/AOCP/.test(n)) return "Instituto AOCP";
  if (/VUNESP/.test(n)) return "VUNESP";
  if (/^FCC|CARLOS CHAGAS/.test(n)) return "FCC";
  if (/^FGV|GETULIO VARGAS/.test(n)) return "FGV";
  if (n.length <= 6) return n;
  return tituloQuest(b);
}

export const buscarQuestoesQuestApi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        banca: z.string().trim().max(80).optional(),
        materia: z.string().trim().max(120).optional(),
        cargo: z.string().trim().max(120).optional(),
        orgao: z.string().trim().max(120).optional(),
        ano: z.string().trim().max(4).optional(),
        pagina: z.number().int().min(1).max(500).default(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const chave = process.env["QUEST_API_KEY"];
    if (!chave) return { ok: false as const, erro: "A chave da Quest API não está configurada." };
    const headers = { "X-API-Key": chave, Accept: "application/json" };

    const qs = new URLSearchParams({ page: String(data.pagina), per_page: "10" });
    const valores = {
      banca: data.banca ? bancaQuest(data.banca) : "",
      materia: data.materia ? tituloQuest(data.materia) : "",
      cargo: data.cargo ? tituloQuest(data.cargo) : "",
      orgao: data.orgao ?? "",
      ano: data.ano ?? "",
    };
    for (const [k, v] of Object.entries(valores)) if (v) qs.set(k, v);

    let lista: { total: number; items: ItemQuest[] };
    try {
      const r = await fetch(`${BASE}/questoes?${qs}`, { headers });
      if (!r.ok) {
        console.error("Quest API", r.status, await r.text().catch(() => ""));
        const erro =
          r.status === 401
            ? "A chave da Quest API foi recusada. Confira se ela ainda está ativa."
            : r.status === 402 || r.status === 429
              ? "Sua cota da Quest API acabou ou está no limite. Tente mais tarde."
              : "A Quest API não respondeu agora. Tente de novo.";
        return { ok: false as const, erro };
      }
      lista = ((await r.json()) as { data: { total: number; items: ItemQuest[] } }).data;
    } catch (e) {
      console.error("Quest API", e);
      return { ok: false as const, erro: "Não consegui falar com a Quest API." };
    }

    // O gabarito só vem no detalhe de cada questão.
    const detalhes = await Promise.all(
      lista.items.map(async (it) => {
        try {
          const r = await fetch(`${BASE}/questoes/${encodeURIComponent(it.id)}`, { headers });
          if (!r.ok) return it;
          return ((await r.json()) as { data: ItemQuest }).data;
        } catch {
          return it;
        }
      }),
    );

    const questoes: QuestaoQuestApi[] = detalhes
      .filter((q) => !q.anulada && q.alternativas?.length >= 2)
      .map((q) => {
        const gab = (q.gabarito ?? "").trim().toUpperCase();
        const apoio = (q.textos_associados ?? []).map(textoAssociado).filter(Boolean).join("\n\n");
        const enunciado = [apoio, texto(q.enunciado)].filter(Boolean).join("\n\n");
        const ano = Number(q.prova?.ano);
        const numero = Number(q.numero);
        return {
          id: `quest:${q.id}`,
          banca: q.prova?.banca ?? "",
          ...(ano ? { ano } : {}),
          orgao: q.prova?.orgao ?? "",
          cargo: q.prova?.cargo ?? "",
          materiaApi: q.classificacao?.materia ?? "",
          assuntoApi: q.classificacao?.assunto ?? "",
          ...(numero ? { numero } : {}),
          enunciado,
          alternativas: q.alternativas.map((a) => ({
            letra: a.letra,
            texto: texto(a.texto),
            correta: !!gab && a.letra.toUpperCase() === gab,
          })),
          temGabarito: !!gab,
        };
      });

    return { ok: true as const, total: lista.total, pagina: data.pagina, questoes };
  });
