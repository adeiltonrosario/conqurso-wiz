import { useEffect, useState } from "react";

/**
 * Trilha de estudo: calendário montado manualmente pelo candidato, com cargo,
 * data prevista da prova e o ponto exato onde ele parou no dia anterior.
 * Tudo salvo no próprio aparelho.
 */
export type Tarefa = {
  id: string;
  /** Data no formato YYYY-MM-DD. */
  data: string;
  materia: string;
  topico: string;
  /** Rota do app onde a tarefa é executada (ex.: /leis, /questoes). */
  rota: string;
  minutos: number;
  concluida: boolean;
};

export type UltimoPonto = {
  tarefaId: string;
  rota: string;
  rotulo: string;
  data: string;
  quando: number;
};

export type Trilha = {
  cargo: string;
  banca: string;
  /** Data prevista da prova (YYYY-MM-DD). */
  dataProva: string;
  tarefas: Tarefa[];
  ultimoPonto: UltimoPonto | null;
};

const KEY = "concurseiro:trilha";

const VAZIA: Trilha = {
  cargo: "",
  banca: "",
  dataProva: "",
  tarefas: [],
  ultimoPonto: null,
};

export const DESTINOS = [
  { rota: "/leis", label: "Ler a lei resumida" },
  { rota: "/questoes", label: "Resolver questões" },
  { rota: "/revisao", label: "Revisão espaçada" },
  { rota: "/prova-interativa", label: "Prova interativa" },
  { rota: "/analise-padroes", label: "Análise de padrões" },
  { rota: "/redacao", label: "Redação" },
] as const;

export function lerTrilha(): Trilha {
  if (typeof window === "undefined") return VAZIA;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...VAZIA, ...(JSON.parse(raw) as Trilha) } : VAZIA;
  } catch {
    return VAZIA;
  }
}

function salvar(trilha: Trilha) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(trilha));
  window.dispatchEvent(new Event("trilha:mudou"));
}

export function iso(data: Date) {
  const ano = data.getFullYear();
  const mes = `${data.getMonth() + 1}`.padStart(2, "0");
  const dia = `${data.getDate()}`.padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function hojeIso() {
  return iso(new Date());
}

export function formatarData(dataIso: string) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diasAte(dataIso: string) {
  if (!dataIso) return null;
  const alvo = new Date(`${dataIso}T00:00:00`);
  const hoje = new Date(`${hojeIso()}T00:00:00`);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export function tarefasDoDia(trilha: Trilha, dataIso: string) {
  return trilha.tarefas.filter((t) => t.data === dataIso);
}

/**
 * Onde retomar: o ponto marcado ao abrir uma tarefa ou, na falta dele,
 * a tarefa pendente mais recente de dias anteriores.
 */
export function pontoDeRetomada(trilha: Trilha): UltimoPonto | null {
  if (trilha.ultimoPonto) {
    const tarefa = trilha.tarefas.find((t) => t.id === trilha.ultimoPonto!.tarefaId);
    if (tarefa && !tarefa.concluida) return trilha.ultimoPonto;
  }
  const hoje = hojeIso();
  const pendente = trilha.tarefas
    .filter((t) => !t.concluida && t.data < hoje)
    .sort((a, b) => (a.data < b.data ? 1 : -1))[0];
  if (!pendente) return null;
  return {
    tarefaId: pendente.id,
    rota: pendente.rota,
    rotulo: `${pendente.materia} — ${pendente.topico}`,
    data: pendente.data,
    quando: 0,
  };
}

export function progressoGeral(trilha: Trilha) {
  const total = trilha.tarefas.length;
  const feitas = trilha.tarefas.filter((t) => t.concluida).length;
  return { total, feitas, taxa: total ? feitas / total : 0 };
}

export function useTrilha() {
  const [trilha, setTrilha] = useState<Trilha>(VAZIA);

  useEffect(() => {
    const sync = () => setTrilha(lerTrilha());
    sync();
    window.addEventListener("trilha:mudou", sync);
    return () => window.removeEventListener("trilha:mudou", sync);
  }, []);

  const aplicar = (patch: Partial<Trilha>) => {
    const proximo = { ...lerTrilha(), ...patch };
    salvar(proximo);
    setTrilha(proximo);
  };

  const adicionarTarefa = (tarefa: Omit<Tarefa, "id" | "concluida">) => {
    const atual = lerTrilha();
    aplicar({
      tarefas: [
        ...atual.tarefas,
        { ...tarefa, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, concluida: false },
      ],
    });
  };

  const alternarTarefa = (id: string) => {
    const atual = lerTrilha();
    aplicar({
      tarefas: atual.tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
      ultimoPonto:
        atual.ultimoPonto?.tarefaId === id ? null : atual.ultimoPonto,
    });
  };

  const removerTarefa = (id: string) => {
    const atual = lerTrilha();
    aplicar({
      tarefas: atual.tarefas.filter((t) => t.id !== id),
      ultimoPonto: atual.ultimoPonto?.tarefaId === id ? null : atual.ultimoPonto,
    });
  };

  const marcarPonto = (tarefa: Tarefa) => {
    aplicar({
      ultimoPonto: {
        tarefaId: tarefa.id,
        rota: tarefa.rota,
        rotulo: `${tarefa.materia} — ${tarefa.topico}`,
        data: tarefa.data,
        quando: Date.now(),
      },
    });
  };

  return { trilha, aplicar, adicionarTarefa, alternarTarefa, removerTarefa, marcarPonto };
}
