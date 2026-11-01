import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MATERIAS_ESPECIFICO, MATERIAS_GERAL } from "./acervo";

/**
 * Matérias vindas do edital do candidato. Somam-se às listas padrão do app
 * em todas as telas (Questões, Leis, Prova, Padrões e Trilha).
 */
export type GrupoEdital = "Conhecimento Geral" | "Conhecimento Específico";

/** Link de uma lei cadastrada pelo candidato dentro de uma matéria do edital. */
export type LinkLei = {
  id: string;
  titulo: string;
  url: string;
  /** Nome do item salvo no acervo depois de buscar o texto desta lei. */
  anexo?: string | undefined;
};

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
  /** Links das leis desta matéria, informados pelo candidato. */
  leis?: LinkLei[] | undefined;
  /** Bloco da prova (ex.: "BLOCO I"), quando o edital é dividido em blocos. */
  bloco?: string | undefined;
};

/** Lei do catálogo central: cadastrada uma vez e vinculável a qualquer edital. */
export type LeiCatalogo = { id: string; titulo: string; url: string; anexo?: string | undefined };

export type EditalEstado = {
  texto: string;
  materias: MateriaEdital[];
  /** Cargos previstos no edital — usados como filtro na Trilha. */
  cargos: string[];
  /** Banca de cada cargo (cargo → banca): o seletor muda os dois juntos. */
  bancaDoCargo?: Record<string, string> | undefined;
  /** Bancas previstas/organizadoras do edital — usadas como filtro na Trilha. */
  bancas: string[];
  /** Banca do concurso em estudo — filtra matérias, tópicos e leis. */
  bancaAtiva?: string | undefined;
  /** Cargo do concurso em estudo — filtra matérias, tópicos e leis. */
  cargoAtivo?: string | undefined;
  /** Catálogo central de leis (link e/ou arquivo do acervo). */
  catalogoLeis?: LeiCatalogo[] | undefined;
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
    return raw ? validarFiltro({ ...VAZIO, ...(JSON.parse(raw) as EditalEstado) }) : VAZIO;
  } catch {
    return VAZIO;
  }
}

/**
 * Banca/cargo ativos só valem se existirem matérias incluídas para eles;
 * senão o seletor volta a ficar limpo.
 */
export function validarFiltro(e: EditalEstado): EditalEstado {
  const banca = (e.bancaAtiva ?? "").trim();
  const cargo = (e.cargoAtivo ?? "").trim();
  const bancaOk = !banca || bancasComMaterias(e).some((b) => b.toLowerCase() === banca.toLowerCase());
  const bancaFinal = bancaOk ? banca : "";
  const cargoOk =
    !cargo || (!!bancaFinal && cargosDaBanca(e, bancaFinal).some((c) => c.toLowerCase() === cargo.toLowerCase()));
  return { ...e, bancaAtiva: bancaFinal, cargoAtivo: cargoOk ? cargo : "" };
}

/** Bancas que têm matérias incluídas no edital. */
export function bancasComMaterias(e: EditalEstado) {
  return unicos((e.materias ?? []).map((m) => (m.banca ?? "").trim()));
}

function salvar(estado: EditalEstado) {
  if (typeof window === "undefined") return true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    toast.error(
      "O aparelho ficou sem espaço para guardar o Detalhamento do edital. Exclua matérias que não usa mais ou cole o edital em partes menores.",
    );
    return false;
  }
  window.dispatchEvent(new Event("edital:mudou"));
  return true;
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
    if (!salvar(proximo)) return;
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

  const adicionarCargo = (nome: string, banca?: string) => {
    const atual = lerEdital();
    const limpo = nome.trim();
    if (!limpo) return;
    if ((atual.cargos ?? []).some((c) => c.trim().toLowerCase() === limpo.toLowerCase())) return;
    const b = (banca ?? "").trim();
    aplicar({
      cargos: [...(atual.cargos ?? []), limpo],
      bancaDoCargo: { ...(atual.bancaDoCargo ?? {}), [limpo]: b },
    });
  };

  const removerCargo = (nome: string) => {
    const atual = lerEdital();
    const mapa = { ...(atual.bancaDoCargo ?? {}) };
    delete mapa[nome];
    aplicar({ cargos: (atual.cargos ?? []).filter((c) => c !== nome), bancaDoCargo: mapa });
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

/**
 * Junta matérias extraídas localmente às já cadastradas: cria as inexistentes e
 * faz união dos tópicos nas que já existem (comparação sem diferenciar caixa).
 */
export function mesclarMaterias(
  atuais: MateriaEdital[],
  novas: { nome: string; grupo: GrupoEdital; topicos: string[] }[],
  escopo: { banca?: string | undefined; cargo?: string | undefined } = {},
): { materias: MateriaEdital[]; criadas: number; topicosNovos: number } {
  const materias = atuais.map((m) => ({ ...m, topicos: [...m.topicos] }));
  let criadas = 0;
  let topicosNovos = 0;

  for (const nova of novas) {
    const nome = nova.nome.trim();
    if (!nome) continue;
    let alvo = materias.find((m) => igual(m.nome, nome));
    if (!alvo) {
      alvo = {
        id: novoId(),
        nome,
        grupo: nova.grupo,
        topicos: [],
        banca: escopo.banca ?? "",
        cargo: escopo.cargo ?? "",
      };
      materias.push(alvo);
      criadas += 1;
    }
    for (const topico of nova.topicos) {
      const t = topico.trim();
      if (!t) continue;
      if (alvo.topicos.some((x) => igual(x, t))) continue;
      alvo.topicos.push(t);
      topicosNovos += 1;
    }
  }

  return { materias, criadas, topicosNovos };
}

/** Cargos do edital (sem repetições). */

export function cargosDoEdital(edital: EditalEstado) {
  return unicos(edital.cargos ?? []);
}

/** Bancas do edital (sem repetições). */
export function bancasDoEdital(edital: EditalEstado) {
  return unicos(edital.bancas ?? []);
}

/** Banca vinculada ao cargo (vazio quando o cargo vale para qualquer banca). */
export function bancaDoCargo(edital: EditalEstado, cargo: string) {
  const alvo = cargo.trim().toLowerCase();
  for (const [nome, banca] of Object.entries(edital.bancaDoCargo ?? {})) {
    if (nome.trim().toLowerCase() === alvo) return banca;
  }
  return "";
}

/**
 * Cargos oferecidos no seletor para a banca escolhida: só os cargos vinculados
 * a ela; se nenhum cargo estiver vinculado, mostra os sem vínculo. Sem banca
 * escolhida, mostra todos.
 */
export function cargosDaBanca(edital: EditalEstado, banca: string) {
  const f = banca.trim().toLowerCase();
  if (!f) return [];
  const daBanca = (edital.materias ?? []).filter((m) => (m.banca ?? "").trim().toLowerCase() === f);
  const vinculados = Object.entries(edital.bancaDoCargo ?? {})
    .filter(([, b]) => b.trim().toLowerCase() === f)
    .map(([c]) => c.trim());
  return unicos([...daBanca.map((m) => (m.cargo ?? "").trim()), ...(daBanca.length ? vinculados : [])]);
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
  return materiasAtivas(edital).some(
    (m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
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

/**
 * Referência oficial do sistema: o "Detalhamento do edital" (matérias, assuntos
 * e relevâncias analisadas). O PDF do edital não é usado como referência.
 */
export function contextoDoEdital(edital: EditalEstado, materia?: string) {
  const ativas = materiasAtivas(edital);
  if (!ativas.length) return "";
  const alvo = materia
    ? ativas.filter((m) => m.nome.trim().toLowerCase() === materia.trim().toLowerCase())
    : ativas;
  const lista = (alvo.length ? alvo : ativas)
    .map((m) => {
      const rel = m.relevancia == null ? "" : ` — relevância na prova: ${m.relevancia}%`;
      const topicos = topicosPorRelevancia(m)
        .map((t) => {
          const dentro = m.relevanciaTopicos?.[t];
          const geral = relevanciaGeral(m, t);
          const pesos = [
            dentro == null ? "" : `${dentro}% da matéria`,
            geral == null ? "" : `${geral.toFixed(1)}% da prova`,
          ]
            .filter(Boolean)
            .join(", ");
          return `  • ${t}${pesos ? ` (${pesos})` : ""}`;
        })
        .join("\n");
      return `- ${m.nome} (${m.grupo})${rel}\n${topicos || "  • sem assuntos detalhados"}`;
    })
    .join("\n");
  const escopo = [
    edital.bancaAtiva ? `Banca: ${edital.bancaAtiva}` : "",
    edital.cargoAtivo ? `Cargo: ${edital.cargoAtivo}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  return `DETALHAMENTO DO EDITAL — ÚNICA REFERÊNCIA DE CONTEÚDO${escopo ? ` (${escopo})` : ""}.
Use apenas as matérias e assuntos abaixo, priorizando os de maior relevância; ignore qualquer outro conteúdo:
${lista}`;
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

/** Links de leis cadastrados na matéria. */
export function leisDaMateria(materia: MateriaEdital): LinkLei[] {
  return materia.leis ?? [];
}

/** Matérias visíveis no filtro atual que têm pelo menos uma lei cadastrada. */
export function materiasComLeis(edital: EditalEstado) {
  return materiasAtivas(edital).filter((m) => leisDaMateria(m).length > 0);
}

/**
 * Nomes (minúsculos) dos anexos de lei vinculados às matérias visíveis no
 * filtro atual (banca + cargo). Vazio quando nenhuma matéria tem lei anexada.
 */
export function anexosDoConcurso(edital: EditalEstado) {
  const nomes = new Set<string>();
  for (const m of materiasAtivas(edital)) {
    for (const l of leisDaMateria(m)) {
      const anexo = (l.anexo ?? "").trim().toLowerCase();
      if (anexo) nomes.add(anexo);
    }
  }
  return nomes;
}

/** Texto sem acentos, em minúsculas, com espaços simples. */
function chave(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Números de lei/decreto citados no texto (4 dígitos ou mais, sem pontuação). */
function numerosDeLei(texto: string) {
  const achados = texto.match(/\d[\d.\s]{3,}\d/g) ?? [];
  return achados.map((n) => n.replace(/\D/g, "")).filter((n) => n.length >= 4);
}

/**
 * Assuntos do concurso em estudo (matérias, tópicos e títulos de leis do
 * Detalhamento), já normalizados, com os anexos e números de lei citados.
 */
function assuntosDoConcurso(edital: EditalEstado) {
  const anexos = new Set<string>();
  const termos = new Set<string>();
  const numeros = new Set<string>();
  const add = (texto: string) => {
    const k = chave(texto);
    if (k.length > 4) termos.add(k);
    for (const n of numerosDeLei(texto)) numeros.add(n);
  };
  // Só as leis cadastradas nas matérias do concurso em estudo contam —
  // nomes de matérias/tópicos genéricos ("Direito Penal") não puxam leis de outro edital.
  for (const m of materiasAtivas(edital)) {
    for (const l of leisDaMateria(m)) {
      const anexo = (l.anexo ?? "").trim().toLowerCase();
      if (anexo) anexos.add(anexo);
      add(l.titulo);
    }
  }
  return { anexos, termos, numeros };
}

/**
 * Uma lei salva no acervo vale para o concurso em estudo somente quando está
 * vinculada a uma matéria ativa (anexo) ou quando casa com o título/número de
 * uma lei cadastrada nas matérias desse concurso.
 */
export function leiDoConcurso(edital: EditalEstado, nomeArquivo: string) {
  if (!editalRestrito(edital)) return true;
  const { anexos, termos, numeros } = assuntosDoConcurso(edital);
  if (anexos.has(nomeArquivo.trim().toLowerCase())) return true;
  const nome = chave(nomeArquivo);
  if (!nome) return false;
  for (const n of numerosDeLei(nomeArquivo)) if (numeros.has(n)) return true;
  for (const t of termos) if (t.length > 8 && (nome.includes(t) || t.includes(nome))) return true;
  return false;
}

/** Acrescenta um link de lei à matéria (sem repetir o mesmo endereço). */
export function comLeiAdicionada(materia: MateriaEdital, titulo: string, url: string): LinkLei[] {
  const atuais = leisDaMateria(materia);
  const limpo = url.trim();
  if (atuais.some((l) => l.url.trim().toLowerCase() === limpo.toLowerCase())) return atuais;
  return [...atuais, { id: novoId(), titulo: titulo.trim() || limpo, url: limpo }];
}

/**
 * Vincula à matéria uma lei que já está salva no acervo (PDF anexado).
 * O link nasce com `anexo` preenchido — a matéria passa a exibir a lei com
 * "texto salvo" e ela entra na lista recolhível da tela Leis. Sem duplicar.
 */
export function vincularAnexoAMateria(
  materia: MateriaEdital,
  titulo: string,
  anexo: string,
): LinkLei[] {
  const atuais = leisDaMateria(materia);
  const alvo = anexo.trim().toLowerCase();
  if (!alvo) return atuais;
  if (atuais.some((l) => (l.anexo ?? "").trim().toLowerCase() === alvo)) return atuais;
  return [
    ...atuais,
    { id: novoId(), titulo: titulo.trim() || anexo, url: `acervo:${anexo.trim()}`, anexo: anexo.trim() },
  ];
}

/** Altera o título/endereço de um link de lei da matéria. */
export function comLeiAlterada(
  materia: MateriaEdital,
  id: string,
  patch: Partial<Omit<LinkLei, "id">>,
): LinkLei[] {
  return leisDaMateria(materia).map((l) => (l.id === id ? { ...l, ...patch } : l));
}

/** Remove um link de lei da matéria. */
export function comLeiRemovida(materia: MateriaEdital, id: string): LinkLei[] {
  return leisDaMateria(materia).filter((l) => l.id !== id);
}

/** Ao renomear uma lei salva, mantém o vínculo dos links das matérias. */
export function renomearAnexoNasLeis(antigo: string, novo: string) {
  const estado = lerEdital();
  let mudou = false;
  const materias = estado.materias.map((m) => {
    const leis = leisDaMateria(m);
    if (!leis.some((l) => l.anexo === antigo)) return m;
    mudou = true;
    return { ...m, leis: leis.map((l) => (l.anexo === antigo ? { ...l, anexo: novo } : l)) };
  });
  if (mudou) salvar({ ...estado, materias });
}

/**
 * Inclui no edital os cargos lidos de uma planilha: cria banca e cargo já
 * vinculados e troca as matérias daquele banca+cargo pelas da planilha
 * (preservando leis já vinculadas a matérias de mesmo nome).
 */
export function importarCargosPlanilha(
  edital: EditalEstado,
  cargos: { cargo: string; banca: string; materias: { nome: string; grupo: GrupoEdital; bloco: string; topicos: string[] }[] }[],
): Partial<EditalEstado> {
  let materias = [...edital.materias];
  const bancas = [...(edital.bancas ?? [])];
  const lista = [...(edital.cargos ?? [])];
  const mapa = { ...(edital.bancaDoCargo ?? {}) };
  for (const c of cargos) {
    const banca = c.banca.trim();
    const cargo = c.cargo.trim();
    if (!banca || !cargo) continue;
    if (!bancas.some((b) => igual(b, banca))) bancas.push(banca);
    const cargoExistente = lista.find((x) => igual(x, cargo));
    // Mesmo nome de cargo em outra banca vira cargo próprio ("CARGO (BANCA)").
    let nomeCargo = cargoExistente ?? cargo;
    const bancaAtual = cargoExistente ? (mapa[cargoExistente] ?? "") : "";
    if (cargoExistente && bancaAtual && !igual(bancaAtual, banca)) nomeCargo = `${cargo} (${banca})`;
    if (!lista.some((x) => igual(x, nomeCargo))) lista.push(nomeCargo);
    mapa[nomeCargo] = banca;
    const doConcurso = (m: MateriaEdital) => igual(m.banca ?? "", banca) && igual(m.cargo ?? "", nomeCargo);
    const antigas = materias.filter(doConcurso);
    materias = materias.filter((m) => !doConcurso(m));
    for (const m of c.materias) {
      const antiga = antigas.find((a) => igual(a.nome, m.nome));
      materias.push({
        ...(antiga ?? {}),
        id: antiga?.id ?? novoId(),
        nome: m.nome,
        grupo: m.grupo,
        bloco: m.bloco,
        topicos: m.topicos,
        banca,
        cargo: nomeCargo,
      });
    }
  }
  const primeiro = cargos.find((c) => c.banca && c.cargo);
  const cargoAtivo = primeiro
    ? (Object.keys(mapa).find((k) => igual(mapa[k] ?? "", primeiro.banca) && (igual(k, primeiro.cargo) || igual(k, `${primeiro.cargo} (${primeiro.banca})`))) ?? primeiro.cargo)
    : edital.cargoAtivo;
  return {
    materias,
    bancas,
    cargos: lista,
    bancaDoCargo: mapa,
    bancaAtiva: primeiro?.banca ?? edital.bancaAtiva,
    cargoAtivo,
  };
}

/** Chave que identifica uma lei: arquivo do acervo, senão o link. */
export function chaveLei(l: { anexo?: string | undefined; url: string }) {
  return ((l.anexo ?? "").trim() || l.url.trim()).toLowerCase();
}

/** Catálogo completo: leis cadastradas + as que já estão vinculadas em matérias. */
export function catalogoDeLeis(edital: EditalEstado, arquivos: string[] = []): LeiCatalogo[] {
  const lista: LeiCatalogo[] = [];
  const vistos = new Set<string>();
  const add = (l: LeiCatalogo) => {
    const k = chaveLei(l);
    if (!k || vistos.has(k)) return;
    vistos.add(k);
    lista.push(l);
  };
  for (const l of edital.catalogoLeis ?? []) add(l);
  for (const m of edital.materias) for (const l of leisDaMateria(m)) add({ ...l });
  for (const a of arquivos) add({ id: `arq-${a}`, titulo: a, url: `acervo:${a}`, anexo: a });
  return lista;
}

/** Matérias (de qualquer edital) que têm esta lei vinculada. */
export function vinculosDaLei(edital: EditalEstado, lei: LeiCatalogo) {
  const k = chaveLei(lei);
  return edital.materias.filter((m) => leisDaMateria(m).some((l) => chaveLei(l) === k));
}

/** Define em quais matérias a lei fica vinculada (marca/desmarca de uma vez). */
export function definirVinculosDaLei(edital: EditalEstado, lei: LeiCatalogo, idsMaterias: Set<string>) {
  const k = chaveLei(lei);
  return edital.materias.map((m) => {
    const tem = leisDaMateria(m).some((l) => chaveLei(l) === k);
    const quer = idsMaterias.has(m.id);
    if (tem === quer) return m;
    if (quer)
      return { ...m, leis: [...leisDaMateria(m), { id: novoId(), titulo: lei.titulo, url: lei.url, anexo: lei.anexo }] };
    return { ...m, leis: leisDaMateria(m).filter((l) => chaveLei(l) !== k) };
  });
}
