import { describe, expect, it } from "vitest";
import { htmlParaTexto } from "./html-texto";
import { consolidarTexto, removerTachados } from "./legislacao-consolidar";

function importar(html: string) {
  const { html: limpo, tachados } = removerTachados(html);
  return consolidarTexto(htmlParaTexto(limpo), tachados);
}

describe("importação de legislação consolidada", () => {
  it("exclui redação tachada e mantém a vigente", () => {
    const r = importar(`
      <p>Art. 6º É proibido o porte de arma de fogo.</p>
      <p><strike>II – Texto antigo do dispositivo.</strike></p>
      <p>II – Nova redação vigente do dispositivo.</p>`);
    expect(r.texto).not.toContain("Texto antigo");
    expect(r.texto).toContain("II – Nova redação vigente do dispositivo.");
    expect(r.relatorio.tachados).toBe(1);
  });

  it("exclui trecho com line-through", () => {
    const r = importar(`<p>Art. 1º Texto.</p><p><span style="text-decoration: line-through">I - velho</span></p><p>I - novo</p>`);
    expect(r.texto).not.toContain("velho");
    expect(r.texto).toContain("I - novo");
  });

  it("exclui só o inciso revogado, sem renumerar", () => {
    const r = importar(`<p>Art. 2º Caput.</p><p>I - primeiro;</p><p>II - (Revogado pela Lei nº 1/2000)</p><p>III - terceiro.</p>`);
    expect(r.texto).not.toMatch(/^II -/m);
    expect(r.texto).toContain("I - primeiro;");
    expect(r.texto).toContain("III - terceiro.");
    expect(r.relatorio.revogados).toBe(1);
  });

  it("artigo revogado não entra e os seguintes mantêm o número", () => {
    const r = importar(`<p>Art. 3º Vigente.</p><p>Art. 4º (Revogado).</p><p>Art. 5º Vigente.</p><p>Art. 5º-A Incluído.</p>`);
    expect(r.texto).not.toContain("Art. 4º");
    expect(r.texto).toContain("Art. 5º Vigente.");
    expect(r.texto).toContain("Art. 5º-A Incluído.");
    expect(r.relatorio.artigosImportados).toBe(3);
  });

  it("artigo repetido aparece uma única vez com a última redação", () => {
    const r = importar(`<p>Art. 7º Redação original.</p><p>Art. 7º Redação nova.</p><p>Art. 8º Outro.</p>`);
    expect(r.texto.match(/Art\. 7º/g)?.length).toBe(1);
    expect(r.texto).toContain("Redação nova.");
    expect(r.relatorio.duplicacoes).toBe(1);
  });

  it("preserva acentos e cedilha", () => {
    const r = importar(`<p>Art. 1&ordm; Constitui&ccedil;&atilde;o, Pol&iacute;cia, disposi&ccedil;&otilde;es, compet&ecirc;ncia, p&uacute;blico.</p>`);
    expect(r.texto).toContain("Constituição, Polícia, disposições, competência, público.");
  });
});
