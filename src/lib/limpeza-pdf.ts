import type { Acervo } from "./acervo";

/**
 * Limpeza seletiva das questões extraídas dos PDFs das provas.
 *
 * O acervo guarda as extraídas em `acervo.extraidas` e a nuvem na tabela
 * `questoes_extraidas`. Nem tudo ali veio de PDF: a busca na Quest API e a
 * importação por link também salvam nesse mesmo lugar, com ids `quest:`.
 * A limpeza remove SÓ o lote do PDF (ids `pdf:<arquivo>:<numero>`, ver
 * `extrairQuestoesDePdf` em questoes-pdf.ts) — cadastradas à mão, Quest API,
 * simulado, leis e o resto do acervo ficam intactos, assim como o Caderno
 * Muse (que vive no código, não no acervo).
 *
 * A ordem importa: a tabela na nuvem sai primeiro, para a sincronização
 * (que espelha a nuvem no aparelho ao abrir o app) não trazer as questões
 * de volta. Não confundir com `limpeza-acervo.ts`, que é a limpeza TOTAL
 * (questões + leis) e não é usada aqui.
 */

/** Prefixo dos ids das questões extraídas de PDF. */
export const PREFIXO_PDF = "pdf:";

export function ehExtraidaDoPdf(q: { id: string }) {
  return q.id.startsWith(PREFIXO_PDF);
}

/** Quantas questões extraídas de PDF há no acervo. */
export function contarExtraidasDoPdf(acervo: Acervo) {
  return acervo.extraidas.filter(ehExtraidaDoPdf).length;
}

/** Acervo sem as questões extraídas de PDF; todo o resto idêntico. */
export function acervoSemExtraidasDoPdf(acervo: Acervo): Acervo {
  return { ...acervo, extraidas: acervo.extraidas.filter((q) => !ehExtraidaDoPdf(q)) };
}

export type ResultadoLimpezaPdf = {
  /** Linhas apagadas da tabela `questoes_extraidas` na nuvem. */
  removidasNuvem: number;
  /** Questões apagadas do acervo no aparelho. */
  removidasLocal: number;
};

export type DependenciasLimpezaPdf = {
  ler: () => Acervo;
  salvarLocal: (acervo: Acervo) => void;
  salvarNuvem: (acervo: Acervo) => Promise<void>;
  removerDaNuvem: () => Promise<{ removidas: number }>;
};

/**
 * Apaga as extraídas de PDF nos três lugares: tabela na nuvem, acervo
 * sincronizado (`estado_estudo`, chave `acervo`) e cópia local
 * (`concurseiro:acervo`). O `removerDaNuvem` é chamado uma única vez.
 */
export async function limparExtraidasDoPdf(
  deps: DependenciasLimpezaPdf,
): Promise<ResultadoLimpezaPdf> {
  const atual = deps.ler();
  const removidasLocal = contarExtraidasDoPdf(atual);
  const { removidas } = await deps.removerDaNuvem();
  const limpo = acervoSemExtraidasDoPdf(atual);
  await deps.salvarNuvem(limpo);
  deps.salvarLocal(limpo);
  return { removidasNuvem: removidas, removidasLocal };
}
