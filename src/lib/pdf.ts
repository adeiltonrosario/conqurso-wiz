/**
 * Leitura de PDFs no navegador. Só é usada em handlers de evento (nunca no SSR),
 * por isso o pdfjs é carregado dinamicamente.
 */

/** Trecho enviado à IA como contexto (o texto integral fica no IndexedDB). */
export const LIMITE_TRECHO_IA = 12000;

export type PdfLido = { texto: string; paginas: number };

/** Lê o PDF por completo, sem cortar páginas. */
export async function extrairTextoPdf(file: File): Promise<PdfLido> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const partes: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const conteudo = await page.getTextContent();
    const texto = conteudo.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (texto) partes.push(texto);
  }

  return { texto: partes.join("\n").trim(), paginas: doc.numPages };
}
