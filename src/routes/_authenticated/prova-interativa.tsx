import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Relevancia, ResumoRelevancia, agruparAssuntos } from "@/components/Relevancia";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { contextoDoAcervo, lerAcervo, useAcervo } from "@/lib/acervo";
import {
  contextoDoEdital,
  ehDoEdital,
  grupoDaMateria,
  questaoPermitida,
  todasAsMaterias,
  useEdital,
} from "@/lib/edital";
import { gerarQuestoes, type Questao } from "@/lib/ai.functions";
import { listarQuestoesExtraidas } from "@/lib/questoes-banco.functions";
import { bancoLocal, montarProvaLocal } from "@/lib/prova-local";
import { provasExtraidas, temGabarito } from "@/lib/questoes-pdf";
import { registrarResposta } from "@/lib/revisao";
import { useBancaPrevista } from "@/lib/trilha";
import { BancaAtual } from "@/components/BancaAtual";

export const Route = createFileRoute("/_authenticated/prova-interativa")({
  head: () => ({
    meta: [
      { title: "Prova interativa em PDF | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Prova simulada com 20 questões por matéria do edital, extraídas dos PDFs das suas provas sem gastar IA, com gabarito e explicações já resolvidas.",
      },
      { property: "og:title", content: "Prova interativa em PDF" },
      {
        property: "og:description",
        content:
          "Scroll vertical contínuo, 20 questões por matéria do seu acervo e dos PDFs anexados, com gabarito comentado.",
      },
    ],
  }),
  component: ProvaPage,
});

const ALVO = 20;
const LOTE = 10;

function ProvaPage() {
  const { acervo, atualizar } = useAcervo();
  const { edital } = useEdital();
  const MATERIAS = todasAsMaterias(edital);
  const [materiaSel, setMateriaSel] = useState("");
  const materia = MATERIAS.includes(materiaSel) ? materiaSel : (MATERIAS[0] ?? "");
  const semMaterias = MATERIAS.length === 0;
  const setMateria = setMateriaSel;
  const [provas, setProvas] = useState<Record<string, Questao[]>>({});
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [corrigida, setCorrigida] = useState<Record<string, boolean>>({});
  const { banca, definida: bancaDefinida } = useBancaPrevista();
  const gerar = useServerFn(gerarQuestoes);

  // Banco na nuvem das questões extraídas dos PDFs, sincronizado com o aparelho.
  const listar = useServerFn(listarQuestoesExtraidas);
  const banco = useQuery({ queryKey: ["questoes-extraidas"], queryFn: () => listar({}) });

  useEffect(() => {
    const nuvem = banco.data;
    if (!nuvem?.length) return;
    const local = lerAcervo().extraidas;
    const mapa = new Map(local.map((q) => [q.id, q]));
    for (const q of nuvem) if (!mapa.has(q.id)) mapa.set(q.id, q);
    const juntas = Array.from(mapa.values());
    if (juntas.length !== local.length) atualizar({ extraidas: juntas });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banco.data]);

  const disponivel = bancoLocal(edital, acervo, banco.data ?? []);
  const previa = montarProvaLocal(disponivel, materia, ALVO);
  const nomesProvas = provasExtraidas(disponivel);

  const questoes = (provas[materia] ?? []).filter((q) => questaoPermitida(edital, q));
  const respondidas = questoes.filter((q) => respostas[q.id ?? ""]).length;
  const assuntos = agruparAssuntos(questoes);
  const resolvidas = questoes.filter((q) => temGabarito(q)).length;
  const comExplicacao = questoes.filter((q) => q.explicacao?.trim()).length;

  /** Montagem local, sem IA: usa as questões dos PDFs e do acervo. */
  function montarLocal() {
    const montada = montarProvaLocal(disponivel, materia, ALVO);
    if (!montada.questoes.length) {
      toast.error(
        `Nenhuma questão de ${materia} no seu banco. Anexe o PDF da prova em “Incluir → Provas anteriores”.`,
      );
      return;
    }
    setProvas((p) => ({ ...p, [materia]: montada.questoes }));
    toast.success(
      montada.faltam
        ? `${montada.questoes.length} questões de ${materia} (faltam ${montada.faltam} para 20 — anexe mais provas).`
        : `20 questões de ${materia} montadas sem gastar IA.`,
    );
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const alvo = Math.max(ALVO, questoes.length + LOTE);
      const acumulado: Questao[] = [...questoes];
      while (acumulado.length < alvo) {
        const resultado = await gerar({
          data: {
            materia,
            grupo: grupoDaMateria(edital, materia),
            banca,
            quantidade: Math.min(LOTE, alvo - acumulado.length),
            formato: "multipla",
            contexto:
              [contextoDoEdital(edital, materia), contextoDoAcervo(acervo)]
                .filter(Boolean)
                .join("\n\n") || null,
          },
        });
        if (resultado.indisponivel) return { acumulado, indisponivel: resultado.indisponivel };
        const lote = resultado.questoes;
        if (!lote.length) break;
        acumulado.push(
          ...lote.map((q, i) => ({ ...q, id: q.id || `${materia}-${acumulado.length + i}` })),
        );
      }
      return { acumulado };
    },
    onSuccess: ({ acumulado, indisponivel }) => {
      if (acumulado.length) setProvas((p) => ({ ...p, [materia]: acumulado }));
      if (indisponivel) toast.error(indisponivel);
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao completar a prova."),
  });

  return (
    <AppShell
      titulo="Prova interativa"
      descricao={`20 questões por matéria do edital, tiradas dos seus PDFs e do acervo — no formato da banca ${banca}.`}
    >
      <BancaAtual banca={banca} definida={bancaDefinida} />
      <FiltroConcurso compacto />
      <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        {semMaterias ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhuma matéria deste edital/banca/cargo. Ajuste o filtro do concurso ou cadastre as
            matérias em “Incluir”.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {MATERIAS.map((m) => {
              const total = montarProvaLocal(disponivel, m, ALVO).disponiveis;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMateria(m)}
                  className={`min-w-28 flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    materia === m
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {m}
                  {ehDoEdital(edital, m) && (
                    <span className="ml-1.5 rounded bg-secondary/70 px-1 text-[10px] font-semibold">
                      Edital
                    </span>
                  )}
                  <span className="ml-1.5 text-[10px] font-semibold opacity-80">{total}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Banco local: {previa.disponiveis} questões de {materia || "—"}
          {nomesProvas.length ? ` · provas: ${nomesProvas.join(", ")}` : ""} — extraídas sem gastar
          crédito de IA.
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {respondidas} respondidas · {Math.max(0, questoes.length - respondidas)} restantes
            </span>
            <span>
              {questoes.length}/{ALVO} questões
            </span>
          </div>
          <Progress value={questoes.length ? (respondidas / questoes.length) * 100 : 0} />
          {questoes.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {resolvidas} com gabarito · {comExplicacao} com explicação da própria prova
            </p>
          )}
        </div>

        <Button className="w-full" disabled={semMaterias} onClick={montarLocal}>
          {semMaterias
            ? "Selecione um edital com matérias"
            : `Montar prova de ${materia} — ${Math.min(ALVO, previa.disponiveis)} de ${ALVO} questões (sem IA)`}
        </Button>

        {previa.faltam > 0 && (
          <Button
            variant="outline"
            className="w-full"
            disabled={mutation.isPending || semMaterias}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Completando com IA…
              </>
            ) : (
              `Completar as ${previa.faltam} que faltam com IA (usa crédito)`
            )}
          </Button>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            disabled={!questoes.length}
            onClick={() =>
              setCorrigida((c) => ({ ...c, ...Object.fromEntries(questoes.map((q) => [q.id, true])) }))
            }
          >
            Correção automática
          </Button>
          <Button variant="outline" disabled={!questoes.length} onClick={() => window.print()}>
            <Download className="mr-2 size-4" /> Baixar PDF
          </Button>
        </div>
        <LegendaCores />
      </section>

      <ResumoRelevancia itens={assuntos} />

      {questoes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {previa.disponiveis
            ? `Toque em “Montar prova de ${materia}” para começar a rolagem vertical contínua.`
            : `Nenhuma questão de ${materia} no seu banco ainda. Anexe o PDF da prova em “Incluir → Provas anteriores”.`}
        </p>
      ) : (
        <div className="space-y-4">
          {questoes.map((q, i) => {
            const mostrar = corrigida[q.id] ?? false;
            return (
              <article key={q.id || i} className="rounded-xl border border-border bg-paper p-4">
                <header className="mb-2 text-xs font-semibold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  {q.titulo ??
                    [q.materia || materia, q.assunto, q.banca || banca].filter(Boolean).join(" · ")}

                  {q.origem && (
                    <span className="ml-1.5 rounded bg-mark-yellow-soft px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      {q.origem}
                    </span>
                  )}
                  {!temGabarito(q) && (
                    <span className="ml-1.5 rounded bg-mark-red-soft px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      sem gabarito
                    </span>
                  )}
                  <Relevancia
                    materia={q.materia || materia}
                    assunto={q.assunto}
                    relevanciaMateria={q.relevancia_materia}
                    relevanciaAssunto={q.relevancia_assunto}
                  />
                </header>
                <p className="text-[15px] leading-relaxed">
                  <Marcado texto={q.enunciado} />
                </p>
                <ul className="mt-3 space-y-2">
                  {q.alternativas.map((a) => {
                    const marcada = respostas[q.id] === a.letra;
                    return (
                      <li key={a.letra}>
                        <button
                          type="button"
                          onClick={() => {
                            setRespostas((r) => ({ ...r, [q.id]: a.letra }));
                            registrarResposta({ ...q, materia: q.materia || materia }, a.correta);
                          }}
                          className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                            mostrar
                              ? a.correta
                                ? "border-mark-blue bg-mark-blue-soft/40"
                                : "border-mark-red/60"
                              : marcada
                                ? "border-primary bg-secondary"
                                : "border-border"
                          }`}
                        >
                          <span className="font-bold">{a.letra})</span> <Marcado texto={a.texto} />
                          {mostrar && a.explicacao && (
                            <p
                              className={`mt-2 text-xs leading-relaxed ${
                                a.correta ? "text-mark-blue" : "text-mark-red"
                              }`}
                            >
                              <Marcado texto={a.explicacao} />
                            </p>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {mostrar && (
                  <p className="mt-3 rounded-lg bg-secondary p-3 text-sm leading-relaxed">
                    <span className="font-semibold text-primary">
                      {temGabarito(q)
                        ? `Gabarito: ${q.alternativas.find((a) => a.correta)?.letra}. `
                        : "Gabarito não informado nesta prova. "}
                    </span>
                    {q.explicacao?.trim() ? (
                      <Marcado texto={q.explicacao} />
                    ) : (
                      <span className="text-muted-foreground">
                        Esta prova não trouxe comentário. Peça a explicação da IA na aba Questões.
                      </span>
                    )}
                  </p>
                )}
                <div className="no-print mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCorrigida((c) => ({ ...c, [q.id]: !mostrar }))}
                  >
                    {mostrar ? "Ocultar gabarito" : "Ver gabarito comentado"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
