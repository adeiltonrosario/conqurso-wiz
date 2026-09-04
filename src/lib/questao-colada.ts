/**
 * Separa um texto colado (enunciado + alternativas + gabarito) nos campos
 * do formulário de nova questão. Local, sem IA.
 */

export type QuestaoColada = {
  enunciado: string;
  /** Alternativas na ordem A..E (até 5 posições). */
  alternativas: string[];
  formato: "multipla" | "certo-errado";
  /** Letra ("A".."E") ou "Certo"/"Errado" quando o gabarito veio no texto. */
  correta?: string;
  /** Quantas alternativas foram reconhecidas antes do corte em 5. */
  reconhecidas: number;
  descartadas: number;
};

const LETRAS = ["A", "B", "C", "D", "E"];

function limpar(t: string) {
  return t
    .replace(/\[\[p:\d+\]\]/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Remove número de questão do começo ("15.", "QUESTÃO 3 -"). */
function semNumero(t: string) {
  return t.replace(/^\s*(?:quest[ãa]o\s*)?\d{1,3}\s*[).\-–—:]?\s*/i, "");
}

/** Extrai e remove a linha de gabarito, retornando a letra/valor. */
function extrairGabarito(texto: string): { texto: string; correta?: string } {
  const re =
    /(?:^|\n|\s)(?:gabarito|resposta\s*correta|resposta)\s*[:\-–—]?\s*(?:letra\s*)?\(?(certo|errado|[a-eA-E])\b\)?\s*\.?/i;
  const m = texto.match(re);
  if (!m) return { texto };
  const bruto = String(m[1]).toLowerCase();
  const correta =
    bruto === "certo" ? "Certo" : bruto === "errado" ? "Errado" : bruto.toUpperCase();
  return { texto: texto.replace(re, " "), correta };
}

type Marca = { letra: string; inicio: number; fim: number };

/** Posições dos rótulos de alternativa, em ordem alfabética crescente. */
function marcasDeAlternativa(texto: string): Marca[] {
  const marcas: Marca[] = [];
  const re = /(?:^|[\s\n>])(?:altern[ai]tiva\s*)?\(?([a-eA-E])\)|(?:^|[\s\n])(?:altern[ai]tiva\s*)?([a-eA-E])\s*[).\-–—:]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const letra = String(m[1] ?? m[2]).toUpperCase();
    const rotulo = m[0];
    const inicio = m.index + rotulo.search(/\S/);
    marcas.push({ letra, inicio, fim: m.index + rotulo.length });
  }
  // Mantém só a sequência A, B, C… (evita casar "a)" dentro do enunciado).
  const sequencia: Marca[] = [];
  for (const marca of marcas) {
    const esperada = LETRAS[sequencia.length];
    if (marca.letra === esperada) sequencia.push(marca);
  }
  return sequencia;
}

function ehCertoErrado(texto: string) {
  const t = texto.toLowerCase();
  return /\bcerto\b/.test(t) && /\berrado\b/.test(t);
}

/**
 * Divide o texto colado. Retorna null quando não reconhece alternativas
 * suficientes (o formulário então mantém o texto como estava).
 */
export function separarQuestaoColada(bruto: string): QuestaoColada | null {
  if (!bruto || bruto.trim().length < 15) return null;

  const semGab = extrairGabarito(bruto);
  const texto = semGab.texto;
  const marcas = marcasDeAlternativa(texto);

  if (marcas.length < 2) {
    // Sem A/B…, mas pode ser Certo/Errado.
    if (ehCertoErrado(texto)) {
      const corpo = limpar(
        semNumero(texto.replace(/\b(certo|errado)\b/gi, " ")),
      );
      if (corpo.length < 10) return null;
      const correta =
        semGab.correta === "Certo" || semGab.correta === "Errado" ? semGab.correta : undefined;
      return {
        enunciado: corpo,
        alternativas: ["Certo", "Errado"],
        formato: "certo-errado",
        ...(correta ? { correta } : {}),
        reconhecidas: 2,
        descartadas: 0,
      };
    }
    return null;
  }

  const enunciado = limpar(semNumero(texto.slice(0, marcas[0]!.inicio)));
  if (enunciado.length < 10) return null;

  const partes: string[] = [];
  marcas.forEach((marca, i) => {
    const fimTrecho = i + 1 < marcas.length ? marcas[i + 1]!.inicio : texto.length;
    partes.push(limpar(texto.slice(marca.fim, fimTrecho)).replace(/^[).\-–—:]\s*/, ""));
  });

  const validas = partes.filter((p) => p.length > 0);
  if (validas.length < 2) return null;

  const alternativas = LETRAS.map((_, i) => (validas[i] ?? "").slice(0, 500));
  const correta =
    semGab.correta && LETRAS.includes(semGab.correta) ? semGab.correta : undefined;

  return {
    enunciado: enunciado.slice(0, 4000),
    alternativas,
    formato: "multipla",
    ...(correta ? { correta } : {}),
    reconhecidas: validas.length,
    descartadas: Math.max(0, validas.length - 5),
  };
}
