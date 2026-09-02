import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Layers, RotateCcw, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAcervo } from "@/lib/acervo";
import { useEdital } from "@/lib/edital";
import { bancoLocal } from "@/lib/prova-local";
import { temGabarito } from "@/lib/questoes-pdf";
import { registrarResposta } from "@/lib/revisao";
import type { Questao } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({
    meta: [
      { title: "Flash cards por matéria | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Revise suas questões em formato de flash card, escolhendo a matéria do edital e marcando acertos e erros.",
      },
      { property: "og:title", content: "Flash cards por matéria" },
      {
        property: "og:description",
        content: "Revisão rápida em flash cards, filtrada pela matéria do edital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FlashcardsPage,
});

function respostaCerta(q: Questao) {
  const certa = q.alternativas.find((a) => a.correta);
  if (!certa) return null;
  return `${certa.letra}) ${certa.texto}`;
}

function FlashcardsPage() {
  const { edital } = useEdital();
  const { acervo } = useAcervo();
  const [materia, setMateria] = useState<string | null>(null);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [feitos, setFeitos] = useState(0);
  const [acertos, setAcertos] = useState(0);

  const banco = useMemo(
    () => bancoLocal(edital, acervo).filter(temGabarito),
    [edital, acervo],
  );

  const materias = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const q of banco) mapa.set(q.materia, (mapa.get(q.materia) ?? 0) + 1);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [banco]);

  const cartoes = useMemo(
    () => (materia ? banco.filter((q) => q.materia === materia) : banco),
    [banco, materia],
  );

  useEffect(() => {
    setIndice(0);
    setVirado(false);
  }, [materia]);

  const atual = cartoes[indice];

  function responder(acertou: boolean) {
    if (!atual) return;
    registrarResposta(atual, acertou);
    setFeitos((n) => n + 1);
    if (acertou) setAcertos((n) => n + 1);
    setVirado(false);
    setIndice((i) => (i + 1 < cartoes.length ? i + 1 : 0));
  }

  function reiniciar() {
    setIndice(0);
    setVirado(false);
    setFeitos(0);
    setAcertos(0);
  }

  return (
    <AppShell
      titulo="Flash cards"
      descricao="Revisão rápida: escolha a matéria, leia a pergunta, vire o cartão e marque se acertou."
    >
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="size-4 text-primary" />
          Matéria
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMateria(null)}
            className={`rounded-full border px-3 py-1 text-xs ${
              materia === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            Todas ({banco.length})
          </button>
          {materias.map(([nome, total]) => (
            <button
              key={nome}
              type="button"
              onClick={() => setMateria(nome)}
              className={`rounded-full border px-3 py-1 text-xs ${
                materia === nome
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {nome} ({total})
            </button>
          ))}
        </div>
      </section>

      {!atual ? (
        <section className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum flash card por aqui ainda. Inclua questões em <strong>Incluir</strong> ou anexe
          provas com gabarito para gerar os cartões automaticamente.
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Cartão {indice + 1} de {cartoes.length}
            </span>
            <span>
              {feitos} respondidos · {acertos} acertos
            </span>
          </div>
          <Progress value={cartoes.length ? ((indice + 1) / cartoes.length) * 100 : 0} />

          <button
            type="button"
            onClick={() => setVirado((v) => !v)}
            className="w-full rounded-2xl border border-border bg-card p-5 text-left"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {atual.titulo ?? atual.materia}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{atual.enunciado}</p>

            {virado ? (
              <div className="mt-4 space-y-2 rounded-xl bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">Resposta</p>
                <p className="text-sm">{respostaCerta(atual) ?? "Sem gabarito"}</p>
                {atual.explicacao ? (
                  <p className="text-xs text-muted-foreground">{atual.explicacao}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="size-3.5" /> Toque para ver a resposta
              </p>
            )}
          </button>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => responder(false)}>
              <X className="size-4" /> Errei
            </Button>
            <Button className="flex-1" onClick={() => responder(true)}>
              <Check className="size-4" /> Acertei
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full" onClick={reiniciar}>
            <RotateCcw className="size-3.5" /> Recomeçar
          </Button>
        </section>
      )}
    </AppShell>
  );
}
