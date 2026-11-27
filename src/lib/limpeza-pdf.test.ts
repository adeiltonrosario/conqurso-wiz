import { describe, expect, it, vi } from "vitest";
import type { Questao } from "./ai.functions";
import type { Acervo, QuestaoCadastrada } from "./acervo";
import {
  acervoSemExtraidasDoPdf,
  contarExtraidasDoPdf,
  ehExtraidaDoPdf,
  limparExtraidasDoPdf,
} from "./limpeza-pdf";

function questao(parcial: Partial<Questao> & { id: string }): Questao {
  return {
    banca: "VUNESP",
    grupo: "Conhecimento Geral",
    materia: "Direito Penal",
    enunciado: "Enunciado da questão.",
    alternativas: [
      { letra: "A", texto: "Alt A", correta: true, explicacao: "" },
      { letra: "B", texto: "Alt B", correta: false, explicacao: "" },
    ],
    explicacao: "",
    ...parcial,
  };
}

function cadastrada(parcial: Partial<QuestaoCadastrada> & { id: string }): QuestaoCadastrada {
  return {
    enunciado: "Enunciado.",
    assunto: "Art. 319",
    banca: "VUNESP",
    formato: "multipla",
    alternativas: ["A", "B"],
    correta: "A",
    ...parcial,
  };
}

/** Acervo com os três tipos que vivem em `extraidas`: PDF, Quest API e o resto. */
const ACERVO: Acervo = {
  questoes: [
    cadastrada({ id: "uuid-cadastrada-1" }),
    cadastrada({ id: "uuid-cadastrada-2" }),
  ],
  leis: "Lei nº 8.429/1992 (Improbidade Administrativa)",
  gramatica: [{ nome: "gramatica.pdf", texto: "texto", chars: 5 }],
  provas: [{ nome: "prova.pdf", texto: "", chars: 0 }],
  edital: [],
  simulado: [questao({ id: "simulado:1" })],
  extraidas: [
    questao({ id: "pdf:prova-2024.pdf:1" }),
    questao({ id: "pdf:prova-2024.pdf:2" }),
    questao({ id: "quest:12345", origem: "Quest API" }),
  ],
};

describe("limpeza seletiva das extraídas do PDF", () => {
  it("só o id pdf: é extraída do PDF", () => {
    expect(ehExtraidaDoPdf({ id: "pdf:prova-2024.pdf:1" })).toBe(true);
    expect(ehExtraidaDoPdf({ id: "quest:12345" })).toBe(false);
    expect(ehExtraidaDoPdf({ id: "caderno:5" })).toBe(false);
    expect(ehExtraidaDoPdf({ id: "uuid-cadastrada-1" })).toBe(false);
  });

  it("conta só as extraídas do PDF", () => {
    expect(contarExtraidasDoPdf(ACERVO)).toBe(2);
  });

  it("limpar extraídas preserva questoes, simulado e leis", () => {
    const limpo = acervoSemExtraidasDoPdf(ACERVO);
    expect(limpo.extraidas.map((q) => q.id)).toEqual(["quest:12345"]);
    expect(limpo.questoes).toEqual(ACERVO.questoes);
    expect(limpo.simulado).toEqual(ACERVO.simulado);
    expect(limpo.leis).toBe(ACERVO.leis);
    expect(limpo.gramatica).toEqual(ACERVO.gramatica);
    expect(limpo.provas).toEqual(ACERVO.provas);
    expect(limpo.edital).toEqual(ACERVO.edital);
    // Não muta o acervo original.
    expect(ACERVO.extraidas).toHaveLength(3);
  });

  it("a limpeza chama o apagar da nuvem uma única vez e salva o acervo limpo", async () => {
    const removerDaNuvem = vi.fn(async () => ({ removidas: 2 }));
    const salvarNuvem = vi.fn(async (_a: Acervo) => {});
    const salvarLocal = vi.fn((_a: Acervo) => {});

    const resultado = await limparExtraidasDoPdf({
      ler: () => ACERVO,
      salvarLocal,
      salvarNuvem,
      removerDaNuvem,
    });

    expect(resultado).toEqual({ removidasNuvem: 2, removidasLocal: 2 });
    expect(removerDaNuvem).toHaveBeenCalledTimes(1);
    expect(salvarNuvem).toHaveBeenCalledTimes(1);
    expect(salvarLocal).toHaveBeenCalledTimes(1);
    const salvo = salvarNuvem.mock.calls[0]?.[0];
    expect(salvo?.extraidas.map((q) => q.id)).toEqual(["quest:12345"]);
    expect(salvo?.questoes).toEqual(ACERVO.questoes);
    expect(salvo?.simulado).toEqual(ACERVO.simulado);
    expect(salvo?.leis).toBe(ACERVO.leis);
    expect(salvarLocal.mock.calls[0]?.[0]).toEqual(salvo);
  });

  it("sem extraídas do PDF, não remove nada e devolve zeros", async () => {
    const semPdf: Acervo = { ...ACERVO, extraidas: [questao({ id: "quest:12345" })] };
    const removerDaNuvem = vi.fn(async () => ({ removidas: 0 }));
    const salvarNuvem = vi.fn(async (_a: Acervo) => {});
    const salvarLocal = vi.fn((_a: Acervo) => {});

    const resultado = await limparExtraidasDoPdf({
      ler: () => semPdf,
      salvarLocal,
      salvarNuvem,
      removerDaNuvem,
    });

    expect(resultado).toEqual({ removidasNuvem: 0, removidasLocal: 0 });
    expect(removerDaNuvem).toHaveBeenCalledTimes(1);
    expect(salvarNuvem.mock.calls[0]?.[0]).toEqual(semPdf);
  });
});
