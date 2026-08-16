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

/** Gabarito em formatos "1-A", "1) B", "01 C", "1. D". */
export function extrairGabarito(texto: string): Record<number, string> {
  const mapa: Record<number, string> = {};
  const re = /\b(\d{1,3})\s*[-—.)]?\s*([A-Ea-e])\b(?![a-zà-ú])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const n = Number(m[1]);
    if (n > 0 && n < 400) mapa[n] = String(m[2]).toUpperCase();
  }
  return mapa;
}

export function separarQuestoes(texto: string): QuestaoBruta[] {
  const limpo = limpar(texto);
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
      const t = corpo.slice(atual.fim, proxima ? proxima.inicio : corpo.length).trim();
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
