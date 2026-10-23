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

/** Limpa o tópico mantendo a numeração do edital (1, 1.1, 1.2.3). */
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
 * Editais costumam vir em parágrafo corrido: "MEDICINA LEGAL: 1. Conceito…
 * 1.1. Corpo de delito…". O cabeçalho e cada item numerado passam a ocupar
 * linhas próprias, sem quebrar ponto e vírgula ou dois-pontos internos.
 */
function quebrarPorNumeracao(texto: string): string {
  return (texto ?? "")
    .replace(/\u00a0/g, " ")
    // "MEDICINA LEGAL: 1." → matéria em uma linha e primeiro tópico na próxima.
    // Exige cabeçalho em maiúsculas para não confundir dois-pontos dentro do assunto.
    .replace(
      /(^|\n)\s*([A-ZÀ-Ý][A-ZÀ-Ý\d\sÀ-ÿ/(),.&ºª-]{2,159}:)\s*(?=\(?\d+(?:\.\d+)*\)?[.)]?\s+)/g,
      "$1$2\n",
    )
    // "… texto 1.1. Assunto" / "… texto (1.2) Assunto" → nova linha.
    // O marcador é preservado para aparecer no tópico salvo.
    .replace(
      /(^|[ \t;])\(?((?:\d+\.)*\d+)\)?[.)]?[ \t]+(?=[A-ZÀ-Ý])/gm,
      (_trecho, separador: string, numero: string) =>
        `${separador === ";" ? ";" : ""}\n${numero} `,
    );
}

const PREFIXO_MATERIA =
  /^(?:disciplina|matéria|materia|conhecimentos?(?:\s+(?:gerais|específicos|especificos|básicos|basicos))?)\s*[:\-–]\s*/i;

/** Começos típicos de nome de disciplina em editais. */
const INICIO_DISCIPLINA =
  /^(?:no[çc][õo]es|conhecimentos?|fundamentos|l[íi]ngua|l[íi]nguagem|direito|legisla[çc][ãa]o|inform[áa]tica|matem[áa]tica|racioc[íi]nio|contabilidade|administra[çc][ãa]o|gest[ãa]o|economia|estat[íi]stica|hist[óo]ria|geografia|atualidades|[ée]tica|reda[çc][ãa]o|portugu[êe]s|ingl[êe]s|espanhol|medicina\s+legal|criminologia|crimin[áa]l[íi]stica|psicologia|sociologia|filosofia|pedagogia|arquivologia|auditoria|seguran[çc]a\s+p[úu]blica|sa[úu]de\s+p[úu]blica|biologia|f[íi]sica|qu[íi]mica)\b/i;

/**
 * Linha numerada que na verdade abre uma nova disciplina
 * ("2. NOÇÕES DE INFORMÁTICA", "3 Direito Penal"), e não um tópico da anterior.
 */
function novaDisciplina(bruto: string) {
  const semNumero = limpar(bruto).replace(/:+$/, "").trim();
  if (semNumero.length < 3 || semNumero.length > 80) return false;
  if (semNumero.includes(";")) return false;
  // Só disciplinas de primeiro nível: "2." e nunca "2.1."
  if (!/^\(?\d{1,2}\)?[.)-]?\s+/.test(bruto.trim())) return false;
  const palavras = semNumero.split(/\s+/);
  if (palavras.length > 6) return false;
  const letras = semNumero.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (letras.length < 3) return false;
  const maiusculas = semNumero === semNumero.toUpperCase();
  return maiusculas || INICIO_DISCIPLINA.test(semNumero);
}

/** Cabeçalho de matéria: "DIREITO PENAL", "Disciplina: X", "Língua Portuguesa:" */
function nomeDeMateria(linha: string, materiaAberta = false): string | null {
  const bruto = linha.replace(/\u00a0/g, " ").trim();
  if (!bruto) return null;

  // "1.1", "(2.3.1)" são tópicos de uma matéria, nunca cabeçalho.
  if (/^\(?\d+\.\d/.test(bruto)) return null;
  // Depois que um cabeçalho foi reconhecido, qualquer item numerado pertence a ele —
  // exceto uma nova disciplina numerada ("2. NOÇÕES DE INFORMÁTICA", "3 Direito Penal").
  if (materiaAberta && /^\(?\d+\)?[.)]?\s+/.test(bruto)) {
    if (!novaDisciplina(bruto)) return null;
    return limpar(bruto).replace(/:+$/, "").trim();
  }

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
  if (!materiaAberta && numeroDeMateria && semNumero.split(" ").length <= 8) return semNumero;
  return null;
}

function topicosDaLinha(linha: string, manterNumeracao = true): string[] {
  const base = (manterNumeracao ? limparTopico : limpar)(linha);
  if (!base) return [];
  const marcador = base.match(/^(\d+(?:\.\d+)*)\s+/);
  const numero = marcador ? marcador[1] : "";
  const corpo = marcador ? base.slice(marcador[0].length) : base;
  const partes = corpo
    .split(/\s+\u2022\s+/)
    .map((t) => limparTopico(t))
    .filter((t) => t.length >= 3 && t.length <= 5000);
  if (!partes.length) return [];
  // A numeração fica no primeiro trecho; os demais são desdobramentos dele.
  return partes.map((t, i) => (i === 0 && numero ? `${numero} ${t}` : t));
}

/** Cabeçalhos de página/instituição e contadores que nunca são matéria nem tópico. */
const RUIDO = [
  /^\d{1,3}$/,
  /^p\s?o\s?d\s?e\s?r\s+j\s?u\s?d/i,
  /^(?:poder\s+judici[áa]rio|tribunal\s+(?:de\s+justi[çc]a|regional|superior)|minist[ée]rio\s+p[úu]blico|governo\s+do\s+estado|prefeitura|estado\s+d[eo])\b/i,
  /^anexo\s+[ivxlc\d]+\b/i,
  /^conte[úu]do\s+program[áa]tico\b/i,
  /^\d+\s+quest[õo]es\s*(?::|,\s*sendo|$)/i,
  /^edital\b.{0,80}$/i,
];

const ehRuido = (l: string) => RUIDO.some((r) => r.test(l.replace(/\u00a0/g, " ").trim()));

/** Junta linhas que o PDF quebrou no meio ("... 159" + "a 161; 176 ..."). */
function juntarQuebras(linhas: string[]): string[] {
  const saida: string[] = [];
  for (const l of linhas) {
    const ant = saida[saida.length - 1];
    const continua =
      ant !== undefined &&
      !/^bloco\s+[ivx\d]+\b/i.test(l) &&
      (/[-,]$/.test(ant) ||
        /\s(?:e|a|de|da|do|com|em|n\.º|s[ãa]o|santo|santa)$/i.test(ant) ||
        /^[a-zà-ÿ]/.test(l) ||
        /^\d[\d.ºª-]*\s*(?:[;,)]|a\s|e\s|\.$|$)/.test(l));
    if (continua) saida[saida.length - 1] = ant.endsWith("-") ? ant + l : `${ant} ${l}`;
    else saida.push(l);
  }
  return saida;
}

/** "BLOCO II: Conhecimentos Específicos" → grupo e, se for disciplina, o nome. */
function lerBloco(linha: string): { grupo?: GrupoEdital; materia?: string } | null {
  const m = linha.match(/^bloco\s+[ivx\d]+\s*[:\-–—]?\s*(.*)$/i);
  if (!m) return null;
  const resto = limpar(m[1] ?? "").replace(/:+$/, "");
  if (!resto) return {};
  if (/^conhecimentos?\s+gerais/i.test(resto)) return { grupo: "Conhecimento Geral" };
  if (/^conhecimentos?\s+espec[íi]ficos/i.test(resto)) return { grupo: "Conhecimento Específico" };
  return { materia: resto };
}

/** "1. DIREITO PENAL: Código Penal – artigos…" → nome em maiúsculas antes dos dois-pontos. */
function cabecalhoComConteudo(linha: string): { nome: string; resto: string } | null {
  const m = linha.match(/^\(?\d{1,2}\)?[.)-]?\s+([A-ZÀ-Ý][A-ZÀ-Ý\s/,&-]{2,80}):\s*(.*)$/);
  if (!m) return null;
  const nome = (m[1] ?? "").trim();
  if (nome.split(/\s+/).length > 7 || nome.replace(/[^A-ZÀ-Ý]/g, "").length < 3) return null;
  return { nome, resto: m[2] ?? "" };
}

/** Disciplina sem número nem dois-pontos ("Atualidades", "Informática"). */
function disciplinaSolta(linha: string) {
  const l = linha.trim();
  if (/[.;:,]$/.test(l) || /^\d/.test(l)) return false;
  return l.split(/\s+/).length <= 6 && INICIO_DISCIPLINA.test(l);
}

/** Conteúdo corrido: "… arquivos. MS-Word: estrutura…" → um tópico por "Rótulo:". */
function quebrarPorRotulos(linha: string): string[] {
  if (linha.length < 200 || /^\d/.test(linha)) return [linha];
  return linha
    .split(/(?<=\.)\s+(?=[A-ZÀ-Ý][\wÀ-ÿ-]*(?:\s[A-ZÀ-Ýa-zà-ÿ][\wÀ-ÿ-]*){0,2}\s?:)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function extrairMateriasDoTexto(texto: string): MateriaExtraida[] {
  const brutas = (texto ?? "")
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !ehRuido(l));

  const linhas = quebrarPorNumeracao(juntarQuebras(brutas).join("\n"))
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !ehRuido(l))
    .flatMap(quebrarPorRotulos);

  const materias: MateriaExtraida[] = [];
  let atual: MateriaExtraida | null = null;
  let grupoBloco: GrupoEdital | null = null;

  const abrir = (nome: string) => {
    const existente = materias.find((m) => m.nome.toLowerCase() === nome.toLowerCase());
    const nova = existente ?? { nome, grupo: grupoBloco ?? grupoSugerido(nome), topicos: [] };
    if (!existente) materias.push(nova);
    return nova;
  };
  const somar = (alvo: MateriaExtraida, ts: string[]) => {
    for (const t of ts) {
      if (!alvo.topicos.some((x) => x.toLowerCase() === t.toLowerCase())) alvo.topicos.push(t);
    }
  };

  for (const linha of linhas) {
    const bloco = lerBloco(linha);
    if (bloco) {
      grupoBloco = bloco.grupo ?? null;
      atual = bloco.materia ? abrir(bloco.materia) : null;
      continue;
    }
    const comConteudo = cabecalhoComConteudo(linha);
    if (comConteudo) {
      atual = abrir(comConteudo.nome);
      somar(atual, topicosDaLinha(comConteudo.resto, false));
      continue;
    }
    if (disciplinaSolta(linha)) {
      atual = abrir(limpar(linha));
      continue;
    }
    const nome = nomeDeMateria(linha, atual !== null);
    if (nome) {
      atual = abrir(nome);
      // Cabeçalho do tipo "Direito Penal: crimes contra a fé pública; ..."
      const resto = linha.includes(":") ? linha.slice(linha.indexOf(":") + 1) : "";
      somar(atual, topicosDaLinha(resto, false));
      continue;
    }
    if (!atual) continue;
    somar(atual, topicosDaLinha(linha));
  }

  return materias.filter((m) => m.nome.length >= 3);
}

/** Remove o trecho anterior ao conteúdo programático (inscrição, taxas etc.). */
function recortarConteudo(texto: string): string {
  const t = texto.replace(/\[\[p:\d+\]\]\s*/g, "\n");
  const i = t.search(/conte[úu]do\s+program[áa]tico/i);
  const corte = i >= 0 ? t.slice(i) : t;
  // O PDF entrega uma linha por página: tira os cabeçalhos no meio e separa os blocos.
  return corte
    .replace(/conte[úu]do\s+program[áa]tico\s*/gi, "\n")
    .replace(/poder\s+judici[áa]rio|tribunal\s+de\s+justi[çc]a(?:\s+do\s+estado\s+de\s+[a-zà-ÿ ]+?(?=\s[A-ZÀ-Ý]{2}))?|anexo\s+[ivxlc]+\b/gi, "\n")
    .replace(/\s*(bloco\s+[ivx]+\b)/gi, "\n$1")
    .replace(/(bloco\s+[ivx]+\s*[:\-–—]?\s*conhecimentos?\s+(?:gerais|espec[íi]ficos))\s*/gi, "$1\n");
}

/** Quebra tópicos de lei com vários trechos ("artigos 1º a 5º; 10 a 12") um por linha. */
function desdobrarTopico(t: string): string[] {
  const corpo = t.replace(/^\d+(?:\.\d+)*\s+/, "");
  const lei = corpo.match(/^(.{3,80}?)\s*[–—-]\s*(artigos?|arts?\.)\s+(.+)$/i);
  if (lei && lei[1] && lei[3]?.includes(";")) {
    const [, nomeLei, , trechos] = lei as unknown as [string, string, string, string];
    return trechos
      .split(/\s*;\s*/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `${nomeLei} – ${/^arts?/i.test(p) ? "" : "artigos "}${p}`.replace(/\s+/g, " "));
  }
  if (!/^\d/.test(t) && corpo.includes(";") && corpo.length > 120) {
    return corpo.split(/\s*;\s*/).map((p) => p.trim()).filter((p) => p.length >= 3);
  }
  return [corpo];
}

/**
 * Organiza o texto bruto (ex.: lido do PDF) no formato
 * "MATÉRIA:\n1. tópico\n2. tópico", pronto para "Extrair e limpar".
 */
export function organizarTextoEdital(texto: string): string {
  const materias = extrairMateriasDoTexto(recortarConteudo(texto ?? ""));
  return materias
    .filter((m) => m.topicos.length)
    .map((m) => {
      const itens = m.topicos.flatMap(desdobrarTopico);
      return `${m.nome.toUpperCase()}:\n${itens.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
    })
    .join("\n\n");
}
