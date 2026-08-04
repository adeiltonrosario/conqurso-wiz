import { useEffect, useState } from "react";
import type { Questao } from "./ai.functions";

export type QuestaoCadastrada = {
  id: string;
  enunciado: string;
  assunto: string;
  banca: string;
  formato: "multipla" | "certo-errado";
  alternativas: string[];
  correta: string;
};

export type Acervo = {
  questoes: QuestaoCadastrada[];
  leis: string;
  gramatica: string[];
  provas: string[];
  edital: string[];
  simulado: Questao[];
};

const VAZIO: Acervo = {
  questoes: [],
  leis: "",
  gramatica: [],
  provas: [],
  edital: [],
  simulado: [],
};

const KEY = "concurseiro:acervo";

export function lerAcervo(): Acervo {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...VAZIO, ...(JSON.parse(raw) as Acervo) } : VAZIO;
  } catch {
    return VAZIO;
  }
}

export function salvarAcervo(acervo: Acervo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(acervo));
  window.dispatchEvent(new Event("acervo:mudou"));
}

export function useAcervo() {
  const [acervo, setAcervo] = useState<Acervo>(VAZIO);

  useEffect(() => {
    const sync = () => setAcervo(lerAcervo());
    sync();
    window.addEventListener("acervo:mudou", sync);
    return () => window.removeEventListener("acervo:mudou", sync);
  }, []);

  const atualizar = (patch: Partial<Acervo>) => {
    const proximo = { ...lerAcervo(), ...patch };
    salvarAcervo(proximo);
    setAcervo(proximo);
  };

  return { acervo, atualizar };
}

export function contextoDoAcervo(acervo: Acervo) {
  const questoes = acervo.questoes
    .map(
      (q) =>
        `Questão (${q.banca} — ${q.assunto}): ${q.enunciado}\nAlternativas: ${q.alternativas.join(" | ")}\nGabarito: ${q.correta}`,
    )
    .join("\n\n");
  return [
    questoes && `QUESTÕES CADASTRADAS:\n${questoes}`,
    acervo.leis && `LEIS / VADE MECUM:\n${acervo.leis}`,
    acervo.gramatica.length && `GRAMÁTICAS ANEXADAS: ${acervo.gramatica.join(", ")}`,
    acervo.provas.length && `PROVAS ANTERIORES ANEXADAS: ${acervo.provas.join(", ")}`,
    acervo.edital.length && `EDITAL ANEXADO: ${acervo.edital.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const BANCAS = ["FCC", "FGV", "CESPE/CEBRASPE", "VUNESP", "IBFC", "Instituto AOCP"];

export const MATERIAS_GERAL = [
  "Língua Portuguesa",
  "Raciocínio Lógico",
  "Informática",
  "Atualidades",
];

export const MATERIAS_ESPECIFICO = [
  "Direito Penal",
  "Direito Constitucional",
  "Direito Administrativo",
  "Processo Penal",
];

export const MODELOS_REDACAO = [
  "Padrão banca — tese + 2 argumentos + intervenção",
  "Estudo de caso jurídico com fundamentação legal",
  "Dissertação com dados e citação de autoridade",
  "Estrutura comparativa (causas x consequências)",
];
