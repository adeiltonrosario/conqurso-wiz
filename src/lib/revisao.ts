import { useEffect, useState } from "react";
import type { Questao } from "./ai.functions";

/**
 * Repetição espaçada (algoritmo SM-2 simplificado, adaptado para concursos).
 * Tudo fica salvo no aparelho, junto do histórico de acertos e erros.
 */
export type CardRevisao = {
  questao: Questao;
  materia: string;
  acertos: number;
  erros: number;
  /** Facilidade do card: quanto maior, mais longo o intervalo. */
  facilidade: number;
  /** Intervalo atual em dias. */
  intervalo: number;
  /** Repetições consecutivas corretas. */
  sequencia: number;
  ultimaRevisao: number;
  proximaRevisao: number;
};

export type HistoricoRevisao = {
  cards: Record<string, CardRevisao>;
};

const KEY = "concurseiro:revisao";
const VAZIO: HistoricoRevisao = { cards: {} };
const DIA = 24 * 60 * 60 * 1000;

export const INTERVALOS = [0, 1, 3, 7, 15, 30, 60] as const;

export function lerHistorico(): HistoricoRevisao {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...VAZIO, ...(JSON.parse(raw) as HistoricoRevisao) } : VAZIO;
  } catch {
    return VAZIO;
  }
}

function salvar(historico: HistoricoRevisao) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(historico));
  window.dispatchEvent(new Event("revisao:mudou"));
}

function chave(questao: Questao) {
  return questao.id || questao.enunciado.slice(0, 80);
}

/**
 * Registra o resultado de uma questão respondida e agenda a próxima revisão.
 * `qualidade`: 0 = errou, 1 = acertou com dúvida, 2 = acertou com segurança.
 */
export function registrarResposta(questao: Questao, acertou: boolean, qualidade = acertou ? 2 : 0) {
  const historico = lerHistorico();
  const id = chave(questao);
  const atual: CardRevisao =
    historico.cards[id] ??
    ({
      questao,
      materia: questao.materia || "Geral",
      acertos: 0,
      erros: 0,
      facilidade: 2.5,
      intervalo: 0,
      sequencia: 0,
      ultimaRevisao: 0,
      proximaRevisao: 0,
    } satisfies CardRevisao);

  const acertos = atual.acertos + (acertou ? 1 : 0);
  const erros = atual.erros + (acertou ? 0 : 1);
  const facilidade = Math.min(
    3,
    Math.max(1.3, atual.facilidade + (acertou ? (qualidade === 2 ? 0.12 : 0) : -0.25)),
  );
  const sequencia = acertou ? atual.sequencia + 1 : 0;
  const passo = Math.min(sequencia, INTERVALOS.length - 1);
  const intervalo = acertou ? Math.max(1, Math.round(INTERVALOS[passo]! * facilidade * 0.6)) : 0;
  const agora = Date.now();

  salvar({
    ...historico,
    cards: {
      ...historico.cards,
      [id]: {
        ...atual,
        questao,
        materia: questao.materia || atual.materia,
        acertos,
        erros,
        facilidade,
        sequencia,
        intervalo,
        ultimaRevisao: agora,
        // Erro volta para a fila imediata (10 minutos).
        proximaRevisao: acertou ? agora + intervalo * DIA : agora + 10 * 60 * 1000,
      },
    },
  });
}

/**
 * Coloca questões na fila de revisão sem tocar no histórico das que já estão
 * lá (acertos, erros e datas ficam intactos). Retorna quantas entraram.
 */
export function adicionarNaRevisao(questoes: Questao[]) {
  const historico = lerHistorico();
  const cards = { ...historico.cards };
  let novas = 0;
  for (const questao of questoes) {
    const id = chave(questao);
    if (cards[id]) continue;
    cards[id] = {
      questao,
      materia: questao.materia || "Geral",
      acertos: 0,
      erros: 0,
      facilidade: 2.5,
      intervalo: 0,
      sequencia: 0,
      ultimaRevisao: 0,
      proximaRevisao: Date.now(),
    };
    novas++;
  }
  if (novas) salvar({ ...historico, cards });
  return novas;
}

export function removerCard(id: string) {
  const historico = lerHistorico();
  const cards = { ...historico.cards };
  delete cards[id];
  salvar({ ...historico, cards });
}

export function limparHistorico() {
  salvar(VAZIO);
}

export type ResumoMateria = {
  materia: string;
  total: number;
  acertos: number;
  erros: number;
  taxa: number;
  vencidos: number;
};

export function resumoPorMateria(historico: HistoricoRevisao): ResumoMateria[] {
  const agora = Date.now();
  const mapa = new Map<string, ResumoMateria>();
  for (const card of Object.values(historico.cards)) {
    const atual =
      mapa.get(card.materia) ??
      { materia: card.materia, total: 0, acertos: 0, erros: 0, taxa: 0, vencidos: 0 };
    atual.total += 1;
    atual.acertos += card.acertos;
    atual.erros += card.erros;
    if (card.proximaRevisao <= agora) atual.vencidos += 1;
    mapa.set(card.materia, atual);
  }
  return [...mapa.values()]
    .map((m) => ({ ...m, taxa: m.acertos + m.erros ? m.acertos / (m.acertos + m.erros) : 0 }))
    .sort((a, b) => a.taxa - b.taxa);
}

/** Cards vencidos, do mais fraco (mais erros / menor facilidade) para o mais forte. */
export function filaDeHoje(historico: HistoricoRevisao, materia?: string | null): CardRevisao[] {
  const agora = Date.now();
  return Object.values(historico.cards)
    .filter((c) => c.proximaRevisao <= agora)
    .filter((c) => !materia || c.materia === materia)
    .sort((a, b) => b.erros - a.erros || a.facilidade - b.facilidade || a.proximaRevisao - b.proximaRevisao);
}

export function proximaData(historico: HistoricoRevisao): number | null {
  const futuros = Object.values(historico.cards)
    .map((c) => c.proximaRevisao)
    .filter((t) => t > Date.now())
    .sort((a, b) => a - b);
  return futuros[0] ?? null;
}

export function materiaMaisFraca(historico: HistoricoRevisao): string | null {
  const resumo = resumoPorMateria(historico).filter((m) => m.acertos + m.erros >= 1);
  return resumo[0]?.materia ?? null;
}

export function useRevisao() {
  const [historico, setHistorico] = useState<HistoricoRevisao>(VAZIO);

  useEffect(() => {
    const sync = () => setHistorico(lerHistorico());
    sync();
    window.addEventListener("revisao:mudou", sync);
    return () => window.removeEventListener("revisao:mudou", sync);
  }, []);

  return { historico, registrarResposta, removerCard, limparHistorico };
}
