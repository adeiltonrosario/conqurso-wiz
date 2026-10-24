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
  // CMaps e fontes padrão: sem eles, letras acentuadas e "ç" viram caractere de erro.
  const base = `https://unpkg.com/pdfjs-dist@${pdfjs.version}`;
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: `${base}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}/standard_fonts/`,
  }).promise;

  const partes: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const conteudo = await page.getTextContent();
    const texto = conteudo.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();
    // A marca de página permite ir direto ao ponto de corte do mapa do Vade Mecum.
    if (texto) partes.push(`[[p:${i}]] ${texto}`);
  }

  return { texto: partes.join("\n").trim(), paginas: doc.numPages };

}
