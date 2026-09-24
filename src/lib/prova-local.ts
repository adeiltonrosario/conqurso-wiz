/**
 * Montagem da prova interativa SEM IA: usa as questões extraídas dos PDFs das
 * provas e as questões cadastradas manualmente no acervo.
 */
import type { Questao } from "./ai.functions";
import type { Acervo, QuestaoCadastrada } from "./acervo";
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

/** Banco local completo (PDFs + acervo), já filtrado pelo edital/banca/cargo. */
export function bancoLocal(edital: EditalEstado, acervo: Acervo, extras: Questao[] = []) {
  const mapa = new Map<string, Questao>();
  for (const q of [...acervo.extraidas, ...extras]) mapa.set(q.id, q);
  for (const q of acervo.questoes) {
    const convertida = daCadastrada(edital, q);
    mapa.set(convertida.id, convertida);
  }
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
 * Seleciona até `alvo` questões da matéria, priorizando as que já têm gabarito
 * e explicação (questões resolvidas) e distribuindo entre os assuntos do edital.
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
  const ordenadas = [...naMateria].sort(
    (a, b) => pontuar(b) - pontuar(a) || (a.numero ?? 0) - (b.numero ?? 0),
  );

  // Rodízio por assunto para não concentrar tudo no mesmo tópico.
  const porAssunto = new Map<string, Questao[]>();
  for (const q of ordenadas) {
    const chave = q.assunto ?? "—";
    const lista = porAssunto.get(chave) ?? [];
    lista.push(q);
    porAssunto.set(chave, lista);
  }
  const filas = Array.from(porAssunto.values());
  const escolhidas: Questao[] = [];
  let restou = true;
  while (escolhidas.length < alvo && restou) {
    restou = false;
    for (const fila of filas) {
      const proxima = fila.shift();
      if (!proxima) continue;
      restou = true;
      escolhidas.push(proxima);
      if (escolhidas.length >= alvo) break;
    }
  }

  return {
    questoes: escolhidas,
    faltam: Math.max(0, alvo - escolhidas.length),
    disponiveis: naMateria.length,
    semGabarito: escolhidas.filter((q) => !temGabarito(q)).length,
  };
}
