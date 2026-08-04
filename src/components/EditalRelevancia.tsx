import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, LineChart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimarRelevanciaEdital } from "@/lib/ai.functions";
import {
  materiasPorRelevancia,
  relevanciaGeral,
  topicosPorRelevancia,
  useEdital,
  type MateriaEdital,
} from "@/lib/edital";
import { useRevisao, type HistoricoRevisao } from "@/lib/revisao";
import { useTrilha } from "@/lib/trilha";

function pct(valor?: number) {
  if (valor == null) return "—";
  return `${valor.toFixed(2).replace(".", ",")} %`;
}

function cor(valor?: number) {
  if (valor == null) return "text-muted-foreground";
  if (valor >= 10) return "text-mark-red font-semibold";
  if (valor >= 5) return "text-foreground font-semibold";
  return "text-muted-foreground";
}

function normaliza(texto: string) {
  return texto.trim().toLowerCase();
}

/** Desempenho do usuário nas questões já respondidas de uma matéria/assunto. */
function desempenho(historico: HistoricoRevisao, materia: string, assunto?: string) {
  let acertos = 0;
  let total = 0;
  for (const card of Object.values(historico.cards)) {
    const q = card.questao;
    if (normaliza(card.materia || q.materia || "") !== normaliza(materia)) continue;
    if (assunto) {
      const alvo = normaliza(q.assunto || "");
      if (!alvo || !(alvo.includes(normaliza(assunto)) || normaliza(assunto).includes(alvo)))
        continue;
    }
    acertos += card.acertos;
    total += card.acertos + card.erros;
  }
  return { acertos, total, taxa: total ? Math.round((acertos / total) * 100) : 0 };
}

function IrParaQuestoes({ materia, assunto }: { materia: string; assunto?: string }) {
  return (
    <Link
      to="/questoes"
      search={assunto ? { materia, assunto } : { materia }}
      className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
    >
      <LineChart className="size-3.5" /> Ir para questões
    </Link>
  );
}

function LinhaMateria({
  materia,
  historico,
}: {
  materia: MateriaEdital;
  historico: HistoricoRevisao;
}) {
  const [aberta, setAberta] = useState(false);
  const geral = desempenho(historico, materia.nome);
  const topicos = topicosPorRelevancia(materia);

  return (
    <li className="border-l-4 border-accent/70">
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 bg-secondary/60 px-3 py-2.5 text-left"
      >
        {aberta ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 font-display text-sm font-bold">{materia.nome}</span>
        <span className="text-xs">
          Relevância: <span className={cor(materia.relevancia)}>{pct(materia.relevancia)}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Meu desempenho: {geral.total ? `${geral.taxa}%` : "—"}
        </span>
      </button>

      {aberta && (
        <div className="px-3 py-2">
          {topicos.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">
              Nenhum tópico cadastrado para esta matéria.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 text-left font-medium">Assunto analisado</th>
                  <th className="py-2 text-right font-medium">Relev. na disciplina</th>
                  <th className="py-2 text-right font-medium">Relev. geral</th>
                  <th className="py-2 text-right font-medium">Meu desempenho</th>
                  <th className="py-2 text-right font-medium">Praticar</th>
                </tr>
              </thead>
              <tbody>
                {topicos.map((t, i) => {
                  const disciplina = materia.relevanciaTopicos?.[t];
                  const desempenhoTopico = desempenho(historico, materia.nome, t);
                  return (
                    <tr key={t} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-2 align-top">
                        <span className="text-muted-foreground">{i + 1}. </span>
                        {t}
                      </td>
                      <td className={`py-2 text-right align-top ${cor(disciplina)}`}>
                        {pct(disciplina)}
                      </td>
                      <td className={`py-2 text-right align-top ${cor(relevanciaGeral(materia, t))}`}>
                        {pct(relevanciaGeral(materia, t))}
                      </td>
                      <td className="py-2 text-right align-top text-muted-foreground">
                        {desempenhoTopico.total
                          ? `${desempenhoTopico.taxa} % em ${desempenhoTopico.total} questões`
                          : "0 % em 0 questões"}
                      </td>
                      <td className="py-2 pl-2 align-top">
                        <div className="flex justify-end">
                          <IrParaQuestoes materia={materia.nome} assunto={t} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </li>
  );
}

/** Detalhamento de relevância das matérias e assuntos do edital. */
export function EditalRelevancia() {
  const { edital, definirMaterias } = useEdital();
  const { historico } = useRevisao();
  const { trilha } = useTrilha();
  const estimar = useServerFn(estimarRelevanciaEdital);

  const mut = useMutation({
    mutationFn: () =>
      estimar({
        data: {
          banca: trilha.banca || undefined,
          cargo: trilha.cargo || undefined,
          materias: edital.materias.map((m) => ({
            nome: m.nome,
            topicos: m.topicos.slice(0, 120),
          })),
        },
      }),
    onSuccess: (resultado) => {
      if (!resultado.length) {
        toast.error("A IA não retornou relevâncias.");
        return;
      }
      definirMaterias(
        edital.materias.map((m) => {
          const achada = resultado.find((r) => normaliza(r.nome) === normaliza(m.nome));
          if (!achada) return m;
          const relevanciaTopicos: Record<string, number> = {};
          for (const t of achada.topicos ?? []) {
            const topico = m.topicos.find((x) => normaliza(x) === normaliza(t.nome));
            if (topico && typeof t.relevancia_disciplina === "number") {
              relevanciaTopicos[topico] = t.relevancia_disciplina;
            }
          }
          return { ...m, relevancia: achada.relevancia, relevanciaTopicos };
        }),
      );
      toast.success("Relevâncias do edital atualizadas.");
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao calcular a relevância."),
  });

  if (!edital.materias.length) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold">Detalhamento do edital</h2>
          <p className="text-xs text-muted-foreground">
            Relevância de cada matéria na prova e de cada assunto dentro da matéria, com o seu
            desempenho e atalho para praticar.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mut.isPending}
          onClick={() => mut.mutate()}
        >
          {mut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Calculando…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" /> Calcular relevância
            </>
          )}
        </Button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {materiasPorRelevancia(edital).map((m) => (
          <LinhaMateria key={m.id} materia={m} historico={historico} />
        ))}
      </ul>
    </section>
  );
}
