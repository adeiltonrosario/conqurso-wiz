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
  /** Banca do edital a que esta matéria pertence (vazio = vale para todas). */
  banca?: string | undefined;
  /** Cargo do edital a que esta matéria pertence (vazio = vale para todos). */
  cargo?: string | undefined;
  /** Relevância da matéria na prova, em % do total de questões. */
  relevancia?: number | undefined;
  /** Relevância de cada tópico DENTRO da matéria, em %. */
  relevanciaTopicos?: Record<string, number> | undefined;
};


export type EditalEstado = {
  texto: string;
  materias: MateriaEdital[];
  /** Cargos previstos no edital — usados como filtro na Trilha. */
  cargos: string[];
  /** Bancas previstas/organizadoras do edital — usadas como filtro na Trilha. */
  bancas: string[];
  /** Banca do concurso em estudo — filtra matérias, tópicos e leis. */
  bancaAtiva?: string | undefined;
  /** Cargo do concurso em estudo — filtra matérias, tópicos e leis. */
  cargoAtivo?: string | undefined;
};

const KEY = "concurseiro:edital";

const VAZIO: EditalEstado = {
  texto: "",
  materias: [],
  cargos: [],
  bancas: [],
  bancaAtiva: "",
  cargoAtivo: "",
};


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

  const adicionarCargo = (nome: string) => {
    const atual = lerEdital();
    const limpo = nome.trim();
    if (!limpo) return;
    if ((atual.cargos ?? []).some((c) => c.trim().toLowerCase() === limpo.toLowerCase())) return;
    aplicar({ cargos: [...(atual.cargos ?? []), limpo] });
  };

  const removerCargo = (nome: string) => {
    const atual = lerEdital();
    aplicar({ cargos: (atual.cargos ?? []).filter((c) => c !== nome) });
  };

  const adicionarBanca = (nome: string) => {
    const atual = lerEdital();
    const limpo = nome.trim();
    if (!limpo) return;
    if ((atual.bancas ?? []).some((b) => b.trim().toLowerCase() === limpo.toLowerCase())) return;
    aplicar({ bancas: [...(atual.bancas ?? []), limpo] });
  };

  const definirFiltro = (patch: { banca?: string; cargo?: string }) =>
    aplicar({
      ...(patch.banca === undefined ? {} : { bancaAtiva: patch.banca }),
      ...(patch.cargo === undefined ? {} : { cargoAtivo: patch.cargo }),
    });

  const removerBanca = (nome: string) => {
    const atual = lerEdital();
    aplicar({ bancas: (atual.bancas ?? []).filter((b) => b !== nome) });
  };

  return {
    edital,
    aplicar,
    definirMaterias,
    adicionarMateria,
    atualizarMateria,
    removerMateria,
    adicionarCargo,
    removerCargo,
    adicionarBanca,
    removerBanca,
    definirFiltro,
  };
}

/** Cargos do edital (sem repetições). */
export function cargosDoEdital(edital: EditalEstado) {
  return unicos(edital.cargos ?? []);
}

/** Bancas do edital (sem repetições). */
export function bancasDoEdital(edital: EditalEstado) {
  return unicos(edital.bancas ?? []);
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

function combina(valor: string | undefined, filtro: string | undefined) {
  const f = (filtro ?? "").trim().toLowerCase();
  if (!f) return true;
  const v = (valor ?? "").trim().toLowerCase();
  return !v || v === f;
}

/**
 * Matérias do edital visíveis com o concurso em estudo (banca + cargo ativos).
 * Matérias sem banca/cargo definidos valem para qualquer seleção.
 */
export function materiasAtivas(edital: EditalEstado) {
  return edital.materias.filter(
    (m) => combina(m.banca, edital.bancaAtiva) && combina(m.cargo, edital.cargoAtivo),
  );
}

/**
 * Modo restrito: há matérias do edital para a banca/cargo em estudo, então
 * só elas podem ser vistas ou importadas (nada das listas padrão).
 */
export function editalRestrito(edital: EditalEstado) {
  return materiasAtivas(edital).length > 0;
}

/** Matérias do edital de um grupo (ou as padrão, quando não há edital ativo). */
export function materiasPorGrupo(edital: EditalEstado, grupo: GrupoEdital) {
  const doEdital = materiasAtivas(edital)
    .filter((m) => m.grupo === grupo)
    .map((m) => m.nome);
  if (editalRestrito(edital)) return unicos(doEdital);
  const padrao = grupo === "Conhecimento Geral" ? MATERIAS_GERAL : MATERIAS_ESPECIFICO;
  return unicos(padrao);
}

/** Todas as matérias permitidas no filtro atual. */
export function todasAsMaterias(edital: EditalEstado) {
  if (editalRestrito(edital)) return unicos(materiasAtivas(edital).map((m) => m.nome));
  return unicos([...MATERIAS_GERAL, ...MATERIAS_ESPECIFICO]);
}

export function ehDoEdital(edital: EditalEstado, nome: string) {
  return materiasAtivas(edital).some((m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase());
}

const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A matéria pode ser vista/importada com o filtro atual? */
export function materiaPermitida(edital: EditalEstado, nome: string) {
  if (!nome?.trim()) return false;
  if (!editalRestrito(edital)) return true;
  return materiasAtivas(edital).some((m) => igual(m.nome, nome));
}

/** O tópico/capítulo pertence ao edital ativo? */
export function topicoPermitido(edital: EditalEstado, materia: string, topico: string) {
  if (!editalRestrito(edital)) return true;
  if (!materiaPermitida(edital, materia)) return false;
  const alvo = (topico ?? "").trim().toLowerCase();
  if (!alvo) return true;
  const topicos = topicosDaMateria(edital, materia);
  if (!topicos.length) return true;
  return topicos.some((t) => {
    const v = t.trim().toLowerCase();
    return v === alvo || v.includes(alvo) || alvo.includes(v);
  });
}

/** Questão visível/importável no filtro atual. */
export function questaoPermitida(
  edital: EditalEstado,
  questao: { materia?: string | undefined; assunto?: string | undefined },
) {
  if (!editalRestrito(edital)) return true;
  const materia = (questao.materia ?? "").trim();
  if (!materia) return false;
  const casa = materiasAtivas(edital).find(
    (m) => igual(m.nome, materia) || materia.toLowerCase().includes(m.nome.trim().toLowerCase()),
  );
  if (!casa) return false;
  if (!questao.assunto) return true;
  return topicoPermitido(edital, casa.nome, questao.assunto);
}

export function grupoDaMateria(edital: EditalEstado, nome: string): GrupoEdital {
  const achada = materiasAtivas(edital).find(
    (m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
  if (achada) return achada.grupo;
  return MATERIAS_ESPECIFICO.includes(nome) ? "Conhecimento Específico" : "Conhecimento Geral";
}

export function topicosDaMateria(edital: EditalEstado, nome: string) {
  const achada = materiasAtivas(edital).find(
    (m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
  return achada?.topicos ?? [];
}

/** Recorte do edital enviado à IA para as gerações ficarem no conteúdo cobrado. */
export function contextoDoEdital(edital: EditalEstado, materia?: string) {
  const ativas = materiasAtivas(edital);
  if (!ativas.length) return "";
  const alvo = materia
    ? ativas.filter((m) => m.nome.trim().toLowerCase() === materia.trim().toLowerCase())
    : ativas;
  const lista = (alvo.length ? alvo : ativas)
    .map((m) => `- ${m.nome} (${m.grupo}): ${m.topicos.join("; ") || "sem tópicos detalhados"}`)
    .join("\n");
  const escopo = [
    edital.bancaAtiva ? `Banca: ${edital.bancaAtiva}` : "",
    edital.cargoAtivo ? `Cargo: ${edital.cargoAtivo}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  return `CONTEÚDO PROGRAMÁTICO DO EDITAL${escopo ? ` (${escopo})` : ""}:\n${lista}`;
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
  return [...materiasAtivas(edital)].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
}

/** Tópicos de uma matéria ordenados por relevância na disciplina. */
export function topicosPorRelevancia(materia: MateriaEdital) {
  return [...materia.topicos].sort(
    (a, b) => (materia.relevanciaTopicos?.[b] ?? 0) - (materia.relevanciaTopicos?.[a] ?? 0),
  );
}
