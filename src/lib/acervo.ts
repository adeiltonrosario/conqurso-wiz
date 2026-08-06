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

/**
 * PDF anexado pelo candidato. `texto` é apenas o trecho enviado à IA;
 * o texto integral fica no IndexedDB (ver src/lib/anexos-store.ts).
 */
export type ArquivoAnexo = {
  nome: string;
  texto: string;
  chars: number;
  paginas?: number;
};


export type Acervo = {
  questoes: QuestaoCadastrada[];
  leis: string;
  gramatica: ArquivoAnexo[];
  provas: ArquivoAnexo[];
  edital: ArquivoAnexo[];
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

/** Anexos antigos eram só nomes (string[]); migramos para o formato com texto. */
function normalizarAnexos(valor: unknown): ArquivoAnexo[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item): ArquivoAnexo | null => {
      if (typeof item === "string") return { nome: item, texto: "", chars: 0 };
      if (item && typeof item === "object" && typeof (item as ArquivoAnexo).nome === "string") {
        const a = item as ArquivoAnexo;
        const texto = typeof a.texto === "string" ? a.texto : "";
        return {
          nome: a.nome,
          texto,
          chars: typeof a.chars === "number" ? a.chars : texto.length,
          ...(typeof a.paginas === "number" ? { paginas: a.paginas } : {}),
        };
      }
      return null;
    })
    .filter((a): a is ArquivoAnexo => a !== null);
}


export function lerAcervo(): Acervo {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return VAZIO;
    const bruto = JSON.parse(raw) as Partial<Acervo>;
    return {
      ...VAZIO,
      ...bruto,
      gramatica: normalizarAnexos(bruto.gramatica),
      provas: normalizarAnexos(bruto.provas),
      edital: normalizarAnexos(bruto.edital),
    };
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

const PREFIXO_LEI = "lei:";

export function ehAnexoDeLei(a: ArquivoAnexo) {
  return a.nome.startsWith(PREFIXO_LEI);
}

export function nomeLimpo(a: ArquivoAnexo) {
  return ehAnexoDeLei(a) ? a.nome.slice(PREFIXO_LEI.length) : a.nome;
}

export function marcarComoLei(nome: string) {
  return `${PREFIXO_LEI}${nome}`;
}

/** Provas anteriores (não são anexos de lei). */
export function provasAnteriores(acervo: Acervo) {
  return acervo.provas.filter((a) => !ehAnexoDeLei(a));
}

/** Trecho de cada anexo enviado à IA. */
const TRECHO = 12000;

function blocoAnexos(titulo: string, anexos: ArquivoAnexo[]) {
  if (!anexos.length) return "";
  const corpo = anexos
    .map((a) => {
      const nome = nomeLimpo(a);
      return a.texto
        ? `--- ${nome} ---\n${a.texto.slice(0, TRECHO)}`
        : `--- ${nome} (texto não lido) ---`;
    })
    .join("\n\n");
  return `${titulo}\n${corpo}`;
}

export function contextoDoAcervo(acervo: Acervo) {
  const questoes = acervo.questoes
    .map(
      (q) =>
        `Questão (${q.banca} — ${q.assunto}): ${q.enunciado}\nAlternativas: ${q.alternativas.join(" | ")}\nGabarito: ${q.correta}`,
    )
    .join("\n\n");

  const provas = provasAnteriores(acervo);
  const leisPdf = acervo.provas.filter(ehAnexoDeLei);

  return [
    questoes && `QUESTÕES CADASTRADAS:\n${questoes}`,
    acervo.leis && `LEIS / VADE MECUM:\n${acervo.leis}`,
    blocoAnexos("PDFs DE LEIS ANEXADOS:", leisPdf),
    blocoAnexos("GRAMÁTICAS ANEXADAS:", acervo.gramatica),
    blocoAnexos(
      "PROVAS ANTERIORES ANEXADAS (banco de questões reais do candidato — use como fonte prioritária):",
      provas,
    ),
    blocoAnexos("EDITAL ANEXADO:", acervo.edital),
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
