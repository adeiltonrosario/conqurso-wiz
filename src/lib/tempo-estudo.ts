import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Relógio automático de estudo — sem botão de start/stop e sem IA.
 *
 * Abrir uma tela já começa a contar: /leis conta como leitura, /questoes,
 * /prova-interativa e /analise-padroes contam como questões, /revisao e
 * /flashcards contam como revisão. Trocar de tela pausa a atividade
 * anterior e começa a nova na hora; voltar para a mesma lei retoma o
 * tempo dela, somando no total daquela lei no dia.
 *
 * Tudo fica só no aparelho (localStorage), como os outros estados locais
 * (leituras, trilha, edital). O ciclo é o dia local (00h–23h59): à
 * meia-noite o dia fecha e começa um novo, com os últimos 30 dias no
 * histórico. A contagem pausa sozinha quando a aba fica oculta, a janela
 * perde o foco ou passam 5 minutos sem interação.
 *
 * O núcleo é puro e testável: as funções recebem o estado e `agora` (ms)
 * e devolvem um estado novo, sem tocar em `window`. A persistência e o
 * rastreador (um só, no AppShell) ficam no fim do arquivo.
 */
export type Atividade = "leitura" | "questoes" | "revisao" | "outro";

export const ROTULOS_ATIVIDADE: Record<Atividade, string> = {
  leitura: "Leitura",
  questoes: "Questões",
  revisao: "Revisão",
  outro: "Outro",
};

/** Atividades que somam no total de estudo do dia. */
export const ATIVIDADES_ESTUDO: Atividade[] = ["leitura", "questoes", "revisao"];

export const CHAVE_TEMPO_ESTUDO = "concurseiro:tempo-estudo";
export const EVENTO_TEMPO_ESTUDO = "tempo-estudo:mudou";
export const EVENTO_LEI_ATUAL = "tempo-estudo:lei-mudou";
/** Nome usado quando a leitura não tem uma lei aberta. */
export const LEITURA_GERAL = "Leitura geral";
/** Sem interação por 5 minutos, a contagem pausa sozinha. */
export const IDLE_MS = 5 * 60 * 1000;
/** Quantos dias passados ficam guardados no histórico. */
export const HISTORICO_DIAS = 30;

export type DiaTempo = {
  /** Data local no formato YYYY-MM-DD. */
  data: string;
  /** Segundos acumulados por atividade (só o que já foi fechado). */
  porAtividade: Record<Atividade, number>;
  /** Segundos acumulados por lei aberta na tela Leis. */
  porLei: Record<string, number>;
};

export type Segmento = {
  atividade: Atividade;
  /** Lei aberta, só quando a atividade é leitura. */
  lei: string | null;
  /** Início do trecho em contagem (ms) ou null quando pausado. */
  inicio: number | null;
  pausado: boolean;
};

export type TempoEstudoEstado = {
  hoje: DiaTempo;
  /** Dias anteriores, do mais antigo para o mais recente. */
  historico: DiaTempo[];
  /** Trecho em contagem agora (ou pausado, esperando retomada). */
  segmento: Segmento | null;
};

export function diaIso(data: Date) {
  const ano = data.getFullYear();
  const mes = `${data.getMonth() + 1}`.padStart(2, "0");
  const dia = `${data.getDate()}`.padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function inicioDoDia(agora: number) {
  const d = new Date(agora);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function diaVazio(data: string): DiaTempo {
  return {
    data,
    porAtividade: { leitura: 0, questoes: 0, revisao: 0, outro: 0 },
    porLei: {},
  };
}

export function estadoVazio(agora: number): TempoEstudoEstado {
  return { hoje: diaVazio(diaIso(new Date(agora))), historico: [], segmento: null };
}

/** "38s" · "45min" · "1h23min" · "2h05min". */
export function formatarTempo(segundos: number) {
  const total = Math.max(0, Math.floor(segundos));
  if (total < 60) return `${total}s`;
  const minutos = Math.floor(total / 60);
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h${String(resto).padStart(2, "0")}min`;
}

/** Total de estudo de um dia (leitura + questões + revisão). */
export function totalDia(dia: DiaTempo) {
  return ATIVIDADES_ESTUDO.reduce((s, a) => s + (dia.porAtividade[a] ?? 0), 0);
}

/** Tempo por lei no dia, do maior para o menor. */
export function leisDoDia(dia: DiaTempo) {
  return Object.entries(dia.porLei)
    .filter(([, segundos]) => segundos > 0)
    .map(([lei, segundos]) => ({ lei, segundos }))
    .sort((a, b) => b.segundos - a.segundos);
}

function somar(dia: DiaTempo, atividade: Atividade, lei: string | null, segundos: number): DiaTempo {
  if (segundos <= 0) return dia;
  const porAtividade = { ...dia.porAtividade, [atividade]: (dia.porAtividade[atividade] ?? 0) + segundos };
  const porLei =
    atividade === "leitura" && lei
      ? { ...dia.porLei, [lei]: (dia.porLei[lei] ?? 0) + segundos }
      : dia.porLei;
  return { ...dia, porAtividade, porLei };
}

/**
 * Fecha o segmento aberto acumulando o trecho decorrido até `agora` no
 * dia atual. Assume o segmento no mesmo dia (chame `virarDia` antes
 * quando o trecho pode cruzar a meia-noite). Devolve o estado sem
 * segmento aberto.
 */
export function fecharSegmento(estado: TempoEstudoEstado, agora: number): TempoEstudoEstado {
  const segmento = estado.segmento;
  if (!segmento || segmento.pausado || segmento.inicio == null) {
    return { ...estado, segmento: null };
  }
  const segundos = Math.floor((agora - segmento.inicio) / 1000);
  return {
    ...estado,
    hoje: somar(estado.hoje, segmento.atividade, segmento.lei, segundos),
    segmento: null,
  };
}

/**
 * Virada de dia: o trecho do segmento até a meia-noite fica no dia
 * anterior (que vai para o histórico), e o segmento recomeça à
 * meia-noite no dia novo, com a mesma atividade e lei.
 */
export function virarDia(estado: TempoEstudoEstado, agora: number): TempoEstudoEstado {
  const hojeIso = diaIso(new Date(agora));
  if (estado.hoje.data === hojeIso) return estado;
  const meiaNoite = inicioDoDia(agora);
  let hoje = estado.hoje;
  let segmento = estado.segmento;
  if (segmento && !segmento.pausado && segmento.inicio != null) {
    const segundos = Math.floor((meiaNoite - segmento.inicio) / 1000);
    hoje = somar(hoje, segmento.atividade, segmento.lei, segundos);
    segmento = { ...segmento, inicio: meiaNoite };
  }
  const historico =
    totalDia(hoje) > 0 ? [...estado.historico, hoje].slice(-HISTORICO_DIAS) : estado.historico;
  return { hoje: diaVazio(hojeIso), historico, segmento };
}

/** Lei efetiva de um segmento de leitura (sem lei, "leitura geral"). */
function leiDoSegmento(lei: string | null | undefined) {
  const limpa = (lei ?? "").trim();
  return limpa || LEITURA_GERAL;
}

/**
 * Troca a atividade em contagem: fecha o trecho anterior e abre outro.
 * Trocar para a mesma atividade e mesma lei não faz nada. Trocar para
 * "outro" só fecha o trecho (Incluir, Redação, Auth e a home não contam).
 */
export function trocarAtividade(
  estado: TempoEstudoEstado,
  atividade: Atividade,
  lei: string | null,
  agora: number,
): TempoEstudoEstado {
  const atual = virarDia(estado, agora);
  const leiEfetiva = atividade === "leitura" ? leiDoSegmento(lei) : null;
  const segmento = atual.segmento;
  if (
    segmento &&
    !segmento.pausado &&
    segmento.atividade === atividade &&
    segmento.lei === leiEfetiva
  ) {
    return atual;
  }
  const fechado = fecharSegmento(atual, agora);
  if (atividade === "outro") return fechado;
  return {
    ...fechado,
    segmento: { atividade, lei: leiEfetiva, inicio: agora, pausado: false },
  };
}

/**
 * Troca a lei em contagem dentro da leitura: fecha o trecho da lei
 * anterior (o acumulado do dia dela fica guardado) e abre outro para a
 * nova lei. Fora da leitura, não faz nada — a lei é aplicada quando a
 * leitura começar.
 */
export function definirLei(
  estado: TempoEstudoEstado,
  lei: string | null,
  agora: number,
): TempoEstudoEstado {
  const segmento = estado.segmento;
  if (!segmento || segmento.atividade !== "leitura") return estado;
  const nova = leiDoSegmento(lei);
  if (segmento.lei === nova) return estado;
  const fechado = fecharSegmento(virarDia(estado, agora), agora);
  if (segmento.pausado) {
    return { ...fechado, segmento: { atividade: "leitura", lei: nova, inicio: null, pausado: true } };
  }
  return {
    ...fechado,
    segmento: { atividade: "leitura", lei: nova, inicio: agora, pausado: false },
  };
}

/** Pausa a contagem, guardando o trecho decorrido; a retomada soma no mesmo dia. */
export function pausar(estado: TempoEstudoEstado, agora: number): TempoEstudoEstado {
  const segmento = estado.segmento;
  if (!segmento || segmento.pausado) return estado;
  const fechado = fecharSegmento(virarDia(estado, agora), agora);
  return {
    ...fechado,
    segmento: { ...segmento, inicio: null, pausado: true },
  };
}

/** Retoma um segmento pausado a partir de `agora`. */
export function retomar(estado: TempoEstudoEstado, agora: number): TempoEstudoEstado {
  const segmento = estado.segmento;
  if (!segmento || !segmento.pausado) return estado;
  return { ...estado, segmento: { ...segmento, inicio: agora, pausado: false } };
}

/**
 * Totais do dia incluindo o trecho em contagem até `agora`, sem mudar o
 * estado guardado — é o que a tela mostra ao vivo, a cada segundo.
 */
export function totaisAoVivo(estado: TempoEstudoEstado, agora: number): DiaTempo {
  const atual = virarDia(estado, agora);
  const segmento = atual.segmento;
  if (!segmento || segmento.pausado || segmento.inicio == null) return atual.hoje;
  const segundos = Math.floor((agora - segmento.inicio) / 1000);
  return somar(atual.hoje, segmento.atividade, segmento.lei, segundos);
}

/** Atividade que uma rota conta. Rotas fora da lista não contam como estudo. */
export function atividadeDaRota(pathname: string): Atividade {
  const rota = pathname.split("?")[0] ?? "";
  if (rota === "/leis") return "leitura";
  if (rota === "/questoes" || rota === "/prova-interativa" || rota === "/analise-padroes") return "questoes";
  if (rota === "/revisao" || rota === "/flashcards") return "revisao";
  return "outro";
}

/* ------------------------------------------------------------------ */
/* Persistência (localStorage, como leituras/trilha/edital)            */
/* ------------------------------------------------------------------ */

function normalizarDia(bruto: unknown, data: string): DiaTempo {
  const vazio = diaVazio(data);
  if (!bruto || typeof bruto !== "object") return vazio;
  const b = bruto as Partial<DiaTempo>;
  const porAtividade: Record<Atividade, number> = { ...vazio.porAtividade };
  for (const a of ATIVIDADES_ESTUDO) {
    const v = (b.porAtividade as Record<string, unknown> | undefined)?.[a];
    porAtividade[a] = typeof v === "number" && v > 0 ? Math.floor(v) : 0;
  }
  const porLei: Record<string, number> = {};
  if (b.porLei && typeof b.porLei === "object") {
    for (const [lei, segundos] of Object.entries(b.porLei)) {
      if (typeof segundos === "number" && segundos > 0 && lei.trim()) porLei[lei] = Math.floor(segundos);
    }
  }
  return { data: typeof b.data === "string" && b.data ? b.data : data, porAtividade, porLei };
}

export function lerTempoEstudo(): TempoEstudoEstado {
  if (typeof window === "undefined") return estadoVazio(Date.now());
  try {
    const raw = window.localStorage.getItem(CHAVE_TEMPO_ESTUDO);
    if (!raw) return estadoVazio(Date.now());
    const bruto = JSON.parse(raw) as Partial<TempoEstudoEstado>;
    const hojeIso = diaIso(new Date());
    const hoje = normalizarDia(bruto.hoje, hojeIso);
    const historico = Array.isArray(bruto.historico)
      ? bruto.historico
          .map((d) => normalizarDia(d, typeof d === "object" && d !== null ? (d as DiaTempo).data ?? "" : ""))
          .filter((d) => d.data && d.data !== hojeIso)
          .slice(-HISTORICO_DIAS)
      : [];
    const s = bruto.segmento;
    const segmento: Segmento | null =
      s && typeof s === "object" && (s.atividade === "leitura" || s.atividade === "questoes" || s.atividade === "revisao")
        ? {
            atividade: s.atividade,
            lei: typeof s.lei === "string" ? s.lei : null,
            inicio: typeof s.inicio === "number" && s.inicio > 0 ? s.inicio : null,
            pausado: s.pausado === true || s.inicio == null,
          }
        : null;
    return { hoje, historico, segmento };
  } catch {
    return estadoVazio(Date.now());
  }
}

export function salvarTempoEstudo(estado: TempoEstudoEstado) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_TEMPO_ESTUDO, JSON.stringify(estado));
  window.dispatchEvent(new Event(EVENTO_TEMPO_ESTUDO));
}

/** Aplica uma transformação pura ao estado guardado e salva. */
function aplicar(transformar: (estado: TempoEstudoEstado, agora: number) => TempoEstudoEstado) {
  const agora = Date.now();
  salvarTempoEstudo(transformar(lerTempoEstudo(), agora));
}

/* ------------------------------------------------------------------ */
/* Lei atual (informada pela tela Leis) e rastreador único             */
/* ------------------------------------------------------------------ */

let leiAtual: string | null = null;

/** A tela Leis informa qual lei está aberta; null = nenhuma lei. */
export function definirLeiAtual(nome: string | null) {
  const limpo = (nome ?? "").trim() || null;
  if (limpo === leiAtual) return;
  leiAtual = limpo;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_LEI_ATUAL));
}

export function lerLeiAtual() {
  return leiAtual;
}

let rastreadorIniciado = false;
let ultimaInteracao = Date.now();
let contadorFlush = 0;

function tentarRetomar() {
  if (typeof document !== "undefined" && document.hidden) return;
  aplicar((estado, agora) => retomar(estado, agora));
}

function pausarAgora() {
  aplicar((estado, agora) => pausar(estado, agora));
}

/**
 * Liga o rastreador (uma só vez por carregamento da página): muda a
 * atividade quando a rota muda, troca a lei quando a tela Leis informa
 * outra, pausa quando a aba some ou a janela perde o foco, pausa após
 * 5 minutos sem interação e retoma ao voltar. Também descarrega o
 * trecho em contagem a cada 30 segundos e ao fechar a página, para o
 * tempo não se perder se o navegador fechar.
 */
export function iniciarRastreador() {
  if (typeof window === "undefined" || rastreadorIniciado) return;
  rastreadorIniciado = true;
  ultimaInteracao = Date.now();

  const tocar = () => {
    ultimaInteracao = Date.now();
    tentarRetomar();
  };
  for (const evento of ["pointerdown", "keydown", "scroll", "touchstart"] as const) {
    window.addEventListener(evento, tocar, { capture: true, passive: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pausarAgora();
    else tentarRetomar();
  });
  window.addEventListener("blur", pausarAgora);
  window.addEventListener("focus", tentarRetomar);
  window.addEventListener("beforeunload", () => {
    const agora = Date.now();
    salvarTempoEstudo(fecharSegmento(lerTempoEstudo(), agora));
  });

  window.setInterval(() => {
    const agora = Date.now();
    if (agora - ultimaInteracao > IDLE_MS) pausarAgora();
    contadorFlush += 1;
    if (contadorFlush % 30 === 0) {
      // Descarrega o trecho em contagem e recomeça do agora, para o
      // tempo não se perder se o navegador fechar.
      const lido = lerTempoEstudo();
      const atual = virarDia(lido, agora);
      const segmento = atual.segmento;
      if (segmento && !segmento.pausado && segmento.inicio != null) {
        const fechado = fecharSegmento(atual, agora);
        salvarTempoEstudo({ ...fechado, segmento: { ...segmento, inicio: agora } });
      } else if (atual !== lido) {
        salvarTempoEstudo(atual);
      }
    }
  }, 1000);
}

/** Hook do rastreador: chamar UMA vez, no AppShell. */
export function useRastreadorTempoEstudo() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    iniciarRastreador();
    // Ao trocar de rota, fecha o trecho anterior e abre o da nova tela.
    aplicar((estado, agora) => trocarAtividade(estado, atividadeDaRota(pathname), lerLeiAtual(), agora));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    // Ao trocar a lei aberta na tela Leis, troca o contexto sem perder o acumulado do dia.
    const trocarLei = () => {
      const estado = lerTempoEstudo();
      if (estado.segmento?.atividade === "leitura") {
        aplicar((atual, agora) => definirLei(atual, lerLeiAtual(), agora));
      }
    };
    window.addEventListener(EVENTO_LEI_ATUAL, trocarLei);
    return () => window.removeEventListener(EVENTO_LEI_ATUAL, trocarLei);
  }, []);
}

export type InstantaneoTempo = {
  hoje: DiaTempo;
  historico: DiaTempo[];
  atividade: Atividade;
  lei: string | null;
  pausado: boolean;
  agora: number;
};

/** Instantâneo ao vivo (totais do dia + trecho em contagem). */
export function instantaneoTempo(agora = Date.now()): InstantaneoTempo {
  const estado = virarDia(lerTempoEstudo(), agora);
  const segmento = estado.segmento;
  return {
    hoje: totaisAoVivo(estado, agora),
    historico: estado.historico,
    atividade: segmento?.atividade ?? "outro",
    lei: segmento?.lei ?? null,
    pausado: segmento?.pausado ?? false,
    agora,
  };
}

/** Hook de leitura (pode ser usado em várias telas): só lê, não rastreia. */
export function useTempoEstudo() {
  const [instantaneo, setInstantaneo] = useState<InstantaneoTempo>(() => instantaneoTempo());

  useEffect(() => {
    const atualizar = () => setInstantaneo(instantaneoTempo());
    atualizar();
    const id = window.setInterval(atualizar, 1000);
    window.addEventListener(EVENTO_TEMPO_ESTUDO, atualizar);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(EVENTO_TEMPO_ESTUDO, atualizar);
    };
  }, []);

  return instantaneo;
}
