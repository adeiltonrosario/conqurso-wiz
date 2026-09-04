import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Eye, Layers, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CardForm } from "@/components/CardForm";
import { ImagemCard } from "@/components/ImagemCard";
import { useAcervo } from "@/lib/acervo";
import { useEdital, materiasAtivas } from "@/lib/edital";
import { bancoLocal } from "@/lib/prova-local";
import { temGabarito } from "@/lib/questoes-pdf";
import { registrarResposta } from "@/lib/revisao";
import { listarCards, salvarCard, removerCard } from "@/lib/cards.functions";
import {
  cardParaQuestao,
  lerCards,
  removerImagemDoCard,
  salvarCardsLocal,
  temImagem,
  type CardProprio,
} from "@/lib/cards";
import type { Questao } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({
    meta: [
      { title: "Flash cards por matéria | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Crie seus próprios flash cards com pergunta, resposta e imagem, e revise por matéria marcando acertos e erros.",
      },
      { property: "og:title", content: "Flash cards por matéria" },
      {
        property: "og:description",
        content: "Cards próprios com imagem e revisão rápida filtrada pela matéria do edital.",
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
  return certa.letra === "A" && q.alternativas.length === 1
    ? certa.texto
    : `${certa.letra}) ${certa.texto}`;
}

function FlashcardsPage() {
  const { edital } = useEdital();
  const { acervo } = useAcervo();
  const queryClient = useQueryClient();
  const buscarCards = useServerFn(listarCards);
  const gravarCard = useServerFn(salvarCard);
  const apagarCard = useServerFn(removerCard);

  const [materia, setMateria] = useState<string | null>(null);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [feitos, setFeitos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [emEdicao, setEmEdicao] = useState<CardProprio | null>(null);
  const [criando, setCriando] = useState(false);

  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: () => buscarCards(),
    initialData: () => (lerCards().length ? lerCards() : undefined),
  });

  const meusCards = cardsQuery.data ?? [];

  useEffect(() => {
    if (cardsQuery.data) salvarCardsLocal(cardsQuery.data);
  }, [cardsQuery.data]);

  const salvarMut = useMutation({
    mutationFn: (card: CardProprio) => gravarCard({ data: { card } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
      setCriando(false);
      setEmEdicao(null);
      toast.success("Card salvo");
    },
    onError: () => toast.error("Não foi possível salvar o card. Tente novamente."),
  });

  const removerMut = useMutation({
    mutationFn: async (card: CardProprio) => {
      await apagarCard({ data: { id: card.id } });
      if (card.imagemPath) await removerImagemDoCard(card.imagemPath);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card excluído");
    },
    onError: () => toast.error("Não foi possível excluir o card."),
  });

  const materiasEdital = useMemo(
    () => [...new Set(materiasAtivas(edital).map((m) => m.nome.trim()).filter(Boolean))],
    [edital],
  );

  const banco = useMemo(() => {
    const questoes = bancoLocal(edital, acervo).filter(temGabarito);
    return [...meusCards.map(cardParaQuestao), ...questoes];
  }, [edital, acervo, meusCards]);

  const mapaCards = useMemo(
    () => new Map<string, CardProprio>(meusCards.map((c) => [`card:${c.id}`, c])),
    [meusCards],
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
  const cardAtual = atual ? mapaCards.get(atual.id) : undefined;

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
      descricao="Crie seus cards com pergunta, resposta e imagem, ou revise as questões do seu acervo por matéria."
    >
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4 text-primary" />
            Meus cards ({meusCards.length})
          </div>
          {!criando && !emEdicao ? (
            <Button size="sm" onClick={() => setCriando(true)}>
              <Plus className="size-4" /> Novo card
            </Button>
          ) : null}
        </div>

        {criando ? (
          <CardForm
            materias={materiasEdital}
            salvando={salvarMut.isPending}
            onSalvar={(c) => salvarMut.mutate(c)}
            onCancelar={() => setCriando(false)}
          />
        ) : null}

        {emEdicao ? (
          <CardForm
            key={emEdicao.id}
            inicial={emEdicao}
            materias={materiasEdital}
            salvando={salvarMut.isPending}
            onSalvar={(c) => salvarMut.mutate(c)}
            onCancelar={() => setEmEdicao(null)}
          />
        ) : null}

        {meusCards.length ? (
          <ul className="space-y-2">
            {meusCards.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.pergunta}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[c.materia || "Sem matéria", c.assunto].filter(Boolean).join(" · ")}
                    {temImagem(c) ? " · com imagem" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEmEdicao(c)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removerMut.mutate(c)}
                    disabled={removerMut.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : !criando ? (
          <p className="text-xs text-muted-foreground">
            Você ainda não criou cards. Toque em <strong>Novo card</strong> para incluir pergunta,
            resposta e imagem.
          </p>
        ) : null}
      </section>

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
          Nenhum flash card por aqui ainda. Crie um card acima, inclua questões em{" "}
          <strong>Incluir</strong> ou anexe provas com gabarito.
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
            <Marcado
              texto={atual.enunciado}
              className="mt-2 block whitespace-pre-wrap text-sm leading-relaxed"
            />

            {virado ? (
              <div className="mt-4 space-y-2 rounded-xl bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">Resposta</p>
                <Marcado
                  texto={respostaCerta(atual) ?? "Sem gabarito"}
                  className="block whitespace-pre-wrap text-sm"
                />
                {atual.explicacao ? (
                  <Marcado
                    texto={atual.explicacao}
                    className="block whitespace-pre-wrap text-xs text-muted-foreground"
                  />
                ) : null}
                {cardAtual ? <ImagemCard card={cardAtual} /> : null}
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
