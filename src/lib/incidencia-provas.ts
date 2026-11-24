/**
 * Peso por matéria a partir de provas anteriores contadas no Qconcursos
 * (página pública de provas, sem cadastro, sem IA, sem créditos).
 *
 * Fonte: contagem feita em 23/11/2026, prova por prova, na seção
 * "O que mais caiu na prova" / "Questões por disciplinas" de cada prova.
 * Cada prova tem a sua URL de origem, para qualquer pessoa conferir.
 *
 * Regra do peso: para cada matéria, peso = (questões da matéria somadas
 * nas provas em que ela foi contada) / (total de questões dessas provas).
 * Por isso cada linha mostra em quantas provas a matéria foi contada:
 * as 3 disciplinas mais cobradas foram contadas em todas as provas do
 * escopo; as demais, só nas provas cuja página trouxe a contagem completa.
 * Não há estimativa de IA aqui — só contagem.
 *
 * Escopos, na ordem que o usuário pediu:
 *  1. banca (VUNESP / Instituto AOCP)
 *  2. carreira / instituição (TJ-SP / qualquer Polícia Civil, depois PC-BA)
 *  3. cargo (Escrevente, Oficial de Justiça, Investigador)
 *
 * Atualização 24/11/2026: entraram as duas provas de 2025 enviadas
 * pelo usuário em PDF com gabarito oficial — Escrevente 07/12/2025
 * (70 questões, Versão 1, primeira no formato novo de 70) e Analista
 * de Sistemas 11/05/2025 (70 questões, Versão 1). Da Analista, só
 * entram as matérias com contagem verificada para o edital do
 * Escrevente (Português 10, Raciocínio Lógico 5, Direito Penal 2);
 * as outras 53 questões são TI de analista e normas do CNJ, fora do
 * edital — ver o relatório em ~/workspace/prova-analista-2025/.
 * O denominador do peso por matéria só soma as provas onde a matéria
 * foi contada, então a Analista não infla o peso das matérias que ela
 * não contou.
 */

export type DisciplinaContada = {
  /** Nome da matéria como aparece na prova / no edital. */
  materia: string;
  questoes: number;
};

export type ProvaContada = {
  banca: string;
  instituicao: string;
  cargo: string;
  ano: number;
  aplicadaEm: string;
  totalQuestoes: number;
  url: string;
  /** Só as disciplinas com contagem verificada na página da prova. */
  disciplinas: DisciplinaContada[];
  assuntosTopo: string[];
};

export const PROVAS_CONTADAS: ProvaContada[] = [
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2023,
    aplicadaEm: "02/07/2023",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2023-tj-sp-escrevente",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
      { materia: "Direito Processual Penal", questoes: 7 },
      { materia: "Direito Processual Civil", questoes: 7 },
      { materia: "Direito Constitucional", questoes: 7 },
      { materia: "Direito Penal", questoes: 6 },
      { materia: "Matemática", questoes: 6 },
      { materia: "Legislação Estadual", questoes: 5 },
      { materia: "Legislação dos Tribunais de Justiça (TJs)", questoes: 5 },
      { materia: "Atualidades", questoes: 4 },
      { materia: "Direito Administrativo", questoes: 3 },
      { materia: "Estatuto da Pessoa com Deficiência", questoes: 2 },
    ],
    assuntosTopo: ["Interpretação de Textos 7%", "Noções Gerais de Compreensão e Interpretação de Texto 5%", "Morfologia 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2017,
    aplicadaEm: "02/07/2017",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2017-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
    ],
    assuntosTopo: ["Interpretação de Textos 7%", "Noções Gerais de Compreensão e Interpretação de Texto 4%", "Sintaxe 2%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2015,
    aplicadaEm: "26/04/2015",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2015-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 16 },
      { materia: "Raciocínio Lógico", questoes: 11 },
    ],
    assuntosTopo: ["Interpretação de Textos 6%", "Sintaxe 3%", "Aritmética e Problemas 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2014,
    aplicadaEm: "07/12/2014",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2014-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 16 },
      { materia: "Raciocínio Lógico", questoes: 11 },
    ],
    assuntosTopo: ["Significação Contextual de Palavras e Expressões 7%", "Interpretação de Textos 6%", "Sintaxe 4%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Oficial de Justiça",
    ano: 2024,
    aplicadaEm: "14/12/2024",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2024-tj-sp-oficial-de-justica",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 20 },
      { materia: "Direito Processual Civil", questoes: 12 },
      { materia: "Direito Processual Penal", questoes: 10 },
      { materia: "Direito Penal", questoes: 8 },
      { materia: "Direito Constitucional", questoes: 8 },
      { materia: "Noções de Informática", questoes: 8 },
      { materia: "Direito Civil", questoes: 7 },
      { materia: "Raciocínio Lógico", questoes: 6 },
      { materia: "Legislação Estadual", questoes: 5 },
      { materia: "Legislação dos Tribunais de Justiça (TJs)", questoes: 5 },
      { materia: "Matemática", questoes: 3 },
      { materia: "Direito Administrativo", questoes: 2 },
      { materia: "Estatuto da Pessoa com Deficiência", questoes: 2 },
    ],
    assuntosTopo: ["Interpretação de Textos 5%", "Noções Gerais de Compreensão e Interpretação de Texto 2%", "Significação Contextual de Palavras e Expressões 2%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Oficial de Justiça",
    ano: 2023,
    aplicadaEm: "15/10/2023",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2023-tj-sp-oficial-de-justica",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 20 },
      { materia: "Direito Penal", questoes: 9 },
      { materia: "Direito Processual Penal", questoes: 9 },
    ],
    assuntosTopo: ["Interpretação de Textos 4%", "Noções Gerais de Compreensão e Interpretação de Texto 4%", "Legislação do Estado de São Paulo 4%"],
  },
  {
    banca: "Instituto AOCP",
    instituicao: "PC-PA",
    cargo: "Investigador de Polícia Civil",
    ano: 2021,
    aplicadaEm: "04/07/2021",
    totalQuestoes: 60,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/instituto-aocp-2021-pc-pa-investigador-de-policia-civil",
    disciplinas: [
      { materia: "Direito Penal", questoes: 13 },
      { materia: "Direito Processual Penal", questoes: 13 },
      { materia: "Língua Portuguesa", questoes: 5 },
      { materia: "Raciocínio Lógico", questoes: 5 },
      { materia: "Estatística", questoes: 5 },
      { materia: "Contabilidade Geral", questoes: 5 },
      { materia: "Direito Constitucional", questoes: 5 },
      { materia: "Legislação Estadual", questoes: 3 },
      { materia: "Noções de Informática", questoes: 2 },
      { materia: "Direito Administrativo", questoes: 2 },
      { materia: "História e Geografia de Estados e Municípios", questoes: 2 },
    ],
    assuntosTopo: ["Noções Fundamentais 5%", "Ação Penal 4%", "Cálculo de Probabilidades 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "PC-SP",
    cargo: "Investigador de Polícia",
    ano: 2022,
    aplicadaEm: "22/05/2022",
    totalQuestoes: 80,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2022-pc-sp-investigador-de-policia",
    disciplinas: [
      { materia: "Noções de Informática", questoes: 19 },
      { materia: "Língua Portuguesa", questoes: 15 },
      { materia: "Raciocínio Lógico", questoes: 15 },
      { materia: "Criminologia", questoes: 10 },
      { materia: "Direito Penal", questoes: 5 },
      { materia: "Direito Processual Penal", questoes: 5 },
      { materia: "Matemática", questoes: 5 },
      { materia: "Direito Administrativo", questoes: 2 },
      { materia: "Direito Constitucional", questoes: 1 },
      { materia: "Direitos Humanos", questoes: 1 },
      { materia: "Direito do Consumidor", questoes: 1 },
      { materia: "Redes de Computadores", questoes: 1 },
    ],
    assuntosTopo: ["Conceito, Objeto, Método, Origem e História da Criminologia 6%", "Interpretação de Textos 4%", "Noções Gerais de Compreensão e Interpretação de Texto 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2018,
    aplicadaEm: "25/03/2018",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2018-tj-sp-escrevente-tecnico-judiciario-interior",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
      { materia: "Direito Processual Penal", questoes: 7 },
      { materia: "Direito Processual Civil", questoes: 7 },
      { materia: "Direito Constitucional", questoes: 7 },
      { materia: "Direito Penal", questoes: 6 },
      { materia: "Atualidades", questoes: 6 },
      { materia: "Matemática", questoes: 6 },
      { materia: "Legislação dos Tribunais de Justiça (TJs)", questoes: 5 },
      { materia: "Legislação Estadual", questoes: 4 },
      { materia: "Direito Administrativo", questoes: 4 },
    ],
    assuntosTopo: ["Interpretação de Textos 8%", "Atualidades do ano de 2018 3%", "Significação Contextual de Palavras e Expressões 2%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2021,
    aplicadaEm: "30/10/2021",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2021-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
    ],
    assuntosTopo: ["Interpretação de Textos 9%", "Noções Gerais de Compreensão e Interpretação de Texto 6%", "Redação - Reescritura de texto 2%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2023,
    aplicadaEm: "28/05/2023",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2023-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [{ materia: "Língua Portuguesa", questoes: 24 }],
    assuntosTopo: ["Crase — questão 10, direta, com as 5 alternativas testando 'à'"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2024,
    aplicadaEm: "08/09/2024",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2024-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
      { materia: "Direito Processual Penal", questoes: 7 },
      { materia: "Direito Processual Civil", questoes: 7 },
      { materia: "Direito Penal", questoes: 6 },
      { materia: "Direito Constitucional", questoes: 6 },
      { materia: "Matemática", questoes: 6 },
      { materia: "Legislação Estadual", questoes: 5 },
      { materia: "Legislação dos Tribunais de Justiça (TJs)", questoes: 5 },
      { materia: "Direito Administrativo", questoes: 4 },
      { materia: "Atualidades", questoes: 4 },
      { materia: "Estatuto da Pessoa com Deficiência", questoes: 2 },
    ],
    assuntosTopo: ["Interpretação de Textos 8%", "Noções Gerais de Compreensão e Interpretação de Texto 6%", "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis do Estado) 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2024,
    aplicadaEm: "24/11/2024",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2024-tj-sp-escrevente-tecnico-judiciario-reaplicacao",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 24 },
      { materia: "Noções de Informática", questoes: 14 },
      { materia: "Raciocínio Lógico", questoes: 10 },
      { materia: "Direito Processual Penal", questoes: 7 },
      { materia: "Direito Processual Civil", questoes: 7 },
      { materia: "Direito Constitucional", questoes: 7 },
      { materia: "Direito Penal", questoes: 6 },
      { materia: "Matemática", questoes: 6 },
      { materia: "Legislação Estadual", questoes: 5 },
      { materia: "Legislação dos Tribunais de Justiça (TJs)", questoes: 5 },
      { materia: "Atualidades", questoes: 4 },
      { materia: "Direito Administrativo", questoes: 3 },
      { materia: "Estatuto da Pessoa com Deficiência", questoes: 2 },
    ],
    assuntosTopo: ["Sintaxe 7%", "Interpretação de Textos 6%", "Noções Gerais de Compreensão e Interpretação de Texto 6%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Escrevente Técnico Judiciário",
    ano: 2025,
    aplicadaEm: "07/12/2025",
    totalQuestoes: 70,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2025-tj-sp-escrevente-tecnico-judiciario",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 16 },
      { materia: "Noções de Informática", questoes: 9 },
      { materia: "Raciocínio Lógico", questoes: 7 },
      { materia: "Direito Administrativo", questoes: 6 },
      { materia: "Direito Processual Penal", questoes: 5 },
      { materia: "Direito Processual Civil", questoes: 5 },
      { materia: "Direito Constitucional", questoes: 5 },
      { materia: "Legislação Interna", questoes: 5 },
      { materia: "Direito Penal", questoes: 4 },
      { materia: "Matemática", questoes: 4 },
      { materia: "Atualidades", questoes: 3 },
      { materia: "Estatuto da Pessoa com Deficiência", questoes: 1 },
    ],
    assuntosTopo: ["Interpretação de Textos 25%", "Significação Contextual 25%", "Sintaxe 19%"],
  },
  {
    banca: "VUNESP",
    instituicao: "PC-BA",
    cargo: "Investigador de Polícia",
    ano: 2018,
    aplicadaEm: "22/04/2018",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2018-pc-ba-investigador-de-policia",
    disciplinas: [
      { materia: "Direito Penal", questoes: 18 },
      { materia: "Direito Processual Penal", questoes: 17 },
      { materia: "Direito Constitucional", questoes: 16 },
    ],
    assuntosTopo: ["Legislação Penal Especial 3%", "Interpretação de Textos 2%", "Legislação do Estado da Bahia 2%"],
  },
  {
    banca: "IBFC",
    instituicao: "PC-BA",
    cargo: "Investigador de Polícia Civil",
    ano: 2022,
    aplicadaEm: "24/07/2022",
    totalQuestoes: 100,
    url: "https://www.qconcursos.com/questoes-de-concursos/provas/ibfc-2022-pc-ba-investigador-de-policia-civil",
    disciplinas: [
      { materia: "Direito Penal", questoes: 15 },
      { materia: "Direito Processual Penal", questoes: 11 },
      { materia: "Legislação Estadual", questoes: 11 },
      { materia: "Direito Administrativo", questoes: 9 },
      { materia: "Direito Constitucional", questoes: 9 },
      { materia: "Raciocínio Lógico", questoes: 8 },
      { materia: "Contabilidade Geral", questoes: 7 },
      { materia: "Língua Portuguesa", questoes: 6 },
      { materia: "Atualidades", questoes: 4 },
      { materia: "Noções de Informática", questoes: 3 },
      { materia: "Medicina Legal", questoes: 3 },
      { materia: "Matemática Financeira", questoes: 3 },
      { materia: "Redação Oficial", questoes: 2 },
      { materia: "Direito Eleitoral", questoes: 2 },
    ],
    assuntosTopo: ["Legislação do Estado da Bahia 6%", "Legislação Penal Especial 3%", "Lei Estadual nº 11.370/2009 – Lei Orgânica da Polícia Civil do Estado da Bahia 3%"],
  },
  {
    banca: "VUNESP",
    instituicao: "TJ-SP",
    cargo: "Analista de Sistemas Judiciário",
    ano: 2025,
    aplicadaEm: "11/05/2025",
    totalQuestoes: 70,
    url: "https://www.pciconcursos.com.br/provas/download/analista-de-sistema-judiciario-tj-sp-vunesp-2025",
    disciplinas: [
      { materia: "Língua Portuguesa", questoes: 10 },
      { materia: "Raciocínio Lógico", questoes: 5 },
      { materia: "Direito Penal", questoes: 2 },
    ],
    assuntosTopo: ["Interpretação de Textos 6", "Crase — questão 10, direta, gabarito E"],
  },
];

export type PesoMateria = {
  materia: string;
  /** Peso percentual, com 1 casa decimal. */
  peso: number;
  questoes: number;
  /** Total de questões das provas em que a matéria foi contada. */
  totalContado: number;
  provas: number;
};

export type EscopoPeso = {
  banca: string;
  instituicao: string;
  cargo: string;
  provas: ProvaContada[];
  pesos: PesoMateria[];
};

/** Normaliza banca/cargo para comparar com o edital ativo. */
const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Agrega as provas contadas de um escopo (banca + instituição + cargo)
 * e devolve o peso de cada matéria, do maior para o menor.
 * O peso de cada matéria usa só as provas em que ela foi contada —
 * ver o comentário no topo do arquivo.
 */
export function calcularPesoPorMateria(provas: ProvaContada[]): PesoMateria[] {
  const acc = new Map<string, { questoes: number; total: number; provas: number }>();
  for (const p of provas) {
    for (const d of p.disciplinas) {
      const a = acc.get(d.materia) ?? { questoes: 0, total: 0, provas: 0 };
      a.questoes += d.questoes;
      a.total += p.totalQuestoes;
      a.provas += 1;
      acc.set(d.materia, a);
    }
  }
  return [...acc.entries()]
    .map(([materia, a]) => ({
      materia,
      peso: Math.round((a.questoes / a.total) * 1000) / 10,
      questoes: a.questoes,
      totalContado: a.total,
      provas: a.provas,
    }))
    .sort((x, y) => y.peso - x.peso || y.questoes - x.questoes);
}

/** Escopos já contados, um por banca + instituição + cargo. */
export function escoposPeso(): EscopoPeso[] {
  const porEscopo = new Map<string, ProvaContada[]>();
  for (const p of PROVAS_CONTADAS) {
    const k = `${p.banca}|${p.instituicao}|${p.cargo}`;
    porEscopo.set(k, [...(porEscopo.get(k) ?? []), p]);
  }
  return [...porEscopo.entries()]
    .map(([k, provas]) => {
      const [banca, instituicao, cargo] = k.split("|");
      return { banca: banca!, instituicao: instituicao!, cargo: cargo!, provas, pesos: calcularPesoPorMateria(provas) };
    })
    .sort((a, b) => a.banca.localeCompare(b.banca) || a.cargo.localeCompare(b.cargo));
}

/** Escopo do concurso ativo no edital, quando já foi contado. */
export function escopoDoConcurso(banca?: string, cargo?: string): EscopoPeso | null {
  if (!banca || !cargo) return null;
  const b = semAcento(banca);
  const c = semAcento(cargo);
  return (
    escoposPeso().find(
      (e) => semAcento(e.banca).includes(b) && semAcento(e.cargo).includes(c),
    ) ?? null
  );
}

/**
 * Peso por banca, somando todos os cargos contados daquela banca.
 * É aqui que entram as questões semelhantes de cargo diferente: o estilo
 * da banca — como ela cobra cada assunto e que tipo de pegadinha usa —
 * se repete entre cargos, então o peso por banca mostra o padrão da banca,
 * não só o do cargo. O peso por cargo (escopoDoConcurso) continua sendo
 * o principal; o peso por banca é o contexto.
 */
export function pesoPorBanca(banca?: string): { provas: ProvaContada[]; pesos: PesoMateria[] } | null {
  if (!banca) return null;
  const b = semAcento(banca);
  const provas = PROVAS_CONTADAS.filter((p) => semAcento(p.banca).includes(b));
  if (!provas.length) return null;
  return { provas, pesos: calcularPesoPorMateria(provas) };
}

/**
 * Chave canônica de uma matéria, para comparar nomes diferentes do mesmo
 * assunto: "Língua Portuguesa" = "Português", "Noções de Informática" =
 * "Informática". Sem isso, o filtro do edital falharia por causa do nome.
 */export function chaveMateria(nome: string): string {
  const n = semAcento(nome);
  if (n.includes("processual penal")) return "processual penal";
  if (n.includes("processual civil")) return "processual civil";
  if (n.includes("portugu")) return "portugues";
  if (n.includes("informatica")) return "informatica";
  if (n.includes("raciocinio")) return "raciocinio logico";
  if (n.includes("matematica financeira")) return "matematica financeira";
  if (n.includes("matematica")) return "matematica";
  if (n.includes("penal")) return "penal";
  if (n.includes("civil")) return "civil";
  if (n.includes("constitucional")) return "constitucional";
  if (n.includes("administrativo")) return "administrativo";
  if (n.includes("legislacao")) return "legislacao";
  if (n.includes("atualidades")) return "atualidades";
  if (n.includes("deficiencia")) return "estatuto pcd";
  if (n.includes("estatistica")) return "estatistica";
  if (n.includes("contabilidade")) return "contabilidade";
  if (n.includes("medicina legal")) return "medicina legal";
  if (n.includes("criminologia")) return "criminologia";
  if (n.includes("direitos humanos")) return "direitos humanos";
  if (n.includes("consumidor")) return "consumidor";
  if (n.includes("igualdade")) return "igualdade racial e de genero";
  return n.trim();
}

/**
 * Só entra o que é do mesmo assunto cobrado no edital ativo.
 * Recebe os nomes das matérias do edital (materiasAtivas) e devolve os
 * pesos dentro do edital e a lista dos excluídos, para mostrar ao usuário
 * o que ficou de fora e por quê. Sem edital ativo, devolve tudo.
 */
export function filtrarPesosPorEdital(
  pesos: PesoMateria[],
  materiasEdital: string[],
): { dentro: PesoMateria[]; fora: PesoMateria[] } {
  if (!materiasEdital.length) return { dentro: pesos, fora: [] };
  const permitidas = new Set(materiasEdital.map(chaveMateria));
  const dentro: PesoMateria[] = [];
  const fora: PesoMateria[] = [];
  for (const p of pesos) {
    (permitidas.has(chaveMateria(p.materia)) ? dentro : fora).push(p);
  }
  return { dentro, fora };
}

/* ------------------------------------------------------------------ */
/* Ranking completo — todas as matérias do edital, com assuntos       */
/* ------------------------------------------------------------------ */

/**
 * Matérias de cada edital, tiradas do Anexo VIII / Anexo I dos editais
 * que o usuário enviou (TJ SP Escrevente Edital nº 02/2026, Oficial
 * Edital nº 01/2026, PC-BA SAEB nº 02/2026). O ranking de incidência
 * tem que cobrir todas elas — mesmo a que teve 0 questões nas provas
 * contadas, porque ela ainda cai no treino e na repetição do estudo.
 */
export const EDITAIS_MATERIAS: Record<string, string[]> = {
  "TJ-SP · Escrevente Técnico Judiciário": [
    "Língua Portuguesa",
    "Direito Penal",
    "Direito Processual Penal",
    "Direito Processual Civil",
    "Direito Constitucional",
    "Direito Administrativo",
    "Legislação Interna",
    "Atualidades",
    "Matemática",
    "Noções de Informática",
    "Raciocínio Lógico",
    "Estatuto da Pessoa com Deficiência",
  ],
  "TJ-SP · Oficial de Justiça": [
    "Língua Portuguesa",
    "Direito Penal",
    "Direito Processual Penal",
    "Direito Processual Civil",
    "Direito Constitucional",
    "Direito Administrativo",
    "Direito Civil",
    "Legislação Especial",
    "Atualidades",
    "Matemática",
    "Raciocínio Lógico",
    "Noções de Informática",
    "Estatuto da Pessoa com Deficiência",
  ],
  "PC-BA · Investigador de Polícia Civil": [
    "Língua Portuguesa",
    "Raciocínio Lógico",
    "Atualidades",
    "Noções de Informática",
    "Promoção da Igualdade Racial e de Gênero",
    "Medicina Legal",
    "Legislação Geral",
    "Noções de Contabilidade",
    "Direito Administrativo",
    "Direito Constitucional",
    "Direito Penal",
    "Direito Processual Penal",
    "Legislação Penal e Processual Extravagante",
    "Estatística",
  ],
};

export type AssuntoContado = {
  assunto: string;
  materia: string;
  /** Questões contadas com esse assunto, nas provas listadas. */
  questoes: number;
  /** Em quantas provas o assunto foi contado (top 3 ou busca por palavra). */
  provas: number;
  /** Como a banca cobra — o formato da pegadinha, quando verificado. */
  comoCobra?: string;
  /** Limite da contagem, para não vender precisão que não existe. */
  observacao?: string;
  /**
   * Alerta de contagem mascarada: o assunto aparece muito mais do que a
   * contagem por palavra mostra, porque a banca o cobra dentro de outro
   * assunto. Ex.: Crase é cobrada dentro de Regência e Sintaxe — a
   * questão não diz "crase" no enunciado, mas as alternativas testam
   * "à" contra "a". Nesse caso, tratar como alta incidência no estudo,
   * mesmo que a contagem explícita seja baixa.
   */
  alertaMascarado?: string;
  /**
   * Separação pedida em 23/11/2026: quando o comando pede Crase, é um
   * assunto; quando o comando pede Regência (ou outro assunto) e a crase
   * só aparece nas alternativas, é crase mascarada. Não somar os dois
   * no mesmo número sem dizer qual é qual.
   */
  separacaoCraseRegencia?: {
    /** Comando pede Crase explicitamente. */
    craseDireta: number;
    /** Comando pede Regência e a crase decide nas alternativas. */
    regenciaMascarada: number;
    /** Comando pede outro assunto e a crase é distrator nas alternativas. */
    outroAssuntoMascarada?: number;
    /**
     * Lacunas "a" x "à": o comando pede para preencher as lacunas e a
     * crase é uma das opções. Incorporadas por decisão do usuário em
     * 23/11/2026 (antes eram contadas à parte, fora do total).
     */
    lacunas?: number;
  };
};

/**
 * Assuntos de Português contados questão por questão (23/11/2026).
 * Fonte: página de questões de cada prova no Qconcursos, buscando a
 * palavra do assunto no enunciado, e a lista "Assuntos mais relevantes"
 * da página da prova (em prova de 100 questões, 7% = 7 questões).
 * Crase: Escrevente 2023 = 2, Escrevente 2017 = 1, Oficial 2023 = 1;
 * Escrevente 2015 e 2014 = 0 pela palavra no enunciado, embora o assunto
 * esteja listado na prova — a crase pode ter aparecido só nas
 * alternativas, por isso a contagem por palavra subestima esses anos.
 * Atualização 24/11/2026: + Analista 2025 (Interpretação 6, Sintaxe 2,
 * Significação 1, Crase direta 1) e lacunas a/à incorporadas por decisão
 * do usuário — Crase total 15 em 13 provas (direta 7, regência 1,
 * outro assunto 1, lacunas 6).
 */
export const ASSUNTOS_CONTADOS: AssuntoContado[] = [
  { assunto: "Interpretação de Textos", materia: "Língua Portuguesa", questoes: 72, provas: 11, comoCobra: "Texto longo (jornal, literatura) + alternativa que resume ou conclui o que o texto diz; a pegadinha troca o sentido ou generaliza." },
  { assunto: "Noções Gerais de Compreensão e Interpretação de Texto", materia: "Língua Portuguesa", questoes: 33, provas: 7 },
  { assunto: "Sintaxe", materia: "Língua Portuguesa", questoes: 18, provas: 5 },
  { assunto: "Significação Contextual de Palavras e Expressões", materia: "Língua Portuguesa", questoes: 12, provas: 4 },
  { assunto: "Morfologia", materia: "Língua Portuguesa", questoes: 3, provas: 1 },
  {
    assunto: "Crase",
    materia: "Língua Portuguesa",
    questoes: 15,
    provas: 13,
    comoCobra: "Sempre dentro de um texto: julgar se a crase está certa, se ela se mantém ao trocar o verbo, ou onde ela caberia. É regência verbal/nominal disfarçada de crase. Ex.: Escrevente 2023-05-28 Q10, direta, com as 5 alternativas testando 'à' ('à uma melhora', 'à procura', 'à ela', 'à todos', 'à 7,9%'); Oficial 2023 'O uso do acento indicativo da crase atende à norma-padrão em:'; Escrevente 2021 Q04 'a crase mantém-se se a expressão destacada for substituída por…'. E as lacunas a/à (6): o comando pede para preencher as lacunas e a crase é uma das opções.",
    observacao: "Contagem separada, por comando: (1) Crase direta, comando pede crase — 7: 2023-07-02 (2), 2017 (1), Oficial 2023 (1), 2021 Q04 (1), 2023-05-28 Q10 (1), Analista 2025 Q10 (1). (2) Regência mascarada, comando pede regência e a crase decide nas alternativas — 1: 2024-11-24 Q24, regência nominal ('ajuda à dona Tetê' / 'em relação às redes sociais'). (3) Outro assunto mascarado — 1: 2023-07-02, questão de pronome com a alternativa errada 'Tratava à ele'. (4) Lacunas a/à — 6: 2018 Q19, 2021 Q06 e Q23, 2024-09-08 Q18, 2024-11-24 Q20, 2025 Q02 — incorporadas por decisão do usuário (23/11/2026). Total 15 em 13 provas. Em 2018 e 2024-09-08 o assunto está listado na prova, sem a palavra no enunciado — por isso 15 ainda é um piso, não o total.",
    alertaMascarado:
      "Crase é muito mais cobrada do que a contagem explícita mostra: ela está mascarada pela regência. Muitas questões de Regência e Sintaxe testam a crase nas alternativas — 'à' contra 'a' — sem dizer 'crase' no enunciado. Ex.: Escrevente 2023, questão de pronome com a alternativa errada 'Tratava à ele'; Escrevente 2024-11-24 Q24, de regência nominal, com 'ajuda à dona Tetê'. Por isso, no estudo, tratar Crase como alta incidência (★★★), junto com Interpretação, mesmo que o número explícito seja menor.",
    separacaoCraseRegencia: {
      craseDireta: 7,
      regenciaMascarada: 1,
      outroAssuntoMascarada: 1,
      lacunas: 6,
    },
  },
  { assunto: "Legislação do Estado de São Paulo", materia: "Legislação Estadual", questoes: 4, provas: 1 },
  { assunto: "Legislação do Estado da Bahia", materia: "Legislação Estadual", questoes: 6, provas: 1 },
  { assunto: "Legislação Penal Especial", materia: "Direito Penal", questoes: 3, provas: 1 },
];

export type ItemRanking = {
  materia: string;
  peso: number;
  questoes: number;
  provas: number;
  /** 0 = não contada nas provas verificadas; ainda entra no treino. */
  contada: boolean;
  assuntos: AssuntoContado[];
};

/**
 * Ranking DENTRO de uma matéria: os assuntos dela, do mais cobrado para
 * o menos cobrado, para ser objetivo no que estudar primeiro dentro
 * daquela matéria. Ex.: dentro de Língua Portuguesa, 1º Interpretação
 * de Textos (35), 2º Noções Gerais (15), 3º Sintaxe e Significação
 * Contextual (9 cada), 4º Crase (4), 5º Morfologia (3).
 * Só entram assuntos com contagem verificada; o resto fica como
 * "sem contagem por assunto" — não inventado.
 */
export function assuntosDaMateria(materia: string): AssuntoContado[] {
  return ASSUNTOS_CONTADOS.filter((a) => chaveMateria(a.materia) === chaveMateria(materia)).sort(
    (a, b) => b.questoes - a.questoes || a.assunto.localeCompare(b.assunto),
  );
}

/** Peso de um assunto dentro da própria matéria, quando o total da matéria é conhecido. */
export function pesoDentroDaMateria(assunto: AssuntoContado, totalMateria: number): number | null {
  if (!totalMateria) return null;
  return Math.round((assunto.questoes / totalMateria) * 1000) / 10;
}

/**
 * Ranking de incidência cobrindo TODAS as matérias do edital, do maior
 * peso para o menor, com as sem contagem no fim — nunca fora do ranking.
 * `pesos` vem de calcularPesoPorMateria do escopo (cargo ou banca);
 * `materiasEdital` é a lista do edital ativo (ou EDITAIS_MATERIAS).
 * As questões variadas para repetir o estudo vêm da Quest API
 * (buscarQuestoesQuestApi, por banca + matéria + cargo), que já existe
 * no app — este ranking diz o que buscar primeiro, por peso.
 */
export function rankingCompleto(pesos: PesoMateria[], materiasEdital: string[]): ItemRanking[] {
  const porChave = new Map(pesos.map((p) => [chaveMateria(p.materia), p]));
  return materiasEdital
    .map((materia) => {
      const p = porChave.get(chaveMateria(materia));
      return {
        materia,
        peso: p?.peso ?? 0,
        questoes: p?.questoes ?? 0,
        provas: p?.provas ?? 0,
        contada: !!p,
        assuntos: assuntosDaMateria(materia),
      };
    })
    .sort((a, b) => b.peso - a.peso || a.materia.localeCompare(b.materia));
}
