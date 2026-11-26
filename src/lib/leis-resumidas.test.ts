import { describe, expect, it } from "vitest";
import {
  LEITURA_RESUMIDA,
  MATERIAS_LEITURA_RESUMIDA,
  MATERIAS_POR_BLOCO,
  NUNCA_COBRADOS,
  artigosCobradosDaMateria,
  blocoDaMateria,
  ehTop5,
  itensDaMateria,
  materiasComNuncaCobrados,
  nuncaCobradosDaMateria,
  numerosDoArtigo,
  top5DaMateria,
} from "./leis-resumidas";
import { numeroArtigo } from "./vademecum";
import type { ArtigoIntegral } from "./ai.functions";

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

  it("Crase mantém a separação por comando (7 diretas, 3 regência, 1 outro assunto, 6 lacunas)", () => {
    const crase = itensDaMateria("Língua Portuguesa").find((i) => i.artigo === "Crase")!;
    expect(crase).toBeDefined();
    expect(crase.questoes).toBe(17);
    expect(crase.provas).toBe(15);
    expect(crase.separacaoCraseRegencia).toEqual({
      craseDireta: 7,
      regenciaMascarada: 3,
      outroAssuntoMascarada: 1,
      lacunas: 6,
    });
  });

  it("NUNCA_COBRADOS tem 14 itens: art. 274 e Regra de três saíram (caíram nas provas de 2024)", () => {
    expect(NUNCA_COBRADOS).toHaveLength(14);
    const pp = nuncaCobradosDaMateria("Direito Processual Penal").map((n) => n.artigo);
    expect(pp).toEqual(["Arts. 531 a 538", "Arts. 541 a 548"]);
    const mat = nuncaCobradosDaMateria("Matemática").map((n) => n.artigo);
    expect(mat).toEqual(["MMC e MDC", "Equação do 2º grau", "Sistemas de medidas usuais"]);
    // Os dois viraram itens cobrados.
    expect(itensDaMateria("Direito Processual Penal").map((i) => i.artigo)).toContain(
      "Art. 274 (suspeição estendida aos serventuários)",
    );
    expect(itensDaMateria("Matemática").map((i) => i.artigo)).toContain("Regra de três simples e composta");
  });

  it("itens novos de 2024: LIA arts. 13 e 16, Lei 10.261 art. 3º e Orientação Espacial e Temporal", () => {
    const item = (materia: string, artigo: string) =>
      itensDaMateria(materia).find((i) => i.artigo === artigo)!;
    expect(item("Direito Administrativo", "Art. 13 (declaração de bens)").provas).toBe(1);
    expect(item("Direito Administrativo", "Art. 16 (indisponibilidade de bens)").provas).toBe(1);
    expect(item("Direito Administrativo", "Art. 3º (conceito de funcionário público)").provas).toBe(1);
    const orientacao = item("Raciocínio Lógico", "Orientação Espacial e Temporal");
    expect(orientacao.provas).toBe(2);
    expect(orientacao.questoes).toBe(2);
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

  it("totais atualizados para a base de 6 provas Escrevente + Analista (2025) + 2024 oficial", () => {
    // Somas conferidas nos relatórios workspace/prova-2025/relatorio-2025.md,
    // workspace/prova-analista-2025/relatorio-analista-2025.md e
    // workspace/cadernos-vunesp/vunesp-2024-escrevente-oficial-mapeamento.md
    // e vunesp-2024-outras-provas-mapeamento.md.
    const item = (materia: string, artigo: string) =>
      itensDaMateria(materia).find((i) => i.artigo === artigo)!;
    // Português (questão por questão): 45 em 7 provas; + Oficial 2024 (12
    // Interpretação, 5 Sintaxe, 6 Significação, 4 Morfologia, 5 Noções
    // Gerais, 1 Pontuação, 1 Concordância, 2 Colocação, 1 Regência),
    // Assistente 2024 (6, 4, 0, 2, 0, 0, 1, 0, 1) e Psicólogo 2024
    // (6, 2, 1, 2, 0, 1, 1, 0, 1).
    expect(item("Língua Portuguesa", "Interpretação de Textos").questoes).toBe(69);
    expect(item("Língua Portuguesa", "Interpretação de Textos").provas).toBe(10);
    expect(item("Língua Portuguesa", "Sintaxe (concordância, regência e colocação)").questoes).toBe(50);
    expect(item("Língua Portuguesa", "Sintaxe (concordância, regência e colocação)").provas).toBe(10);
    expect(item("Língua Portuguesa", "Significação Contextual de Palavras e Expressões").questoes).toBe(29);
    expect(item("Língua Portuguesa", "Morfologia (classes de palavras)").questoes).toBe(26);
    expect(item("Língua Portuguesa", "Pontuação").questoes).toBe(9);
    expect(item("Língua Portuguesa", "Concordância verbal e nominal").questoes).toBe(12);
    expect(item("Língua Portuguesa", "Colocação pronominal").questoes).toBe(7);
    expect(item("Língua Portuguesa", "Regência verbal e nominal").questoes).toBe(7);
    // RL: dedução 23+3+4+3=33, sequências 15+1+1+1=18, negação 14+1=15, diagramas 9+1=10.
    expect(item("Raciocínio Lógico", "Dedução e estruturas lógicas").questoes).toBe(33);
    expect(item("Raciocínio Lógico", "Sequências numéricas e figurais").questoes).toBe(18);
    expect(item("Raciocínio Lógico", "Negação e equivalência").questoes).toBe(15);
    expect(item("Raciocínio Lógico", "Diagramas lógicos e conjuntos").questoes).toBe(10);
    // Matemática: porcentagem 7+2+2=11, média 7+1+1=9, geometria 6+1=7, razão 5+3=8.
    expect(item("Matemática", "Porcentagem e juros simples").questoes).toBe(11);
    expect(item("Matemática", "Média aritmética simples e ponderada").questoes).toBe(9);
    expect(item("Matemática", "Geometria (Pitágoras, área e volume)").questoes).toBe(7);
    expect(item("Matemática", "Razão e proporção").questoes).toBe(8);
    // Informática: Windows 17+1+1=19, Excel 14+2+1+1=18, Word 13+1+1=15,
    // Internet 11+2+1+1=15, correio 10+1=11, Teams 9+1=10, OneDrive 1+1+1=3.
    expect(item("Noções de Informática", "Windows e Explorador de Arquivos").questoes).toBe(19);
    expect(item("Noções de Informática", "Excel (fórmulas, funções e planilhas)").questoes).toBe(18);
    expect(item("Noções de Informática", "Word (edição e formatação de textos)").questoes).toBe(15);
    expect(item("Noções de Informática", "Internet e URL").questoes).toBe(15);
    expect(item("Noções de Informática", "Correio eletrônico (envio, anexos, Cc/Cco, spam)").questoes).toBe(11);
    expect(item("Noções de Informática", "MS Teams (chats, reuniões e equipes)").questoes).toBe(10);
    expect(item("Noções de Informática", "OneDrive (armazenamento e compartilhamento)").questoes).toBe(3);
    // Atualidades: política 10+1=11, internacional 10+1=11.
    expect(item("Atualidades", "Política nacional e Judiciário").questoes).toBe(11);
    expect(item("Atualidades", "Internacional").questoes).toBe(11);
    // Direito: fé pública 4→5, funcionário 4→5, 311-A 2→4, 307/308 3→4,
    // tutela 3→4, procedimento comum 3→4, recursos 3→4, JEC 4→5,
    // Improbidade 9º/11 3→5, PcD 1º–13 3→5.
    expect(item("Direito Penal", "Arts. 293 a 305 (fé pública)").provas).toBe(5);
    expect(item("Direito Penal", "Arts. 312 a 317 (funcionário contra a Administração)").provas).toBe(5);
    expect(item("Direito Penal", "Art. 311-A (fraude em certames)").provas).toBe(4);
    expect(item("Direito Penal", "Arts. 307 e 308 (falsa identidade)").provas).toBe(4);
    expect(item("Direito Processual Civil", "Arts. 294 a 311 (tutela provisória)").provas).toBe(4);
    expect(item("Direito Processual Civil", "Arts. 318 a 538 (procedimento comum)").provas).toBe(4);
    expect(item("Direito Processual Civil", "Arts. 994 a 1026 (recursos)").provas).toBe(4);
    expect(item("Direito Processual Civil", "Arts. 3º a 19").provas).toBe(5);
    expect(item("Direito Administrativo", "Arts. 9º e 11 (atos de improbidade)").provas).toBe(5);
    expect(item("Estatuto da Pessoa com Deficiência", "Arts. 1º a 13 (atendimento prioritário)").provas).toBe(5);
  });

  it("Estatuto PcD tem os dois blocos de artigos do edital (1º–13 e 34–38)", () => {
    const pcd = itensDaMateria("Estatuto da Pessoa com Deficiência");
    expect(pcd).toHaveLength(2);
    expect(pcd.map((i) => i.artigo)).toEqual([
      "Arts. 1º a 13 (atendimento prioritário)",
      "Arts. 34 a 38 (direito ao trabalho)",
    ]);
  });

  it("mantém todos os cobrados, ordenados do mais para o menos cobrado, com Top 5 por matéria", () => {
    // Português: 10 cobrados, ordenados por questões (69, 50, 29, 26, 17, 12, 12, 9, 7, 7).
    const port = itensDaMateria("Língua Portuguesa");
    expect(port).toHaveLength(10);
    expect(port.map((i) => i.artigo)).toEqual([
      "Interpretação de Textos",
      "Sintaxe (concordância, regência e colocação)",
      "Significação Contextual de Palavras e Expressões",
      "Morfologia (classes de palavras)",
      "Crase",
      "Noções Gerais de Compreensão e Interpretação de Texto",
      "Concordância verbal e nominal",
      "Pontuação",
      "Regência verbal e nominal",
      "Colocação pronominal",
    ]);
    expect(top5DaMateria("Língua Portuguesa").map((i) => i.artigo)).toEqual([
      "Interpretação de Textos",
      "Sintaxe (concordância, regência e colocação)",
      "Significação Contextual de Palavras e Expressões",
      "Morfologia (classes de palavras)",
      "Crase",
    ]);
    expect(ehTop5(port[0]!)).toBe(true);
    expect(ehTop5(port[5]!)).toBe(false);
    // Constitucional: art. 5º no topo, Top 5 não corta o art. 92 (6º, raro).
    const consti = itensDaMateria("Direito Constitucional");
    expect(consti).toHaveLength(6);
    expect(top5DaMateria("Direito Constitucional")).toHaveLength(5);
    expect(ehTop5(consti.find((i) => i.artigo.includes("Art. 92"))!)).toBe(false);
  });

  it("seção 'Artigos cobrados desta lei' na tela Leis: Direito Penal traz os 10 itens em ordem, com Top 5 certo", () => {
    // Ordem da prévia mostrada ao usuário (26/11/2026): ordenado por questões
    // e depois por provas — os 3 artigos de 1 questão primeiro, depois os de
    // 5, 4, 3 e 1 provas.
    const penal = itensDaMateria("Direito Penal");
    expect(penal.map((i) => i.artigo)).toEqual([
      "Art. 320 (condescendência criminosa)",
      "Art. 319 (prevaricação)",
      "Art. 344 (coação no curso do processo)",
      "Arts. 293 a 305 (fé pública)",
      "Arts. 312 a 317 (funcionário contra a Administração)",
      "Art. 311-A (fraude em certames)",
      "Arts. 307 e 308 (falsa identidade)",
      "Arts. 339 a 347 (contra a Administração da Justiça)",
      "Art. 357 (exploração de prestígio)",
      "Arts. 328 a 333 e 335 a 337 (particular contra a Administração)",
    ]);
    expect(top5DaMateria("Direito Penal").map((i) => i.artigo)).toEqual(
      penal.slice(0, 5).map((i) => i.artigo),
    );
    for (const item of penal.slice(0, 5)) expect(ehTop5(item)).toBe(true);
    for (const item of penal.slice(5)) expect(ehTop5(item)).toBe(false);
    expect(nuncaCobradosDaMateria("Direito Penal").map((n) => n.artigo)).toEqual([
      "Art. 359",
      "Arts. 322 a 327",
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

describe("números dos artigos cobrados — sumário do Vade Mecum", () => {
  it("parser expande os formatos reais do arquivo", () => {
    expect([...numerosDoArtigo("Art. 320")]).toEqual([320]);
    expect([...numerosDoArtigo("Art. 311-A (fraude em certames)")]).toEqual([311]);
    expect([...numerosDoArtigo("Art. 382, §2º (produção antecipada de provas)")]).toEqual([382]);
    expect([...numerosDoArtigo("Arts. 307 e 308 (falsa identidade)")].sort((a, b) => a - b)).toEqual([
      307, 308,
    ]);
    const faixa = numerosDoArtigo("Arts. 293 a 305 (fé pública)");
    expect(faixa.size).toBe(13);
    expect(faixa.has(293)).toBe(true);
    expect(faixa.has(299)).toBe(true);
    expect(faixa.has(305)).toBe(true);
    expect(faixa.has(306)).toBe(false);
    expect(
      [...numerosDoArtigo("Arts. 328 a 333 e 335 a 337 (particular contra a Administração)")].sort(
        (a, b) => a - b,
      ),
    ).toEqual([328, 329, 330, 331, 332, 333, 335, 336, 337]);
    const mista = numerosDoArtigo("Arts. 60 a 83, 88 e 89");
    expect(mista.size).toBe(26);
    expect(mista.has(60)).toBe(true);
    expect(mista.has(83)).toBe(true);
    expect(mista.has(84)).toBe(false);
    expect(mista.has(88)).toBe(true);
    expect(mista.has(89)).toBe(true);
    expect(mista.has(90)).toBe(false);
    const ordinal = numerosDoArtigo("Arts. 1º a 13 (atendimento prioritário)");
    expect(ordinal.size).toBe(13);
    expect(ordinal.has(1)).toBe(true);
    expect(ordinal.has(13)).toBe(true);
    expect(numerosDoArtigo("Lei nº 12.153/2009").size).toBe(0);
    expect(numerosDoArtigo("Interpretação de Textos").size).toBe(0);
    expect(numerosDoArtigo("Res. TJSP 963/2025 (eproc)").size).toBe(0);
    expect(numerosDoArtigo("Penas disciplinares (demissão; suspensão de até 90 dias)").size).toBe(0);
  });

  it("Direito Penal: Top 5 cobre 320, 319, 344, 293–305 e 312–317; 359 e 322–327 fora", () => {
    const { top5, cobrados } = artigosCobradosDaMateria("Direito Penal");
    for (const n of [320, 319, 344]) expect(top5.has(n)).toBe(true);
    for (let n = 293; n <= 305; n++) expect(top5.has(n)).toBe(true);
    for (let n = 312; n <= 317; n++) expect(top5.has(n)).toBe(true);
    expect(top5.has(311)).toBe(false);
    expect(top5.has(307)).toBe(false);
    expect(top5.has(339)).toBe(false);
    for (const n of [311, 307, 308, 357]) expect(cobrados.has(n)).toBe(true);
    for (let n = 339; n <= 347; n++) expect(cobrados.has(n)).toBe(true);
    for (let n = 328; n <= 333; n++) expect(cobrados.has(n)).toBe(true);
    for (let n = 335; n <= 337; n++) expect(cobrados.has(n)).toBe(true);
    for (let n = 322; n <= 327; n++) {
      expect(cobrados.has(n)).toBe(false);
      expect(top5.has(n)).toBe(false);
    }
    expect(cobrados.has(359)).toBe(false);
    expect(cobrados.has(321)).toBe(false);
  });

  it("Constitucional: Top 5 sem o art. 92 (raro); Língua Portuguesa não tem números", () => {
    const { top5, cobrados } = artigosCobradosDaMateria("Direito Constitucional");
    expect(top5.has(5)).toBe(true);
    for (let n = 37; n <= 41; n++) expect(top5.has(n)).toBe(true);
    expect(top5.has(12)).toBe(true);
    expect(top5.has(7)).toBe(true);
    expect(top5.has(8)).toBe(true);
    expect(top5.has(92)).toBe(false);
    expect(cobrados.has(92)).toBe(true);
    const port = artigosCobradosDaMateria("Língua Portuguesa");
    expect(port.top5.size).toBe(0);
    expect(port.cobrados.size).toBe(0);
  });

  it("seletor 'Ver só o Top 5': o filtro deixa passar só os artigos do Top 5 (mesma regra do painel)", () => {
    // A regra do painel é: soTop5 && !top5.has(numeroArtigo(artigo)) → fora.
    const { top5 } = artigosCobradosDaMateria("Direito Penal");
    const passa = (referencia: string) =>
      top5.has(numeroArtigo({ referencia, texto: "" } as ArtigoIntegral));
    expect(passa("Art. 320")).toBe(true);
    expect(passa("Art. 299")).toBe(true); // dentro da faixa 293–305
    expect(passa("Art. 312")).toBe(true);
    expect(passa("Art. 311-A")).toBe(false); // cobrado, mas fora do Top 5
    expect(passa("Art. 357")).toBe(false);
    expect(passa("Art. 359")).toBe(false); // nunca cobrado
    expect(passa("Art. 1º")).toBe(false);
  });
});
