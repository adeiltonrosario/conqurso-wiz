/**
 * Incidência de cobrança 100% determinística (sem IA, sem créditos).
 * Cruza questões de provas (arquivos, texto colado ou Quest API) com o edital
 * ativo, conta questões únicas / provas distintas / anos e classifica em
 * ★☆☆ / ★★☆ / ★★★. Os resultados ficam por concurso (banca + cargo).
 */
import { useEffect, useState } from "react";
import type { Questao } from "./ai.functions";

export type Estrelas = 1 | 2 | 3;

export type Dispositivo = {
  /** Chave da norma ("cp", "cpp", "cf", "lei-8112"...) ou "" quando não identificada. */
  lei: string;
  artigo: number;
  detalhe?: string;
};

export type QuestaoAnalisada = {
  id: string;
  hash: string;
  questao: Questao;
  prova: string;
  ano?: number;
  materia: string;
  assunto?: string;
  dispositivos: Dispositivo[];
  /** Motivo da revisão manual, quando a classificação não é segura. */
  pendente?: string;
  foraDoEdital?: boolean;
  anulada?: boolean;
};

export type ItemIncidencia = {
  tipo: "artigo" | "assunto";
  chave: string;
  rotulo: string;
  materia: string;
  lei?: string;
  artigo?: number;
  questoes: string[];
  provas: number;
  anos: number[];
  estrelas: Estrelas;
};

export type ConfigIncidencia = {
  alta: { questoes: number; provas: number };
  media: { questoes: number; provas: number };
};

export const CONFIG_PADRAO: ConfigIncidencia = {
  alta: { questoes: 3, provas: 2 },
  media: { questoes: 2, provas: 1 },
};

export const LIMITE_REVISAO = 20;
export const LIMITE_CARDS = 10;

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Identifica a norma citada num trecho. Retorna "" quando não há referência segura. */
export function chaveNorma(texto: string): string {
  const t = semAcento(texto);
  if (/codigo de processo penal|\bcpp\b|3\.?689/.test(t)) return "cpp";
  if (/codigo de processo civil|\bcpc\b|13\.?105/.test(t)) return "cpc";
  if (/codigo penal|\bcp\b|2\.?848/.test(t)) return "cp";
  if (/codigo civil|10\.?406/.test(t)) return "cc";
  if (/constituicao( da republica| federal)?|\bcf\b|crfb/.test(t)) return "cf";
  const lei = /lei(?: complementar)?\s*(?:federal\s*)?(?:n[.ºo°]*\s*)?(\d{1,2}\.?\d{3})/.exec(t);
  if (lei) return `lei-${lei[1]!.replace(".", "")}`;
  return "";
}

/** Normas mencionadas em qualquer ponto do texto (sem duplicar). */
function normasCitadas(texto: string) {
  const achadas = new Set<string>();
  const re =
    /c[oó]digo de processo penal|c[oó]digo de processo civil|c[oó]digo penal|c[oó]digo civil|constitui[cç][aã]o(?: da rep[uú]blica| federal)?|\b(?:cpp|cpc|cp|cf|crfb)\b|lei(?: complementar)?\s*(?:federal\s*)?(?:n[.ºo°]*\s*)?\d{1,2}\.?\d{3}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const k = chaveNorma(m[0]);
    if (k) achadas.add(k);
  }
  return [...achadas];
}

/**
 * Extrai referências expressas a artigos. Só vincula a uma norma quando ela é
 * citada logo após o artigo ou quando é a única norma citada na questão.
 */
export function extrairDispositivos(texto: string): Dispositivo[] {
  const saida: Dispositivo[] = [];
  const vistos = new Set<string>();
  const normas = normasCitadas(texto);
  const re = /\bart(?:igo|s?\.)?\s*(\d{1,4})\s*[º°o]?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const artigo = Number(m[1]);
    if (!artigo) continue;
    const depois = texto.slice(m.index + m[0].length, m.index + m[0].length + 90);
    const perto = chaveNorma(depois.split(/[;.](?!\d)/)[0] ?? "");
    const lei = perto || (normas.length === 1 ? normas[0]! : "");
    const par = /^\s*,?\s*(§\s*\d+\s*[º°o]?|par[aá]grafo [uú]nico)/i.exec(depois)?.[1];
    const inc = /inciso\s+([IVXLC]+)\b/i.exec(depois.slice(0, 40))?.[1];
    const detalhe = [par, inc ? `inciso ${inc.toUpperCase()}` : ""].filter(Boolean).join(", ");
    const k = `${lei}|${artigo}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    saida.push({ lei, artigo, ...(detalhe ? { detalhe } : {}) });
  }
  return saida;
}

const PARADAS = new Set(
  "a o e de da do das dos em no na nos nas para por com sem que se ao aos as os um uma sua seu ou lei art artigo sobre entre como mais".split(
    " ",
  ),
);

function palavras(s: string) {
  return semAcento(s)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3 && !PARADAS.has(p));
}

/** Melhor assunto do edital por sobreposição de palavras-chave (determinístico). */
export function classificarAssunto(texto: string, topicos: string[]) {
  const base = new Set(palavras(texto));
  let melhor: { topico: string; pontos: number } | null = null;
  let empate = false;
  for (const topico of topicos) {
    const chaves = [...new Set(palavras(topico))];
    if (!chaves.length) continue;
    const pontos = chaves.filter((p) => base.has(p)).length / chaves.length;
    if (!melhor || pontos > melhor.pontos) {
      melhor = { topico, pontos };
      empate = false;
    } else if (pontos === melhor.pontos) empate = true;
  }
  if (!melhor || melhor.pontos < 0.5 || empate) return null;
  return melhor.topico;
}

/** Identidade exata da questão (texto normalizado), não semelhança. */
export function hashQuestao(q: Pick<Questao, "enunciado" | "alternativas">) {
  const base = semAcento(
    `${q.enunciado}|${q.alternativas.map((a) => a.texto).join("|")}`,
  ).replace(/[^a-z0-9]+/g, "");
  let h = 5381;
  for (let i = 0; i < base.length; i++) h = ((h * 33) ^ base.charCodeAt(i)) >>> 0;
  return `${h.toString(36)}-${base.length}`;
}

export type MateriaRef = { nome: string; topicos: string[] };

/** Classifica as questões no edital ativo. Nada fora do edital entra na contagem. */
export function analisarQuestoes(
  questoes: Questao[],
  materias: MateriaRef[],
  filtroMateria: string,
): QuestaoAnalisada[] {
  const porNome = new Map(materias.map((m) => [semAcento(m.nome.trim()), m]));
  const saida: QuestaoAnalisada[] = [];
  const vistos = new Set<string>();
  for (const q of questoes) {
    const hash = hashQuestao(q);
    if (vistos.has(hash)) continue;
    vistos.add(hash);
    const texto = `${q.enunciado} ${q.alternativas.map((a) => a.texto).join(" ")} ${q.explicacao ?? ""}`;
    let mat = porNome.get(semAcento((q.materia ?? "").trim()));
    let pendente: string | undefined;
    if (!mat && materias.length) {
      // Sem matéria declarada: tenta pelos assuntos de cada matéria do edital.
      const candidatas = materias.filter((m) => classificarAssunto(texto, m.topicos));
      if (candidatas.length === 1) mat = candidatas[0];
    }
    if (filtroMateria && mat && semAcento(mat.nome) !== semAcento(filtroMateria)) continue;
    const anulada = !q.alternativas.some((a) => a.correta);
    const assunto =
      (q.assunto && mat?.topicos.find((t) => semAcento(t) === semAcento(q.assunto!))) ||
      (mat ? classificarAssunto(texto, mat.topicos) : null) ||
      undefined;
    const dispositivos = extrairDispositivos(texto);
    if (!mat) pendente = "Matéria não identificada no edital";
    else if (dispositivos.some((d) => !d.lei)) pendente = "Artigo citado sem norma identificável";
    else if (!assunto && !dispositivos.length) pendente = "Assunto não identificado com segurança";
    saida.push({
      id: q.id,
      hash,
      questao: q,
      prova: q.prova || q.origem || "Prova sem nome",
      ...(q.ano ? { ano: q.ano } : {}),
      materia: mat?.nome ?? q.materia ?? "",
      ...(assunto ? { assunto } : {}),
      dispositivos,
      ...(pendente ? { pendente } : {}),
      ...(!mat ? { foraDoEdital: true } : {}),
      ...(anulada ? { anulada: true } : {}),
    });
  }
  return saida;
}

export function estrelasDe(questoes: number, provas: number, cfg: ConfigIncidencia): Estrelas {
  if (questoes >= cfg.alta.questoes && provas >= cfg.alta.provas) return 3;
  if (questoes >= cfg.media.questoes && provas >= cfg.media.provas) return 2;
  return 1;
}

/** Conta a incidência por artigo e por assunto (só questões válidas e do edital). */
export function calcularIncidencia(
  analisadas: QuestaoAnalisada[],
  cfg: ConfigIncidencia = CONFIG_PADRAO,
): ItemIncidencia[] {
  type Acc = Omit<ItemIncidencia, "provas" | "anos" | "estrelas"> & {
    provasSet: Set<string>;
    anosSet: Set<number>;
  };
  const mapa = new Map<string, Acc>();
  const somar = (chave: string, base: Omit<Acc, "questoes" | "provasSet" | "anosSet">, q: QuestaoAnalisada) => {
    const atual = mapa.get(chave) ?? { ...base, questoes: [], provasSet: new Set(), anosSet: new Set() };
    if (!atual.questoes.includes(q.hash)) atual.questoes.push(q.hash);
    atual.provasSet.add(q.prova);
    if (q.ano) atual.anosSet.add(q.ano);
    mapa.set(chave, atual);
  };
  for (const q of analisadas) {
    if (q.anulada || q.foraDoEdital) continue;
    for (const d of q.dispositivos) {
      if (!d.lei) continue;
      const chave = `artigo|${d.lei}|${d.artigo}`;
      somar(chave, { tipo: "artigo", chave, rotulo: `${rotuloNorma(d.lei)} – Art. ${d.artigo}`, materia: q.materia, lei: d.lei, artigo: d.artigo }, q);
    }
    if (q.assunto) {
      const chave = `assunto|${semAcento(q.materia)}|${semAcento(q.assunto)}`;
      somar(chave, { tipo: "assunto", chave, rotulo: q.assunto, materia: q.materia }, q);
    }
  }
  return [...mapa.values()]
    .map(({ provasSet, anosSet, ...r }) => ({
      ...r,
      provas: provasSet.size,
      anos: [...anosSet].sort(),
      estrelas: estrelasDe(r.questoes.length, provasSet.size, cfg),
    }))
    .sort((a, b) => b.estrelas - a.estrelas || b.questoes.length - a.questoes.length);
}

export function rotuloNorma(lei: string) {
  const nomes: Record<string, string> = {
    cp: "Código Penal",
    cpp: "Código de Processo Penal",
    cpc: "Código de Processo Civil",
    cc: "Código Civil",
    cf: "Constituição Federal",
  };
  return nomes[lei] ?? (lei.startsWith("lei-") ? `Lei ${lei.slice(4)}` : lei);
}

/** Ordena por prioridade: banca do usuário, gabarito válido, provas/anos distintos. */
function priorizar(lista: QuestaoAnalisada[], banca: string) {
  const b = semAcento(banca);
  const ordenada = [...lista].sort((x, y) => {
    const bx = b && semAcento(x.questao.banca ?? "").includes(b) ? 0 : 1;
    const by = b && semAcento(y.questao.banca ?? "").includes(b) ? 0 : 1;
    return bx - by || (y.ano ?? 0) - (x.ano ?? 0);
  });
  // Espalha entre provas distintas: primeiro uma por prova, depois o restante.
  const primeiras: QuestaoAnalisada[] = [];
  const resto: QuestaoAnalisada[] = [];
  const provas = new Set<string>();
  for (const q of ordenada) (provas.has(q.prova) ? resto : primeiras).push(q), provas.add(q.prova);
  return [...primeiras, ...resto];
}

/** Até 20 questões por artigo/assunto ★★★ (cada conjunto separado, sem repetir). */
export function selecionarRevisao(itens: ItemIncidencia[], analisadas: QuestaoAnalisada[], banca: string) {
  const porHash = new Map(analisadas.map((q) => [q.hash, q]));
  return itens
    .filter((i) => i.estrelas === 3)
    .map((item) => ({
      item,
      questoes: priorizar(
        item.questoes.map((h) => porHash.get(h)!).filter((q) => q && !q.anulada),
        banca,
      ).slice(0, LIMITE_REVISAO),
    }));
}

/** Até 10 questões por matéria, distribuídas entre os assuntos. */
export function selecionarCards(analisadas: QuestaoAnalisada[], banca: string) {
  const porMateria = new Map<string, QuestaoAnalisada[]>();
  for (const q of analisadas) {
    if (q.anulada || q.foraDoEdital || !q.materia) continue;
    porMateria.set(q.materia, [...(porMateria.get(q.materia) ?? []), q]);
  }
  return [...porMateria.entries()].map(([materia, lista]) => {
    const ordenada = priorizar(lista, banca);
    const porAssunto = new Map<string, QuestaoAnalisada[]>();
    for (const q of ordenada) porAssunto.set(q.assunto ?? "", [...(porAssunto.get(q.assunto ?? "") ?? []), q]);
    const filas = [...porAssunto.values()];
    const escolhidas: QuestaoAnalisada[] = [];
    while (escolhidas.length < LIMITE_CARDS && filas.some((f) => f.length)) {
      for (const f of filas) {
        const q = f.shift();
        if (q && escolhidas.length < LIMITE_CARDS) escolhidas.push(q);
      }
    }
    return { materia, questoes: escolhidas };
  });
}

/* ---------- Armazenamento por concurso (banca + cargo) ---------- */

export type ResultadoConcurso = {
  banca: string;
  cargo: string;
  questoes: QuestaoAnalisada[];
  config: ConfigIncidencia;
  atualizado: number;
};

export type EstadoIncidencia = { concursos: Record<string, ResultadoConcurso> };

const KEY = "concurseiro:incidencia";
const VAZIO: EstadoIncidencia = { concursos: {} };

export const chaveConcurso = (banca?: string, cargo?: string) =>
  `${semAcento(banca ?? "").trim()}|${semAcento(cargo ?? "").trim()}`;

export function lerIncidencia(): EstadoIncidencia {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...VAZIO, ...(JSON.parse(raw) as EstadoIncidencia) } : VAZIO;
  } catch {
    return VAZIO;
  }
}

/** Junta as novas questões às já analisadas do mesmo concurso, sem duplicar. */
export function mesclarConcurso(
  atual: QuestaoAnalisada[],
  novas: QuestaoAnalisada[],
): QuestaoAnalisada[] {
  const mapa = new Map(atual.map((q) => [q.hash, q]));
  for (const q of novas) mapa.set(q.hash, q);
  return [...mapa.values()];
}

export function salvarResultado(r: ResultadoConcurso) {
  const estado = lerIncidencia();
  estado.concursos[chaveConcurso(r.banca, r.cargo)] = r;
  window.localStorage.setItem(KEY, JSON.stringify(estado));
  window.dispatchEvent(new Event("incidencia:mudou"));
}

export function useIncidencia(banca?: string, cargo?: string) {
  const [estado, setEstado] = useState<EstadoIncidencia>(VAZIO);
  useEffect(() => {
    const sync = () => setEstado(lerIncidencia());
    sync();
    window.addEventListener("incidencia:mudou", sync);
    return () => window.removeEventListener("incidencia:mudou", sync);
  }, []);
  return estado.concursos[chaveConcurso(banca, cargo)] ?? null;
}
