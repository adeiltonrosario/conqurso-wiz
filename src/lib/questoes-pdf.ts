/**
 * Extração de questões dos PDFs das provas SEM IA (zero créditos).
 * Roda no navegador, reaproveitando o parser local da análise de padrões.
 */
import type { Questao } from "./ai.functions";
import { extrairGabarito, separarQuestoes } from "./padroes-local";
import { grupoDaMateria, materiasAtivas, type EditalEstado } from "./edital";

export const NAO_CLASSIFICADA = "Não classificada";

const MAX_QUESTOES = 200;
const MAX_ENUNCIADO = 1500;
const MAX_ALTERNATIVA = 400;

export type ResultadoExtracao = {
  questoes: Questao[];
  /** PDF que contém apenas a lista de gabarito (sem enunciados). */
  soGabarito: boolean;
  /** Mapa numero → letra encontrado no arquivo. */
  gabarito: Record<number, string>;
  comGabarito: number;
  comComentario: number;
};

function limpar(t: string) {
  return t.replace(/\[\[p:\d+\]\]/g, " ").replace(/\s+/g, " ").trim();
}

/** Palavras significativas de um texto (para casar matéria/tópico). */
function termos(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3);
}

type Classificador = { materia: string; assunto?: string; termos: string[] }[];

/** Índice de palavras-chave das matérias e tópicos ativos do edital. */
export function classificadorDoEdital(edital: EditalEstado): Classificador {
  const indice: Classificador = [];
  for (const m of materiasAtivas(edital)) {
    indice.push({ materia: m.nome, termos: termos(m.nome) });
    for (const t of m.topicos) {
      const lista = termos(t);
      if (lista.length) indice.push({ materia: m.nome, assunto: t, termos: lista });
    }
  }
  return indice;
}

function classificar(indice: Classificador, texto: string) {
  const palavras = new Set(termos(texto));
  let melhor: { materia: string; assunto?: string; pontos: number } | null = null;
  for (const item of indice) {
    const pontos = item.termos.reduce((s, t) => s + (palavras.has(t) ? 1 : 0), 0);
    if (!pontos) continue;
    const peso = pontos / item.termos.length + (item.assunto ? 0.2 : 0);
    if (!melhor || peso > melhor.pontos) {
      melhor = { materia: item.materia, ...(item.assunto ? { assunto: item.assunto } : {}), pontos: peso };
    }
  }
  return melhor;
}

/** Comentários/justificativas que a própria prova traz depois das alternativas. */
function comentariosDaProva(texto: string) {
  const mapa: Record<number, string> = {};
  const re =
    /(?:QUEST[ÃA]O\s*)?(\d{1,3})\s*[-—.)]?\s*(?:COMENT[ÁA]RIO|JUSTIFICATIVA|RESOLU[ÇC][ÃA]O)S?\s*[:-]?\s*([\s\S]{20,1200}?)(?=(?:QUEST[ÃA]O\s*)?\d{1,3}\s*[-—.)]?\s*(?:COMENT[ÁA]RIO|JUSTIFICATIVA|RESOLU[ÇC][ÃA]O)|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const n = Number(m[1]);
    if (n > 0 && n < 400) mapa[n] = limpar(String(m[2])).slice(0, 1200);
  }
  return mapa;
}

/** Ano da prova: procura no nome do arquivo e depois no texto. */
export function anoDaProva(nomeArquivo: string, texto: string): number | undefined {
  const atual = new Date().getFullYear() + 1;
  const doNome = nomeArquivo.match(/(19|20)\d{2}/);
  if (doNome) {
    const n = Number(doNome[0]);
    if (n >= 1990 && n <= atual) return n;
  }
  const candidatos = texto.slice(0, 4000).match(/(19|20)\d{2}/g) ?? [];
  const validos = candidatos.map(Number).filter((n) => n >= 1990 && n <= atual);
  return validos.length ? Math.max(...validos) : undefined;
}

/** Título do cartão: matéria, assunto, banca e ano. */
export function tituloDaQuestao(q: {
  materia: string;
  assunto?: string;
  banca?: string;
  ano?: number;
}) {
  return [q.materia, q.assunto, q.banca, q.ano ? String(q.ano) : ""]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" · ");
}

/**
 * Converte o texto de um PDF de prova em questões prontas para a aba Questões.
 * Nenhuma chamada de IA é feita aqui.
 */
export function extrairQuestoesDePdf(
  nomeArquivo: string,
  textoIntegral: string,
  edital: EditalEstado,
  banca: string,
): ResultadoExtracao {
  const texto = limpar(textoIntegral);
  const gabarito = extrairGabarito(texto);
  // O texto bruto (com as marcas de página) permite limpar cabeçalhos/rodapés.
  const brutas = separarQuestoes(textoIntegral).slice(0, MAX_QUESTOES);
  const comentarios = comentariosDaProva(texto);
  const indice = classificadorDoEdital(edital);
  const ano = anoDaProva(nomeArquivo, texto);

  const soGabarito = brutas.length < 3 && Object.keys(gabarito).length >= 5;
  if (soGabarito) {
    return { questoes: [], soGabarito: true, gabarito, comGabarito: 0, comComentario: 0 };
  }

  let comGabarito = 0;
  let comComentario = 0;

  const questoes: Questao[] = brutas.map((q) => {
    const letra = gabarito[q.numero];
    const base = q.enunciado.slice(0, MAX_ENUNCIADO);
    const achado = classificar(indice, `${base} ${q.alternativas.map((a) => a.texto).join(" ")}`);
    const materia = achado?.materia ?? NAO_CLASSIFICADA;
    const comentario = comentarios[q.numero] ?? "";
    if (comentario) comComentario++;

    const alternativas = q.alternativas.length
      ? q.alternativas.map((a) => ({
          letra: a.letra,
          texto: a.texto.slice(0, MAX_ALTERNATIVA),
          correta: letra === a.letra,
          explicacao: "",
        }))
      : ["Certo", "Errado"].map((op) => ({
          letra: op,
          texto: op,
          correta: (letra === "C" && op === "Certo") || (letra === "E" && op === "Errado"),
          explicacao: "",
        }));

    if (alternativas.some((a) => a.correta)) comGabarito++;

    return {
      id: `pdf:${nomeArquivo}:${q.numero}`,
      banca,
      grupo:
        materia === NAO_CLASSIFICADA ? "Conhecimento Geral" : grupoDaMateria(edital, materia),
      materia,
      ...(achado?.assunto ? { assunto: achado.assunto } : {}),
      ...(ano ? { ano } : {}),
      titulo: tituloDaQuestao({
        materia,
        ...(achado?.assunto ? { assunto: achado.assunto } : {}),
        banca,
        ...(ano ? { ano } : {}),
      }),
      origem: `Prova: ${nomeArquivo}, questão ${q.numero}`,
      prova: nomeArquivo,
      numero: q.numero,
      enunciado: base,
      alternativas,
      explicacao: comentario,
    } satisfies Questao;
  });

  return { questoes, soGabarito: false, gabarito, comGabarito, comComentario };
}


/** Aplica um gabarito (de PDF separado ou manual) às questões de uma prova. */
export function aplicarGabarito(
  questoes: Questao[],
  gabarito: Record<number, string>,
  prova?: string,
): Questao[] {
  return questoes.map((q) => {
    if (prova && q.prova !== prova) return q;
    const letra = q.numero ? gabarito[q.numero] : undefined;
    if (!letra) return q;
    return {
      ...q,
      alternativas: q.alternativas.map((a) => ({
        ...a,
        correta:
          a.letra === letra ||
          (letra === "C" && a.letra === "Certo") ||
          (letra === "E" && a.letra === "Errado"),
      })),
    };
  });
}

export function temGabarito(q: Questao) {
  return q.alternativas.some((a) => a.correta);
}

/** Provas distintas presentes no banco extraído. */
export function provasExtraidas(questoes: Questao[]) {
  return Array.from(new Set(questoes.map((q) => q.prova).filter((p): p is string => Boolean(p))));
}

/** Questões da matéria escolhida (sem cair para "mostra tudo"). */
export function questoesDaMateria(questoes: Questao[], materia: string) {
  if (!materia) return [];
  const alvo = materia.toLowerCase();
  return questoes.filter((q) => q.materia.toLowerCase() === alvo);
}

/** Questões que o extrator não conseguiu classificar. */
export function questoesPendentes(questoes: Questao[]) {
  return questoes.filter((q) => !q.materia || q.materia === NAO_CLASSIFICADA);
}

/** Assuntos do edital com questões dentro da lista, com contagem. */
export function assuntosComQuestoes(questoes: Questao[]) {
  const mapa = new Map<string, number>();
  for (const q of questoes) {
    if (!q.assunto) continue;
    mapa.set(q.assunto, (mapa.get(q.assunto) ?? 0) + 1);
  }
  return Array.from(mapa, ([assunto, total]) => ({ assunto, total })).sort(
    (a, b) => b.total - a.total,
  );
}

/** Reclassifica manualmente uma questão para uma matéria/assunto do edital. */
export function reclassificar(
  q: Questao,
  edital: EditalEstado,
  materia: string,
  assunto?: string,
): Questao {
  const { assunto: _antigo, ...resto } = q;
  return {
    ...resto,
    materia,
    grupo: grupoDaMateria(edital, materia),
    ...(assunto ? { assunto } : {}),
    titulo: tituloDaQuestao({
      materia,
      ...(assunto ? { assunto } : {}),
      banca: q.banca,
      ...(q.ano ? { ano: q.ano } : {}),
    }),
  } as Questao;
}

