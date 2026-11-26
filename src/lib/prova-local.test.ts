import { describe, expect, it } from "vitest";
import type { Questao } from "./ai.functions";
import type { Acervo } from "./acervo";
import { questoesTreinaveis } from "./caderno-muse";
import type { EditalEstado } from "./edital";
import { top5DaMateria } from "./leis-resumidas";
import {
  bancoLocal,
  daCadernoMuse,
  ehDoCaderno,
  montarProvaLocal,
  questoesDoCaderno,
} from "./prova-local";

const MATERIA = "Língua Portuguesa";
/** Nomes dos 5 itens mais cobrados da matéria, na ordem contada. */
const TOP5 = top5DaMateria(MATERIA).map((t) => t.artigo);
/** Nome do item i do Top 5 (falha se o dado contado mudar de forma). */
const T = (i: number): string => {
  const nome = TOP5[i];
  if (!nome) throw new Error(`Top 5 de ${MATERIA} sem item ${i}`);
  return nome;
};

function questao(parcial: Partial<Questao> & { id: string }): Questao {
  return {
    banca: "VUNESP",
    grupo: "Conhecimento Geral",
    materia: MATERIA,
    enunciado: "Enunciado da questão.",
    alternativas: [
      { letra: "A", texto: "Alt A", correta: true, explicacao: "" },
      { letra: "B", texto: "Alt B", correta: false, explicacao: "" },
      { letra: "C", texto: "Alt C", correta: false, explicacao: "" },
      { letra: "D", texto: "Alt D", correta: false, explicacao: "" },
      { letra: "E", texto: "Alt E", correta: false, explicacao: "" },
    ],
    explicacao: "",
    ...parcial,
  };
}

/** Questão sem gabarito (nenhuma alternativa correta). */
function semGabarito(parcial: Partial<Questao> & { id: string }): Questao {
  const q = questao(parcial);
  return { ...q, alternativas: q.alternativas.map((a) => ({ ...a, correta: false })) };
}

const ehTop5 = (q: Questao) =>
  !!q.assunto && TOP5.some((t) => t.toLowerCase() === q.assunto?.toLowerCase());

/** Edital vazio (sem matérias ativas): nada é filtrado. */
const EDITAL_VAZIO = { texto: "", materias: [], cargos: [], bancas: [] } as unknown as EditalEstado;
const ACERVO_VAZIO = {
  questoes: [],
  leis: "",
  gramatica: [],
  provas: [],
  edital: [],
  simulado: [],
  extraidas: [],
} as unknown as Acervo;

describe("montarProvaLocal — prioridade ao Top 5", () => {
  it("monta 20 com 15 do Top 5 e 5 dos outros", () => {
    const banco = [
      ...Array.from({ length: 8 }, (_, i) => questao({ id: `t5a-${i}`, assunto: T(0) })),
      ...Array.from({ length: 8 }, (_, i) => questao({ id: `t5b-${i}`, assunto: T(1) })),
      ...Array.from({ length: 10 }, (_, i) =>
        questao({ id: `out-${i}`, assunto: "Outro Assunto" }),
      ),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 20);
    expect(prova.questoes).toHaveLength(20);
    expect(prova.questoes.filter(ehTop5)).toHaveLength(15);
    expect(prova.questoes.filter((q) => !ehTop5(q))).toHaveLength(5);
    expect(prova.faltam).toBe(0);
    expect(prova.disponiveis).toBe(26);
  });

  it("completa com os outros quando o Top 5 é curto", () => {
    const banco = [
      ...Array.from({ length: 8 }, (_, i) => questao({ id: `t5-${i}`, assunto: T(0) })),
      ...Array.from({ length: 20 }, (_, i) =>
        questao({ id: `out-${i}`, assunto: "Outro Assunto" }),
      ),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 20);
    expect(prova.questoes).toHaveLength(20);
    expect(prova.questoes.filter(ehTop5)).toHaveLength(8);
    expect(prova.questoes.filter((q) => !ehTop5(q))).toHaveLength(12);
    expect(prova.faltam).toBe(0);
  });

  it("volta ao Top 5 quando os outros são curtos", () => {
    const banco = [
      ...Array.from({ length: 20 }, (_, i) => questao({ id: `t5-${i}`, assunto: T(0) })),
      ...Array.from({ length: 3 }, (_, i) => questao({ id: `out-${i}`, assunto: "Outro Assunto" })),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 20);
    expect(prova.questoes).toHaveLength(20);
    expect(prova.questoes.filter(ehTop5)).toHaveLength(17);
    expect(prova.questoes.filter((q) => !ehTop5(q))).toHaveLength(3);
  });

  it("mostra as que tem quando o banco é curto", () => {
    const banco = [
      ...Array.from({ length: 7 }, (_, i) => questao({ id: `t5-${i}`, assunto: T(0) })),
      ...Array.from({ length: 5 }, (_, i) => questao({ id: `out-${i}`, assunto: "Outro Assunto" })),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 20);
    expect(prova.questoes).toHaveLength(12);
    expect(prova.faltam).toBe(8);
    expect(prova.disponiveis).toBe(12);
  });

  it("Top 5 sem gabarito passa na frente de outros com gabarito", () => {
    const banco = [
      ...Array.from({ length: 16 }, (_, i) => semGabarito({ id: `t5-${i}`, assunto: T(0) })),
      ...Array.from({ length: 10 }, (_, i) =>
        questao({ id: `out-${i}`, assunto: "Outro Assunto" }),
      ),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 20);
    expect(prova.questoes.filter(ehTop5)).toHaveLength(15);
    expect(prova.semGabarito).toBe(15);
  });

  it("faz rodízio por assunto dentro do Top 5", () => {
    const banco = [
      ...Array.from({ length: 10 }, (_, i) => questao({ id: `a-${i}`, assunto: T(0) })),
      ...Array.from({ length: 2 }, (_, i) => questao({ id: `b-${i}`, assunto: T(1) })),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 5);
    expect(prova.questoes).toHaveLength(5);
    expect(prova.questoes.filter((q) => q.assunto === T(1))).toHaveLength(2);
  });

  it("casa o Top 5 sem maiúsculas e sem acentos", () => {
    const banco = [
      questao({ id: "t5", assunto: "interpretacao de textos" }),
      questao({ id: "out", assunto: "Outro Assunto" }),
    ];
    const prova = montarProvaLocal(banco, MATERIA, 2);
    expect(prova.questoes[0]?.id).toBe("t5");
    expect(prova.questoes).toHaveLength(2);
  });
});

describe("Caderno Muse no banco", () => {
  it("converte questão treinável para o formato padrão", () => {
    const original = questoesTreinaveis()[0]!;
    const q = daCadernoMuse(EDITAL_VAZIO, original);
    expect(q.id).toBe(`caderno:${original.id}`);
    expect(q.banca).toBe("VUNESP");
    expect(q.materia).toBe(original.materia);
    expect(q.enunciado).toBe(original.enunciado);
    expect(q.alternativas).toHaveLength(5);
    expect(q.alternativas.map((a) => a.letra)).toEqual(["A", "B", "C", "D", "E"]);
    expect(q.alternativas.filter((a) => a.correta)).toHaveLength(1);
    expect(q.explicacao).toBe(original.insight);
    expect(q.explicacao.length).toBeGreaterThan(0);
  });

  it("questoesDoCaderno traz as 103 treináveis", () => {
    const lista = questoesDoCaderno(EDITAL_VAZIO);
    expect(lista).toHaveLength(103);
    expect(lista.every((q) => q.id.startsWith("caderno:"))).toBe(true);
    expect(lista.every((q) => q.enunciado.trim().length > 10)).toBe(true);
  });

  it("bancoLocal inclui o Caderno Muse", () => {
    const banco = bancoLocal(EDITAL_VAZIO, ACERVO_VAZIO);
    const doCaderno = banco.filter(ehDoCaderno);
    expect(doCaderno).toHaveLength(103);
    expect(banco.some((q) => q.id === "caderno:Q3777318")).toBe(true);
  });

  it("ehDoCaderno distingue o prefixo", () => {
    expect(ehDoCaderno(questao({ id: "caderno:Q1" }))).toBe(true);
    expect(ehDoCaderno(questao({ id: "pdf:prova.pdf:1" }))).toBe(false);
    expect(ehDoCaderno(questao({ id: "acervo:abc" }))).toBe(false);
  });
});
