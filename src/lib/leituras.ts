import { useEffect, useState } from "react";

/**
 * Leituras de lei feitas na aba "Leis": servem de contexto para os reforços
 * da revisão espaçada.
 */
export type Leitura = {
  id: string;
  materia: string;
  capitulo: string;
  baseLegal: string;
  resumo: string;
  lidoEm: number;
  /** Quantas questões de revisão já foram geradas a partir desta leitura. */
  questoesGeradas: number;
  /** Artigos/tópicos selecionados dentro do capítulo: as questões saem só deles. */
  focos: string[];
};

const KEY = "concurseiro:leituras";

export function lerLeituras(): Leitura[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Leitura[]) : [];
  } catch {
    return [];
  }
}

function salvar(leituras: Leitura[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(leituras.slice(0, 40)));
  window.dispatchEvent(new Event("leituras:mudou"));
}

export function registrarLeitura(leitura: Omit<Leitura, "id" | "lidoEm" | "questoesGeradas">) {
  const leituras = lerLeituras();
  const id = `${leitura.materia}::${leitura.capitulo}`.toLowerCase();
  const anterior = leituras.find((l) => l.id === id);
  const proximo: Leitura = {
    ...leitura,
    id,
    lidoEm: Date.now(),
    questoesGeradas: anterior?.questoesGeradas ?? 0,
    focos: anterior?.focos ?? [],
  };
  salvar([proximo, ...leituras.filter((l) => l.id !== id)]);
  return proximo;
}

export function somarQuestoesGeradas(id: string, quantidade: number) {
  salvar(
    lerLeituras().map((l) =>
      l.id === id ? { ...l, questoesGeradas: l.questoesGeradas + quantidade } : l,
    ),
  );
}

export function definirFocos(id: string, focos: string[]) {
  salvar(lerLeituras().map((l) => (l.id === id ? { ...l, focos } : l)));
}

export function removerLeitura(id: string) {
  salvar(lerLeituras().filter((l) => l.id !== id));
}

/** Contexto textual da leitura para a IA gerar questões fiéis ao capítulo lido. */
export function contextoDaLeitura(leitura: Leitura) {
  const focos = leitura.focos ?? [];
  const recorte = focos.length
    ? `\n\nRECORTE OBRIGATÓRIO — gere questões EXCLUSIVAMENTE sobre os artigos/tópicos abaixo, ignorando o resto do capítulo:\n${focos
        .map((f, i) => `${i + 1}. ${f}`)
        .join("\n")}`
    : "";
  return `CAPÍTULO LIDO PELO CANDIDATO — ${leitura.materia}: ${leitura.capitulo}
Base legal: ${leitura.baseLegal}
Resumo estudado:
${leitura.resumo}${recorte}`.slice(0, 12000);
}

export function useLeituras() {
  const [leituras, setLeituras] = useState<Leitura[]>([]);

  useEffect(() => {
    const sync = () => setLeituras(lerLeituras());
    sync();
    window.addEventListener("leituras:mudou", sync);
    return () => window.removeEventListener("leituras:mudou", sync);
  }, []);

  return { leituras };
}
