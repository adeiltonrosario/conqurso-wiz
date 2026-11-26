/**
 * Navegação simplificada — 4 telas no menu de baixo.
 *
 * Nada aqui muda rotas: /trilha, /leis, /questoes, /prova-interativa,
 * /analise-padroes, /revisao, /flashcards, /redacao, /inclusao, / e /auth
 * continuam existindo com as mesmas URLs. Só o menu agrupa as rotas:
 * Hoje junta / e /trilha, Treinar junta /questoes, /prova-interativa e
 * /analise-padroes, Revisar junta /revisao e /flashcards. Redação e
 * Incluir não têm tela própria no menu — moram na seção "Mais" da Hoje.
 *
 * O relógio automático (src/lib/tempo-estudo.ts) deriva a atividade da
 * rota e não depende deste mapa: manter a correspondência rota→atividade
 * dele intacta ao mexer aqui.
 */

export type Tela = "hoje" | "leis" | "treinar" | "revisar";

/** Rota principal de cada tela do menu (para onde o item do menu leva). */
export const ROTA_DA_TELA: Record<Tela, string> = {
  hoje: "/trilha",
  leis: "/leis",
  treinar: "/questoes",
  revisar: "/revisao",
} as const;

/** Rotas que pertencem a cada tela (para marcar o item ativo no menu). */
export const ROTAS_DA_TELA: Record<Tela, readonly string[]> = {
  hoje: ["/", "/trilha"],
  leis: ["/leis"],
  treinar: ["/questoes", "/prova-interativa", "/analise-padroes"],
  revisar: ["/revisao", "/flashcards"],
} as const;

/** A qual das 4 telas uma rota pertence — null quando não pertence a nenhuma (ex.: /redacao, /inclusao, /auth). */
export function telaDaRota(pathname: string): Tela | null {
  const rota = (pathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";
  for (const [tela, rotas] of Object.entries(ROTAS_DA_TELA)) {
    if (rotas.includes(rota)) return tela as Tela;
  }
  return null;
}

export type AbaGrupo = { to: string; label: string };

/** Abas dentro de Treinar: Questões, Prova e Padrões são a mesma tela. */
export const ABAS_TREINAR: readonly AbaGrupo[] = [
  { to: "/questoes", label: "Questões" },
  { to: "/prova-interativa", label: "Prova" },
  { to: "/analise-padroes", label: "Padrões" },
] as const;

/** Abas dentro de Revisar: Revisão espaçada e Cards são a mesma tela. */
export const ABAS_REVISAR: readonly AbaGrupo[] = [
  { to: "/revisao", label: "Revisão" },
  { to: "/flashcards", label: "Cards" },
] as const;
