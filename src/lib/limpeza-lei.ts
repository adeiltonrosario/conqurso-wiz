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

/** Remove o lixo de rodapé/cabeçalho que sobra no texto extraído do PDF. */
export function limparRuidoLei(texto: string) {
  let saida = texto ?? "";
  for (const re of RUIDO) saida = saida.replace(re, " ");
  return saida
    // número de página solto entre espaços
    .replace(/\s+\d{1,4}\s+(?=[A-ZÁÉÍÓÚ§])/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}
