/**
 * Leitura de arquivos de referência (PDF, Word, imagens) no navegador.
 * Tudo roda em handlers de evento — nunca no SSR — por isso os imports são dinâmicos.
 */
import { extrairTextoPdf } from "./pdf";

export type TipoArquivo = "pdf" | "word" | "imagem" | "texto" | "desconhecido";

export type ArquivoRef = {
  nome: string;
  tipo: TipoArquivo;
  /** Texto extraído (vazio quando só há imagem). */
  texto: string;
  chars: number;
  /** Data URL da imagem enviada à IA no modo visual. */
  imagem?: string;
  status: "texto" | "imagem" | "erro";
  aviso?: string;
};

export function tipoDoArquivo(file: File): TipoArquivo {
  const nome = file.name.toLowerCase();
  if (file.type === "application/pdf" || nome.endsWith(".pdf")) return "pdf";
  if (nome.endsWith(".docx") || nome.endsWith(".doc")) return "word";
  if (file.type.startsWith("image/")) return "imagem";
  if (file.type.startsWith("text/") || nome.endsWith(".txt")) return "texto";
  return "desconhecido";
}

function lerComoDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

/** Renderiza a primeira página do PDF como imagem (para PDFs escaneados). */
async function pdfComoImagem(file: File): Promise<string | undefined> {
  try {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.75);
  } catch {
    return undefined;
  }
}

async function textoDoWord(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value.replace(/\u00a0/g, " ").trim();
}

/** Reduz a imagem para não estourar o limite de payload da IA. */
async function comprimirImagem(file: File, maxLado = 1600): Promise<string> {
  const dataUrl = await lerComoDataUrl(file);
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    if (escala >= 1 && dataUrl.length < 1_200_000) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  } catch {
    return dataUrl;
  }
}

export async function lerArquivoRef(file: File): Promise<ArquivoRef> {
  const tipo = tipoDoArquivo(file);
  const base = { nome: file.name, tipo, texto: "", chars: 0 };

  try {
    if (tipo === "pdf") {
      const { texto } = await extrairTextoPdf(file);
      const limpo = texto.replace(/\[\[p:\d+\]\]/g, " ").replace(/\s+/g, " ").trim();
      if (limpo.length > 200) {
        return { ...base, texto: limpo, chars: limpo.length, status: "texto" };
      }
      const imagem = await pdfComoImagem(file);
      return imagem
        ? {
            ...base,
            imagem,
            status: "imagem",
            aviso: "PDF sem texto (escaneado) — a IA vai ler a 1ª página como imagem.",
          }
        : { ...base, status: "erro", aviso: "Não foi possível ler este PDF. Cole o texto manualmente." };
    }

    if (tipo === "word") {
      const texto = await textoDoWord(file);
      return texto
        ? { ...base, texto, chars: texto.length, status: "texto" }
        : { ...base, status: "erro", aviso: "Documento Word sem texto legível." };
    }

    if (tipo === "imagem") {
      const imagem = await comprimirImagem(file);
      return { ...base, imagem, status: "imagem" };
    }

    if (tipo === "texto") {
      const texto = (await file.text()).trim();
      return { ...base, texto, chars: texto.length, status: "texto" };
    }

    return { ...base, status: "erro", aviso: "Formato não suportado (use PDF, Word, imagem ou texto)." };
  } catch {
    return { ...base, status: "erro", aviso: "Falha ao ler o arquivo." };
  }
}

/** Junta o texto colado com o texto dos arquivos, em um único contexto. */
export function consolidarConteudo(colado: string, arquivos: ArquivoRef[]) {
  const blocos = arquivos
    .filter((a) => a.texto)
    .map((a) => `--- ${a.nome} ---\n${a.texto.slice(0, 20000)}`);
  return [colado.trim(), ...blocos].filter(Boolean).join("\n\n");
}

export function imagensDe(arquivos: ArquivoRef[]) {
  return arquivos.map((a) => a.imagem).filter((i): i is string => Boolean(i)).slice(0, 4);
}
