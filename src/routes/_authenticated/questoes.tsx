import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Pencil, Plus, Star, Trash2, XCircle } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Relevancia, ResumoRelevancia, agruparAssuntos } from "@/components/Relevancia";
import { Button } from "@/components/ui/button";
import { CampoFormatado } from "@/components/CampoFormatado";
import { contextoDoAcervo, lerAcervo, useAcervo } from "@/lib/acervo";
import {
  assuntosComQuestoes,
  provasExtraidas,
  questoesDaMateria,
  questoesPendentes,
  reclassificar,
} from "@/lib/questoes-pdf";
import {
  listarQuestoesExtraidas,
  removerQuestao,
  salvarQuestoesExtraidas,
} from "@/lib/questoes-banco.functions";
import {
  contextoDoEdital,
  ehDoEdital,
  grupoDaMateria,
  materiasPorGrupo,
  questaoPermitida,
  todasAsMaterias,
  topicosDaMateria,
  useEdital,
} from "@/lib/edital";
import { explicarQuestao, gerarQuestoes, type Questao } from "@/lib/ai.functions";
import { registrarResposta } from "@/lib/revisao";
import { useBancaPrevista } from "@/lib/trilha";
import { daCadastrada } from "@/lib/prova-local";
import { BancaAtual } from "@/components/BancaAtual";
import { QuestoesPorLink } from "@/components/QuestoesPorLink";


export const Route = createFileRoute("/_authenticated/questoes")({
  validateSearch: (search: Record<string, unknown>) => ({
    materia: typeof search['materia'] === "string" ? search['materia'] : undefined,
    assunto: typeof search['assunto'] === "string" ? search['assunto'] : undefined,
  }),

  head: () => ({

    meta: [
      { title: "Questões FCC comentadas pela IA | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Questões no padrão FCC com 5 alternativas, filtro por Conhecimento Geral e Específico e explicação passo a passo do agente de IA.",
      },
      { property: "og:title", content: "Questões FCC comentadas pela IA" },
      {
        property: "og:description",
        content: "Resolva, veja o gabarito e entenda cada alternativa com os erros grifados.",
      },
    ],
  }),
  component: QuestoesPage,
});

const GRUPOS = ["Conhecimento Geral", "Conhecimento Específico"] as const;

function CartaoQuestao({
  questao,
  numero,
  onAtualizar,
  onExcluir,
  onFavoritar,
  contexto,
}: {
  questao: Questao;
  numero: number;
  /** Presente só nas questões extraídas de PDF (gabarito e explicação editáveis). */
  onAtualizar?: (q: Questao) => void;
  /** Exclui a questão do aparelho e da conta. */
  onExcluir?: (q: Questao) => void;
  /** Marca/desmarca a estrela de estudo direcionado. */
  onFavoritar?: (q: Questao) => void;
  contexto?: string | null;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [minha, setMinha] = useState("");
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<Questao>(questao);
  const respondida = escolha !== null;
  const correta = questao.alternativas.find((a) => a.correta);
  const explicarIA = useServerFn(explicarQuestao);

  const LETRAS = "ABCDEFGH";
  const rascunhoValido =
    rascunho.enunciado.trim().length > 3 &&
    rascunho.alternativas.filter((a) => a.texto.trim().length > 0).length >= 2;

  function abrirEdicao() {
    setRascunho(questao);
    setEditando(true);
  }

  function salvarEdicao() {
    const alternativas = rascunho.alternativas
      .filter((a) => a.texto.trim().length > 0)
      .map((a, i) => ({ ...a, letra: LETRAS[i] ?? a.letra, texto: a.texto.trim() }));
    onAtualizar?.({
      ...questao,
      enunciado: rascunho.enunciado.trim(),
      explicacao: rascunho.explicacao ?? "",
      alternativas,
    });
    setEditando(false);
    setEscolha(null);
    toast.success("Questão salva.");
  }


  const explicacaoIA = useMutation({
    mutationFn: () =>
      explicarIA({
        data: {
          banca: questao.banca,
          materia: questao.assunto ? `${questao.materia} — ${questao.assunto}` : questao.materia,
          enunciado: questao.enunciado,
          alternativas: questao.alternativas.map((a) => ({
            letra: a.letra,
            texto: a.texto,
            correta: a.correta,
          })),
          contexto: contexto ?? null,
        },
      }),
    onSuccess: (res) => {
      onAtualizar?.({
        ...questao,
        explicacao: res.explicacao,
        alternativas: questao.alternativas.map((a) => ({
          ...a,
          explicacao: res.alternativas?.find((x) => x.letra === a.letra)?.explicacao ?? a.explicacao,
        })),
      });
      toast.success("Explicação gerada.");
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao explicar a questão."),
  });

  function escolher(letra: string) {
    setEscolha(letra);
    if (correta) registrarResposta(questao, letra === correta.letra);
  }

  function definirGabarito(letra: string) {
    onAtualizar?.({
      ...questao,
      alternativas: questao.alternativas.map((a) => ({ ...a, correta: a.letra === letra })),
    });
  }

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="mb-2 text-xs font-semibold text-muted-foreground">
        <h3 className="text-sm font-bold text-foreground">
          Questão {numero} — {questao.titulo ?? [questao.materia, questao.assunto, questao.banca].filter(Boolean).join(" · ")}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {questao.origem && (
            <span className="rounded bg-mark-yellow-soft px-2 py-0.5 text-[10px] font-semibold text-foreground">
              {questao.origem}
            </span>
          )}
          {onAtualizar && !correta && (
            <span className="rounded bg-mark-red-soft px-2 py-0.5 text-[10px] font-semibold text-foreground">
              sem gabarito
            </span>
          )}
          {!editando && (onFavoritar || onAtualizar || onExcluir) && (
            <span className="ml-auto flex items-center gap-1.5">
              {onFavoritar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 px-2 text-[11px]"
                  aria-pressed={!!questao.favorita}
                  aria-label={questao.favorita ? "Remover dos favoritos" : "Favoritar questão"}
                  onClick={() => onFavoritar(questao)}
                >
                  <Star
                    className={`size-3.5 ${questao.favorita ? "fill-mark-yellow text-mark-yellow" : ""}`}
                  />
                  {questao.favorita ? "Favorita" : "Favoritar"}
                </Button>
              )}
              {onAtualizar && (
                <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]" onClick={abrirEdicao}>
                  <Pencil className="size-3.5" /> Editar
                </Button>
              )}
              {onExcluir && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 px-2 text-[11px] text-destructive"
                  aria-label="Excluir questão"
                  onClick={() => {
                    if (window.confirm("Excluir esta questão?")) onExcluir(questao);
                  }}
                >
                  <Trash2 className="size-3.5" /> Excluir
                </Button>
              )}
            </span>
          )}
        </div>


        <Relevancia
          materia={questao.materia}
          assunto={questao.assunto}
          relevanciaMateria={questao.relevancia_materia}
          relevanciaAssunto={questao.relevancia_assunto}
        />
      </header>

      {editando && (
        <div className="space-y-3 rounded-lg border border-primary/40 bg-secondary/40 p-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Enunciado</label>
            <CampoFormatado
              rows={6}
              value={rascunho.enunciado}
              onChange={(v) => setRascunho({ ...rascunho, enunciado: v })}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Alternativas (marque o gabarito na letra)
            </span>
            {rascunho.alternativas.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRascunho({
                      ...rascunho,
                      alternativas: rascunho.alternativas.map((x, j) => ({ ...x, correta: i === j })),
                    })
                  }
                  className={`mt-1 size-7 shrink-0 rounded-full border text-[11px] font-bold ${
                    a.correta
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {LETRAS[i] ?? a.letra}
                </button>
                <div className="flex-1">
                  <CampoFormatado
                    rows={2}
                    value={a.texto}
                    onChange={(v) =>
                      setRascunho({
                        ...rascunho,
                        alternativas: rascunho.alternativas.map((x, j) =>
                          i === j ? { ...x, texto: v } : x,
                        ),
                      })
                    }
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 shrink-0 px-2"
                  onClick={() =>
                    setRascunho({
                      ...rascunho,
                      alternativas: rascunho.alternativas.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              disabled={rascunho.alternativas.length >= 8}
              onClick={() =>
                setRascunho({
                  ...rascunho,
                  alternativas: [
                    ...rascunho.alternativas,
                    {
                      letra: LETRAS[rascunho.alternativas.length] ?? "?",
                      texto: "",
                      correta: false,
                      explicacao: "",
                    },
                  ],
                })
              }
            >
              <Plus className="mr-1.5 size-3.5" /> Adicionar alternativa
            </Button>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Explicação (opcional)</label>
            <CampoFormatado
              rows={3}
              value={rascunho.explicacao ?? ""}
              onChange={(v) => setRascunho({ ...rascunho, explicacao: v })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!rascunhoValido} onClick={salvarEdicao}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            {!rascunhoValido && (
              <span className="text-[11px] text-muted-foreground">
                Preencha o enunciado e ao menos 2 alternativas.
              </span>
            )}
          </div>
        </div>
      )}

      {!editando && (
      <p className="text-[15px] leading-relaxed">
        <Marcado texto={questao.enunciado} />
      </p>
      )}


      {!editando && (
      <ul className="mt-3 space-y-2">

        {questao.alternativas.map((a) => {
          const escolhida = escolha === a.letra;
          const estado = !respondida
            ? "border-border"
            : a.correta
              ? "border-mark-blue bg-mark-blue-soft/40"
              : escolhida
                ? "border-mark-red bg-mark-red-soft/40"
                : "border-border opacity-70";
          return (
            <li key={a.letra}>
              <button
                type="button"
                disabled={respondida}
                onClick={() => escolher(a.letra)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${estado}`}
              >
                <span className="font-bold">{a.letra})</span> <Marcado texto={a.texto} />
                {respondida && (
                  <p className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
                    {a.correta ? (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-mark-blue" />
                    ) : (
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-mark-red" />
                    )}
                    <Marcado texto={a.explicacao} />
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      )}

      {!editando && respondida && (

        <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
          <p className="font-semibold text-primary">
            {correta ? `Gabarito: ${correta.letra}` : "Gabarito não informado nesta prova"}
            {correta && escolha !== correta.letra && (
              <span className="ml-2 font-normal text-mark-red">
                sua marcação: {escolha} (erro grifado em vermelho)
              </span>
            )}
          </p>
          {questao.explicacao && (
            <p className="mt-1.5 leading-relaxed">
              <Marcado texto={questao.explicacao} />
            </p>
          )}
        </div>
      )}

      {onAtualizar && !editando && (
        <div className="mt-3 space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold">Gabarito correto:</span>
            {questao.alternativas.map((a) => (
              <button
                key={a.letra}
                type="button"
                onClick={() => definirGabarito(a.letra)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  a.correta
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {a.letra}
              </button>
            ))}
          </div>

          <CampoFormatado
            rows={2}
            value={minha}
            maxLength={2000}
            onChange={(v) => setMinha(v.slice(0, 2000))}
            placeholder="Minha explicação (sem IA)…"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={minha.trim().length < 3}
              onClick={() => {
                onAtualizar({ ...questao, explicacao: minha.trim() });
                setMinha("");
                toast.success("Explicação salva no aparelho.");
              }}
            >
              Salvar minha explicação
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={explicacaoIA.isPending}
              onClick={() => explicacaoIA.mutate()}
            >
              {explicacaoIA.isPending ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" /> Explicando…
                </>
              ) : (
                "Explicar com IA"
              )}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

function QuestoesPage() {
  const { acervo, atualizar } = useAcervo();
  const { edital } = useEdital();
  const busca = Route.useSearch();
  const [grupo, setGrupo] = useState<(typeof GRUPOS)[number]>(
    busca.materia ? grupoDaMateria(edital, busca.materia) : "Conhecimento Geral",
  );
  const [materia, setMateria] = useState(busca.materia ?? "");
  const { banca, definida: bancaDefinida } = useBancaPrevista();
  const gerar = useServerFn(gerarQuestoes);

  const materias = materiasPorGrupo(edital, grupo);
  const materiaAtiva = materias.includes(materia) ? materia : (materias[0] ?? "");
  const foco = busca.assunto && materiaAtiva === busca.materia ? busca.assunto : null;
  const semMaterias = materias.length === 0;

  // Banco local: questões dos PDFs + questões cadastradas à mão no acervo,
  // ambas classificadas por matéria/assunto do edital (sem IA).
  const extraidas = useMemo(() => {
    const mapa = new Map<string, Questao>();
    for (const q of acervo.extraidas) mapa.set(q.id, q);
    for (const q of acervo.questoes) {
      const convertida = daCadastrada(edital, q);
      if (!mapa.has(convertida.id)) mapa.set(convertida.id, convertida);
    }
    return Array.from(mapa.values());
  }, [acervo.extraidas, acervo.questoes, edital]);
  const [fonte, setFonte] = useState<"pdf" | "ia">(extraidas.length ? "pdf" : "ia");
  const fonteAtiva = fonte === "pdf" && !extraidas.length ? "ia" : fonte;

  const mutation = useMutation({
    mutationFn: () =>
      gerar({
        data: {
          materia: foco ? `${materiaAtiva} — ${foco}` : materiaAtiva,
          grupo,
          banca,
          quantidade: 5,
          formato: "multipla",
          contexto:
            [
              foco ? `Gere questões APENAS sobre o assunto do edital: ${foco}.` : "",
              contextoDoEdital(edital, materiaAtiva),
              contextoDoAcervo(acervo),
            ]
              .filter(Boolean)
              .join("\n\n") || null,
        },
      }),

    onSuccess: (resultado) => {
      if (resultado.indisponivel) {
        toast.error(resultado.indisponivel);
        if (lerAcervo().extraidas.length) {
          setFonte("pdf");
          toast.info("Mostrando as questões extraídas dos seus PDFs (sem IA).");
        }
        return;
      }
      atualizar({ simulado: resultado.questoes });
    },
    onError: (e: Error) => {
      const semCredito = /cr[ée]dito/i.test(e.message);
      toast.error(e.message || "Falha ao gerar as questões.");
      if (semCredito && lerAcervo().extraidas.length) {
        setFonte("pdf");
        toast.info("Mostrando as questões extraídas dos seus PDFs (sem IA).");
      }
    },
  });


  const [assuntoSel, setAssuntoSel] = useState<string | null>(busca.assunto ?? null);

  // Banco na nuvem: traz as questões salvas na conta e mantém o cache local em sincronia.
  const listar = useServerFn(listarQuestoesExtraidas);
  const salvar = useServerFn(salvarQuestoesExtraidas);
  const remover = useServerFn(removerQuestao);
  const [excluidas, setExcluidas] = useState<string[]>([]);
  const [soFavoritas, setSoFavoritas] = useState(false);
  const banco = useQuery({ queryKey: ["questoes-extraidas"], queryFn: () => listar({}) });

  useEffect(() => {
    const nuvem = banco.data;
    if (!nuvem?.length) return;
    const local = lerAcervo().extraidas;
    const mapa = new Map(local.map((q) => [q.id, q]));
    for (const q of nuvem) if (!mapa.has(q.id) && !excluidas.includes(q.id)) mapa.set(q.id, q);
    const juntas = Array.from(mapa.values());
    if (juntas.length !== local.length) atualizar({ extraidas: juntas });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banco.data, excluidas]);

  const contextoIA =
    [contextoDoEdital(edital, materiaAtiva), contextoDoAcervo(acervo)].filter(Boolean).join("\n\n") ||
    null;

  const queryClient = useQueryClient();

  const atualizarExtraida = (q: Questao) => {
    const atuais = lerAcervo().extraidas;
    // Questões vindas do acervo cadastrado ainda não estão no banco local:
    // ao editar, passam a viver nele (é a versão que vale a partir de agora).
    const proximas = atuais.some((x) => x.id === q.id)
      ? atuais.map((x) => (x.id === q.id ? q : x))
      : [...atuais, q];
    atualizar({ extraidas: proximas });
    void salvar({ data: { questoes: [q] } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["questoes-extraidas"] }))
      .catch(() => toast.error("Não deu para salvar na nuvem agora; ficou salva no aparelho."));
  };


  const excluirExtraida = (q: Questao) => {
    const atuais = lerAcervo().extraidas;
    atualizar({ extraidas: atuais.filter((x) => x.id !== q.id) });
    setExcluidas((ids) => [...ids, q.id]);
    void remover({ data: { id: q.id } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["questoes-extraidas"] }))
      .catch(() => toast.error("Não deu para excluir na nuvem agora; saiu do aparelho."));
    toast.success("Questão excluída.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          setExcluidas((ids) => ids.filter((id) => id !== q.id));
          atualizarExtraida(q);
        },
      },
    });
  };

  const favoritarExtraida = (q: Questao) => {
    atualizarExtraida({ ...q, favorita: !q.favorita });
    toast.success(q.favorita ? "Removida dos favoritos." : "Questão favoritada.");
  };

  /** Salva no acervo (aparelho + nuvem) as questões vindas de um link. */
  const importarDoLink = (novas: Questao[]) => {
    if (!novas.length) return;
    const atuais = lerAcervo().extraidas;
    const mapa = new Map(atuais.map((q) => [q.id, q]));
    for (const q of novas) mapa.set(q.id, q);
    atualizar({ extraidas: Array.from(mapa.values()) });
    setFonte("pdf");
    void salvar({ data: { questoes: novas } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["questoes-extraidas"] }))
      .catch(() => toast.error("Não deu para salvar na nuvem agora; ficaram salvas no aparelho."));
  };


  // Filtro estrito: só as questões da matéria selecionada e permitidas pelo edital/banca/cargo.
  const permitidasPdf = extraidas.filter((q) => questaoPermitida(edital, q));
  const pendentes = questoesPendentes(extraidas);
  const doPdfNaMateria = questoesDaMateria(permitidasPdf, materiaAtiva);
  const assuntosDisponiveis = assuntosComQuestoes(doPdfNaMateria);
  const assuntoAtivo =
    assuntoSel && assuntosDisponiveis.some((a) => a.assunto === assuntoSel) ? assuntoSel : null;
  const doPdf = assuntoAtivo
    ? doPdfNaMateria.filter((q) => q.assunto === assuntoAtivo)
    : doPdfNaMateria;

  const permitidas = acervo.simulado.filter((q) => questaoPermitida(edital, q));
  const daIA = permitidas.filter(
    (q) => !q.materia || q.materia.toLowerCase().includes(materiaAtiva.toLowerCase()),
  );
  const totalFavoritas = doPdfNaMateria.filter((q) => q.favorita).length;
  const base = fonteAtiva === "pdf" ? doPdf : daIA;
  const lista = soFavoritas ? base.filter((q) => q.favorita) : base;
  const assuntos = agruparAssuntos(lista);
  const provas = provasExtraidas(extraidas);


  return (
    <AppShell
      titulo="Questões e explicações"
      descricao={`Padrão ${banca} com 5 alternativas e gabarito comentado passo a passo pela IA.`}
    >
      <BancaAtual banca={banca} definida={bancaDefinida} />
      <FiltroConcurso compacto />

      <QuestoesPorLink
        edital={edital}
        banca={banca}
        materias={materias}
        materiaAtiva={materiaAtiva}
        existentes={extraidas}
        onImportar={importarDoLink}
      />

      <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex gap-2">
          {(["pdf", "ia"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFonte(f)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                fonteAtiva === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {f === "pdf" ? `Das minhas provas (${extraidas.length})` : "Geradas por IA"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {fonteAtiva === "pdf"
            ? extraidas.length
              ? `Questões extraídas automaticamente dos PDFs${provas.length ? `: ${provas.join(", ")}` : ""} — sem gastar crédito de IA.`
              : "Nenhuma questão extraída ainda. Anexe o PDF da prova em “Incluir → Provas anteriores”."
            : "Questões criadas pela IA no padrão da banca prevista."}
        </p>
      </section>
      <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex gap-2">
          {GRUPOS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGrupo(g);
                setMateria(materiasPorGrupo(edital, g)[0] ?? "");
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                grupo === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {semMaterias ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhuma matéria de {grupo} para o edital/banca/cargo selecionados. Ajuste o filtro do
            concurso ou cadastre as matérias em “Incluir”.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {materias.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMateria(m)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  materiaAtiva === m
                    ? "border-accent bg-accent text-accent-foreground font-semibold"
                    : "border-border text-muted-foreground"
                }`}
              >
                {m}
                {ehDoEdital(edital, m) && (
                  <span className="ml-1.5 rounded bg-secondary px-1 text-[10px] font-semibold text-primary">
                    Edital
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          disabled={mutation.isPending || semMaterias}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Montando questões…
            </>
          ) : semMaterias ? (
            "Selecione um edital com matérias"
          ) : (
            foco ? `Gerar questões de ${foco}` : `Gerar questões de ${materiaAtiva}`
          )}
        </Button>
        <LegendaCores />
      </section>

      {fonteAtiva === "pdf" && assuntosDisponiveis.length > 0 && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">
            Assunto do edital em {materiaAtiva}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAssuntoSel(null)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                !assuntoAtivo
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border text-muted-foreground"
              }`}
            >
              Todos ({doPdfNaMateria.length})
            </button>
            {assuntosDisponiveis.map((a) => (
              <button
                key={a.assunto}
                type="button"
                onClick={() => setAssuntoSel(a.assunto)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  assuntoAtivo === a.assunto
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border text-muted-foreground"
                }`}
              >
                {a.assunto} ({a.total})
              </button>
            ))}
          </div>
        </section>
      )}

      {fonteAtiva === "pdf" && doPdfNaMateria.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card">
          <button
            type="button"
            onClick={() => setSoFavoritas(false)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              !soFavoritas
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            Todas ({base.length})
          </button>
          <button
            type="button"
            onClick={() => setSoFavoritas(true)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              soFavoritas
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            <Star className={`size-3.5 ${soFavoritas ? "" : "fill-mark-yellow text-mark-yellow"}`} />
            Só favoritas ({totalFavoritas})
          </button>
        </section>
      )}

      <ResumoRelevancia itens={assuntos} />

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {fonteAtiva === "pdf"
            ? `Nenhuma questão das suas provas em ${materiaAtiva || "esta matéria"}${
                assuntoAtivo ? ` — assunto ${assuntoAtivo}` : ""
              }. Anexe outra prova em “Incluir” ou classifique as questões pendentes abaixo.`
            : "Nenhuma questão ainda. Gere um simulado acima ou cadastre conteúdo em “Incluir”."}
        </p>
      ) : (
        lista.map((q, i) =>
          fonteAtiva === "pdf" ? (
            <CartaoQuestao
              key={q.id || i}
              questao={q}
              numero={q.numero ?? i + 1}
              onAtualizar={atualizarExtraida}
              onExcluir={excluirExtraida}
              onFavoritar={favoritarExtraida}
              contexto={contextoIA}
            />
          ) : (
            <CartaoQuestao key={q.id || i} questao={q} numero={i + 1} />
          ),
        )
      )}

      {fonteAtiva === "pdf" && pendentes.length > 0 && (
        <section className="space-y-3 rounded-xl border border-dashed border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-base font-bold">
            Pendentes de classificação ({pendentes.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Estas questões não entraram em nenhuma matéria. Escolha a matéria e o assunto do edital
            para que elas apareçam no filtro certo.
          </p>
          {pendentes.slice(0, 30).map((q) => (
            <div key={q.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">{q.origem}</p>
                <span className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={q.favorita ? "Remover dos favoritos" : "Favoritar questão"}
                    onClick={() => favoritarExtraida(q)}
                  >
                    <Star
                      className={`size-4 ${q.favorita ? "fill-mark-yellow text-mark-yellow" : "text-muted-foreground"}`}
                    />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir questão"
                    onClick={() => {
                      if (window.confirm("Excluir esta questão?")) excluirExtraida(q);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </button>
                </span>
              </div>
              <p className="line-clamp-3 text-sm">{q.enunciado}</p>
              <div className="flex flex-wrap gap-2">
                <select
                  defaultValue=""
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                  onChange={(e) => {
                    const m = e.target.value;
                    if (!m) return;
                    atualizarExtraida(reclassificar(q, edital, m));
                    toast.success(`Questão classificada em ${m}.`);
                  }}
                >
                  <option value="">Classificar em…</option>
                  {todasAsMaterias(edital).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {q.materia && q.materia !== "Não classificada" && (
                  <select
                    defaultValue=""
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                    onChange={(e) => {
                      const t = e.target.value;
                      if (!t) return;
                      atualizarExtraida(reclassificar(q, edital, q.materia, t));
                    }}
                  >
                    <option value="">Assunto…</option>
                    {topicosDaMateria(edital, q.materia).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

    </AppShell>
  );
}
