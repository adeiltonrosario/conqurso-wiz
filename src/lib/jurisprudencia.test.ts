import { describe, expect, it } from "vitest";
import { numerosDoArtigo } from "./leis-resumidas";
import {
  JURISPRUDENCIA_POR_LEI,
  julgamentosDaLei,
  julgamentosDeContraste,
  julgamentosDoArtigo,
} from "./jurisprudencia";

const LEI = "Lei nº 8.429/1992 (Improbidade Administrativa)";

describe("jurisprudência da Lei 8.429/1992", () => {
  it("tem as 8 decisões do Plenário do STF", () => {
    expect(julgamentosDaLei(LEI)).toHaveLength(8);
  });

  it("cada julgamento tem referência, tese não vazia e nota prática", () => {
    for (const j of julgamentosDaLei(LEI)) {
      expect(j.referencia.trim()).not.toBe("");
      expect(j.tese.trim()).not.toBe("");
      expect(j.notaPratica.trim()).not.toBe("");
      expect(j.data.trim()).not.toBe("");
    }
  });

  it("cada julgamento tem ao menos um artigo ou marcação de contraste", () => {
    for (const j of julgamentosDaLei(LEI)) {
      expect(j.artigos.length > 0 || (j.contraste?.trim() ?? "") !== "").toBe(true);
    }
  });

  it("Tema 1199 é o ARE 843.989, não o RE 976.566", () => {
    const tema1199 = julgamentosDaLei(LEI).find((j) => j.tema === "Tema 1199");
    expect(tema1199?.referencia).toBe("ARE 843.989/PR");
    const tema576 = julgamentosDaLei(LEI).find((j) => j.tema === "Tema 576");
    expect(tema576?.referencia).toBe("RE 976.566/PA");
  });

  it("Tema 1000 está marcado como pendente, sem tese fixada", () => {
    const tema1000 = julgamentosDaLei(LEI).find((j) => j.tema === "Tema 1000");
    expect(tema1000?.status).toBe("pendente");
    expect(tema1000?.tese).toContain("Sem tese fixada");
    // A tese proposta pelo relator não pode aparecer como se fosse fixada.
    expect(tema1000?.tese).not.toContain("salvo se, no ato da nomeação");
    expect(tema1000?.observacao).toContain("Sem tese fixada");
  });

  it("só o Tema 1000 está pendente; os demais estão decididos", () => {
    const pendentes = julgamentosDaLei(LEI).filter((j) => j.status === "pendente");
    expect(pendentes.map((j) => j.tema)).toEqual(["Tema 1000"]);
  });

  it("Temas 666 e 899 entram por contraste, sem artigo da LIA", () => {
    const contrastes = julgamentosDeContraste(LEI);
    expect(contrastes.map((j) => j.tema).sort()).toEqual(["Tema 666", "Tema 899"]);
    for (const j of contrastes) {
      expect(j.artigos).toEqual([]);
      expect(j.contraste).toContain("art. 37, § 5º, da CF");
    }
  });

  it("o julgamento aparece abaixo de cada artigo que interpreta", () => {
    // "Arts. 9º e 11" recebe Tema 1199, Tema 897, Tema 576, ADIs e SV 13 + Tema 1000.
    const arts9e11 = julgamentosDoArtigo(
      LEI,
      numerosDoArtigo("Arts. 9º e 11 (atos de improbidade)"),
    );
    expect(arts9e11.map((j) => j.tema ?? j.referencia).sort()).toEqual([
      "ADIs 7156 e 7236",
      "Súmula Vinculante 13",
      "Tema 1000",
      "Tema 1199",
      "Tema 576",
      "Tema 897",
    ]);
    // "Art. 23" recebe Tema 1199, Tema 897 e ADIs — mas não o Tema 576 nem a SV 13.
    const art23 = julgamentosDoArtigo(LEI, numerosDoArtigo("Art. 23 (prescrição — 8 anos)"));
    expect(art23.map((j) => j.tema ?? j.referencia).sort()).toEqual([
      "ADIs 7156 e 7236",
      "Tema 1199",
      "Tema 897",
    ]);
    // Item sem "Art." não recebe julgamento por artigo.
    expect(
      julgamentosDoArtigo(
        LEI,
        numerosDoArtigo("Representação, indisponibilidade de bens e acordo de não persecução"),
      ),
    ).toEqual([]);
  });

  it("lei sem jurisprudência devolve vazio", () => {
    expect(
      julgamentosDaLei("Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)"),
    ).toEqual([]);
    expect(
      julgamentosDeContraste("Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)"),
    ).toEqual([]);
  });

  it("não há lei além da 8.429/1992 com entradas por enquanto", () => {
    expect(Object.keys(JURISPRUDENCIA_POR_LEI)).toEqual([LEI]);
  });
});
