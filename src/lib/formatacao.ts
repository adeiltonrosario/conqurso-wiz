export type Marca = "negrito" | "azul" | "vermelho" | "amarelo";

export const MARCAS: Marca[] = ["negrito", "azul", "vermelho", "amarelo"];

const ABRE = (m: Marca) => `{{${m}|`;
const FECHA = "}}";

const REGEX_MARCA = /\{\{(negrito|azul|vermelho|amarelo)\|([^{}]*)\}\}/g;

/** Remove todas as marcas de um trecho, deixando só o texto. */
export function limparMarcas(texto: string): string {
  let anterior = texto;
  for (let i = 0; i < 5; i++) {
    const proximo = anterior.replace(REGEX_MARCA, "$2");
    if (proximo === anterior) break;
    anterior = proximo;
  }
  return anterior;
}

/** Verifica se o trecho inteiro já está envolvido pela marca informada. */
export function temMarca(texto: string, marca: Marca): boolean {
  const t = texto.trim();
  return t.startsWith(ABRE(marca)) && t.endsWith(FECHA);
}

type Resultado = { texto: string; inicio: number; fim: number };

/**
 * Aplica (ou remove, se já aplicada) a marca ao trecho selecionado.
 * Retorna o novo texto e a nova seleção para reposicionar o cursor.
 */
export function alternarMarca(
  texto: string,
  inicio: number,
  fim: number,
  marca: Marca,
): Resultado {
  if (fim <= inicio) return { texto, inicio, fim };

  const antes = texto.slice(0, inicio);
  const trecho = texto.slice(inicio, fim);
  const depois = texto.slice(fim);

  // Espaços da borda ficam fora da marca.
  const esquerda = trecho.match(/^\s*/)?.[0] ?? "";
  const direita = trecho.match(/\s*$/)?.[0] ?? "";
  const nucleo = trecho.slice(esquerda.length, trecho.length - direita.length);
  if (!nucleo) return { texto, inicio, fim };

  const novoNucleo = temMarca(nucleo, marca)
    ? nucleo.slice(ABRE(marca).length, -FECHA.length)
    : `${ABRE(marca)}${nucleo}${FECHA}`;

  const novoTrecho = `${esquerda}${novoNucleo}${direita}`;
  return {
    texto: `${antes}${novoTrecho}${depois}`,
    inicio,
    fim: inicio + novoTrecho.length,
  };
}

/** Remove a formatação do trecho selecionado. */
export function limparTrecho(texto: string, inicio: number, fim: number): Resultado {
  if (fim <= inicio) return { texto, inicio, fim };
  const limpo = limparMarcas(texto.slice(inicio, fim));
  return {
    texto: `${texto.slice(0, inicio)}${limpo}${texto.slice(fim)}`,
    inicio,
    fim: inicio + limpo.length,
  };
}
