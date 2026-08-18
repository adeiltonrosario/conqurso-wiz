import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Relevancia, ResumoRelevancia, agruparAssuntos } from "@/components/Relevancia";
import { Button } from "@/components/ui/button";
import { contextoDoAcervo, useAcervo } from "@/lib/acervo";
import {
  contextoDoEdital,
  ehDoEdital,
  grupoDaMateria,
  materiasPorGrupo,
  useEdital,
} from "@/lib/edital";
import { gerarQuestoes, type Questao } from "@/lib/ai.functions";
import { registrarResposta } from "@/lib/revisao";
import { useBancaPrevista } from "@/lib/trilha";
import { BancaAtual } from "@/components/BancaAtual";

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

function CartaoQuestao({ questao, numero }: { questao: Questao; numero: number }) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const respondida = escolha !== null;
  const correta = questao.alternativas.find((a) => a.correta);

  function escolher(letra: string) {
    setEscolha(letra);
    registrarResposta(questao, letra === correta?.letra);
  }


  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="mb-2 text-xs font-semibold text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-secondary px-2 py-0.5 text-primary">
            Questão {numero} — {questao.banca}
          </span>
          <span>{questao.materia}</span>
          {questao.origem && (
            <span className="rounded bg-mark-yellow-soft px-2 py-0.5 text-[10px] font-semibold text-foreground">
              {questao.origem}
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


      <p className="text-[15px] leading-relaxed">
        <Marcado texto={questao.enunciado} />
      </p>

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

      {respondida && (
        <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
          <p className="font-semibold text-primary">
            Gabarito: {correta?.letra}
            {escolha !== correta?.letra && (
              <span className="ml-2 font-normal text-mark-red">
                sua marcação: {escolha} (erro grifado em vermelho)
              </span>
            )}
          </p>
          <p className="mt-1.5 leading-relaxed">
            <Marcado texto={questao.explicacao} />
          </p>
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

    onSuccess: (questoes) => atualizar({ simulado: questoes }),
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar as questões."),
  });

  const permitidas = acervo.simulado.filter((q) => questaoPermitida(edital, q));
  const visiveis = permitidas.filter(
    (q) => !q.materia || q.materia.toLowerCase().includes(materiaAtiva.toLowerCase()),
  );
  const lista = visiveis.length ? visiveis : permitidas;
  const assuntos = agruparAssuntos(lista);

  return (
    <AppShell
      titulo="Questões e explicações"
      descricao={`Padrão ${banca} com 5 alternativas e gabarito comentado passo a passo pela IA.`}
    >
      <BancaAtual banca={banca} definida={bancaDefinida} />
      <FiltroConcurso compacto />
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

        <Button className="w-full" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Montando questões…
            </>
          ) : (
            foco ? `Gerar questões de ${foco}` : `Gerar questões de ${materiaAtiva}`
          )}
        </Button>
        <LegendaCores />
      </section>

      <ResumoRelevancia itens={assuntos} />

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma questão ainda. Gere um simulado acima ou cadastre conteúdo em “Incluir”.
        </p>
      ) : (
        lista.map((q, i) => <CartaoQuestao key={q.id || i} questao={q} numero={i + 1} />)
      )}
    </AppShell>
  );
}
