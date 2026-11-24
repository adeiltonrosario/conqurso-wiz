import { describe, expect, it } from "vitest";
import {
  calcularRelevanciaContada,
  MACROS_ESCREVENTE,
  macrosDoConcurso,
  relevanciaTopicoContada,
} from "./relevancia-contada";

/** Matérias do edital ativo (TJ-SP Escrevente, VUNESP), com os tópicos como estão cadastrados no app. */
const MATERIAS_ESCREVENTE = [
  {
    nome: "Língua Portuguesa",
    topicos: [
      "Interpretação de Textos",
      "Noções Gerais de Compreensão e Interpretação de Texto",
      "Significação Contextual de Palavras e Expressões",
      "Sinônimos e Antônimos",
      "Classes de Palavras",
      "Concordância Verbal e Nominal",
      "Regência Verbal e Nominal",
      "Colocação Pronominal",
      "Crase",
      "Pontuação",
      "Informações e Inferências",
    ],
  },
  { nome: "Direito Penal", topicos: ["Código Penal — artigos 293 a 305", "Código Penal — artigos 312 a 317"] },
  {
    nome: "Direito Processual Penal",
    topicos: ["Código de Processo Penal — artigos 251 a 258", "Lei nº 9.099/1995 — artigos 60 a 83"],
  },
  {
    nome: "Direito Processual Civil",
    topicos: [
      "Código de Processo Civil — artigos 144 a 155",
      "Código de Processo Civil — artigos 294 a 311",
      "Lei n.º 9.099 de 26.09.1995 (artigos 3º ao 19)",
    ],
  },
  {
    nome: "Direito Constitucional",
    topicos: [
      "Constituição Federal — Título II — Capítulo I",
      "Constituição Federal — Título II — Capítulo II",
      "Constituição Federal — Título II — Capítulo III",
      "Constituição Federal — Título III — Capítulo VII — Seção I",
      "Constituição Federal — Título III — Capítulo VII — Seção II",
      "Constituição Federal — artigo 92",
    ],
  },
  {
    nome: "Direito Administrativo",
    topicos: [
      "Estatuto dos Funcionários Públicos Civis do Estado de São Paulo (Lei n.º 10.261/68) — artigos 1º a 86; 171 a 175; 239 a 323.",
      "Lei n.º 10.261/68 — artigos 1º a 86",
      "Lei n.º 10.261/68 — artigos 171 a 175",
      "Lei n.º 10.261/68 — artigos 239 a 323",
      "Lei Federal n.º 8.429/92 (Lei de Improbidade Administrativa).",
    ],
  },
  {
    nome: "Legislação Interna",
    topicos: [
      "Res. TJSP 850/2021 (teletrabalho)",
      "Res. TJSP 963/2025 (eproc)",
      "Normas da Corregedoria Geral da Justiça",
    ],
  },
  { nome: "Atualidades", topicos: ["Política nacional", "Internacional", "Saúde"] },
  {
    nome: "Matemática",
    topicos: ["Equação do 2º grau", "Porcentagem e juros simples", "Média aritmética", "Geometria", "MMC e MDC"],
  },
  {
    nome: "Noções de Informática",
    topicos: ["MS-Windows 10", "MS-Excel", "MS-Word", "MS Teams", "OneDrive"],
  },
  {
    nome: "Raciocínio Lógico",
    topicos: ["Dedução e estruturas lógicas", "Sequências numéricas", "Negação e equivalência"],
  },
  {
    nome: "Estatuto da Pessoa com Deficiência",
    topicos: ["Lei nº 13.146/2015 — artigos 1º a 13", "Lei nº 13.146/2015 — artigos 34 a 38"],
  },
];

function relevanciaEscrevente() {
  return calcularRelevanciaContada("VUNESP", "Escrevente Técnico Judiciário", MATERIAS_ESCREVENTE);
}

describe("relevância contada por matéria — VUNESP Escrevente", () => {
  it("Português pesa 23,9% na prova", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Língua Portuguesa")!;
    // 216 (9 provas antigas) + 16 (2025) = 232 em 970 questões (900 + 70)
    expect(r.relevancia).toBe(23.9);
    expect(r.questoes).toBe(232);
    expect(r.provas).toBe(10);
  });

  it("Informática: 125 questões em 9 provas (14,4%)", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Noções de Informática")!;
    // 116 (8 provas antigas) + 9 (2025) = 125 em 870 questões (800 + 70)
    expect(r.questoes).toBe(125);
    expect(r.provas).toBe(9);
    expect(r.relevancia).toBe(14.4);
  });

  it("Direito Administrativo soma Improbidade + Lei 10.261 (alias do edital 2027)", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Direito Administrativo")!;
    // 14 (Improbidade) + 19 (Lei 10.261) = 33 em 4 provas + 6 (3 + 3) na 2025 = 39 em 5 provas = 8,3%
    expect(r.questoes).toBe(39);
    expect(r.provas).toBe(5);
    expect(r.relevancia).toBe(8.3);
  });

  it("Legislação Interna: 25 questões em 5 provas (5,3%) — Corregedoria + os 4 itens novos", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Legislação Interna")!;
    // 20 (Corregedoria, 5 por prova em 4 provas) + 5 (2025: 4 itens novos + 1 Corregedoria) = 25 em 470 questões
    expect(r.relevancia).toBe(5.3);
    expect(r.questoes).toBe(25);
    expect(r.provas).toBe(5);
  });

  it("todas as 12 matérias do edital voltam, com ou sem contagem", () => {
    expect(relevanciaEscrevente()).toHaveLength(12);
  });
});

describe("relevância contada por tópico — dentro da matéria", () => {
  it("Interpretação é 25,5% do Português", () => {
    expect(relevanciaTopicoContada("Língua Portuguesa", "Interpretação de Textos")).toBe(25.5);
  });

  it("art. 5º é o maior tópico do Constitucional (45%)", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Direito Constitucional")!;
    const art5 = r.relevanciaTopicos["Constituição Federal — Título II — Capítulo I"];
    expect(art5).toBe(45);
    const demais = Object.values(r.relevanciaTopicos).filter((v) => v !== art5);
    for (const v of demais) expect(v).toBeLessThan(art5!);
    // Capítulo II (arts. 7º+8º) e Capítulo III (art. 12): 5 em 40 = 12,5%
    expect(r.relevanciaTopicos["Constituição Federal — Título II — Capítulo II"]).toBe(12.5);
    expect(r.relevanciaTopicos["Constituição Federal — Título II — Capítulo III"]).toBe(12.5);
    expect(r.relevanciaTopicos["Constituição Federal — artigo 92"]).toBe(2.5);
  });

  it("Crase fica com 5,3% do Português (15 em 282)", () => {
    expect(relevanciaTopicoContada("Língua Portuguesa", "Crase")).toBe(5.3);
  });

  it("tópico sem contagem verificada fica undefined — não zero, não excluído", () => {
    const r = relevanciaEscrevente();
    const matematica = r.find((x) => x.materia === "Matemática")!;
    // Equação do 2º grau nunca foi identificada com certeza
    expect(matematica.relevanciaTopicos["Equação do 2º grau"]).toBeUndefined();
    expect(matematica.semContagem).toContain("Equação do 2º grau");
    expect(matematica.semContagem).toContain("MMC e MDC");
    // ...mas a matéria continua no resultado, com os tópicos contados
    expect(matematica.relevancia).toBe(6);
    expect(matematica.relevanciaTopicos["Porcentagem e juros simples"]).toBe(20.6);

    const legislacao = r.find((x) => x.materia === "Legislação Interna")!;
    // Os 4 itens novos caíram na 2025 (1 questão cada) e a Corregedoria
    // soma 21 em 25 — nada aqui fica sem contagem.
    expect(legislacao.relevanciaTopicos["Res. TJSP 850/2021 (teletrabalho)"]).toBe(4);
    expect(legislacao.relevanciaTopicos["Res. TJSP 963/2025 (eproc)"]).toBe(4);
    expect(legislacao.relevanciaTopicos["Normas da Corregedoria Geral da Justiça"]).toBe(84);
    expect(legislacao.semContagem).toHaveLength(0);
    expect(legislacao.relevancia).toBe(5.3);
  });

  it("Lei 10.261 arts. 239–323 pesa 56,4% do Administrativo; faixa 1–86 agora tem contagem; 171–175 segue sem", () => {
    const r = relevanciaEscrevente().find((x) => x.materia === "Direito Administrativo")!;
    expect(r.relevanciaTopicos["Lei n.º 10.261/68 — artigos 239 a 323"]).toBe(56.4);
    expect(r.relevanciaTopicos["Lei Federal n.º 8.429/92 (Lei de Improbidade Administrativa)."]).toBe(43.6);
    // Arts. 30, 60 e 75 cobrados na 2025 (Q36–Q38): 3 em 39 = 7,7%
    expect(r.relevanciaTopicos["Lei n.º 10.261/68 — artigos 1º a 86"]).toBe(7.7);
    expect(r.relevanciaTopicos["Lei n.º 10.261/68 — artigos 171 a 175"]).toBeUndefined();
  });
});

describe("macros diretos — o que estudar primeiro", () => {
  it("Bloco servidor: 13 a 14 por prova no formato antigo; 7 em 2025", () => {
    const macro = MACROS_ESCREVENTE.find((m) => m.id === "bloco-servidor")!;
    expect(macro.questoesPorProvaMin).toBe(7);
    expect(macro.questoesPorProvaMax).toBe(14);
    expect(macro.pesoTexto).toBe("13 a 14 por prova no formato antigo; 7 em 2025 (11 com toda a Legislação Interna)");
    expect(macro.materias).toEqual(["Direito Administrativo", "Legislação Interna"]);
  });

  it("macros existem para as 12 matérias de Escrevente (sem inventar fora do escopo)", () => {
    const macros = macrosDoConcurso("VUNESP", "Escrevente Técnico Judiciário");
    expect(macros.length).toBeGreaterThanOrEqual(12);
    const materiasComMacro = new Set(macros.map((m) => m.materia));
    for (const m of MATERIAS_ESCREVENTE) {
      expect(materiasComMacro.has(m.nome)).toBe(true);
    }
    // Fora do escopo Escrevente, sem macro inventado
    expect(macrosDoConcurso("Instituto AOCP", "Investigador de Polícia Civil")).toEqual([]);
    expect(macrosDoConcurso(undefined, undefined)).toEqual([]);
  });

  it("Ações constitucionais e Crase mascarada existem com os pesos contados", () => {
    const acoes = MACROS_ESCREVENTE.find((m) => m.id === "acoes-constitucionais")!;
    expect(acoes.questoes).toBe(8);
    expect(acoes.materia).toBe("Direito Constitucional");
    const crase = MACROS_ESCREVENTE.find((m) => m.id === "crase-mascarada")!;
    expect(crase.questoes).toBe(15);
    expect(crase.provas).toBe(13);
  });
});
