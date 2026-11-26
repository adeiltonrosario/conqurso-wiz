import { describe, expect, it } from "vitest";
import { ABAS_REVISAR, ABAS_TREINAR, ROTA_DA_TELA, telaDaRota } from "./navegacao";

describe("telaDaRota", () => {
  it("Hoje é / e /trilha", () => {
    expect(telaDaRota("/")).toBe("hoje");
    expect(telaDaRota("/trilha")).toBe("hoje");
  });

  it("Leis é só /leis", () => {
    expect(telaDaRota("/leis")).toBe("leis");
  });

  it("Treinar junta Questões, Prova e Padrões", () => {
    expect(telaDaRota("/questoes")).toBe("treinar");
    expect(telaDaRota("/prova-interativa")).toBe("treinar");
    expect(telaDaRota("/analise-padroes")).toBe("treinar");
  });

  it("Revisar junta Revisão e Cards", () => {
    expect(telaDaRota("/revisao")).toBe("revisar");
    expect(telaDaRota("/flashcards")).toBe("revisar");
  });

  it("Redação, Incluir e Auth não pertencem a nenhuma tela do menu", () => {
    expect(telaDaRota("/redacao")).toBeNull();
    expect(telaDaRota("/inclusao")).toBeNull();
    expect(telaDaRota("/auth")).toBeNull();
  });

  it("rota desconhecida não pertence a nenhuma tela", () => {
    expect(telaDaRota("/nao-existe")).toBeNull();
  });
});

describe("abas dos grupos", () => {
  it("Treinar tem Questões, Prova e Padrões, e o menu leva para /questoes", () => {
    expect(ABAS_TREINAR.map((a) => a.to)).toEqual(["/questoes", "/prova-interativa", "/analise-padroes"]);
    expect(ROTA_DA_TELA.treinar).toBe("/questoes");
  });

  it("Revisar tem Revisão e Cards, e o menu leva para /revisao", () => {
    expect(ABAS_REVISAR.map((a) => a.to)).toEqual(["/revisao", "/flashcards"]);
    expect(ROTA_DA_TELA.revisar).toBe("/revisao");
  });

  it("Hoje leva para /trilha", () => {
    expect(ROTA_DA_TELA.hoje).toBe("/trilha");
  });
});
