/**
 * Montagem da prova interativa SEM IA: usa as questões extraídas dos PDFs das
 * provas e as questões cadastradas manualmente no acervo.
 */
import type { Questao } from "./ai.functions";
import type { Acervo, QuestaoCadastrada } from "./acervo";
import { questoesTreinaveis, type QuestaoCadernoMuse } from "./caderno-muse";
import { top5DaMateria } from "./leis-resumidas";
import {
  grupoDaMateria,
  questaoPermitida,
  todasAsMaterias,
  topicosDaMateria,
  type EditalEstado,
} from "./edital";
import {
  classificarQuestao,
  NAO_CLASSIFICADA,
  questoesDaMateria,
  temGabarito,
  tituloDaQuestao,
} from "./questoes-pdf";

function chave(t: string) {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matéria e assunto declarados no cadastro da questão ("Matéria — Assunto").
 * A escolha do usuário manda: só cai na classificação por palavras-chave
 * quando o campo não corresponde a nenhuma matéria do edital.
 */
function declarados(edital: EditalEstado, q: QuestaoCadastrada) {
  const bruto = (q.assunto ?? "").trim();
  if (!bruto) return null;
  const [primeiro, ...resto] = bruto.split(/\s*[—–-]\s*/);
  const nomeMateria = (primeiro ?? "").trim();
  const topico = resto.join(" - ").trim();
  if (!nomeMateria) return null;
  const materia = todasAsMaterias(edital).find((m) => chave(m) === chave(nomeMateria));
  if (!materia) return null;
  if (!topico) return { materia };
  const topicos = topicosDaMateria(edital, materia);
  const achadoTopico = topicos.find((t) => chave(t) === chave(topico));
  return { materia, assunto: achadoTopico ?? topico };
}

/** Converte uma questão cadastrada à mão no acervo para o formato padrão. */
export function daCadastrada(edital: EditalEstado, q: QuestaoCadastrada): Questao {
  const escolhido = declarados(edital, q);
  const achado =
    escolhido ??
    classificarQuestao(edital, `${q.assunto} ${q.enunciado} ${q.alternativas.join(" ")}`);
  const materia = achado?.materia ?? NAO_CLASSIFICADA;
  const assunto = achado?.assunto;
  return {
    id: `acervo:${q.id}`,
    banca: q.banca,
    grupo:
      materia === NAO_CLASSIFICADA ? "Conhecimento Geral" : grupoDaMateria(edital, materia),
    materia,
    ...(assunto ? { assunto } : {}),
    titulo: tituloDaQuestao({
      materia,
      ...(assunto ? { assunto } : {}),
      banca: q.banca,
    }),
    origem: "Cadastrada no acervo",
    enunciado: q.enunciado,
    alternativas: q.alternativas.map((texto, i) => {
      const letra = q.formato === "certo-errado" ? texto : String.fromCharCode(65 + i);
      return {
        letra,
        texto,
        correta: q.correta.trim().toLowerCase() === letra.trim().toLowerCase(),
        explicacao: "",
      };
    }),
    explicacao: q.explicacao?.trim() ?? "",
  };
}

/** Prefixo das questões do Caderno Muse no banco (não colide com `pdf:`, `quest:` e `acervo:`). */
export const PREFIXO_CADERNO = "caderno:";

/** Uma questão do banco é do Caderno Muse (verificada, só leitura no Treinar). */
export function ehDoCaderno(q: Questao) {
  return q.id.startsWith(PREFIXO_CADERNO);
}

const LETRAS = "ABCDEFGH";

/**
 * Converte uma questão treinável do Caderno Muse para o formato padrão.
 * A banca é VUNESP (todas as 111 são de provas oficiais VUNESP); o `insight`
 * vira a explicação; quando não há assunto, o artigo cobrado ocupa o lugar.
 */
export function daCadernoMuse(edital: EditalEstado, q: QuestaoCadernoMuse): Questao {
  const assunto = q.assunto ?? q.artigo ?? undefined;
  return {
    id: `${PREFIXO_CADERNO}${q.id}`,
    banca: "VUNESP",
    grupo: grupoDaMateria(edital, q.materia),
    materia: q.materia,
    ...(assunto ? { assunto } : {}),
    titulo: tituloDaQuestao({
      materia: q.materia,
      ...(assunto ? { assunto } : {}),
      banca: "VUNESP",
      ...(q.ano ? { ano: q.ano } : {}),
    }),
    ...(q.ano ? { ano: q.ano } : {}),
    origem: "Caderno Muse",
    ...(q.prova ? { prova: q.prova } : {}),
    ...(typeof q.numero === "number" ? { numero: q.numero } : {}),
    enunciado: q.enunciado,
    alternativas: q.alternativas.map((a, i) => ({
      letra: LETRAS[i] ?? "?",
      texto: a.texto,
      correta: a.correta,
      explicacao: a.porQue ?? "",
    })),
    explicacao: q.insight,
  };
}

/** Questões treináveis do Caderno Muse, já no formato padrão (103). */
export function questoesDoCaderno(edital: EditalEstado): Questao[] {
  return questoesTreinaveis()
    .map((q) => daCadernoMuse(edital, q))
    .filter((q) => q.enunciado.trim().length > 10);
}

/** Banco local completo (PDFs + acervo), já filtrado pelo edital/banca/cargo. */
export function bancoLocal(edital: EditalEstado, acervo: Acervo, extras: Questao[] = []) {
  const mapa = new Map<string, Questao>();
  for (const q of [...acervo.extraidas, ...extras]) mapa.set(q.id, q);
  for (const q of acervo.questoes) {
    const convertida = daCadastrada(edital, q);
    mapa.set(convertida.id, convertida);
  }
  for (const q of questoesDoCaderno(edital)) mapa.set(q.id, q);
  return Array.from(mapa.values()).filter((q) => questaoPermitida(edital, q));
}

export type ProvaMontada = {
  questoes: Questao[];
  /** Quantas ainda faltam para atingir o alvo (0 quando completou). */
  faltam: number;
  /** Disponíveis na matéria, incluindo as sem gabarito. */
  disponiveis: number;
  semGabarito: number;
};

/**
 * Seleciona até `alvo` questões da matéria, principalmente do Top 5:
 * 3/4 das vagas (15 de 20) vão para os 5 assuntos/artigos mais cobrados da
 * matéria; o resto vai para os outros assuntos cobrados. Se o Top 5 não
 * tiver o suficiente, completa com os outros; se os outros não tiverem,
 * volta ao Top 5. Dentro de cada grupo, prioriza as que já têm gabarito
 * e explicação (questões resolvidas) e faz rodízio por assunto para não
 * concentrar tudo no mesmo tópico.
 */
export function montarProvaLocal(
  banco: Questao[],
  materia: string,
  alvo: number,
  assunto?: string | null,
): ProvaMontada {
  const naMateria = questoesDaMateria(banco, materia).filter(
    (q) => !assunto || q.assunto === assunto,
  );
  const pontuar = (q: Questao) =>
    (temGabarito(q) ? 2 : 0) + (q.explicacao?.trim() ? 1 : 0);
  const ordenar = (lista: Questao[]) =>
    [...lista].sort((a, b) => pontuar(b) - pontuar(a) || (a.numero ?? 0) - (b.numero ?? 0));

  /** Nomes normalizados dos 5 itens mais cobrados da matéria. */
  const top5 = new Set(top5DaMateria(materia).map((t) => chave(t.artigo)));
  const ehTop5 = (q: Questao) => !!q.assunto && top5.has(chave(q.assunto));

  // Rodízio por assunto para não concentrar tudo no mesmo tópico.
  const rodizio = (ordenadas: Questao[], n: number, jaEscolhidas: Set<string>) => {
    const porAssunto = new Map<string, Questao[]>();
    for (const q of ordenadas) {
      if (jaEscolhidas.has(q.id)) continue;
      const nomeAssunto = q.assunto ?? "—";
      const lista = porAssunto.get(nomeAssunto) ?? [];
      lista.push(q);
      porAssunto.set(nomeAssunto, lista);
    }
    const filas = Array.from(porAssunto.values());
    const escolhidas: Questao[] = [];
    let restou = true;
    while (escolhidas.length < n && restou) {
      restou = false;
      for (const fila of filas) {
        const proxima = fila.shift();
        if (!proxima) continue;
        restou = true;
        escolhidas.push(proxima);
        if (escolhidas.length >= n) break;
      }
    }
    return escolhidas;
  };

  const doTop5 = ordenar(naMateria.filter(ehTop5));
  const dosOutros = ordenar(naMateria.filter((q) => !ehTop5(q)));
  const escolhidas: Questao[] = [];
  const ids = new Set<string>();
  const pegar = (lista: Questao[], n: number) => {
    if (n <= 0) return;
    for (const q of rodizio(lista, n, ids)) {
      ids.add(q.id);
      escolhidas.push(q);
    }
  };
  pegar(doTop5, Math.ceil((alvo * 3) / 4));
  pegar(dosOutros, alvo - escolhidas.length);
  pegar(doTop5, alvo - escolhidas.length);

  return {
    questoes: escolhidas,
    faltam: Math.max(0, alvo - escolhidas.length),
    disponiveis: naMateria.length,
    semGabarito: escolhidas.filter((q) => !temGabarito(q)).length,
  };
}
