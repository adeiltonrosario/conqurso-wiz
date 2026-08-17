import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Relevancia, ResumoRelevancia, agruparAssuntos } from "@/components/Relevancia";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { contextoDoAcervo, useAcervo } from "@/lib/acervo";
import { contextoDoEdital, ehDoEdital, grupoDaMateria, todasAsMaterias, useEdital } from "@/lib/edital";
import { gerarQuestoes, type Questao } from "@/lib/ai.functions";
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
          "Prova simulada idêntica à banca, com no mínimo 35 questões por matéria, correção automática, explicação por alternativa e download em PDF.",
      },
      { property: "og:title", content: "Prova interativa em PDF" },
      {
        property: "og:description",
        content: "Scroll vertical contínuo, progresso por matéria e gabarito comentado alternativa por alternativa.",
      },
    ],
  }),
  component: ProvaPage,
});

const MINIMO = 35;
const LOTE = 10;

function ProvaPage() {
  const { acervo } = useAcervo();
  const { edital } = useEdital();
  const MATERIAS = todasAsMaterias(edital);
  const [materiaSel, setMateriaSel] = useState("");
  const materia = MATERIAS.includes(materiaSel) ? materiaSel : MATERIAS[0]!;
  const setMateria = setMateriaSel;
  const [provas, setProvas] = useState<Record<string, Questao[]>>({});
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [corrigida, setCorrigida] = useState<Record<string, boolean>>({});
  const { banca, definida: bancaDefinida } = useBancaPrevista();
  const gerar = useServerFn(gerarQuestoes);

  const questoes = provas[materia] ?? [];
  const respondidas = questoes.filter((q) => respostas[q.id ?? ""]).length;
  const assuntos = agruparAssuntos(questoes);

  const mutation = useMutation({
    mutationFn: async () => {
      const alvo = Math.max(MINIMO, questoes.length + LOTE);
      const acumulado: Questao[] = [...questoes];
      while (acumulado.length < alvo) {
        const lote = await gerar({
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
        if (!lote.length) break;
        acumulado.push(
          ...lote.map((q, i) => ({ ...q, id: q.id || `${materia}-${acumulado.length + i}` })),
        );
      }
      return acumulado;
    },
    onSuccess: (lista) => setProvas((p) => ({ ...p, [materia]: lista })),
    onError: (e: Error) => toast.error(e.message || "Falha ao montar a prova."),
  });

  return (
    <AppShell
      titulo="Prova interativa"
      descricao={`Formato idêntico ao da banca ${banca}, em scroll vertical contínuo como uma prova impressa.`}
    >
      <BancaAtual banca={banca} definida={bancaDefinida} />
      <FiltroConcurso compacto />
      <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {MATERIAS.map((m) => (
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
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {respondidas} respondidas · {Math.max(0, questoes.length - respondidas)} restantes
            </span>
            <span>
              {questoes.length}/{MINIMO} questões
            </span>
          </div>
          <Progress value={questoes.length ? (respondidas / questoes.length) * 100 : 0} />
        </div>

        <Button className="w-full" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Montando prova de {materia}…
            </>
          ) : questoes.length >= MINIMO ? (
            `Adicionar mais ${LOTE} questões`
          ) : (
            `Gerar prova de ${materia} (mín. ${MINIMO} questões)`
          )}
        </Button>

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
          Gere a prova de {materia} para começar a rolagem vertical contínua.
        </p>
      ) : (
        <div className="space-y-4">
          {questoes.map((q, i) => {
            const mostrar = corrigida[q.id] ?? false;
            return (
              <article key={q.id || i} className="rounded-xl border border-border bg-paper p-4">
                <header className="mb-2 text-xs font-semibold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} · {q.materia || materia} · FCC
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
                          {mostrar && (
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
                      Gabarito: {q.alternativas.find((a) => a.correta)?.letra}.{" "}
                    </span>
                    <Marcado texto={q.explicacao} />
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
