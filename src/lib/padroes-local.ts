/**
 * Análise de padrões SEM IA (modo local, zero créditos).
 * Faz o parsing da prova colada/extraída e calcula estatísticas de padrão
 * das alternativas corretas a partir do gabarito informado.
 */
import type { PadraoAnalise } from "./ai.functions";

type Alt = { letra: string; texto: string };
type QuestaoBruta = { numero: number; enunciado: string; alternativas: Alt[] };

const CONECTIVOS = [
  "porém","contudo","todavia","entretanto","embora","salvo","exceto","desde que","somente","apenas","sempre","nunca","jamais","obrigatoriamente","independentemente",
];

function limpar(t: string) {
  return t.replace(/\[\[p:\d+\]\]/g, " ").replace(/[ \t]+/g, " ").trim();
}

/** Lixo típico de cabeçalho/rodapé de caderno de prova. */
const RODAPE_PADROES: RegExp[] = [
  /p[áa]g(?:ina)?\.?\s*\d+(?:\s*(?:de|\/)\s*\d+)?/gi,
  /www\.[^\s]+/gi,
  /https?:\/\/[^\s]+/gi,
  /[\w.+-]+@[\w-]+\.[\w.]+/gi,
  /CNPJ[^\s]*\s*[\d./-]+/gi,
  /caderno\s+de\s+(?:prova|quest[õo]es)[^.]{0,60}/gi,
  /folha\s+de\s+respostas?[^.]{0,40}/gi,
  /nome\s+do\s+candidato\s*:?[^.]{0,60}/gi,
  /(?:n[ºo]\.?\s*de\s*)?inscri[çc][ãa]o\s*:?\s*[\d.-]*/gi,
  /concurso\s+p[úu]blico[^.]{0,80}/gi,
  /(?:^|\s)rascunho(?:\s|$)/gi,
  /reserv(?:a|ado)\s+para\s+rascunho/gi,
  /boa\s+prova!?/gi,
  /instru[çc][õo]es\s+gerais[^.]{0,60}/gi,
];

/**
 * Remove cabeçalhos/rodapés do PDF: trechos repetidos em várias páginas
 * (usando as marcas [[p:n]]) e os padrões típicos de caderno de prova.
 */
export function limparRodapes(texto: string) {
  const paginas = texto.split(/\[\[p:\d+\]\]/).filter((p) => p.trim());
  let saida = texto;

  if (paginas.length >= 3) {
    // Segmentos curtos que aparecem na maioria das páginas são cabeçalho/rodapé.
    const contagem = new Map<string, number>();
    for (const pag of paginas) {
      const vistos = new Set<string>();
      for (const seg of pag.split(/(?<=[.;:!?])\s+|\s{3,}/)) {
        const s = seg.trim();
        if (s.length < 8 || s.length > 120) continue;
        if (vistos.has(s)) continue;
        vistos.add(s);
        contagem.set(s, (contagem.get(s) ?? 0) + 1);
      }
    }
    const limite = Math.max(3, Math.ceil(paginas.length * 0.5));
    for (const [seg, n] of contagem) {
      if (n < limite) continue;
      saida = saida.split(seg).join(" ");
    }
  }

  for (const re of RODAPE_PADROES) saida = saida.replace(re, " ");
  return saida.replace(/[ \t]+/g, " ").trim();
}

/** Corta de um texto de alternativa qualquer resto de rodapé/cabeçalho. */
export function limparAlternativa(texto: string) {
  let t = texto;
  for (const re of RODAPE_PADROES) t = t.replace(re, " ");
  // Corta quando começa um novo bloco de prova/gabarito depois da alternativa.
  t = t.split(
    /\s(?=(?:QUEST[ÃA]O\s*\d{1,3}|GABARITO|COMENT[ÁA]RIO|TEXTO\s+\d|[A-ZÀ-Ú]{4,}(?:\s+[A-ZÀ-Ú]{2,}){2,}\s))/,
  )[0]!;
  return t.replace(/\s+/g, " ").replace(/[\s.;,-]+$/, (m) => (m.includes(".") ? "." : "")).trim();
}

export function separarQuestoes(texto: string): QuestaoBruta[] {
  const limpo = limpar(limparRodapes(texto));
  const partes = limpo.split(/(?=(?:QUEST[ÃA]O\s*)?\b\d{1,3}\s*[-—.)]\s)/gi);
  const questoes: QuestaoBruta[] = [];

  for (const parte of partes) {
    const cab = parte.match(/^(?:QUEST[ÃA]O\s*)?(\d{1,3})\s*[-—.)]\s*/i);
    if (!cab) continue;
    const numero = Number(cab[1]);
    const corpo = parte.slice(cab[0].length);

    const alternativas: Alt[] = [];
    const reAlt = /(?:^|\s)\(?([A-Ea-e])\)?\s*[-—.)]?\s+(?=[A-Za-zÀ-ú"“(])/g;
    const marcas: { letra: string; inicio: number; fim: number }[] = [];
    let a: RegExpExecArray | null;
    while ((a = reAlt.exec(corpo))) {
      marcas.push({
        letra: String(a[1]).toUpperCase(),
        inicio: a.index,
        fim: a.index + a[0].length,
      });
    }
    // Aceita as marcas na ordem A, B, C, D, E, ignorando letras soltas no meio do texto.
    const validas: typeof marcas = [];
    for (const mk of marcas) {
      if (mk.letra === "ABCDE"[validas.length]) validas.push(mk);
    }
    for (let i = 0; i < validas.length; i++) {
      const atual = validas[i]!;
      const proxima = validas[i + 1];
      const bruto = corpo.slice(atual.fim, proxima ? proxima.inicio : corpo.length).trim();
      // A última alternativa é a que costuma arrastar o rodapé da página.
      const t = limparAlternativa(bruto);
      if (t) alternativas.push({ letra: atual.letra, texto: t });
    }

    const primeira = validas[0];
    const enunciado = (primeira ? corpo.slice(0, primeira.inicio) : corpo).trim();
    if (enunciado.length > 15) questoes.push({ numero, enunciado, alternativas });
  }

  return questoes;
}


function marcarConectivos(texto: string) {
  let saida = texto;
  for (const c of [...CONECTIVOS].sort((x, y) => y.length - x.length)) {
    saida = saida.replace(new RegExp(`\\b(${c})\\b`, "gi"), "{{vermelho|$1}}");
  }
  return saida;
}

function padraoDaAlternativa(alt: Alt, todas: Alt[], correta: boolean) {
  const tamanhos = todas.map((t) => t.texto.length);
  const media = tamanhos.reduce((s, n) => s + n, 0) / Math.max(1, tamanhos.length);
  const relacao =
    alt.texto.length > media * 1.15 ? "mais longa que a média" : alt.texto.length < media * 0.85 ? "mais curta que a média" : "tamanho médio";
  const restritivo = CONECTIVOS.some((c) => new RegExp(`\\b${c}\\b`, "i").test(alt.texto));
  const fim = alt.texto.replace(/[.;:]$/, "").slice(-1).toLowerCase();
  const partes = [
    `${alt.texto.length} caracteres (${relacao})`,
    `termina em "${fim}" (${/[aeiouáéíóúãõâêô]/.test(fim) ? "vogal" : "consoante"})`,
    restritivo ? "usa termo restritivo/absoluto" : "sem termo absoluto",
    correta ? "marcada como correta pelo gabarito" : "distrator",
  ];
  return partes.join(" · ");
}

export function analisarPadroesLocal(conteudo: string, materia: string): PadraoAnalise {
  const gabarito = extrairGabarito(conteudo);
  const brutas = separarQuestoes(conteudo);

  const questoes = brutas.map((q) => {
    const letraCorreta = gabarito[q.numero];
    const frases = q.enunciado
      .split(/(?<=[.;])\s+/)
      .filter((f) => f.trim().length > 20)
      .slice(0, 6)
      .map((f) => ({
        texto: marcarConectivos(f.trim()),
        sentido: /\bn[ãa]o\b|\bexceto\b|\bincorret/i.test(f) ? ("invertida" as const) : ("correta" as const),
      }));

    return {
      numero: q.numero,
      materia: materia || "",
      enunciado: marcarConectivos(q.enunciado),
      frases,
      alternativas: q.alternativas.map((alt) => {
        const correta = letraCorreta === alt.letra;
        const texto = correta ? `{{azul|${alt.texto}}}` : marcarConectivos(alt.texto);
        return { letra: alt.letra, texto, correta, padrao: padraoDaAlternativa(alt, q.alternativas, correta) };
      }),
    };
  });

  const comGabarito = questoes.filter((q) => q.alternativas.some((a) => a.correta));
  const resumo: string[] = [];

  resumo.push(
    `${questoes.length} questão(ões) reconhecidas no material enviado; ${comGabarito.length} com gabarito identificado.`,
  );

  if (comGabarito.length) {
    const contagem: Record<string, number> = {};
    for (const q of comGabarito) {
      const letra = q.alternativas.find((a) => a.correta)!.letra;
      contagem[letra] = (contagem[letra] ?? 0) + 1;
    }
    const dist = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .map(([l, n]) => `${l}: ${n} (${Math.round((n / comGabarito.length) * 100)}%)`)
      .join(" · ");
    resumo.push(`Distribuição do gabarito — {{amarelo|${dist}}}`);

    let maisLonga = 0;
    let comAbsoluto = 0;
    let terminaVogal = 0;
    for (const q of comGabarito) {
      const correta = q.alternativas.find((a) => a.correta)!;
      const outras = q.alternativas.filter((a) => !a.correta);
      const mediaOutras = outras.reduce((s, a) => s + a.texto.length, 0) / Math.max(1, outras.length);
      if (correta.texto.length > mediaOutras) maisLonga++;
      if (CONECTIVOS.some((c) => new RegExp(`\\b${c}\\b`, "i").test(correta.texto))) comAbsoluto++;
      const fim = correta.texto.replace(/[.;:}]+$/, "").slice(-1).toLowerCase();
      if (/[aeiouáéíóúãõâêô]/.test(fim)) terminaVogal++;
    }
    const pct = (n: number) => Math.round((n / comGabarito.length) * 100);
    resumo.push(`A alternativa correta é mais longa que a média dos distratores em {{azul|${pct(maisLonga)}%}} das questões.`);
    resumo.push(`Termos restritivos/absolutos (salvo, apenas, sempre, nunca) aparecem na correta em {{vermelho|${pct(comAbsoluto)}%}} dos casos — nos distratores é o padrão clássico de erro.`);
    resumo.push(`A correta termina em vogal em {{amarelo|${pct(terminaVogal)}%}} das questões.`);
  } else {
    resumo.push(
      "Nenhum gabarito foi encontrado. Inclua o gabarito no formato {{amarelo|1-A, 2-C, 3-B}} para o modo local calcular os padrões da alternativa correta.",
    );
  }

  const invertidas = questoes.reduce(
    (s, q) => s + q.frases.filter((f) => f.sentido === "invertida").length,
    0,
  );
  if (invertidas) {
    resumo.push(`${invertidas} frase(s) com construção negativa/invertida ("não", "exceto", "incorreta") — leia duas vezes antes de marcar.`);
  }
  resumo.push("Modo local: análise estatística feita no seu navegador, sem consumir créditos de IA.");

  return { resumo, questoes };
}
