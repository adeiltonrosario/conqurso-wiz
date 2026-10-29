import { describe, expect, it } from "vitest";
import { lerAbaEdital, normalizarBanca } from "./edital-planilha";
import { importarCargosPlanilha, type EditalEstado } from "./edital";

const linhas = [
  ["EDITAL VERTICALIZADO · TJ SP · ESCREVENTE"],
  ["Banca: Fundação Vunesp"],
  ["BLOCO I  ·  LÍNGUA PORTUGUESA  ·  16 questões"],
  ["1", "Ponto de vista do autor."],
  ["BLOCO II  ·  CONHECIMENTOS EM DIREITO  ·  30 questões"],
  ["1", "DIREITO PENAL: Código Penal – artigos 293 a 305"],
  ["1.a", "Código Penal — artigos 293 a 305"],
];

describe("planilha de edital", () => {
  it("cria matérias por bloco com a banca do cabeçalho", () => {
    const c = lerAbaEdital("Escrevente", linhas);
    expect(c.banca).toBe("VUNESP");
    expect(c.cargo).toBe("ESCREVENTE");
    expect(c.materias.map((m) => [m.bloco, m.nome])).toEqual([
      ["BLOCO I", "LÍNGUA PORTUGUESA"],
      ["BLOCO II", "DIREITO PENAL"],
    ]);
  });

  it("vincula cargo à banca e não mexe em matérias de outra banca", () => {
    const edital: EditalEstado = {
      texto: "", bancas: ["FCC"], cargos: ["TÉCNICO"], bancaDoCargo: { "TÉCNICO": "FCC" },
      materias: [{ id: "x", nome: "DIREITO PENAL", grupo: "Conhecimento Específico", topicos: ["a"], banca: "FCC", cargo: "TÉCNICO" }],
    };
    const p = importarCargosPlanilha(edital, [lerAbaEdital("Escrevente", linhas)]);
    expect(p.bancaDoCargo?.["ESCREVENTE"]).toBe("VUNESP");
    expect(p.bancaAtiva).toBe("VUNESP");
    expect(p.materias?.find((m) => m.id === "x")?.banca).toBe("FCC");
    expect(p.materias?.filter((m) => m.banca === "VUNESP").length).toBe(2);
  });

  it("reconhece a banca pelo nome", () => {
    expect(normalizarBanca("Instituto AOCP")).toBe("INSTITUTO AOCP");
  });
});
