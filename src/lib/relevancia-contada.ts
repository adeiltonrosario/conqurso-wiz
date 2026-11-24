/**
 * Relevância contada — substitui a estimativa da IA no "Detalhamento do
 * edital" (EditalRelevancia.tsx).
 *
 * REGRA: nenhum número aqui é estimativa. Tudo vem de contagem de provas
 * reais, já verificada e guardada no repo:
 *  - peso por matéria: `calcularPesoPorMateria` sobre as 17 provas de
 *    `PROVAS_CONTADAS` (src/lib/incidencia-provas.ts);
 *  - peso por tópico: `questoes` de `LEITURA_RESUMIDA` e de
 *    `ASSUNTOS_CONTADOS`, com o denominador documentado em cada regra;
 *  - macros: agrupamentos diretos do que estudar primeiro, só com
 *    contagem verificada.
 *
 * O que NÃO tem contagem verificada fica SEM valor (undefined) — nunca
 * zero inventado e nunca excluído da lista. O tópico continua aparecendo
 * no fim, marcado "sem contagem", para estudar do zero.
 *
 * Dois cuidados de casamento, documentados onde se aplicam:
 *  1. O Qconcursos rotula "Legislação Estadual" o que no edital 2027 é
 *     Direito Administrativo (Lei 10.261/68), e "Legislação dos TJs" o
 *     que no edital 2027 é Legislação Interna (Normas da Corregedoria).
 *     Por isso, para VUNESP + Escrevente, Direito Administrativo soma
 *     "Direito Administrativo" (Improbidade) + "Legislação Estadual"
 *     (Lei 10.261) = 39 questões em 5 provas = 8,3%; e Legislação
 *     Interna soma "Legislação dos Tribunais de Justiça (TJs)" (20)
 *     + "Legislação Interna" (5, só na 2025, já no rótulo novo) = 25
 *     em 5 provas = 5,3%.
 *     Esse alias só vale para esse escopo — em outro concurso, a
 *     "Legislação Estadual" é outra coisa (ex.: PC-BA, Lei 11.370/09).
 *  2. Pesos por tópico são pisos quando a contagem é um subconjunto
 *     citado (ex.: as seções do Capítulo VII somam 9 das 11 questões
 *     de arts. 37–41; as 2 restantes não foram atribuídas por seção
 *     na fonte). A soma dos tópicos de uma matéria pode ficar abaixo
 *     de 100% — o resto é o que não foi classificado por tópico.
 */

import {
  ASSUNTOS_CONTADOS,
  chaveMateria,
  escoposPeso,
  PROVAS_CONTADAS,
  type EscopoPeso,
  type ProvaContada,
} from "./incidencia-provas";
import { LEITURA_RESUMIDA } from "./leis-resumidas";

/* ------------------------------------------------------------------ */
/* Normalização                                                        */
/* ------------------------------------------------------------------ */

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Normaliza um texto para casamento por palavra-chave. */
function normalizar(texto: string): string {
  return semAcento(texto).replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Verdadeiro se todas as frases aparecem no texto, com fronteira de palavra. As frases passam pela mesma normalização do texto (ex.: "10.261" vira "10 261"). */
function contemFrases(textoNormalizado: string, frases: string[]): boolean {
  return frases.every((f) => {
    const frase = normalizar(f);
    return frase.length > 0 && new RegExp(`\\b${escaparRegex(frase)}\\b`).test(textoNormalizado);
  });
}

/** Arredonda um % para 1 casa decimal, como em incidencia-provas.ts. */
function pct1(questoes: number, total: number): number {
  return Math.round((questoes / total) * 1000) / 10;
}

/* ------------------------------------------------------------------ */
/* Escopo contado (banca + cargo)                                     */
/* ------------------------------------------------------------------ */

/** Tira "fundação"/"instituto" da banca, para casar "Fundação VUNESP" com "VUNESP". */
function bancaSemPrefixo(banca: string): string {
  return normalizar(banca).replace(/\b(fundacao|instituto)\b/g, "").replace(/\s+/g, " ").trim();
}

function escopoPara(banca: string | undefined, cargo: string | undefined): EscopoPeso | null {
  if (!banca || !cargo) return null;
  const b = bancaSemPrefixo(banca);
  const c = normalizar(cargo);
  return (
    escoposPeso().find((e) => {
      const eb = bancaSemPrefixo(e.banca);
      const ec = normalizar(e.cargo);
      const bancaOk = eb.includes(b) || b.includes(eb);
      // Cargo: o escopo tem que conter o cargo pedido (não o contrário),
      // senão "Investigador de Polícia Civil" casaria com "Investigador
      // de Polícia" (PC-SP) em vez de "Investigador de Polícia Civil" (PC-PA).
      const cargoOk = ec.includes(c);
      return bancaOk && cargoOk;
    }) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Peso por matéria                                                    */
/* ------------------------------------------------------------------ */

/**
 * Aliases de rótulo, só para VUNESP + Escrevente Técnico Judiciário
 * (edital 2027): o rótulo contado no Qconcursos e o nome da matéria
 * no edital 2027. O casamento é por nome exato normalizado, não por
 * chave — "Legislação Estadual" e "Legislação dos TJs" têm a mesma
 * chave ("legislacao") e não podem se misturar.
 */
const ALIASES_ESCOPO_ESCREVENTE: Record<string, string[]> = {
  "Direito Administrativo": ["Direito Administrativo", "Legislação Estadual"],
  // A 2025 já vem no rótulo novo "Legislação Interna" (5 questões: 4
  // itens novos + 1 Corregedoria); as antigas vêm como "Legislação
  // dos Tribunais de Justiça (TJs)" (só Corregedoria, 5 por prova).
  // Nenhuma prova tem os dois rótulos, então não há dupla contagem.
  "Legislação Interna": ["Legislação dos Tribunais de Justiça (TJs)", "Legislação Interna"],
};

function ehEscopoEscrevente(banca: string | undefined, cargo: string | undefined): boolean {
  return (
    bancaSemPrefixo(banca ?? "").includes("vunesp") &&
    normalizar(cargo ?? "").includes("escrevente")
  );
}

/**
 * Peso combinado de um conjunto de rótulos contados, somando as questões
 * e usando como total a soma das provas em que PELO MENOS UM deles foi
 * contado (cada prova uma só vez — os dois rótulos aparecem nas mesmas
 * provas, então somar os totais dobraria a base).
 */
function pesoCombinado(
  provas: ProvaContada[],
  rotulos: string[],
): { questoes: number; total: number; provas: number } | null {
  const norm = rotulos.map((r) => normalizar(r));
  const relevantes = provas.filter((p) =>
    p.disciplinas.some((d) => norm.includes(normalizar(d.materia))),
  );
  if (!relevantes.length) return null;
  const questoes = relevantes.reduce(
    (s, p) =>
      s +
      p.disciplinas
        .filter((d) => norm.includes(normalizar(d.materia)))
        .reduce((a, d) => a + d.questoes, 0),
    0,
  );
  const total = relevantes.reduce((s, p) => s + p.totalQuestoes, 0);
  return { questoes, total, provas: relevantes.length };
}

export type RelevanciaMateriaContada = {
  /** Nome da matéria como está no edital ativo. */
  materia: string;
  /** Peso da matéria na prova (%), contado. undefined = sem contagem verificada. */
  relevancia?: number | undefined;
  /** Questões contadas da matéria no escopo (para conferir). */
  questoes?: number | undefined;
  /** Provas em que a matéria foi contada. */
  provas?: number | undefined;
  /** Peso de cada tópico dentro da matéria (%), contado. Só tópicos com contagem. */
  relevanciaTopicos: Record<string, number>;
  /** Tópicos do edital sem contagem verificada — continuam na lista, no fim. */
  semContagem: string[];
};

/* ------------------------------------------------------------------ */
/* Peso por tópico                                                     */
/* ------------------------------------------------------------------ */

/**
 * Regra de peso por tópico: o tópico do edital casa quando todas as
 * `chaves` aparecem nele (fronteira de palavra) e nenhuma de `excluir`
 * aparece. O peso é questoes / totalMateria.
 *
 * Fontes, por matéria (denominador = total de questões da matéria nas
 * provas de referência):
 *  - Língua Portuguesa (ASSUNTOS_CONTADOS, banca VUNESP): total 282
 *    = 24×9 Escrevente + 20×2 Oficial + 16 Escrevente 2025 + 10
 *    Analista 2025. Subtópicos de Sintaxe (concordância, colocação,
 *    regência) e Pontuação vêm de LEITURA_RESUMIDA, total 136 =
 *    24×5 PDFs + 16 Escrevente 2025. Os subtópicos se sobrepõem (a
 *    2025 Q04 testa concordância, regência e colocação juntas e conta
 *    nas três; Q14 e Q16 são concordância) — por isso a soma deles
 *    passa de 100% da Sintaxe, como antes.
 *  - Direito Constitucional: total 40 = 35 (7×5 PDFs) + 5 (2025).
 *    Art. 5º (18) e arts. 37–41 (11) têm `questoes` em
 *    LEITURA_RESUMIDA; art. 12 (5), art. 7º (4), art. 8º (1) e
 *    art. 92 (1) vêm das questões citadas no `exemplo` desses itens
 *    — e somam 18+11+5+4+1+1 = 40, o total conhecido, por isso a
 *    conta fecha. As seções do Capítulo VII usam a divisão citada:
 *    Seção I (arts. 37–38) 5, Seção II (arts. 39–41) 4 — piso, pois
 *    2 das 11 não foram atribuídas por seção na fonte.
 *  - Matemática (34 = 30 + 4 da 2025), Informática (79 = 70 + 9 da
 *    2025), Raciocínio Lógico (62 = 50 + 7 da 2025 + 5 da Analista
 *    2025), Atualidades (25 = 22 + 3 da 2025): `questoes` de
 *    LEITURA_RESUMIDA e dos relatórios de 2025.
 *  - Direito Processual Penal, arts. 251–258: 6 questões — "1 por
 *    prova, sempre", total 40 = 35 + 5 (2025).
 *  - Direito Administrativo: total 39 = 22 (Lei 10.261) + 17
 *    (Improbidade) em 5 provas. Lei 10.261, arts. 239–323: 22/39 =
 *    56,4%; arts. 30, 60 e 75 (faixa 1–86): 3/39 = 7,7% — a faixa
 *    1–86 saiu da lista de nunca cobrados na 2025; só 171–175
 *    segue sem cobrança. Lei 8.429/92: 17/39 = 43,6%.
 *  - Legislação Interna: total 25 = 20 (Corregedoria, 5 por prova
 *    em 4 provas) + 5 (2025: Res. 963, Res. 850, LC 1.111,
 *    Regimento Interno e Corregedoria, 1 cada). Corregedoria 21/25
 *    = 84%; cada item novo 1/25 = 4%.
 *  - Demais tópicos de Direito (Penal, Proc. Penal, Proc. Civil):
 *    só há `provas`, sem contagem de questões por artigo — ficam
 *    undefined, sem inventar.
 */
type RegraPesoTopico = {
  materia: string;
  chaves: string[];
  excluir?: string[];
  questoes: number;
  totalMateria: number;
  fonte: string;
};

const REGRAS_TOPICOS: RegraPesoTopico[] = [
  /* Língua Portuguesa — ASSUNTOS_CONTADOS, total 282 */
  { materia: "Língua Portuguesa", chaves: ["nocoes gerais"], questoes: 33, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Noções Gerais 33 em 7 provas" },
  { materia: "Língua Portuguesa", chaves: ["interpretacao"], excluir: ["nocoes gerais"], questoes: 72, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Interpretação de Textos 72 em 11 provas (66 + 6 da Analista 2025)" },
  { materia: "Língua Portuguesa", chaves: ["sintaxe"], questoes: 18, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Sintaxe 18 em 5 provas (16 + 2 da Analista 2025)" },
  { materia: "Língua Portuguesa", chaves: ["significacao"], questoes: 12, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Significação Contextual 12 em 4 provas (11 + 1 da Analista 2025)" },
  { materia: "Língua Portuguesa", chaves: ["sinonimo"], questoes: 12, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Significação Contextual 12 em 4 provas (sinônimos/antônimos)" },
  { materia: "Língua Portuguesa", chaves: ["antonimo"], questoes: 12, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Significação Contextual 12 em 4 provas (sinônimos/antônimos)" },
  { materia: "Língua Portuguesa", chaves: ["sentido"], questoes: 12, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Significação Contextual 12 em 4 provas (sentido próprio/figurado)" },
  { materia: "Língua Portuguesa", chaves: ["morfologia"], questoes: 3, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Morfologia 3 em 1 prova" },
  { materia: "Língua Portuguesa", chaves: ["classes de palavras"], questoes: 3, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Morfologia 3 em 1 prova" },
  { materia: "Língua Portuguesa", chaves: ["crase"], questoes: 15, totalMateria: 282, fonte: "ASSUNTOS_CONTADOS: Crase 15 em 13 provas (direta 7, regência mascarada 1, outro assunto 1, lacunas 6 — lacunas incorporadas por decisão do usuário) — tratar como alta prioridade" },
  /* Língua Portuguesa — LEITURA_RESUMIDA, total 136 */
  { materia: "Língua Portuguesa", chaves: ["concordancia"], questoes: 8, totalMateria: 136, fonte: "LEITURA_RESUMIDA: Concordância 8 em 6 PDFs (5 + 2025 Q04, Q14 e Q16)" },
  { materia: "Língua Portuguesa", chaves: ["colocacao"], questoes: 4, totalMateria: 136, fonte: "LEITURA_RESUMIDA: Colocação pronominal 4 em 6 PDFs (3 + 2025 Q04)" },
  { materia: "Língua Portuguesa", chaves: ["regencia"], questoes: 3, totalMateria: 136, fonte: "LEITURA_RESUMIDA: Regência 3 em 6 PDFs (2 + 2025 Q04)" },
  { materia: "Língua Portuguesa", chaves: ["pontuacao"], questoes: 7, totalMateria: 136, fonte: "LEITURA_RESUMIDA: Pontuação 7 em 6 PDFs (5 + 2025 Q05 e Q15)" },
  /* Direito Constitucional — total 40 */
  { materia: "Direito Constitucional", chaves: ["titulo ii", "capitulo i"], questoes: 18, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Art. 5º, 18 questões em 6 provas (16 + 2025 Q31 e Q32)" },
  { materia: "Direito Constitucional", chaves: ["titulo ii", "capitulo ii"], questoes: 5, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Art. 7º (4) + Art. 8º (1), citados no exemplo" },
  { materia: "Direito Constitucional", chaves: ["titulo ii", "capitulo iii"], questoes: 5, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Art. 12, 5 questões citadas no exemplo" },
  { materia: "Direito Constitucional", chaves: ["titulo iii", "capitulo vii", "secao i"], questoes: 5, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Arts. 37–38, 5 citadas (piso; 2 das 11 de arts. 37–41 sem seção atribuída)" },
  { materia: "Direito Constitucional", chaves: ["titulo iii", "capitulo vii", "secao ii"], questoes: 4, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Arts. 39–41, 4 citadas (piso; 2 das 11 de arts. 37–41 sem seção atribuída)" },
  { materia: "Direito Constitucional", chaves: ["artigo 92"], questoes: 1, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Art. 92, 1 questão (2023-05-28 Q50); 0 em 2025" },
  /* Direito Processual Penal — total 40 */
  { materia: "Direito Processual Penal", chaves: ["251"], questoes: 6, totalMateria: 40, fonte: "LEITURA_RESUMIDA: Arts. 251–258, 1 por prova, sempre (5 + 2025 Q21)" },
  /* Direito Administrativo — total 39 */
  { materia: "Direito Administrativo", chaves: ["10.261", "239"], questoes: 22, totalMateria: 39, fonte: "PROVAS_CONTADAS: Lei 10.261/68 arts. 239–323, 22 em 5 provas (19 + 2025: 0 — as 3 de 2025 são das faixas 30, 60 e 75)" },
  { materia: "Direito Administrativo", chaves: ["10.261", "1"], questoes: 3, totalMateria: 39, fonte: "LEITURA_RESUMIDA: Lei 10.261/68 arts. 30, 60 e 75, 3 questões na Escrevente 2025 (Q36–Q38) — a faixa 1–86 saiu da lista de nunca cobrados" },
  { materia: "Direito Administrativo", chaves: ["8.429"], questoes: 17, totalMateria: 39, fonte: "PROVAS_CONTADAS: Improbidade, 17 em 5 provas (14 + 3 da 2025)" },
  /* Legislação Interna — total 25 */
  { materia: "Legislação Interna", chaves: ["850"], questoes: 1, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Res. TJSP 850/2021, 1 questão (2025 Q43)" },
  { materia: "Legislação Interna", chaves: ["963"], questoes: 1, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Res. TJSP 963/2025, 1 questão (2025 Q42)" },
  { materia: "Legislação Interna", chaves: ["1.111"], questoes: 1, totalMateria: 25, fonte: "LEITURA_RESUMIDA: LC 1.111/2010, 1 questão (2025 Q44)" },
  { materia: "Legislação Interna", chaves: ["regimento"], questoes: 1, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Regimento Interno, 1 questão (2025 Q45)" },
  { materia: "Legislação Interna", chaves: ["corregedoria"], questoes: 21, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Normas da Corregedoria, 21 em 5 provas (5 por prova no formato antigo + 2025 Q46)" },
  /* Matemática — total 34 */
  { materia: "Matemática", chaves: ["porcentagem"], questoes: 7, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Porcentagem e juros simples, 7 em 6 provas (6 + 2025 Q52)" },
  { materia: "Matemática", chaves: ["juros"], questoes: 7, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Porcentagem e juros simples, 7 em 6 provas (6 + 2025 Q52)" },
  { materia: "Matemática", chaves: ["sistema de equacoes"], questoes: 6, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Sistema de equações do 1º grau, 6 em 5 PDFs (0 em 2025 — a Q51 foi classificada como razão e proporção)" },
  { materia: "Matemática", chaves: ["media"], questoes: 7, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Média aritmética, 7 em 6 provas (6 + 2025 Q54)" },
  { materia: "Matemática", chaves: ["geometria"], questoes: 6, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Geometria, 6 em 6 provas (5 + 2025 Q53)" },
  { materia: "Matemática", chaves: ["pitagoras"], questoes: 6, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Geometria (ternos pitagóricos), 6 em 6 provas" },
  { materia: "Matemática", chaves: ["razao"], questoes: 5, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Razão e proporção, 5 em 6 provas (4 + 2025 Q51)" },
  { materia: "Matemática", chaves: ["proporcao"], questoes: 5, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Razão e proporção, 5 em 6 provas (4 + 2025 Q51)" },
  { materia: "Matemática", chaves: ["tabela"], questoes: 2, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Tabelas e gráficos, 2 em 5 PDFs (0 em 2025)" },
  { materia: "Matemática", chaves: ["grafico"], questoes: 2, totalMateria: 34, fonte: "LEITURA_RESUMIDA: Tabelas e gráficos, 2 em 5 PDFs (0 em 2025)" },
  /* Noções de Informática — total 79 */
  { materia: "Noções de Informática", chaves: ["windows"], questoes: 17, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Windows e Explorador, 17 em 6 provas (16 + 2025 Q63)" },
  { materia: "Noções de Informática", chaves: ["explorador"], questoes: 17, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Windows e Explorador, 17 em 6 provas (16 + 2025 Q63)" },
  { materia: "Noções de Informática", chaves: ["excel"], questoes: 14, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Excel, 14 em 6 provas (12 + 2025 Q58 e Q59)" },
  { materia: "Noções de Informática", chaves: ["word"], questoes: 13, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Word, 13 em 6 provas (11 + 2025 Q56 e Q57)" },
  { materia: "Noções de Informática", chaves: ["internet"], questoes: 11, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Internet e URL, 11 em 6 provas (10 + 2025 Q61)" },
  { materia: "Noções de Informática", chaves: ["url"], questoes: 11, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Internet e URL, 11 em 6 provas (10 + 2025 Q61)" },
  { materia: "Noções de Informática", chaves: ["correio"], questoes: 10, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Correio eletrônico, 10 em 6 provas (9 + 2025 Q60)" },
  { materia: "Noções de Informática", chaves: ["e-mail"], questoes: 10, totalMateria: 79, fonte: "LEITURA_RESUMIDA: Correio eletrônico, 10 em 6 provas (9 + 2025 Q60)" },
  { materia: "Noções de Informática", chaves: ["teams"], questoes: 9, totalMateria: 79, fonte: "LEITURA_RESUMIDA: MS Teams, 9 em 6 provas (8 + 2025 Q62)" },
  { materia: "Noções de Informática", chaves: ["onedrive"], questoes: 1, totalMateria: 79, fonte: "LEITURA_RESUMIDA: OneDrive, 1 questão (2025 Q55) — primeira identificada com número" },
  /* Raciocínio Lógico — total 62 */
  { materia: "Raciocínio Lógico", chaves: ["deducao"], questoes: 23, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Dedução e estruturas lógicas, 23 em 7 provas (18 + 3 da 2025 + 2 da Analista 2025)" },
  { materia: "Raciocínio Lógico", chaves: ["estruturas logicas"], questoes: 23, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Dedução e estruturas lógicas, 23 em 7 provas" },
  { materia: "Raciocínio Lógico", chaves: ["sequencia"], questoes: 15, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Sequências, 15 em 7 provas (12 + 2 da 2025 + 1 da Analista 2025)" },
  { materia: "Raciocínio Lógico", chaves: ["negacao"], questoes: 14, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Negação e equivalência, 14 em 7 provas (11 + 2 da 2025 + 1 da Analista 2025)" },
  { materia: "Raciocínio Lógico", chaves: ["equivalencia"], questoes: 14, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Negação e equivalência, 14 em 7 provas" },
  { materia: "Raciocínio Lógico", chaves: ["diagrama"], questoes: 9, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Diagramas lógicos e conjuntos, 9 em 7 provas (8 + 0 da 2025 + 1 da Analista 2025)" },
  { materia: "Raciocínio Lógico", chaves: ["conjunto"], questoes: 9, totalMateria: 62, fonte: "LEITURA_RESUMIDA: Diagramas lógicos e conjuntos, 9 em 7 provas" },
  /* Atualidades — total 25 */
  { materia: "Atualidades", chaves: ["politica"], questoes: 10, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Política nacional e Judiciário, 10 em 6 provas (9 + 2025 Q48)" },
  { materia: "Atualidades", chaves: ["judiciario"], questoes: 10, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Política nacional e Judiciário, 10 em 6 provas" },
  { materia: "Atualidades", chaves: ["internacional"], questoes: 10, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Internacional, 10 em 6 provas (8 + 2025 Q47 e Q49)" },
  { materia: "Atualidades", chaves: ["saude"], questoes: 3, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Saúde, 3 em 5 PDFs (0 em 2025)" },
  { materia: "Atualidades", chaves: ["ciencia"], questoes: 2, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Ciência e tecnologia, 2 em 5 PDFs (0 em 2025)" },
  { materia: "Atualidades", chaves: ["tecnologia"], questoes: 2, totalMateria: 25, fonte: "LEITURA_RESUMIDA: Ciência e tecnologia, 2 em 5 PDFs (0 em 2025)" },
];

/** Peso contado de um tópico dentro da matéria, ou undefined (sem contagem). */
export function relevanciaTopicoContada(materia: string, topico: string): number | undefined {
  const chave = chaveMateria(materia);
  const texto = normalizar(topico);
  for (const regra of REGRAS_TOPICOS) {
    if (chaveMateria(regra.materia) !== chave) continue;
    if (!contemFrases(texto, regra.chaves)) continue;
    if (regra.excluir && contemFrases(texto, regra.excluir)) continue;
    return pct1(regra.questoes, regra.totalMateria);
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Relevância contada por matéria + tópicos                            */
/* ------------------------------------------------------------------ */

/**
 * Calcula a relevância contada para as matérias do edital ativo.
 * Matéria: peso % contado no escopo (banca + cargo). Tópico: peso %
 * dentro da matéria, quando há contagem verificada. Tópico sem
 * contagem vai para `semContagem` — continua na lista, sem valor.
 * Fora do escopo Escrevente, os tópicos ficam sem contagem (as
 * tabelas acima são dos 5 PDFs de Escrevente); o peso por matéria
 * continua valendo, quando há escopo contado.
 */
export function calcularRelevanciaContada(
  banca: string | undefined,
  cargo: string | undefined,
  materias: { nome: string; topicos: string[] }[],
): RelevanciaMateriaContada[] {
  const escopo = escopoPara(banca, cargo);
  const escrevente = ehEscopoEscrevente(banca, cargo);
  const provasEscopo = escopo?.provas ?? [];

  return materias.map((m) => {
    const aliases = escrevente ? (ALIASES_ESCOPO_ESCREVENTE[m.nome] ?? null) : null;
    let peso: { questoes: number; total: number; provas: number } | null = null;
    if (aliases) {
      peso = pesoCombinado(provasEscopo, aliases);
    } else if (escopo) {
      const chave = chaveMateria(m.nome);
      const rotulos = PROVAS_CONTADAS.flatMap((p) => p.disciplinas.map((d) => d.materia)).filter(
        (nome, i, arr) => chaveMateria(nome) === chave && arr.indexOf(nome) === i,
      );
      // Peso da matéria no escopo: soma das questões dos rótulos que
      // casam por chave, nas provas do escopo.
      const combinados = pesoCombinado(
        provasEscopo,
        rotulos.length ? rotulos : [m.nome],
      );
      peso = combinados;
    }

    const relevanciaTopicos: Record<string, number> = {};
    const semContagem: string[] = [];
    if (escrevente) {
      for (const t of m.topicos) {
        const v = relevanciaTopicoContada(m.nome, t);
        if (v == null) semContagem.push(t);
        else relevanciaTopicos[t] = v;
      }
    } else {
      semContagem.push(...m.topicos);
    }

    return {
      materia: m.nome,
      relevancia: peso ? pct1(peso.questoes, peso.total) : undefined,
      questoes: peso?.questoes,
      provas: peso?.provas,
      relevanciaTopicos,
      semContagem,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Macros diretos — o que estudar primeiro                             */
/* ------------------------------------------------------------------ */

export type MacroEstudo = {
  id: string;
  /** Título curto e direto. */
  titulo: string;
  /** Matéria principal, para o link "Ir para questões". */
  materia: string;
  /** Todas as matérias que o macro atravessa. */
  materias: string[];
  /** O que estudar, em uma linha. */
  descricao: string;
  /** Itens contados do macro, com o peso de cada um. */
  itens: string[];
  /** Questões contadas do macro, quando o total é verificado. */
  questoes?: number | undefined;
  /** Em quantas provas o macro foi identificado. */
  provas: number;
  /** Taxa por prova, quando verificada (ex.: "13 a 14 por prova"). */
  questoesPorProva?: string | undefined;
  /** Menor taxa por prova verificada (para o teste do Bloco servidor). */
  questoesPorProvaMin?: number | undefined;
  /** Maior taxa por prova verificada. */
  questoesPorProvaMax?: number | undefined;
  /** Texto curto do peso, como aparece na tela. */
  pesoTexto: string;
  /** Aviso quando o número é um piso verificado, não o total. */
  observacao?: string | undefined;
};

/**
 * Macros de Escrevente (VUNESP), ordenados por questões por prova.
 * Só entra o que tem contagem verificada nas fontes citadas em cada
 * item — nada de estimativa. Onde a contagem é um piso (questões
 * citadas no `exemplo`, sem o total fechado), o `observacao` diz isso.
 */
export const MACROS_ESCREVENTE: MacroEstudo[] = [
  {
    id: "bloco-servidor",
    titulo: "Bloco servidor — Lei 10.261 + Improbidade + Normas da Corregedoria",
    materia: "Direito Administrativo",
    materias: ["Direito Administrativo", "Legislação Interna"],
    descricao: "O maior conjunto da prova: Estatuto, Improbidade e Normas da Corregedoria juntos.",
    itens: [
      "Lei 10.261/68 (Estatuto) — 5 por prova no formato antigo; 3 em 2025",
      "Lei 8.429/92 (Improbidade) — 3 por prova",
      "Normas da Corregedoria — 5 por prova no formato antigo; 1 em 2025",
    ],
    provas: 5,
    questoesPorProva: "13 a 14 por prova no formato antigo; 7 em 2025",
    questoesPorProvaMin: 7,
    questoesPorProvaMax: 14,
    pesoTexto: "13 a 14 por prova no formato antigo; 7 em 2025 (11 com toda a Legislação Interna)",
  },
  {
    id: "deducao-sequencias-negacao",
    titulo: "Raciocínio Lógico — dedução, sequências e negação/equivalência",
    materia: "Raciocínio Lógico",
    materias: ["Raciocínio Lógico"],
    descricao: "Dedução, sequências e negação/equivalência somam quase todas as questões de RL.",
    itens: [
      "Dedução e estruturas lógicas — 23 questões",
      "Sequências — 15 questões",
      "Negação e equivalência — 14 questões",
    ],
    questoes: 52,
    provas: 7,
    pesoTexto: "52 das 62 questões de RL em 7 provas",
  },
  {
    id: "trio-escritorio",
    titulo: "Informática — Windows, Excel e Word",
    materia: "Noções de Informática",
    materias: ["Noções de Informática"],
    descricao: "O trio do escritório: Windows, Excel e Word são mais da metade da Informática.",
    itens: [
      "Windows e Explorador — 17 questões",
      "Excel — 14 questões",
      "Word — 13 questões",
    ],
    questoes: 44,
    provas: 6,
    pesoTexto: "44 questões em 6 provas",
  },
  {
    id: "sintaxe-reescrita",
    titulo: "Português — Sintaxe e reescrita",
    materia: "Língua Portuguesa",
    materias: ["Língua Portuguesa"],
    descricao: "Concordância, regência e colocação cobradas juntas, quase sempre dentro de reescrita.",
    itens: ["Sintaxe (concordância, regência e colocação) — 37 questões"],
    questoes: 37,
    provas: 6,
    pesoTexto: "37 questões em 6 provas",
  },
  {
    id: "interpretacao",
    titulo: "Português — Interpretação de Textos",
    materia: "Língua Portuguesa",
    materias: ["Língua Portuguesa"],
    descricao: "O assunto que mais cai na prova: texto longo + alternativa que resume o que o texto diz.",
    itens: ["Interpretação de Textos — 72 questões"],
    questoes: 72,
    provas: 11,
    pesoTexto: "72 questões em 11 provas — 25,5% do Português",
  },
  {
    id: "normas-corregedoria",
    titulo: "Legislação Interna — Normas da Corregedoria, 100% literais",
    materia: "Legislação Interna",
    materias: ["Legislação Interna"],
    descricao: "Sistema informatizado, consulta e carga, correição 1 vez por ano — decore o texto da norma. Na 2025, caíram também os 4 itens novos (Res. 963, Res. 850, LC 1.111 e Regimento Interno), 1 questão cada.",
    itens: [
      "Normas da Corregedoria — 5 por prova no formato antigo; 1 em 2025",
      "Res. 963/2025, Res. 850/2021, LC 1.111/2010 e Regimento Interno — 1 cada em 2025",
    ],
    provas: 5,
    questoesPorProva: "5 por prova no formato antigo; 1 em 2025",
    questoesPorProvaMin: 1,
    questoesPorProvaMax: 5,
    pesoTexto: "5 por prova no formato antigo; 1 em 2025",
  },
  {
    id: "contas-matematica",
    titulo: "Matemática — porcentagem, sistema de equações e média",
    materia: "Matemática",
    materias: ["Matemática"],
    descricao: "As três contas que mais caem: porcentagem/juros, sistema de equações e média.",
    itens: [
      "Porcentagem e juros simples — 7 questões",
      "Sistema de equações do 1º grau — 6 questões",
      "Média aritmética — 7 questões",
    ],
    questoes: 20,
    provas: 6,
    pesoTexto: "20 questões em 6 provas",
  },
  {
    id: "noticiario",
    titulo: "Atualidades — política nacional e internacional",
    materia: "Atualidades",
    materias: ["Atualidades"],
    descricao: "A resposta está no próprio texto da questão — a errada troca um detalhe (lugar, data, número, órgão).",
    itens: [
      "Política nacional e Judiciário — 10 questões",
      "Internacional — 10 questões",
    ],
    questoes: 20,
    provas: 6,
    pesoTexto: "20 das 25 questões de Atualidades em 6 provas",
  },
  {
    id: "improbidade",
    titulo: "Direito Administrativo — Improbidade (Lei 8.429/92)",
    materia: "Direito Administrativo",
    materias: ["Direito Administrativo"],
    descricao: "Só há improbidade com dolo, nunca com culpa; prescrição em 8 anos (art. 23).",
    itens: [
      "Arts. 9º e 11 (atos de improbidade)",
      "Representação, indisponibilidade e acordo de não persecução",
      "Art. 23 (prescrição — 8 anos)",
    ],
    provas: 5,
    questoesPorProva: "3 por prova",
    questoesPorProvaMin: 3,
    questoesPorProvaMax: 3,
    pesoTexto: "3 questões por prova",
  },
  {
    id: "servidores-37-41",
    titulo: "Direito Constitucional — Servidores (arts. 37 a 41)",
    materia: "Direito Constitucional",
    materias: ["Direito Constitucional"],
    descricao: "Improbidade (§4º do art. 37), responsabilidade civil (§6º), aposentadoria (art. 40) e estabilidade (art. 41).",
    itens: ["Arts. 37 a 41 — 11 questões"],
    questoes: 11,
    provas: 6,
    pesoTexto: "11 questões em 6 provas — 27,5% do Constitucional",
  },
  {
    id: "fe-publica-funcionario",
    titulo: "Direito Penal — fé pública (arts. 293–305) e funcionário (arts. 312–317)",
    materia: "Direito Penal",
    materias: ["Direito Penal"],
    descricao: "Falsidade ideológica (art. 299), peculato e corrupção passiva (crime formal).",
    itens: [
      "Arts. 293 a 305 (fé pública)",
      "Arts. 312 a 317 (funcionário contra a Administração)",
    ],
    questoes: 8,
    provas: 6,
    pesoTexto: "8 questões citadas em 6 provas",
    observacao: "Piso verificado — são as questões citadas no exemplo; o Penal tem 6 questões por prova no formato antigo e 4 em 2025.",
  },
  {
    id: "acoes-constitucionais",
    titulo: "Direito Constitucional — Ações constitucionais (art. 5º: LXX, LXXIII, XLVII)",
    materia: "Direito Constitucional",
    materias: ["Direito Constitucional"],
    descricao: "Ação popular (LXXIII), mandado de segurança coletivo (LXX, 1 ano) e penas vedadas (XLVII) — a pegadinha troca uma palavra ou um prazo.",
    itens: [
      "LXXIII ação popular — 3 questões",
      "LXX mandado de segurança coletivo — 2 questões",
      "XLVII penas vedadas — 3 questões",
    ],
    questoes: 8,
    provas: 6,
    pesoTexto: "8 questões citadas em 6 provas",
    observacao: "Piso verificado — o art. 5º tem 18 questões em 6 provas; 8 são das ações LXX, LXXIII e XLVII citadas.",
  },
  {
    id: "impedimento-suspeicao",
    titulo: "Processo Penal — impedimento e suspeição (CPP arts. 251–258)",
    materia: "Direito Processual Penal",
    materias: ["Direito Processual Penal"],
    descricao: "Juiz impedido ou suspeito não pode julgar — 1 questão por prova, sempre.",
    itens: ["Arts. 251 a 258 — 6 questões"],
    questoes: 6,
    provas: 6,
    pesoTexto: "1 por prova, sempre — 6 em 6 provas",
  },
  {
    id: "pcd-prioritario-trabalho",
    titulo: "Estatuto PcD — atendimento prioritário e trabalho",
    materia: "Estatuto da Pessoa com Deficiência",
    materias: ["Estatuto da Pessoa com Deficiência"],
    descricao: "O atendimento prioritário se estende ao acompanhante; trabalho com apoio, respeitando o perfil vocacional.",
    itens: [
      "Arts. 1º a 13 (atendimento prioritário)",
      "Arts. 34 a 38 (direito ao trabalho)",
    ],
    questoes: 5,
    provas: 3,
    pesoTexto: "5 questões citadas em 3 provas",
    observacao: "Piso verificado — o PcD tem 2 questões por prova em 2021, 2023, 2024-09-08 e 2024-11-24, e 1 em 2025.",
  },
  {
    id: "crase-mascarada",
    titulo: "Português — Crase mascarada pela regência",
    materia: "Língua Portuguesa",
    materias: ["Língua Portuguesa"],
    descricao: "A crase quase nunca vem com o nome 'crase' no comando — ela se mascara de regência. Tratar como alta prioridade.",
    itens: ["Crase — 15 questões (direta 7, regência mascarada 1, outro assunto 1, lacunas 6)"],
    questoes: 15,
    provas: 13,
    pesoTexto: "15 questões em 13 provas — alta prioridade (★★★)",
  },
  {
    id: "tutela-provisoria",
    titulo: "Processo Civil — tutela provisória (CPC arts. 294–311)",
    materia: "Direito Processual Civil",
    materias: ["Direito Processual Civil"],
    descricao: "Tutela de urgência e de evidência: a caução tem de ser real ou fidejussória idônea.",
    itens: ["Arts. 294 a 311 — 3 questões citadas"],
    questoes: 3,
    provas: 3,
    pesoTexto: "3 questões citadas em 3 provas",
    observacao: "Piso verificado — citadas em 2018 Q40, 2021 Q40 e 2023-05-28 Q40. Zero em 2025: a tutela provisória não caiu na primeira prova do formato novo.",
  },
];

/**
 * Macros do concurso ativo. Hoje só há macros com contagem suficiente
 * para VUNESP + Escrevente; para outro concurso, volta lista vazia —
 * sem inventar macro.
 */
export function macrosDoConcurso(
  banca: string | undefined,
  cargo: string | undefined,
): MacroEstudo[] {
  if (!ehEscopoEscrevente(banca, cargo)) return [];
  return MACROS_ESCREVENTE;
}

/* ------------------------------------------------------------------ */
/* Sanidade interna (usada pelos testes)                               */
/* ------------------------------------------------------------------ */

/** Quantas provas contadas existem no repo. */
export function totalProvasContadas(): number {
  return PROVAS_CONTADAS.length;
}

/** Itens de leitura resumida usados como fonte dos pesos por tópico. */
export function fontesLeituraResumida(): number {
  return LEITURA_RESUMIDA.length;
}

/** Assuntos contados usados como fonte dos pesos de Português. */
export function fontesAssuntosContados(): number {
  return ASSUNTOS_CONTADOS.length;
}
