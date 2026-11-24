import { describe, expect, it } from "vitest";
import {
  LEITURA_RESUMIDA,
  MATERIAS_LEITURA_RESUMIDA,
  MATERIAS_POR_BLOCO,
  NUNCA_COBRADOS,
  blocoDaMateria,
  itensDaMateria,
  materiasComNuncaCobrados,
  nuncaCobradosDaMateria,
} from "./leis-resumidas";

/** Todas as matérias do edital do Escrevente (Anexo VIII, Edital nº 02/2026). */
const MATERIAS_EDTAL = [
  "Língua Portuguesa",
  "Direito Penal",
  "Direito Processual Penal",
  "Direito Processual Civil",
  "Direito Constitucional",
  "Direito Administrativo",
  "Legislação Interna",
  "Estatuto da Pessoa com Deficiência",
  "Matemática",
  "Noções de Informática",
  "Raciocínio Lógico",
  "Atualidades",
];

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

describe("leitura resumida — só o que foi cobrado (Escrevente TJ-SP)", () => {
  it("cobre todas as 12 matérias do edital, na ordem dos blocos", () => {
    expect(MATERIAS_LEITURA_RESUMIDA).toHaveLength(12);
    expect([...MATERIAS_LEITURA_RESUMIDA].sort()).toEqual([...MATERIAS_EDTAL].sort());
    expect(MATERIAS_POR_BLOCO[0]!.bloco).toBe("BLOCO I");
    expect(MATERIAS_POR_BLOCO[0]!.materias).toEqual(["Língua Portuguesa"]);
    expect(MATERIAS_POR_BLOCO[1]!.bloco).toBe("BLOCO II");
    expect(MATERIAS_POR_BLOCO[2]!.bloco).toBe("BLOCO III");
    for (const materia of MATERIAS_EDTAL) {
      expect(itensDaMateria(materia).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("todo item tem resumo de uma linha, artigo e ao menos 1 prova contada", () => {
    expect(LEITURA_RESUMIDA.length).toBeGreaterThanOrEqual(60);
    for (const item of LEITURA_RESUMIDA) {
      expect(item.artigo.trim().length).toBeGreaterThan(0);
      expect(item.resumo.length).toBeGreaterThan(10);
      expect(item.resumo).not.toContain("\n");
      expect(item.provas).toBeGreaterThanOrEqual(1);
      expect(blocoDaMateria(item.materia)).toBe(item.bloco);
      if (item.questoes !== undefined) expect(item.questoes).toBeGreaterThanOrEqual(1);
    }
  });

  it("nenhum item da lista de nunca cobrados aparece como cobrado", () => {
    for (const n of NUNCA_COBRADOS) {
      const cobrados = itensDaMateria(n.materia);
      expect(cobrados.length).toBeGreaterThanOrEqual(1);
      for (const c of cobrados) {
        expect(normalizar(c.artigo)).not.toBe(normalizar(n.artigo));
        expect(normalizar(c.artigo)).not.toContain(normalizar(n.artigo));
        expect(normalizar(n.artigo)).not.toContain(normalizar(c.artigo));
      }
    }
  });

  it("os 4 itens novos de Legislação Interna saíram da lista de nunca cobrados (caíram todos na 2025)", () => {
    // Res. 963/2025 Q42, Res. 850/2021 Q43, LC 1.111/2010 Q44 e Regimento
    // Interno Q45 — todos cobrados na Escrevente 2025, 1 questão cada.
    expect(nuncaCobradosDaMateria("Legislação Interna")).toHaveLength(0);
    const itens = itensDaMateria("Legislação Interna").map((i) => i.artigo);
    expect(itens).toContain("Res. TJSP 963/2025 (eproc)");
    expect(itens).toContain("Res. TJSP 850/2021 (teletrabalho)");
    expect(itens).toContain("LC 1.111/2010 (Plano de Cargos e Carreiras)");
    expect(itens).toContain("Regimento Interno do TJSP");
    // CP art. 320 e art. 319 também saíram: ficam só os arts. 322 a 327.
    const penal = nuncaCobradosDaMateria("Direito Penal").map((n) => n.artigo);
    expect(penal).toContain("Arts. 322 a 327");
    expect(penal.join(" ")).not.toMatch(/319|320/);
    // Lei 10.261: faixa 1–86 saiu; fica só 171–175.
    const adm = nuncaCobradosDaMateria("Direito Administrativo").map((n) => n.artigo);
    expect(adm).toEqual(["Arts. 171 a 175"]);
    // OneDrive saiu (2025 Q55).
    const info = nuncaCobradosDaMateria("Noções de Informática").map((n) => n.artigo);
    expect(info).not.toContain("OneDrive (armazenamento e compartilhamento)");
    expect(itensDaMateria("Noções de Informática").map((i) => i.artigo)).toContain(
      "OneDrive (armazenamento e compartilhamento)",
    );
  });

  it("Crase mantém a separação por comando (7 diretas, 1 regência, 1 outro assunto, 6 lacunas)", () => {
    const crase = itensDaMateria("Língua Portuguesa").find((i) => i.artigo === "Crase")!;
    expect(crase).toBeDefined();
    expect(crase.questoes).toBe(15);
    expect(crase.provas).toBe(13);
    expect(crase.separacaoCraseRegencia).toEqual({
      craseDireta: 7,
      regenciaMascarada: 1,
      outroAssuntoMascarada: 1,
      lacunas: 6,
    });
  });

  it("Direito Constitucional tem o art. 5º no topo (18 em 6 provas) e o art. 92 como raro (1 em 6)", () => {
    const consti = itensDaMateria("Direito Constitucional");
    expect(consti[0]!.artigo).toContain("Art. 5º");
    expect(consti[0]!.provas).toBe(6);
    expect(consti[0]!.questoes).toBe(18);
    const art92 = consti.find((i) => i.artigo.includes("Art. 92"))!;
    expect(art92.provas).toBe(1);
    // Arts. 37–41 11, art. 7º 5 e art. 12 5 em 6 provas (relatório 2025).
    expect(consti.find((i) => i.artigo.includes("Arts. 37 a 41"))!.questoes).toBe(11);
    expect(consti.find((i) => i.artigo.includes("Art. 7º"))!.questoes).toBe(5);
    expect(consti.find((i) => i.artigo.includes("Art. 12"))!.questoes).toBe(5);
  });

  it("totais atualizados para a base de 6 provas Escrevente + Analista (2025)", () => {
    // Somas conferidas nos relatórios workspace/prova-2025/relatorio-2025.md
    // e workspace/prova-analista-2025/relatorio-analista-2025.md.
    const item = (materia: string, artigo: string) =>
      itensDaMateria(materia).find((i) => i.artigo === artigo)!;
    // Português (questão por questão): 39 em 6 Escrevente; + Analista.
    expect(item("Língua Portuguesa", "Interpretação de Textos").questoes).toBe(45);
    expect(item("Língua Portuguesa", "Interpretação de Textos").provas).toBe(7);
    expect(item("Língua Portuguesa", "Sintaxe (concordância, regência e colocação)").questoes).toBe(39);
    expect(item("Língua Portuguesa", "Sintaxe (concordância, regência e colocação)").provas).toBe(7);
    expect(item("Língua Portuguesa", "Significação Contextual de Palavras e Expressões").questoes).toBe(22);
    expect(item("Língua Portuguesa", "Morfologia (classes de palavras)").questoes).toBe(18);
    expect(item("Língua Portuguesa", "Pontuação").questoes).toBe(7);
    expect(item("Língua Portuguesa", "Concordância verbal e nominal").questoes).toBe(9);
    expect(item("Língua Portuguesa", "Colocação pronominal").questoes).toBe(5);
    expect(item("Língua Portuguesa", "Regência verbal e nominal").questoes).toBe(4);
    // RL: dedução 18+3+2=23, sequências 12+2+1=15, negação 11+2+1=14, diagramas 8+0+1=9.
    expect(item("Raciocínio Lógico", "Dedução e estruturas lógicas").questoes).toBe(23);
    expect(item("Raciocínio Lógico", "Sequências numéricas e figurais").questoes).toBe(15);
    expect(item("Raciocínio Lógico", "Negação e equivalência").questoes).toBe(14);
    expect(item("Raciocínio Lógico", "Diagramas lógicos e conjuntos").questoes).toBe(9);
    // Matemática: porcentagem 6+1=7, média 6+1=7, geometria 5+1=6, razão 4+1=5.
    expect(item("Matemática", "Porcentagem e juros simples").questoes).toBe(7);
    expect(item("Matemática", "Média aritmética simples e ponderada").questoes).toBe(7);
    expect(item("Matemática", "Geometria (Pitágoras, área e volume)").questoes).toBe(6);
    expect(item("Matemática", "Razão e proporção").questoes).toBe(5);
    // Informática: Windows 16+1=17, Excel 12+2=14, Word 11+2=13, Internet 10+1=11, correio 9+1=10, Teams 8+1=9.
    expect(item("Noções de Informática", "Windows e Explorador de Arquivos").questoes).toBe(17);
    expect(item("Noções de Informática", "Excel (fórmulas, funções e planilhas)").questoes).toBe(14);
    expect(item("Noções de Informática", "Word (edição e formatação de textos)").questoes).toBe(13);
    expect(item("Noções de Informática", "Internet e URL").questoes).toBe(11);
    expect(item("Noções de Informática", "Correio eletrônico (envio, anexos, Cc/Cco, spam)").questoes).toBe(10);
    expect(item("Noções de Informática", "MS Teams (chats, reuniões e equipes)").questoes).toBe(9);
    // Atualidades: política 9+1=10, internacional 8+2=10.
    expect(item("Atualidades", "Política nacional e Judiciário").questoes).toBe(10);
    expect(item("Atualidades", "Internacional").questoes).toBe(10);
  });

  it("Estatuto PcD tem os dois blocos de artigos do edital (1º–13 e 34–38)", () => {
    const pcd = itensDaMateria("Estatuto da Pessoa com Deficiência");
    expect(pcd).toHaveLength(2);
    expect(pcd.map((i) => i.artigo)).toEqual([
      "Arts. 1º a 13 (atendimento prioritário)",
      "Arts. 34 a 38 (direito ao trabalho)",
    ]);
  });

  it("6 matérias têm lista de nunca cobrados; Português, Proc. Civil, PcD, RL, Atualidades e Legislação Interna não têm", () => {
    expect(materiasComNuncaCobrados().sort()).toEqual(
      [
        "Direito Administrativo",
        "Direito Constitucional",
        "Direito Penal",
        "Direito Processual Penal",
        "Matemática",
        "Noções de Informática",
      ].sort(),
    );
    for (const m of ["Língua Portuguesa", "Direito Processual Civil", "Estatuto da Pessoa com Deficiência", "Raciocínio Lógico", "Atualidades", "Legislação Interna"]) {
      expect(nuncaCobradosDaMateria(m)).toHaveLength(0);
    }
  });
});
