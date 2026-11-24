import { describe, expect, it } from "vitest";
import {
  QUESTOES_CRASE_TREINO,
  embaralharAlternativas,
  repetirQuestao,
} from "./treino-crase";

describe("treino de crase — insight por questão e repetição embaralhada", () => {
  it("tem as 5 questões verificadas, cada uma com 5 alternativas e 1 certa", () => {
    expect(QUESTOES_CRASE_TREINO).toHaveLength(5);
    for (const q of QUESTOES_CRASE_TREINO) {
      expect(q.alternativas).toHaveLength(5);
      expect(q.alternativas.filter((a) => a.correta)).toHaveLength(1);
      expect(q.insight.length).toBeGreaterThan(50);
      for (const a of q.alternativas) {
        expect(a.porQue.length).toBeGreaterThan(10);
      }
    }
  });

  it("separa crase direta de regência mascarada e de lacuna", () => {
    const modelos = QUESTOES_CRASE_TREINO.map((q) => q.modelo);
    expect(modelos).toContain("crase-direta");
    expect(modelos).toContain("regencia");
    expect(modelos).toContain("lacuna");
    expect(QUESTOES_CRASE_TREINO.filter((q) => q.modelo === "crase-direta")).toHaveLength(3);
    expect(QUESTOES_CRASE_TREINO.filter((q) => q.modelo === "lacuna")).toHaveLength(1);
    expect(QUESTOES_CRASE_TREINO.find((q) => q.id === "escrevente-2025-q02")!.alternativas.find((a) => a.correta)!.texto).toBe(
      "à qual … a milhões de pessoas … às",
    );
    expect(QUESTOES_CRASE_TREINO.find((q) => q.id === "analista-2025-q10")!.alternativas.find((a) => a.correta)!.texto).toContain(
      "fê-la",
    );
  });

  it("embaralhar troca a ordem sem mudar o texto nem o gabarito", () => {
    const q = QUESTOES_CRASE_TREINO[0]!;
    const embaralhadas = embaralharAlternativas(q);
    expect(embaralhadas).toHaveLength(5);
    expect(embaralhadas.map((a) => a.letra)).toEqual(["A", "B", "C", "D", "E"]);
    // Mesmos textos, mesma quantidade de certas.
    expect(embaralhadas.map((a) => a.texto).sort()).toEqual(
      q.alternativas.map((a) => a.texto).sort(),
    );
    expect(embaralhadas.filter((a) => a.correta)).toHaveLength(1);
    expect(embaralhadas.find((a) => a.correta)!.texto).toBe(
      q.alternativas.find((a) => a.correta)!.texto,
    );
  });

  it("repetir devolve a mesma questão com as alternativas embaralhadas", () => {
    const q = QUESTOES_CRASE_TREINO[1]!;
    const repeticao = repetirQuestao(q);
    expect(repeticao.questao.id).toBe(q.id);
    expect(repeticao.alternativasEmbaralhadas).toHaveLength(5);
  });
});
