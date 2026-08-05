import { useEffect, useState } from "react";
import { MATERIAS_ESPECIFICO, MATERIAS_GERAL } from "./acervo";

/**
 * Matérias vindas do edital do candidato. Somam-se às listas padrão do app
 * em todas as telas (Questões, Leis, Prova, Padrões e Trilha).
 */
export type GrupoEdital = "Conhecimento Geral" | "Conhecimento Específico";

export type MateriaEdital = {
  id: string;
  nome: string;
  grupo: GrupoEdital;
  topicos: string[];
  /** Relevância da matéria na prova, em % do total de questões. */
  relevancia?: number;
  /** Relevância de cada tópico DENTRO da matéria, em %. */
  relevanciaTopicos?: Record<string, number>;
};


export type EditalEstado = {
  texto: string;
  materias: MateriaEdital[];
  /** Cargos previstos no edital — usados como filtro na Trilha. */
  cargos: string[];
};

const KEY = "concurseiro:edital";

const VAZIO: EditalEstado = { texto: "", materias: [], cargos: [] };

export function lerEdital(): EditalEstado {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...VAZIO, ...(JSON.parse(raw) as EditalEstado) } : VAZIO;
  } catch {
    return VAZIO;
  }
}

function salvar(estado: EditalEstado) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(estado));
  window.dispatchEvent(new Event("edital:mudou"));
}

export function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useEdital() {
  const [edital, setEdital] = useState<EditalEstado>(VAZIO);

  useEffect(() => {
    const sync = () => setEdital(lerEdital());
    sync();
    window.addEventListener("edital:mudou", sync);
    return () => window.removeEventListener("edital:mudou", sync);
  }, []);

  const aplicar = (patch: Partial<EditalEstado>) => {
    const proximo = { ...lerEdital(), ...patch };
    salvar(proximo);
    setEdital(proximo);
  };

  const definirMaterias = (materias: MateriaEdital[]) => aplicar({ materias });

  const adicionarMateria = (nome: string, grupo: GrupoEdital) => {
    const atual = lerEdital();
    aplicar({
      materias: [...atual.materias, { id: novoId(), nome, grupo, topicos: [] }],
    });
  };

  const atualizarMateria = (id: string, patch: Partial<Omit<MateriaEdital, "id">>) => {
    const atual = lerEdital();
    aplicar({
      materias: atual.materias.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  const removerMateria = (id: string) => {
    const atual = lerEdital();
    aplicar({ materias: atual.materias.filter((m) => m.id !== id) });
  };

  return { edital, aplicar, definirMaterias, adicionarMateria, atualizarMateria, removerMateria };
}

function unicos(nomes: string[]) {
  const vistos = new Set<string>();
  return nomes.filter((n) => {
    const chave = n.trim().toLowerCase();
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Matérias do edital de um grupo somadas às padrão daquele grupo. */
export function materiasPorGrupo(edital: EditalEstado, grupo: GrupoEdital) {
  const doEdital = edital.materias.filter((m) => m.grupo === grupo).map((m) => m.nome);
  const padrao = grupo === "Conhecimento Geral" ? MATERIAS_GERAL : MATERIAS_ESPECIFICO;
  return unicos([...doEdital, ...padrao]);
}

/** Todas as matérias: as do edital primeiro, depois as padrão. */
export function todasAsMaterias(edital: EditalEstado) {
  return unicos([
    ...edital.materias.map((m) => m.nome),
    ...MATERIAS_GERAL,
    ...MATERIAS_ESPECIFICO,
  ]);
}

export function ehDoEdital(edital: EditalEstado, nome: string) {
  return edital.materias.some((m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase());
}

export function grupoDaMateria(edital: EditalEstado, nome: string): GrupoEdital {
  const achada = edital.materias.find(
    (m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
  if (achada) return achada.grupo;
  return MATERIAS_ESPECIFICO.includes(nome) ? "Conhecimento Específico" : "Conhecimento Geral";
}

export function topicosDaMateria(edital: EditalEstado, nome: string) {
  const achada = edital.materias.find(
    (m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
  return achada?.topicos ?? [];
}

/** Recorte do edital enviado à IA para as gerações ficarem no conteúdo cobrado. */
export function contextoDoEdital(edital: EditalEstado, materia?: string) {
  if (!edital.materias.length) return "";
  const alvo = materia
    ? edital.materias.filter((m) => m.nome.trim().toLowerCase() === materia.trim().toLowerCase())
    : edital.materias;
  const lista = (alvo.length ? alvo : edital.materias)
    .map((m) => `- ${m.nome} (${m.grupo}): ${m.topicos.join("; ") || "sem tópicos detalhados"}`)
    .join("\n");
  return `CONTEÚDO PROGRAMÁTICO DO EDITAL:\n${lista}`;
}

/** Relevância do tópico dentro da matéria (%). */
export function relevanciaNaDisciplina(materia: MateriaEdital, topico: string) {
  return materia.relevanciaTopicos?.[topico];
}

/** Relevância geral do tópico na prova (%) = relevância da matéria × relevância na disciplina. */
export function relevanciaGeral(materia: MateriaEdital, topico: string) {
  const disciplina = materia.relevanciaTopicos?.[topico];
  if (materia.relevancia == null || disciplina == null) return undefined;
  return (materia.relevancia * disciplina) / 100;
}

/** Matérias do edital ordenadas da mais cobrada para a menos cobrada. */
export function materiasPorRelevancia(edital: EditalEstado) {
  return [...edital.materias].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
}

/** Tópicos de uma matéria ordenados por relevância na disciplina. */
export function topicosPorRelevancia(materia: MateriaEdital) {
  return [...materia.topicos].sort(
    (a, b) => (materia.relevanciaTopicos?.[b] ?? 0) - (materia.relevanciaTopicos?.[a] ?? 0),
  );
}
