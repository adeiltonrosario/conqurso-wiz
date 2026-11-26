import { describe, expect, it } from "vitest";
import { ehLinkReal, leiTemTextoSalvo, type LinkLei } from "./edital";

const lei = (patch: Partial<LinkLei>): LinkLei => ({
  id: "l1",
  titulo: "Lei n.º 9.099/95",
  url: "https://www.planalto.gov.br/ccivil_03/leis/l9099.htm",
  ...patch,
});

describe("leiTemTextoSalvo", () => {
  it("anexo presente no acervo → salvo", () => {
    expect(leiTemTextoSalvo(lei({ anexo: "Lei n.º 9.099/95" }), ["lei n.º 9.099/95"])).toBe(true);
  });

  it("anexo ausente mas título casa com o salvo → salvo", () => {
    expect(
      leiTemTextoSalvo(lei({ anexo: undefined }), ["lei n.º 9.099/95 — juizados especiais"]),
    ).toBe(true);
  });

  it("anexo ausente mas número casa com o salvo → salvo", () => {
    expect(
      leiTemTextoSalvo(lei({ titulo: "Lei 12.153/2009", anexo: undefined }), ["lei121532009.pdf"]),
    ).toBe(true);
  });

  it("nada casa → não salvo", () => {
    expect(leiTemTextoSalvo(lei({ anexo: undefined }), ["código penal"])).toBe(false);
  });

  it("anexo aponta para arquivo que não existe mais → não salvo", () => {
    expect(leiTemTextoSalvo(lei({ anexo: "CF88_Livro_EC91_2016.pdf" }), ["código penal"])).toBe(
      false,
    );
  });

  it("lei só com PDF (url acervo:) sem texto correspondente → não salvo", () => {
    expect(
      leiTemTextoSalvo(lei({ url: "acervo:Normas CGJ.pdf", anexo: "Normas CGJ.pdf" }), [
        "código penal",
      ]),
    ).toBe(false);
  });
});

describe("ehLinkReal", () => {
  it("https → link real", () => {
    expect(ehLinkReal("https://www.planalto.gov.br/ccivil_03/leis/l9099.htm")).toBe(true);
  });

  it("http → link real", () => {
    expect(ehLinkReal("http://exemplo.com/lei.htm")).toBe(true);
  });

  it("acervo: → não é link", () => {
    expect(ehLinkReal("acervo:Normas CGJ.pdf")).toBe(false);
  });

  it("vazio → não é link", () => {
    expect(ehLinkReal("")).toBe(false);
  });
});
