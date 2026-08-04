import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MODELOS_REDACAO } from "@/lib/acervo";
import { gerarRedacao, type Redacao } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/redacao")({
  head: () => ({
    meta: [
      { title: "Criação de redação com IA | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Gere uma redação dissertativa-argumentativa de até 35 linhas a partir de um tema ou estudo de caso, com conectivos destacados por cores.",
      },
      { property: "og:title", content: "Criação de redação com IA" },
      {
        property: "og:description",
        content: "Introdução, desenvolvimento e conclusão com conectivos grifados e contador de linhas.",
      },
    ],
  }),
  component: RedacaoPage,
});

function estimarLinhas(r: Redacao) {
  const texto = [r.introducao, ...r.desenvolvimento, r.conclusao]
    .join(" ")
    .replace(/\{\{(azul|vermelho|amarelo)\|([^}]*)\}\}/g, "$2");
  return Math.min(35, Math.max(1, Math.ceil(texto.length / 90)));
}

function Bloco({ titulo, paragrafos }: { titulo: string; paragrafos: string[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-card">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {titulo}
      </h2>
      <div className="paper-sheet rounded-lg px-3 py-1 text-[15px]">
        {paragrafos.map((p, i) => (
          <p key={i} className="mb-3 indent-6 text-justify last:mb-0">
            <Marcado texto={p} />
          </p>
        ))}
      </div>
    </section>
  );
}

function RedacaoPage() {
  const [tema, setTema] = useState("");
  const [modelo, setModelo] = useState(MODELOS_REDACAO[0]!);
  const [redacao, setRedacao] = useState<Redacao | null>(null);
  const gerar = useServerFn(gerarRedacao);

  const mutation = useMutation({
    mutationFn: () => gerar({ data: { tema, modelo } }),
    onSuccess: (r) => setRedacao(r),
    onError: (e: Error) => toast.error(e.message || "Não foi possível gerar a redação."),
  });

  return (
    <AppShell
      titulo="Criação de redação"
      descricao="Tema ou estudo de caso, modelo de estrutura e até 35 linhas com conectivos grifados."
    >
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="tema">Tema ou estudo de caso</Label>
          <Textarea
            id="tema"
            value={tema}
            onChange={(e) => setTema(e.target.value.slice(0, 2000))}
            rows={4}
            placeholder="Ex.: Os limites da atuação policial na apreensão de bens sem mandado judicial."
          />
        </div>

        <div className="space-y-2">
          <Label>Modelo de redação</Label>
          <div className="grid gap-2">
            {MODELOS_REDACAO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModelo(m)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  modelo === m
                    ? "border-primary bg-secondary font-semibold text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          disabled={tema.trim().length < 5 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Escrevendo…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" /> Gerar redação
            </>
          )}
        </Button>
        <LegendaCores />
      </section>

      {redacao && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
            <h2 className="font-display text-sm font-bold">{redacao.titulo}</h2>
            <span className="text-xs font-semibold text-primary">
              {estimarLinhas(redacao)}/35 linhas
            </span>
          </div>
          <Bloco titulo="Introdução" paragrafos={[redacao.introducao]} />
          <Bloco titulo="Desenvolvimento" paragrafos={redacao.desenvolvimento} />
          <Bloco titulo="Conclusão" paragrafos={[redacao.conclusao]} />
        </>
      )}
    </AppShell>
  );
}
