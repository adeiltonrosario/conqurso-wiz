/**
 * Limpeza local (sem IA) do texto legal vindo do PDF: dispositivos revogados/vetados
 * e restos de cabeçalho/rodapé do Vade Mecum.
 */

const RE_REVOGADO = /\(\s*(revogad[oa]s?|vetad[oa]s?|suprimid[oa]s?)\b/i;

/** Dispositivo marcado como revogado, vetado ou suprimido (texto tachado no PDF). */
export function ehRevogado(texto: string) {
  const t = (texto ?? "").trim();
  if (!t) return false;
  if (RE_REVOGADO.test(t)) return true;
  // "Art. 5º Revogado." sem parênteses, quando é praticamente o texto todo.
  return /^(revogad[oa]s?|vetad[oa]s?)\b/i.test(t) && t.length < 80;
}

const RUIDO: RegExp[] = [
  /\[\[p:\d+\]\]/g,
  /https?:\/\/\S+/gi,
  /www\.\S+/gi,
  /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
  /\bvade\s*mecum\b/gi,
  /\beditora\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÁ-ú]*/g,
  /\bsaraiva\b|\bjuspodivm\b|\brideel\b|\bforense\b|\bmanole\b/gi,
  /\bimpresso\s+no\s+brasil\b/gi,
  /\bISBN[\s:]*[\d-]+/gi,
  /\bp[áa]g(?:ina)?\.?\s*\d+\b/gi,
  // frase de licença do e-book ("O conteúdo deste livro eletrônico é licenciado para ... civil e criminal")
  /o\s+conte[úu]do\s+deste\s+livro\s+eletr[ôo]nico[\s\S]{0,400}?responsabiliza[çc][ãa]o\s+civil\s+e\s+criminal\.?/gi,
  // sites soltos no meio do texto (ex.: gran.com.br)
  /\b[\w-]+\.(?:com\.br|com|net|org)\b/gi,
  // "Última Atualização: agosto/2026"
  /[úu]ltima\s+atualiza[çc][ãa]o\s*:?\s*[\wç]+\s*\/\s*\d{4}/gi,
  // "LEI N. 13.869, DE ... DE" incompleta no rodapé é mantida (faz parte do texto legal)
];

/** Pares de mojibake (texto latin-1 lido como UTF-8) que aparecem nas leis oficiais. */
const MOJIBAKE: [RegExp, string][] = [
  [/Ã¡/g, "á"], [/Ã /g, "à"], [/Ã¢/g, "â"], [/Ã£/g, "ã"], [/Ã¤/g, "ä"],
  [/Ã©/g, "é"], [/Ã¨/g, "è"], [/Ãª/g, "ê"],
  [/Ã­/g, "í"], [/Ã¬/g, "ì"], [/Ã®/g, "î"],
  [/Ã³/g, "ó"], [/Ã²/g, "ò"], [/Ã´/g, "ô"], [/Ãµ/g, "õ"], [/Ã¶/g, "ö"],
  [/Ãº/g, "ú"], [/Ã¹/g, "ù"], [/Ã»/g, "û"], [/Ã¼/g, "ü"],
  [/Ã§/g, "ç"], [/Ã±/g, "ñ"],
  [/Ã\u0081/g, "Á"], [/Ã€/g, "À"], [/Ã‚/g, "Â"], [/Ãƒ/g, "Ã"],
  [/Ã‰/g, "É"], [/ÃŠ/g, "Ê"], [/Ã\u008d/g, "Í"],
  [/Ã“/g, "Ó"], [/Ã”/g, "Ô"], [/Ã•/g, "Õ"],
  [/Ãš/g, "Ú"], [/Ã‡/g, "Ç"],
  [/Âº/g, "º"], [/Âª/g, "ª"], [/Â§/g, "§"], [/Â°/g, "°"], [/Â/g, ""],
  [/â€“/g, "–"], [/â€”/g, "—"], [/â€œ/g, '"'], [/â€\u009d/g, '"'],
  [/â€™/g, "'"], [/â€˜/g, "'"], [/â€¦/g, "…"],
];

/**
 * Repara acentos danificados por leitura em codificação errada e remove os
 * caracteres de erro (U+FFFD) que apareciam como "?" na leitura das leis.
 */
export function corrigirCodificacao(texto: string) {
  let saida = texto ?? "";
  if (!saida) return saida;
  if (/Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â€/.test(saida)) {
    for (const [re, sub] of MOJIBAKE) saida = saida.replace(re, sub);
  }
  // caractere de erro solto no meio de uma palavra: melhor remover que exibir "?"
  return saida.replace(/\uFFFD/g, "");
}

/** Remove o lixo de rodapé/cabeçalho que sobra no texto extraído do PDF. */
export function limparRuidoLei(texto: string) {
  let saida = corrigirCodificacao(texto ?? "");
  for (const re of RUIDO) saida = saida.replace(re, " ");
  return saida
    // número de página solto entre espaços
    .replace(/\s+\d{1,4}\s+(?=[A-ZÁÉÍÓÚ§(]|$)/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}
