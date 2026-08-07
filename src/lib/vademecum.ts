/**
 * Parser local (sem IA) do texto extraído de um PDF de Vade Mecum.
 * Quebra o texto em leis → título → capítulo → seção → artigos, preservando a redação literal.
 */
import type { ArtigoIntegral } from "./ai.functions";

export type LeiDoPdf = {
  nome: string;
  artigos: ArtigoIntegral[];
};

const RE_MARCADOR = new RegExp(
  [
    // lei / código / constituição
    "(?<lei>CONSTITUI[ÇC][ÃA]O\\s+(?:DA\\s+REP[ÚU]BLICA[^.]{0,60}|FEDERAL)|C[ÓO]DIGO\\s+(?:PENAL|DE\\s+PROCESSO\\s+PENAL|CIVIL|DE\\s+PROCESSO\\s+CIVIL|DE\\s+TR[ÂA]NSITO\\s+BRASILEIRO|TRIBUT[ÁA]RIO\\s+NACIONAL|ELEITORAL)|(?:DECRETO[-\\s]LEI|LEI\\s+COMPLEMENTAR|LEI)\\s+N?[º°o]?\\s*[\\d][\\d.]*(?:\\s*\\/\\s*\\d{2,4})?)",
    // hierarquia
    "(?<titulo>T[ÍI]TULO\\s+(?:[IVXLCDM]+|[ÚU]NICO)\\b[^§]{0,120}?(?=\\s+(?:CAP[ÍI]TULO|Se[çc][ãa]o|Art)|$))",
    "(?<capitulo>CAP[ÍI]TULO\\s+(?:[IVXLCDM]+|[ÚU]NICO)\\b[^§]{0,120}?(?=\\s+(?:Se[çc][ãa]o|Art|T[ÍI]TULO)|$))",
    "(?<secao>Se[çc][ãa]o\\s+(?:[IVXLCDM]+|[ÚU]NICA)\\b[^§]{0,100}?(?=\\s+(?:Art|CAP[ÍI]TULO|T[ÍI]TULO)|$))",
    // artigo
    "(?<artigo>Art(?:igo)?\\.?\\s*\\d+[º°]?(?:-[A-Z])?)",
  ].join("|"),
  "gu",
);

const RE_DIVISOR = /(?=§\s*\d+[º°]?|Parágrafo\s+único|(?:^|\s)[IVXLCDM]{1,5}\s*[-–—]\s|(?:^|\s)[a-z]\)\s)/gu;

/** Marca inserida na extração do PDF para localizar a página de cada trecho. */
const RE_PAGINA = /\[\[p:(\d+)\]\]/g;

/** Recorta o texto do PDF entre duas páginas (usa o mapa edital → Vade Mecum). */
export function fatiarPorPaginas(texto: string, de: number, ate: number): string {
  let inicio = -1;
  let fim = texto.length;
  RE_PAGINA.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_PAGINA.exec(texto))) {
    const pagina = Number(m[1]);
    if (inicio < 0 && pagina >= de) inicio = m.index;
    if (pagina > ate) {
      fim = m.index;
      break;
    }
  }
  if (inicio < 0) return "";
  return texto.slice(inicio, fim);
}

/** Remove as marcas de página antes de exibir/parsear o texto legal. */
export function semMarcasDePagina(texto: string) {
  return texto.replace(/\[\[p:\d+\]\]/g, " ");
}

function limpar(s: string) {
  return s.replace(/\s+/g, " ").trim();
}


/** Separa o caput dos parágrafos, incisos e alíneas, mantendo a numeração original. */
function partirCorpo(corpo: string) {
  const partes = corpo
    .split(RE_DIVISOR)
    .map(limpar)
    .filter((p) => p.length > 0);
  const [caput = "", ...resto] = partes;
  return { texto: caput, paragrafos: resto };
}

export function lerVadeMecum(textoBruto: string): LeiDoPdf[] {
  const texto = textoBruto.replace(/\r/g, "");
  const leis: LeiDoPdf[] = [];

  let leiAtual = "";
  let titulo = "";
  let capitulo = "";
  let secao = "";

  type Bruto = { referencia: string; inicio: number; lei: string; titulo: string; capitulo: string; secao: string };
  const brutos: Bruto[] = [];
  const cortes: number[] = [];

  RE_MARCADOR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_MARCADOR.exec(texto))) {
    const g = m.groups ?? {};
    if (g["lei"]) {
      leiAtual = limpar(g["lei"]);
      titulo = "";
      capitulo = "";
      secao = "";
    } else if (g["titulo"]) {
      titulo = limpar(g["titulo"]);
      capitulo = "";
      secao = "";
    } else if (g["capitulo"]) {
      capitulo = limpar(g["capitulo"]);
      secao = "";
    } else if (g["secao"]) {
      secao = limpar(g["secao"]);
    } else if (g["artigo"]) {
      brutos.push({
        referencia: limpar(g["artigo"]).replace(/^Artigo/i, "Art.").replace(/^Art\s/i, "Art. "),
        inicio: m.index,
        lei: leiAtual || "Legislação anexada",
        titulo,
        capitulo,
        secao,
      });
    }
    cortes.push(m.index);
  }

  let proximoCorte = 0;
  const mapa = new Map<string, LeiDoPdf>();
  for (const b of brutos) {
    // O corpo do artigo vai até o próximo marcador (artigo, seção, capítulo, título ou lei).
    while (proximoCorte < cortes.length && cortes[proximoCorte]! <= b.inicio) proximoCorte++;
    const fim = cortes[proximoCorte] ?? texto.length;
    const bruto = texto.slice(b.inicio + b.referencia.length, fim);
    const corpo = bruto.replace(/^\s*[.\-–—º°]*\s*/u, "");
    if (limpar(corpo).length < 3) continue;

    const { texto: caput, paragrafos } = partirCorpo(corpo);
    let lei = mapa.get(b.lei);
    if (!lei) {
      lei = { nome: b.lei, artigos: [] };
      mapa.set(b.lei, lei);
      leis.push(lei);
    }
    lei.artigos.push({
      referencia: b.referencia,
      texto: caput,
      paragrafos,
      titulo: b.titulo,
      capitulo_lei: b.capitulo,
      secao: b.secao,
    });
  }


  return leis.filter((l) => l.artigos.length > 0);
}

/** Número do artigo (para filtro por faixa, ex.: 312-327). */
export function numeroArtigo(a: ArtigoIntegral) {
  const n = /(\d+)/.exec(a.referencia);
  return n ? Number(n[1]) : NaN;
}

/** Faixa digitada pelo candidato: "312-327" ou "312". */
export function lerFaixa(valor: string): [number, number] | null {
  const m = /^\s*(\d+)\s*(?:[-–a]\s*(\d+))?\s*$/i.exec(valor);
  if (!m) return null;
  const de = Number(m[1]);
  const ate = m[2] ? Number(m[2]) : de;
  return [Math.min(de, ate), Math.max(de, ate)];
}

/** Filtra os artigos pelo capítulo do edital, comparando com a hierarquia da lei. */
export function artigosDoCapitulo(artigos: ArtigoIntegral[], capitulo: string) {
  const termos = capitulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  if (!termos.length) return artigos;

  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const encontrados = artigos.filter((a) => {
    const alvo = norm(`${a.titulo ?? ""} ${a.capitulo_lei ?? ""} ${a.secao ?? ""}`);
    return termos.every((t) => alvo.includes(t));
  });
  return encontrados.length ? encontrados : artigos;
}
