/**
 * Extração local (sem IA) das matérias e tópicos do conteúdo programático colado.
 * Reconhece cabeçalhos de disciplina e listas de tópicos numeradas ou com marcadores.
 */
import type { GrupoEdital } from "./edital";

export type MateriaExtraida = { nome: string; grupo: GrupoEdital; topicos: string[] };

const GERAIS = [
  "portugu",
  "reda",
  "raciocínio",
  "raciocinio",
  "matemática",
  "matematica",
  "informática",
  "informatica",
  "atualidades",
  "inglês",
  "ingles",
  "espanhol",
  "ética",
  "etica",
  "noções de administração",
];

function grupoSugerido(nome: string): GrupoEdital {
  const n = nome.toLowerCase();
  return GERAIS.some((g) => n.includes(g)) ? "Conhecimento Geral" : "Conhecimento Específico";
}

const limpar = (s: string) =>
  s
    .replace(/\u00a0/g, " ")
    .replace(/^[\s\-–—•*·]+/, "")
    .replace(/^(?:\d+(?:\.\d+)*)[.)\s-]+/, "")
    .replace(/\s+/g, " ")
    .replace(/[;.,:]+$/, "")
    .trim();

/** Limpa o tópico mantendo a numeração do edital (1.1, 1.2.3). */
const limparTopico = (s: string) =>
  s
    .replace(/\u00a0/g, " ")
    .replace(/^[\s\-–—•*·]+/, "")
    .replace(/^\((\d+(?:\.\d+)*)\)/, "$1")
    .replace(/\s+/g, " ")
    .replace(/[;,:]+$/, "")
    .replace(/\.$/, "")
    .trim();

/**
 * Editais costumam vir em parágrafo corrido: "1 Língua Portuguesa. 1.1 Compreensão…
 * 1.2 Ortografia…". Aqui cada item numerado passa a ocupar a própria linha.
 */
function quebrarPorNumeracao(texto: string): string {
  return (texto ?? "")
    .replace(/\u00a0/g, " ")
    // "… texto 1.1 Assunto" / "… texto (1.2) Assunto" → nova linha
    .replace(/([^\n])[\s.;]+\(?(\d+(?:\.\d+)+)\)?[.)]?\s+/g, "$1\n$2 ")
    // "… texto 2 DIREITO PENAL" (número de primeiro nível seguido de letra)
    .replace(/([^\n])[\s.;]+\(?(\d+)\)?[.)]?\s+(?=[A-ZÀ-Ý])/g, "$1\n$2 ");
}

const PREFIXO_MATERIA =
  /^(?:disciplina|matéria|materia|conhecimentos?(?:\s+(?:gerais|específicos|especificos|básicos|basicos))?)\s*[:\-–]\s*/i;

/** Cabeçalho de matéria: "DIREITO PENAL", "Disciplina: X", "Língua Portuguesa:" */
function nomeDeMateria(linha: string): string | null {
  const bruto = linha.replace(/\u00a0/g, " ").trim();
  if (!bruto) return null;

  // "1.1", "(2.3.1)" são tópicos de uma matéria, nunca cabeçalho.
  if (/^\(?\d+\.\d/.test(bruto)) return null;

  const comPrefixo = bruto.match(PREFIXO_MATERIA);
  if (comPrefixo) {
    const nome = limpar(bruto.slice(comPrefixo[0].length));
    return nome.length >= 3 ? nome : null;
  }

  const semNumero = limpar(bruto);
  if (semNumero.length < 3 || semNumero.length > 160) return null;
  // Linhas com muitos tópicos separados por ";" são conteúdo, não cabeçalho.
  if (semNumero.includes(";")) return null;

  const letras = semNumero.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (!letras) return null;

  const maiusculas = semNumero === semNumero.toUpperCase() && letras.length >= 3;
  const terminaComDoisPontos = bruto.trim().endsWith(":");
  const numeroDeMateria = /^\(?\d+\)?\s*[.)-]?\s*[^\d]/.test(bruto.trim());

  if (maiusculas) return semNumero;
  if (terminaComDoisPontos) return semNumero.replace(/:+$/, "").trim();
  // "1 DIREITO PENAL" / "1. Língua Portuguesa" curtos (poucas palavras) → cabeçalho
  if (numeroDeMateria && semNumero.split(" ").length <= 8) return semNumero;
  return null;
}

function topicosDaLinha(linha: string, manterNumeracao = true): string[] {
  const base = (manterNumeracao ? limparTopico : limpar)(linha);
  if (!base) return [];
  const marcador = base.match(/^(\d+(?:\.\d+)*)\s+/);
  const numero = marcador ? marcador[1] : "";
  const corpo = marcador ? base.slice(marcador[0].length) : base;
  const partes = corpo
    .split(/\s*;\s*|\s+\u2022\s+/)
    .map((t) => limparTopico(t))
    .filter((t) => t.length >= 3 && t.length <= 5000);
  if (!partes.length) return [];
  // A numeração fica no primeiro trecho; os demais são desdobramentos dele.
  return partes.map((t, i) => (i === 0 && numero ? `${numero} ${t}` : t));
}

export function extrairMateriasDoTexto(texto: string): MateriaExtraida[] {
  const linhas = quebrarPorNumeracao(texto)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const materias: MateriaExtraida[] = [];
  let atual: MateriaExtraida | null = null;

  for (const linha of linhas) {
    const nome = nomeDeMateria(linha);
    if (nome) {
      const existente = materias.find((m) => m.nome.toLowerCase() === nome.toLowerCase());
      atual = existente ?? { nome, grupo: grupoSugerido(nome), topicos: [] };
      if (!existente) materias.push(atual);
      // Cabeçalho do tipo "Direito Penal: crimes contra a fé pública; ..."
      const resto = linha.includes(":") ? linha.slice(linha.indexOf(":") + 1) : "";
      for (const t of topicosDaLinha(resto, false)) {
        if (!atual.topicos.some((x) => x.toLowerCase() === t.toLowerCase())) atual.topicos.push(t);
      }
      continue;
    }
    if (!atual) continue;
    for (const t of topicosDaLinha(linha)) {
      if (!atual.topicos.some((x) => x.toLowerCase() === t.toLowerCase())) atual.topicos.push(t);
    }
  }

  return materias.filter((m) => m.nome.length >= 3);
}
