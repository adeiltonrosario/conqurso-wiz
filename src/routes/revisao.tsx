import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Marcado, LegendaCores } from "../components/Marcado";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { contextoDoAcervo, useAcervo } from "../lib/acervo";
import { gerarQuestoes, type Questao } from "../lib/ai.functions";
import {
  contextoDaLeitura,
  somarQuestoesGeradas,
  useLeituras,
  type Leitura,
} from "../lib/leituras";
import {
  filaDeHoje,
  materiaMaisFraca,
  proximaData,
  registrarResposta,
  resumoPorMateria,
  useRevisao,
} from "../lib/revisao";

export const Route = createFileRoute("/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão espaçada automática | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Modo de revisão por repetição espaçada que reagenda as questões conforme seu histórico de acertos e erros e prioriza suas matérias mais fracas.",
      },
      { property: "og:title", content: "Revisão por repetição espaçada" },
      {
        property: "og:description",
        content:
          "A IA remonta sua fila de estudo todos os dias: erro volta logo, acerto volta mais tarde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisaoPage,
});

function formatarData(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CartaoRevisao({
  questao,
  onResponder,
}: {
  questao: Questao;
  onResponder: (acertou: boolean, comSeguranca: boolean) => void;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const correta = questao.alternativas.find((a) => a.correta);
  const respondida = escolha !== null;
  const acertou = escolha === correta?.letra;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="rounded bg-secondary px-2 py-0.5 text-primary">Revisão agendada</span>
        <span>{questao.materia || "Geral"}</span>
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
                onClick={() => setEscolha(a.letra)}
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
        <div className="mt-3 space-y-3 rounded-lg bg-secondary p-3 text-sm">
          <p className="font-semibold text-primary">
            Gabarito: {correta?.letra}
            {!acertou && (
              <span className="ml-2 font-normal text-mark-red">sua marcação: {escolha}</span>
            )}
          </p>
          <p className="leading-relaxed">
            <Marcado texto={questao.explicacao} />
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button size="sm" variant="outline" onClick={() => onResponder(false, false)}>
              Errei — rever hoje
            </Button>
            <Button size="sm" variant="outline" onClick={() => onResponder(acertou, false)}>
              Acertei com dúvida
            </Button>
            <Button size="sm" onClick={() => onResponder(acertou, true)}>
              Acertei fácil
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sua resposta define quando esta questão volta: erro reaparece em minutos, acerto seguro
            pode ir para 30 ou 60 dias.
          </p>
        </div>
      )}
    </article>
  );
}

function RevisaoPage() {
  const { acervo } = useAcervo();
  const { historico, limparHistorico } = useRevisao();
  const { leituras } = useLeituras();
  const [indice, setIndice] = useState(0);
  const gerar = useServerFn(gerarQuestoes);

  const fila = useMemo(() => filaDeHoje(historico), [historico]);
  const resumo = useMemo(() => resumoPorMateria(historico), [historico]);
  const proxima = proximaData(historico);
  const totalCards = Object.keys(historico.cards).length;
  const atual = fila[Math.min(indice, Math.max(0, fila.length - 1))];

  const reforco = useMutation({
    mutationFn: async () => {
      const materia = materiaMaisFraca(historico) ?? "Língua Portuguesa";
      const questoes = await gerar({
        data: {
          materia,
          grupo: "Conhecimento Geral",
          banca: "FCC",
          quantidade: 5,
          formato: "multipla",
          contexto: contextoDoAcervo(acervo) || null,
        },
      });
      return { materia, questoes };
    },
    onSuccess: ({ materia, questoes }) => {
      if (!questoes.length) {
        toast.error("A IA não retornou questões. Tente novamente.");
        return;
      }
      // Entram na fila já vencidos, para estudo imediato.
      questoes.forEach((q, i) =>
        registrarResposta(
          { ...q, id: q.id || `rev-${Date.now()}-${i}`, materia: q.materia || materia },
          false,
          0,
        ),
      );
      toast.success(`${questoes.length} questões de reforço adicionadas em ${materia}.`);
      setIndice(0);
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar o reforço."),
  });

  const reforcoLeitura = useMutation({
    mutationFn: async (l: Leitura) => {
      const questoes = await gerar({
        data: {
          materia: l.materia,
          grupo: "Conhecimento Específico",
          banca: "FCC",
          quantidade: 5,
          formato: "multipla",
          contexto: `${contextoDaLeitura(l)}\n\nGere questões APENAS sobre esse capítulo lido.`,
        },
      });
      return { l, questoes };
    },
    onSuccess: ({ l, questoes }) => {
      if (!questoes.length) {
        toast.error("A IA não retornou questões deste capítulo.");
        return;
      }
      questoes.forEach((q, i) =>
        registrarResposta(
          {
            ...q,
            id: q.id || `lei-${l.id}-${Date.now()}-${i}`,
            materia: `${l.materia} — ${l.capitulo}`,
          },
          false,
          0,
        ),
      );
      somarQuestoesGeradas(l.id, questoes.length);
      toast.success(`Reforço da leitura “${l.capitulo}” adicionado à fila.`);
      setIndice(0);
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar o reforço da leitura."),
  });



  function responder(acertou: boolean, comSeguranca: boolean) {
    if (!atual) return;
    registrarResposta(atual.questao, acertou, acertou ? (comSeguranca ? 2 : 1) : 0);
    setIndice((i) => i + 1);
  }

  return (
    <AppShell
      titulo="Revisão espaçada"
      descricao="A fila é montada sozinha a partir do seu histórico: o que você erra volta rápido, o que você domina volta bem depois."
    >
      <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="size-4 text-primary" />
          {fila.length ? `${fila.length} questões para revisar agora` : "Nenhuma revisão vencida"}
        </div>
        <Progress
          value={totalCards ? ((totalCards - fila.length) / totalCards) * 100 : 0}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          {totalCards
            ? proxima
              ? `${totalCards} questões no seu histórico · próxima volta em ${formatarData(proxima)}`
              : `${totalCards} questões no seu histórico`
            : "Responda questões em “Questões” ou “Prova” para alimentar a revisão."}
        </p>

        {resumo.length > 0 && (
          <ul className="space-y-1.5">
            {resumo.map((m) => (
              <li key={m.materia} className="text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">{m.materia}</span>
                  <span className="text-muted-foreground">
                    {Math.round(m.taxa * 100)}% de acerto · {m.vencidos} vencidas
                  </span>
                </div>
                <Progress className="mt-1 h-1.5" value={m.taxa * 100} />
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button disabled={reforco.isPending} onClick={() => reforco.mutate()}>
            {reforco.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Gerando reforço…
              </>
            ) : (
              "Reforçar matéria mais fraca"
            )}
          </Button>
          <Button
            variant="outline"
            disabled={!totalCards}
            onClick={() => {
              limparHistorico();
              setIndice(0);
              toast.success("Histórico de revisão zerado.");
            }}
          >
            <RotateCcw className="mr-2 size-4" /> Zerar histórico
          </Button>
        </div>
        <LegendaCores />
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4 text-primary" /> Reforço das leis que você leu
        </div>
        {leituras.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma leitura ainda.{" "}
            <Link to="/leis" className="font-semibold text-primary underline">
              Leia um capítulo do edital
            </Link>{" "}
            e ele entra aqui para gerar questões automaticamente.
          </p>
        ) : (
          <ul className="space-y-2">
            {leituras.slice(0, 6).map((l) => (
              <li key={l.id} className="rounded-lg border border-border/70 p-3">
                <p className="text-sm font-semibold">{l.capitulo}</p>
                <p className="text-xs text-muted-foreground">
                  {l.materia}
                  {l.baseLegal ? ` · ${l.baseLegal}` : ""} · {l.questoesGeradas} questão(ões) na fila
                </p>
                {(l.focos ?? []).length > 0 && (
                  <p className="mt-1 text-xs text-primary">
                    Recorte: {l.focos.length} artigo(s)/tópico(s) selecionados na leitura
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  disabled={reforcoLeitura.isPending}
                  onClick={() => reforcoLeitura.mutate(l)}
                >
                  {reforcoLeitura.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Gerando…
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 size-4" /> Reforçar esta leitura
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>


      {atual ? (
        <CartaoRevisao key={atual.questao.id || indice} questao={atual.questao} onResponder={responder} />
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {totalCards
            ? "Revisão de hoje concluída. Volte no horário agendado ou gere um reforço da matéria mais fraca."
            : "Sua fila está vazia. Responda questões nas outras telas ou gere um reforço agora."}
        </p>
      )}
    </AppShell>
  );
}
