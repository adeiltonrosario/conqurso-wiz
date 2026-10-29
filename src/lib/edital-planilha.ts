/**
 * Leitura de edital verticalizado em planilha (.xlsx): cada aba é um cargo,
 * as linhas "BLOCO I · …" separam os blocos e as linhas numeradas são tópicos.
 * Tudo local, sem IA.
 */
import type { GrupoEdital } from "./edital";

export type MateriaPlanilha = { nome: string; grupo: GrupoEdital; bloco: string; topicos: string[] };
export type CargoPlanilha = { cargo: string; banca: string; materias: MateriaPlanilha[] };

const BANCAS_CONHECIDAS = [
  "VUNESP", "FCC", "FGV", "CEBRASPE", "CESPE", "IBFC", "AOCP", "IDECAN", "QUADRIX",
  "CESGRANRIO", "CONSULPLAN", "IADES", "FUNDATEC", "IBADE", "OBJETIVA", "FEPESE",
];

/** "Fundação Vunesp" → "VUNESP"; nomes desconhecidos ficam em maiúsculas. */
export function normalizarBanca(texto: string) {
  const t = texto.trim();
  const sem = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const achada = BANCAS_CONHECIDAS.find((b) => new RegExp(`\\b${b}\\b`).test(sem));
  if (achada === "AOCP") return "INSTITUTO AOCP";
  return achada ?? t.toUpperCase();
}

const limpar = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const semQuestoes = (s: string) => s.replace(/\s*·?\s*\d+\s*quest(õ|o)es\s*$/i, "").replace(/:$/, "").trim();
const ehMaiuscula = (s: string) => /[A-ZÀ-Ú]/.test(s) && s === s.toUpperCase();

/** Lê uma aba (linhas × colunas). `nomeAba` vira o cargo. */
export function lerAbaEdital(nomeAba: string, linhas: unknown[][], bancaPadrao = ""): CargoPlanilha {
  let banca = "";
  let cargo = nomeAba.trim().toUpperCase();
  const materias: MateriaPlanilha[] = [];
  let bloco = "";
  let grupo: GrupoEdital = "Conhecimento Geral";
  let atual: MateriaPlanilha | null = null;

  const nova = (nome: string) => {
    const n = semQuestoes(nome).toUpperCase();
    if (!n) return;
    atual = materias.find((m) => m.nome === n && m.bloco === bloco) ?? null;
    if (!atual) {
      atual = { nome: n, grupo, bloco, topicos: [] };
      materias.push(atual);
    }
  };

  for (const linha of linhas) {
    const a = limpar(linha[0]);
    const b = limpar(linha[1]);
    if (!a && !b) continue;
    if (/^observa/i.test(a)) break;

    const mBanca = a.match(/^banca\s*:\s*(.+)$/i);
    if (mBanca) { banca = normalizarBanca(mBanca[1] ?? ""); continue; }
    const mTitulo = a.match(/^edital verticalizado.*·\s*([^·]+)$/i);
    if (mTitulo && !b) { cargo = (mTitulo[1] ?? cargo).trim().toUpperCase(); continue; }

    const mBloco = a.match(/^(BLOCO\s+[IVX]+)\s*·?\s*(.*)$/i);
    if (mBloco && !b) {
      bloco = (mBloco[1] ?? "").replace(/\s+/g, " ").toUpperCase();
      const partes = (mBloco[2] ?? "").split("·").map((p) => semQuestoes(p.trim())).filter(Boolean);
      const resto = partes.join(" ");
      grupo = /espec[ií]fic|direito/i.test(resto) ? "Conhecimento Específico" : "Conhecimento Geral";
      atual = null;
      // "Conhecimentos Gerais · MATEMÁTICA" → matéria é a última parte;
      // "LÍNGUA PORTUGUESA" → a própria; "CONHECIMENTOS ESPECÍFICOS" → as matérias vêm abaixo.
      const ultima = partes[partes.length - 1] ?? "";
      if (ultima && !/^conhecimentos?\s+(espec|em\s+direito|gerais)/i.test(ultima)) nova(ultima);
      continue;
    }

    if (!bloco) continue; // cabeçalho, instruções, progresso
    if (/^n[ºo°]$/i.test(a) || /^progresso/i.test(a)) continue;

    if (b) {
      if (b.endsWith(":") && ehMaiuscula(b.replace(/[^\p{L}]/gu, ""))) { nova(b); continue; }
      if (!atual) nova(bloco);
      (atual as MateriaPlanilha | null)?.topicos.push(b);
    }
  }
  return { cargo, banca: banca || bancaPadrao, materias: materias.filter((m) => m.topicos.length) };
}

/** Banca citada no nome do arquivo (ex.: "...-vunesp-2026.xlsx"). */
export function bancaDoNomeArquivo(nome: string) {
  const n = normalizarBanca(nome);
  return BANCAS_CONHECIDAS.some((b) => n === b || n === "INSTITUTO AOCP") ? n : "";
}

/** Lê o arquivo .xlsx no navegador e devolve um cargo por aba. */
export async function lerPlanilhaEdital(arquivo: File): Promise<CargoPlanilha[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await arquivo.arrayBuffer(), { type: "array" });
  const padrao = bancaDoNomeArquivo(arquivo.name);
  const cargos = wb.SheetNames.map((nome) => {
    const ws = wb.Sheets[nome];
    const linhas = ws ? (XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][]) : [];
    return lerAbaEdital(nome, linhas, padrao);
  }).filter((c) => c.materias.length);
  // Banca achada em uma aba vale para as outras do mesmo arquivo.
  const comum = cargos.find((c) => c.banca)?.banca ?? "";
  return cargos.map((c) => ({ ...c, banca: c.banca || comum }));
}
