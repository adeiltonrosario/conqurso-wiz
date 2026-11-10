import { useEffect, useState } from "react";

/**
 * Explicações pessoais por artigo de lei. Gravadas no aparelho e espelhadas
 * na nuvem da conta pela sincronização (chave "anotacoes").
 */
export type AnotacaoArtigo = { texto: string; lei: string; referencia: string; atualizadoEm: number; estrelas?: number };

const KEY = "concurseiro:anotacoes";
const EVENTO = "anotacoes:mudou";

export function lerAnotacoes(): Record<string, AnotacaoArtigo> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, AnotacaoArtigo>) : {};
  } catch {
    return {};
  }
}

export function salvarAnotacao(chave: string, dados: Omit<AnotacaoArtigo, "atualizadoEm"> | null) {
  const todas = lerAnotacoes();
  if (!dados || !dados.texto.trim()) delete todas[chave];
  else todas[chave] = { ...dados, texto: dados.texto.trim(), atualizadoEm: Date.now() };
  window.localStorage.setItem(KEY, JSON.stringify(todas));
  window.dispatchEvent(new Event(EVENTO));
}

export function useAnotacoes() {
  const [anotacoes, setAnotacoes] = useState<Record<string, AnotacaoArtigo>>({});
  useEffect(() => {
    const ler = () => setAnotacoes(lerAnotacoes());
    ler();
    window.addEventListener(EVENTO, ler);
    window.addEventListener("storage", ler);
    return () => {
      window.removeEventListener(EVENTO, ler);
      window.removeEventListener("storage", ler);
    };
  }, []);
  return anotacoes;
}

/** Estrelas (0–3) que o próprio estudante dá ao artigo. Ficam no mesmo
 * registro sincronizado das explicações, com chave prefixada por "★". */
const PREFIXO_ESTRELA = "★";

export function estrelasDoArtigo(anotacoes: Record<string, AnotacaoArtigo>, chave: string): number {
  return anotacoes[PREFIXO_ESTRELA + chave]?.estrelas ?? 0;
}

export function salvarEstrelas(chave: string, lei: string, referencia: string, estrelas: number) {
  const todas = lerAnotacoes();
  const k = PREFIXO_ESTRELA + chave;
  if (estrelas <= 0) delete todas[k];
  else todas[k] = { texto: "", lei, referencia, estrelas: Math.min(3, estrelas), atualizadoEm: Date.now() };
  window.localStorage.setItem(KEY, JSON.stringify(todas));
  window.dispatchEvent(new Event(EVENTO));
}
