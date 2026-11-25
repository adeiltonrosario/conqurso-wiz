import { describe, expect, it } from "vitest";
import {
  QUESTOES_CADERNO_MUSE,
  TOTAL_CADERNO_MUSE,
  embaralharAlternativasCadernoMuse,
  materiasComTreino,
  questoesPendentes,
  questoesPorMateria,
  questoesTreinaveis,
  repetirQuestaoCadernoMuse,
} from "./caderno-muse";

/** Códigos mencionados nos arquivos mas FORA das 111 confirmadas do caderno. */
const EXTRAS_FORA_DO_CADERNO = [
  // Contador (+4)
  "Q3777376",
  "Q3777377",
  "Q3777378",
  "Q3777381",
  // ARSESP (+14)
  "Q3787251",
  "Q3787253",
  "Q3787255",
  "Q3787256",
  "Q3787257",
  "Q3787258",
  "Q3787260",
  "Q3787274",
  "Q3787275",
  "Q3787276",
  "Q3787277",
  "Q3787278",
  "Q3787279",
  "Q3787280",
  // Assistente Social (+1) e Psicólogo (+1)
  "Q3289441",
  "Q3291609",
  // Paulínia Q32 — registrada como não adicionada ao caderno
  "Q3775157",
];

/** As 8 pendentes: texto parcial por imagem, sem como resolver pelo texto. */
const PENDENTES_ESPERADAS = [
  "Q3777334", // Contador Q17 — frações das alternativas
  "Q3777336", // Contador Q19 — fórmulas das alternativas
  "Q3777342", // Contador Q25 — valores da planilha
  "Q3787229", // ARSESP Q1 — tira em imagem
  "Q3775126", // Paulínia Q1 — tira em imagem
  "Q3775136", // Paulínia Q11 — frações em imagem
  "Q3775145", // Paulínia Q20 — polígono em imagem
  "Q3775148", // Paulínia Q23 — planilha em imagem
];

describe("treino caderno muse — só as 111 confirmadas", () => {
  it("tem as 111 confirmadas: 103 treináveis e 8 pendentes", () => {
    expect(TOTAL_CADERNO_MUSE).toBe(111);
    expect(QUESTOES_CADERNO_MUSE).toHaveLength(111);
    expect(questoesTreinaveis()).toHaveLength(103);
    expect(questoesPendentes()).toHaveLength(8);
    expect(questoesPendentes().map((q) => q.id).sort()).toEqual([...PENDENTES_ESPERADAS].sort());
  });

  it("não tem código duplicado nem fora das 111 confirmadas", () => {
    const ids = QUESTOES_CADERNO_MUSE.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const extra of EXTRAS_FORA_DO_CADERNO) {
      expect(ids).not.toContain(extra);
    }
  });

  it("reproduz a contagem do registro de criação por prova", () => {
    const porProva = (trecho: string) => QUESTOES_CADERNO_MUSE.filter((q) => q.prova.includes(trecho)).length;
    expect(porProva("Contador Judiciário")).toBe(32);
    expect(porProva("ARSESP")).toBe(22);
    expect(porProva("Analista de Sistemas")).toBe(7);
    expect(porProva("Assistente Social")).toBe(5);
    expect(porProva("Psicólogo")).toBe(2);
    expect(porProva("Paulínia")).toBe(40);
    expect(porProva("CREF-4")).toBe(3);
  });

  it("toda treinável tem enunciado + 5 alternativas + 1 correta por texto e insight", () => {
    for (const q of questoesTreinaveis()) {
      expect(q.enunciado.trim().length).toBeGreaterThan(10);
      expect(q.alternativas).toHaveLength(5);
      expect(q.alternativas.filter((a) => a.correta)).toHaveLength(1);
      expect(q.insight.length).toBeGreaterThan(50);
      expect(q.motivoPendente).toBeNull();
      for (const a of q.alternativas) {
        expect(a.texto.trim().length).toBeGreaterThan(0);
        expect(a.porQue === null || a.porQue.trim().length > 10).toBe(true);
      }
    }
  });

  it("toda pendente tem motivo e não entra no treino", () => {
    for (const q of questoesPendentes()) {
      expect(q.motivoPendente).not.toBeNull();
      expect(q.motivoPendente!.length).toBeGreaterThan(10);
    }
    const treinaveis = questoesTreinaveis().map((q) => q.id);
    for (const p of PENDENTES_ESPERADAS) {
      expect(treinaveis).not.toContain(p);
    }
  });

  it("Q58 do Contador ensina o gabarito oficial, não a pegadinha", () => {
    const q58 = QUESTOES_CADERNO_MUSE.find((q) => q.id === "Q3777375")!;
    expect(q58.status).toBe("treinavel");
    // Gabarito oficial B: impenhorabilidade dos bens de uso especial.
    expect(q58.alternativas.find((a) => a.correta)!.texto).toContain("impenhorabilidade");
    // O tema "greve" (CF, art. 37, VII) é a armadilha, não a resposta.
    const armadilha = q58.alternativas.find((a) => a.texto.includes("greve"))!;
    expect(armadilha.correta).toBe(false);
    expect(armadilha.porQue ?? "").toMatch(/armadilha/i);
    expect(q58.insight).toMatch(/greve/i);
  });

  it("Q59 do Contador (tema errado no caderno) não está no catálogo", () => {
    // Q3777376 (desvio de finalidade) é um dos 4 extras do Contador.
    expect(QUESTOES_CADERNO_MUSE.map((q) => q.id)).not.toContain("Q3777376");
  });

  it("filtra treináveis por matéria", () => {
    expect(questoesPorMateria("Língua Portuguesa")).toHaveLength(26);
    expect(questoesPorMateria("Direito Constitucional")).toHaveLength(12);
    expect(questoesPorMateria("Direito Processual Civil")).toHaveLength(5);
    for (const q of questoesPorMateria("Língua Portuguesa")) {
      expect(q.materia).toBe("Língua Portuguesa");
      expect(q.status).toBe("treinavel");
    }
    expect(materiasComTreino()).toContain("Língua Portuguesa");
    expect(materiasComTreino()).toContain("Raciocínio Lógico");
    expect(materiasComTreino()).toHaveLength(12);
  });

  it("embaralhar troca a ordem sem mudar o texto nem o gabarito", () => {
    const q = questoesTreinaveis()[0]!;
    const embaralhadas = embaralharAlternativasCadernoMuse(q);
    expect(embaralhadas).toHaveLength(5);
    expect(embaralhadas.map((a) => a.letra)).toEqual(["A", "B", "C", "D", "E"]);
    expect(embaralhadas.map((a) => a.texto).sort()).toEqual(
      q.alternativas.map((a) => a.texto).sort(),
    );
    expect(embaralhadas.filter((a) => a.correta)).toHaveLength(1);
    expect(embaralhadas.find((a) => a.correta)!.texto).toBe(
      q.alternativas.find((a) => a.correta)!.texto,
    );
  });

  it("repetir devolve a mesma questão com as alternativas embaralhadas", () => {
    const q = questoesTreinaveis()[1]!;
    const repeticao = repetirQuestaoCadernoMuse(q);
    expect(repeticao.questao.id).toBe(q.id);
    expect(repeticao.alternativasEmbaralhadas).toHaveLength(5);
  });
});
