/**
 * Leitura de PDFs no navegador. Só é usada em handlers de evento (nunca no SSR),
 * por isso o pdfjs é carregado dinamicamente.
 */
export const LIMITE_TEXTO_ARQUIVO = 60000;

export async function extrairTextoPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const partes: string[] = [];
  let total = 0;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const conteudo = await page.getTextContent();
    const texto = conteudo.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (texto) {
      partes.push(texto);
      total += texto.length;
    }
    if (total > LIMITE_TEXTO_ARQUIVO) break;
  }

  return partes.join("\n").slice(0, LIMITE_TEXTO_ARQUIVO).trim();
}
