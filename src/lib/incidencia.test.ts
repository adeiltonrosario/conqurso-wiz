import { describe, expect, it } from "vitest";
import type { Questao } from "./ai.functions";
import {
  analisarQuestoes,
  calcularIncidencia,
  extrairDispositivos,
  selecionarCards,
  selecionarRevisao,
} from "./incidencia";

const q = (id: string, enunciado: string, prova: string, extra: Partial<Questao> = {}): Questao => ({
  id,
  banca: "VUNESP",
  grupo: "Conhecimento Específico",
  materia: "Direito Penal",
  enunciado,
  prova,
  alternativas: [
    { letra: "A", texto: `certa ${id}`, correta: true, explicacao: "" },
    { letra: "B", texto: `errada ${id}`, correta: false, explicacao: "" },
  ],
  explicacao: "",
  ...extra,
});

const materias = [{ nome: "Direito Penal", topicos: ["Crimes contra a fé pública"] }];

describe("incidência determinística", () => {
  it("liga o artigo à norma citada logo depois", () => {
    expect(extrairDispositivos("Nos termos do art. 297 do Código Penal")).toEqual([{ lei: "cp", artigo: 297 }]);
  });

  it("artigo sem norma vai para revisão manual", () => {
    const [r] = analisarQuestoes([q("1", "Conforme o art. 5º, assinale", "P1")], materias, "");
    expect(r!.dispositivos[0]!.lei).toBe("");
    expect(r!.pendente).toBeTruthy();
  });

  it("3 questões em 2 provas = ★★★; questão repetida não conta duas vezes", () => {
    const lista = [
      q("1", "art. 297 do Código Penal caso um", "P1"),
      q("2", "art. 297 do Código Penal caso dois", "P2"),
      q("3", "art. 297 do Código Penal caso três", "P2"),
      q("1b", "art. 297 do Código Penal caso um", "P1", { alternativas: q("1", "", "").alternativas }),
    ];
    const item = calcularIncidencia(analisarQuestoes(lista, materias, "")).find((i) => i.chave === "artigo|cp|297")!;
    expect(item.questoes.length).toBe(3);
    expect(item.estrelas).toBe(3);
  });

  it("uma única prova nunca gera ★★★", () => {
    const lista = [1, 2, 3, 4].map((n) => q(String(n), `art. 299 do Código Penal ${n}`, "P1"));
    const item = calcularIncidencia(analisarQuestoes(lista, materias, ""))[0]!;
    expect(item.estrelas).toBeLessThan(3);
  });

  it("questão fora do edital não entra na contagem", () => {
    const r = analisarQuestoes([q("x", "art. 297 do Código Penal", "P1", { materia: "Informática" })], materias, "");
    expect(r[0]!.foraDoEdital).toBe(true);
    expect(calcularIncidencia(r)).toHaveLength(0);
  });

  it("limita a 20 por artigo ★★★ na revisão e 10 por matéria nos cards", () => {
    const lista = Array.from({ length: 30 }, (_, n) => q(String(n), `art. 297 do Código Penal ${n}`, `P${n % 3}`));
    const a = analisarQuestoes(lista, materias, "");
    const conj = selecionarRevisao(calcularIncidencia(a), a, "VUNESP");
    expect(conj[0]!.questoes).toHaveLength(20);
    expect(selecionarCards(a, "VUNESP")[0]!.questoes).toHaveLength(10);
  });
});
