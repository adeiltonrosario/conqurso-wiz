/**
 * Mapa oficial do edital PC-BA (Investigador) → páginas do PDF do Vade Mecum pós-edital.
 * É a fonte primária de busca: ao escolher um item do edital, a leitura vai direto
 * para o ponto de corte do PDF (página inicial da norma até a página da norma seguinte).
 */

export type NormaMapeada = {
  /** Grupo/disciplina do edital. */
  grupo: string;
  /** Numeração do item no edital (ex.: "1.3"). */
  item: string;
  /** Descrição da norma como aparece no edital. */
  edital: string;
  /** Nome oficial da norma no Vade Mecum. */
  norma: string;
  /** Página inicial no PDF do Vade Mecum. */
  pagina_vade_mecum: number;
};

export const GRUPOS_VADE_MECUM = [
  { nome: "Promoção da igualdade racial e de gênero", de: 6, ate: 310 },
  { nome: "Legislação geral", de: 311, ate: 535 },
  { nome: "Noções de direito administrativo", de: 536, ate: 665 },
  { nome: "Códigos fundamentais", de: 666, ate: 1000 },
  { nome: "Legislação penal e processual extravagante", de: 1001, ate: 1408 },
] as const;

export const MAPA_VADE_MECUM: NormaMapeada[] = [
  // 1. Promoção da igualdade racial e de gênero
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.1", edital: "Constituição do Estado da Bahia (Cap. XXIII — Do Negro)", norma: "Constituição Estadual da Bahia", pagina_vade_mecum: 6 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.2", edital: "Lei Federal nº 12.288/2010", norma: "Estatuto da Igualdade Racial", pagina_vade_mecum: 113 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.3", edital: "Lei Federal nº 7.716/1989", norma: "Crimes de preconceito de raça ou de cor", pagina_vade_mecum: 130 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.4", edital: "Decreto Federal nº 65.810/1969", norma: "Convenção Internacional sobre Eliminação da Discriminação Racial", pagina_vade_mecum: 134 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.5", edital: "Decreto Federal nº 4.377/2002", norma: "Convenção sobre Eliminação de Discriminação contra a Mulher", pagina_vade_mecum: 147 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.6", edital: "Lei Federal nº 11.340/2006", norma: "Lei Maria da Penha", pagina_vade_mecum: 159 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.7", edital: "Código Penal — art. 140 (injúria)", norma: "Código Penal (extrato de injúria racial)", pagina_vade_mecum: 182 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.8", edital: "Lei Federal nº 9.455/1997", norma: "Crimes de tortura", pagina_vade_mecum: 184 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.9", edital: "Lei Federal nº 2.889/1956", norma: "Crime de genocídio", pagina_vade_mecum: 188 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.10", edital: "Lei Federal nº 7.437/1985", norma: "Lei Caó", pagina_vade_mecum: 191 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.11", edital: "Lei Estadual nº 14.521/2022", norma: "SEPROMI — Secretaria da Igualdade Racial da Bahia", pagina_vade_mecum: 194 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.12", edital: "Lei Estadual nº 13.182/2014", norma: "Estatuto da Igualdade Racial e Intolerância Religiosa (BA)", pagina_vade_mecum: 200 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.13", edital: "Lei Federal nº 10.678/2003", norma: "Secretaria Especial de Políticas de Promoção da Igualdade Racial", pagina_vade_mecum: 235 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.14", edital: "Decreto Federal nº 4.886/2003", norma: "Política Nacional de Promoção da Igualdade Racial (PNPIR)", pagina_vade_mecum: 238 },
  { grupo: "Promoção da igualdade racial e de gênero", item: "1.15", edital: "Leis nº 13.341 e nº 14.600", norma: "Legislações correlatas — organização dos Ministérios / igualdade", pagina_vade_mecum: 244 },

  // 2. Legislação geral
  { grupo: "Legislação geral", item: "2.1", edital: "Lei Estadual nº 6.677/1994", norma: "Estatuto dos Servidores Públicos do Estado da Bahia", pagina_vade_mecum: 311 },
  { grupo: "Legislação geral", item: "2.2", edital: "Lei Estadual nº 14.634/2023", norma: "Lei de Licitações e Contratos do Estado da Bahia", pagina_vade_mecum: 396 },
  { grupo: "Legislação geral", item: "2.3", edital: "Lei Estadual nº 12.209/2011", norma: "Processo Administrativo Estadual (Bahia)", pagina_vade_mecum: 446 },
  { grupo: "Legislação geral", item: "2.4", edital: "Lei Estadual nº 11.370/2009", norma: "Lei Orgânica da Polícia Civil do Estado da Bahia", pagina_vade_mecum: 481 },
  { grupo: "Legislação geral", item: "2.5", edital: "Lei Federal nº 8.906/1994", norma: "Estatuto da Advocacia e da OAB", pagina_vade_mecum: 518 },

  // 3. Noções de direito administrativo
  { grupo: "Noções de direito administrativo", item: "3.1", edital: "Lei Federal nº 14.133/2021", norma: "Nova Lei de Licitações e Contratos Administrativos", pagina_vade_mecum: 536 },
  { grupo: "Noções de direito administrativo", item: "3.2", edital: "Lei Federal nº 8.429/1992", norma: "Lei de Improbidade Administrativa", pagina_vade_mecum: 631 },

  // 4. Códigos fundamentais
  { grupo: "Códigos fundamentais", item: "4.1", edital: "Noções de Direito Constitucional", norma: "Constituição da República Federativa do Brasil de 1988", pagina_vade_mecum: 666 },
  { grupo: "Códigos fundamentais", item: "4.2", edital: "Noções de Direito Penal", norma: "Decreto-Lei nº 2.848/1940 — Código Penal", pagina_vade_mecum: 764 },
  { grupo: "Códigos fundamentais", item: "4.3", edital: "Noções de Direito Processual Penal", norma: "Decreto-Lei nº 3.689/1941 — Código de Processo Penal", pagina_vade_mecum: 880 },

  // 5. Legislação penal e processual extravagante
  { grupo: "Legislação penal e processual extravagante", item: "5.1", edital: "Lei Federal nº 5.553/1968", norma: "Apresentação e uso de documentos de identificação", pagina_vade_mecum: 1001 },
  { grupo: "Legislação penal e processual extravagante", item: "5.2", edital: "Lei Federal nº 13.869/2019", norma: "Lei de Abuso de Autoridade", pagina_vade_mecum: 1003 },
  { grupo: "Legislação penal e processual extravagante", item: "5.3", edital: "Lei Federal nº 8.072/1990", norma: "Lei dos Crimes Hediondos", pagina_vade_mecum: 1016 },
  { grupo: "Legislação penal e processual extravagante", item: "5.4", edital: "Lei Federal nº 9.503/1997", norma: "Código de Trânsito Brasileiro (crimes de trânsito)", pagina_vade_mecum: 1022 },
  { grupo: "Legislação penal e processual extravagante", item: "5.5", edital: "Lei Federal nº 9.605/1998", norma: "Lei dos Crimes Ambientais", pagina_vade_mecum: 1105 },
  { grupo: "Legislação penal e processual extravagante", item: "5.6", edital: "Lei Federal nº 10.826/2003", norma: "Estatuto do Desarmamento", pagina_vade_mecum: 1128 },
  { grupo: "Legislação penal e processual extravagante", item: "5.7", edital: "Lei Federal nº 11.343/2006", norma: "Lei de Drogas", pagina_vade_mecum: 1143 },
  { grupo: "Legislação penal e processual extravagante", item: "5.8", edital: "Lei Federal nº 7.960/1989", norma: "Lei de Prisão Temporária", pagina_vade_mecum: 1172 },
  { grupo: "Legislação penal e processual extravagante", item: "5.9", edital: "Lei Federal nº 9.099/1995", norma: "Juizados Especiais Cíveis e Criminais", pagina_vade_mecum: 1175 },
  { grupo: "Legislação penal e processual extravagante", item: "5.10", edital: "Lei Federal nº 10.259/2001", norma: "Juizados Especiais Cíveis e Criminais Federais", pagina_vade_mecum: 1192 },
  { grupo: "Legislação penal e processual extravagante", item: "5.11", edital: "Lei Federal nº 9.296/1996", norma: "Interceptação Telefônica", pagina_vade_mecum: 1198 },
  { grupo: "Legislação penal e processual extravagante", item: "5.12", edital: "Lei Federal nº 12.850/2013", norma: "Organizações Criminosas", pagina_vade_mecum: 1204 },
  { grupo: "Legislação penal e processual extravagante", item: "5.13", edital: "Lei Federal nº 8.069/1990", norma: "Estatuto da Criança e do Adolescente (ECA)", pagina_vade_mecum: 1222 },
  { grupo: "Legislação penal e processual extravagante", item: "5.14", edital: "Lei Federal nº 10.741/2003", norma: "Estatuto da Pessoa Idosa", pagina_vade_mecum: 1285 },
  { grupo: "Legislação penal e processual extravagante", item: "5.15", edital: "Lei Federal nº 7.492/1986", norma: "Crimes contra o Sistema Financeiro Nacional", pagina_vade_mecum: 1312 },
  { grupo: "Legislação penal e processual extravagante", item: "5.16", edital: "Lei Federal nº 4.737/1965", norma: "Código Eleitoral (crimes eleitorais)", pagina_vade_mecum: 1320 },
  { grupo: "Legislação penal e processual extravagante", item: "5.17", edital: "Lei Federal nº 7.210/1984", norma: "Lei de Execução Penal (LEP)", pagina_vade_mecum: 1328 },
  { grupo: "Legislação penal e processual extravagante", item: "5.18", edital: "Lei Federal nº 8.137/1990", norma: "Crimes contra a Ordem Tributária e Econômica", pagina_vade_mecum: 1362 },
  { grupo: "Legislação penal e processual extravagante", item: "5.19", edital: "Lei Federal nº 8.078/1990", norma: "Código de Defesa do Consumidor (crimes)", pagina_vade_mecum: 1369 },
  { grupo: "Legislação penal e processual extravagante", item: "5.20", edital: "Resolução nº 217-A (III) de 1948", norma: "Declaração Universal dos Direitos Humanos", pagina_vade_mecum: 1373 },
  { grupo: "Legislação penal e processual extravagante", item: "5.21", edital: "Decreto-Lei nº 3.688/1941", norma: "Lei das Contravenções Penais", pagina_vade_mecum: 1378 },
  { grupo: "Legislação penal e processual extravagante", item: "5.22", edital: "Lei Federal nº 9.613/1998", norma: "Lei de Lavagem de Dinheiro", pagina_vade_mecum: 1389 },
  { grupo: "Legislação penal e processual extravagante", item: "5.23", edital: "Lei Federal nº 12.037/2009", norma: "Lei de Identificação Criminal", pagina_vade_mecum: 1400 },
  { grupo: "Legislação penal e processual extravagante", item: "5.24", edital: "Lei Federal nº 12.830/2013", norma: "Lei da Investigação Criminal pelo Delegado", pagina_vade_mecum: 1403 },
  { grupo: "Legislação penal e processual extravagante", item: "5.25", edital: "Lei Federal nº 9.807/1999", norma: "Proteção a Vítimas e Testemunhas", pagina_vade_mecum: 1405 },
];

const ORDENADO = [...MAPA_VADE_MECUM].sort((a, b) => a.pagina_vade_mecum - b.pagina_vade_mecum);

/** Faixa de páginas da norma: da página inicial até a página anterior à norma seguinte. */
export function faixaDaNorma(item: string): [number, number] | null {
  const i = ORDENADO.findIndex((n) => n.item === item);
  if (i < 0) return null;
  const de = ORDENADO[i]!.pagina_vade_mecum;
  const proxima = ORDENADO[i + 1]?.pagina_vade_mecum;
  const fimGrupo = GRUPOS_VADE_MECUM.find((g) => de >= g.de && de <= g.ate)?.ate;
  const ate = proxima ? proxima - 1 : (fimGrupo ?? de + 40);
  return [de, Math.max(de, ate)];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Encontra a norma do mapa que melhor corresponde ao tópico/matéria do edital
 * (por número de lei citado ou por palavras do nome da norma).
 */
export function normaDoTopico(texto: string): NormaMapeada | null {
  const alvo = norm(texto);
  if (alvo.trim().length < 3) return null;

  const numeros = alvo.match(/\d[\d.]{2,}/g) ?? [];
  for (const n of numeros) {
    const limpo = n.replace(/\./g, "");
    const achou = MAPA_VADE_MECUM.find((m) =>
      norm(`${m.edital} ${m.norma}`).replace(/\./g, "").includes(limpo),
    );
    if (achou) return achou;
  }

  // Atalhos das disciplinas do edital que não citam o número da lei.
  const atalhos: [RegExp, string][] = [
    [/processual penal|processo penal/, "4.3"],
    [/constitucional/, "4.1"],
    [/execucao penal/, "5.17"],
    [/maria da penha/, "1.6"],
    [/improbidade/, "3.2"],
    [/licitac/, "3.1"],
    [/drogas/, "5.7"],
    [/desarmamento/, "5.6"],
    [/organizac(ao|oes) criminosa/, "5.12"],
    [/crianca e do adolescente|eca\b/, "5.13"],
    [/idosa|idoso/, "5.14"],
    [/penal/, "4.2"],
  ];
  for (const [re, item] of atalhos) {
    if (re.test(alvo)) {
      const achou = MAPA_VADE_MECUM.find((m) => m.item === item);
      if (achou) return achou;
    }
  }

  let melhor: { m: NormaMapeada; nota: number } | null = null;
  for (const m of MAPA_VADE_MECUM) {
    const palavras = norm(m.norma)
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length > 3);
    if (!palavras.length) continue;
    const achadas = palavras.filter((p) => alvo.includes(p)).length;
    const nota = achadas / palavras.length;
    const suficiente = palavras.length > 1 ? achadas >= 2 && nota >= 0.6 : nota === 1;
    if (suficiente && (!melhor || nota > melhor.nota)) melhor = { m, nota };
  }
  return melhor?.m ?? null;
}

/**
 * Normas do Vade Mecum efetivamente cobradas pelo edital em estudo:
 * casa cada matéria e cada tópico com o mapa e devolve sem repetição, na ordem de página.
 */
export function normasDoEdital(
  materias: { nome: string; topicos?: string[] }[],
): NormaMapeada[] {
  const achadas = new Map<string, NormaMapeada>();
  for (const m of materias) {
    const alvos = [m.nome, ...(m.topicos ?? []).map((t) => `${t} ${m.nome}`)];
    for (const alvo of alvos) {
      const norma = normaDoTopico(alvo);
      if (norma) achadas.set(norma.item, norma);
    }
  }
  return [...achadas.values()].sort((a, b) => a.pagina_vade_mecum - b.pagina_vade_mecum);
}

