/**
 * Importador de legislação consolidada (sem IA).
 * 1) Remove do HTML todo trecho tachado (<strike>, <del>, <s>, line-through).
 * 2) Organiza o texto por dispositivo (artigo, §, inciso, alínea, item),
 *    descarta dispositivos revogados e redações repetidas, sem reescrever nada.
 */

export type RelatorioLei = {
  artigosIdentificados: number;
  artigosImportados: number;
  revogados: number;
  tachados: number;
  duplicacoes: number;
  duvidas: string[];
};

const TAGS_TACHADO = ["strike", "del", "s"];

/** Remove um elemento inteiro (com aninhamento) a partir da posição da tag de abertura. */
function fimDoElemento(html: string, inicio: number, tag: string) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = inicio;
  let nivel = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[0].endsWith("/>")) continue;
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return re.lastIndex;
  }
  return html.length;
}

/** Retira do HTML todo conteúdo tachado. Devolve o HTML limpo e quantos trechos saíram. */
export function removerTachados(html: string): { html: string; tachados: number } {
  let tachados = 0;
  let saida = html;
  const abertura =
    /<(strike|del|s)\b[^>]*>|<([a-z][a-z0-9]*)\b[^>]*style\s*=\s*["'][^"']*line-through[^"']*["'][^>]*>/i;
  for (let guarda = 0; guarda < 20000; guarda++) {
    const m = abertura.exec(saida);
    if (!m) break;
    const tag = (m[1] ?? m[2] ?? "").toLowerCase();
    const fim = fimDoElemento(saida, m.index, tag);
    const trecho = saida.slice(m.index, fim);
    if (/[A-Za-zÀ-ú0-9]/.test(trecho.replace(/<[^>]+>/g, ""))) tachados++;
    // Mantém a quebra de bloco para não colar dispositivos vizinhos.
    const bloco = /^(p|div|li|tr|td|table)$/.test(tag) || TAGS_TACHADO.includes(tag) ? "\n" : " ";
    saida = saida.slice(0, m.index) + bloco + saida.slice(fim);
  }
  return { html: saida, tachados };
}

type Tipo = "estrutura" | "artigo" | "paragrafo" | "inciso" | "alinea" | "item" | "texto";

const RE_ARTIGO = /^Art\.?\s*(\d+(?:\.\d+)*)\s*[º°o]?\s*(-\s*[A-Z]+)?(?![A-Za-z0-9])/i;
const RE_PARAGRAFO = /^(§\s*(\d+)\s*[º°o]?(-\s*[A-Z]+)?|Par[áa]grafo\s+[úu]nico)/i;
const RE_INCISO = /^([IVXLC]+)(-[A-Z])?\s*[-–—]\s*/;
const RE_ALINEA = /^([a-z])(-[A-Z])?\s*\)\s*/;
const RE_ITEM = /^(\d+)\s*[.)]\s*(?=[A-Za-zÀ-ú])/;
const RE_ESTRUTURA = /^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O|LIVRO|PARTE)\b/i;

function classificar(linha: string): { tipo: Tipo; id: string; rotulo: string } {
  let m = RE_ARTIGO.exec(linha);
  if (m) return { tipo: "artigo", id: (m[1]!.replace(/\./g, "") + (m[2] ?? "").replace(/\s/g, "")).toUpperCase(), rotulo: m[0] };
  m = RE_PARAGRAFO.exec(linha);
  if (m) return { tipo: "paragrafo", id: m[2] ? m[2] + (m[3] ?? "").replace(/\s/g, "") : "unico", rotulo: m[0] };
  m = RE_INCISO.exec(linha);
  if (m) return { tipo: "inciso", id: m[1]! + (m[2] ?? ""), rotulo: m[0] };
  m = RE_ALINEA.exec(linha);
  if (m) return { tipo: "alinea", id: m[1]! + (m[2] ?? ""), rotulo: m[0] };
  m = RE_ITEM.exec(linha);
  if (m) return { tipo: "item", id: m[1]!, rotulo: m[0] };
  if (RE_ESTRUTURA.test(linha)) return { tipo: "estrutura", id: "", rotulo: "" };
  return { tipo: "texto", id: "", rotulo: "" };
}

/** Dispositivo cujo conteúdo é só a nota de revogação: "II - (Revogado pela Lei ...)". */
export function ehRevogado(linha: string, rotulo: string) {
  if (!/revogad/i.test(linha)) return false;
  const corpo = linha
    .slice(rotulo.length)
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s.;:–—ºª°-]/g, "");
  return corpo === "" || /^revogad[oa]s?$/i.test(corpo);
}

const NIVEL: Record<string, number> = { artigo: 1, paragrafo: 2, inciso: 3, alinea: 4, item: 5 };

/** Consolida o texto já sem tachados. Nunca altera a redação de uma linha. */
export function consolidarTexto(texto: string, tachados = 0): { texto: string; relatorio: RelatorioLei } {
  const linhas = texto.split("\n").map((l) => l.trim());
  const saida: (string | null)[] = [];
  const posicao = new Map<string, number>();
  const artigosVistos = new Set<string>();
  const artigosVigentes = new Set<string>();
  const duvidas: string[] = [];
  let revogados = 0;
  let duplicacoes = 0;
  // caminho atual: [artigo, paragrafo, inciso, alinea, item]
  const caminho: string[] = ["", "", "", "", "", ""];
  let pularAte = 0; // nível revogado cujos filhos devem ser descartados
  let algumArtigo = false;

  for (const linha of linhas) {
    if (!linha) {
      if (saida[saida.length - 1] !== "") saida.push("");
      continue;
    }
    const c = classificar(linha);
    if (c.tipo === "estrutura") {
      pularAte = 0;
      saida.push(linha);
      continue;
    }
    if (c.tipo === "texto") {
      if (pularAte) continue;
      saida.push(linha);
      continue;
    }
    // Incisos/alíneas antes do primeiro artigo são ementa/preâmbulo.
    if (!algumArtigo && c.tipo !== "artigo") {
      saida.push(linha);
      continue;
    }
    const nivel = NIVEL[c.tipo]!;
    if (pularAte && nivel > pularAte) continue;
    pularAte = 0;
    caminho[nivel] = c.id;
    for (let i = nivel + 1; i < caminho.length; i++) caminho[i] = "";
    if (c.tipo === "artigo") {
      algumArtigo = true;
      artigosVistos.add(c.id);
    }
    const chave = caminho.slice(1, nivel + 1).join("|");

    if (ehRevogado(linha, c.rotulo)) {
      revogados++;
      pularAte = nivel;
      const anterior = posicao.get(chave);
      if (anterior !== undefined) saida[anterior] = null;
      posicao.delete(chave);
      continue;
    }

    const anterior = posicao.get(chave);
    if (anterior !== undefined) {
      duplicacoes++;
      // A última redação na página é a vigente: ocupa o lugar da antiga.
      if (saida[anterior] !== linha) saida[anterior] = linha;
      continue;
    }
    posicao.set(chave, saida.length);
    saida.push(linha);
    if (c.tipo === "artigo") artigosVigentes.add(c.id);
  }

  if (!algumArtigo) duvidas.push("Nenhum artigo foi identificado na página.");
  const final = saida
    .filter((l): l is string => l !== null)
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n")
    .trim();

  return {
    texto: final,
    relatorio: {
      artigosIdentificados: artigosVistos.size,
      artigosImportados: artigosVigentes.size,
      revogados,
      tachados,
      duplicacoes,
      duvidas,
    },
  };
}
