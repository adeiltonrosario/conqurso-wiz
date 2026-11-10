import { useEffect, useState } from "react";

/**
 * Explicações pessoais por artigo de lei. Gravadas no aparelho e espelhadas
 * na nuvem da conta pela sincronização (chave "anotacoes").
 */
export type AnotacaoArtigo = { texto: string; lei: string; referencia: string; atualizadoEm: number };

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
