import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Pencil, Bot } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MODELOS_REDACAO } from "@/lib/acervo";
import { gerarRedacao, type Redacao } from "@/lib/ai.functions";
import { gerarRedacaoLocal, marcarConectivos } from "@/lib/redacao-local";

export const Route = createFileRoute("/_authenticated/redacao")({
  head: () => ({
    meta: [
      { title: "Criação de redação | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Monte uma redação dissertativa-argumentativa de até 35 linhas a partir de um tema ou estudo de caso, com conectivos destacados por cores.",
      },
      { property: "og:title", content: "Criação de redação" },
      {
        property: "og:description",
        content: "Introdução, desenvolvimento e conclusão com conectivos grifados e contador de linhas.",
      },
    ],
  }),
  component: RedacaoPage,
});

function estimarLinhas(r: { introducao: string; desenvolvimento: string[]; conclusao: string }) {
  const texto = [r.introducao, ...r.desenvolvimento, r.conclusao]
    .join(" ")
    .replace(/\{\{(azul|vermelho|amarelo)\|([^}]*)\}\}/g, "$2");
  return Math.min(35, Math.max(1, Math.ceil(texto.length / 90)));
}

function BlocoEditavel({
  titulo,
  paragrafos,
  onChange,
}: {
  titulo: string;
  paragrafos: string[];
  onChange: (paragrafos: string[]) => void;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{titulo}</h2>
      <div className="space-y-3">
        {paragrafos.map((p, i) => (
          <Textarea
            key={i}
            value={p}
            onChange={(e) => {
              const proximo = [...paragrafos];
              proximo[i] = e.target.value.slice(0, 2000);
              onChange(proximo);
            }}
            rows={Math.max(3, Math.ceil(p.length / 80))}
            className="paper-sheet min-h-[80px] resize-y text-[15px] leading-relaxed"
          />
        ))}
      </div>
    </section>
  );
}

function RedacaoPage() {
  const [tema, setTema] = useState("");
  const [modelo, setModelo] = useState(MODELOS_REDACAO[0]!);
  const [modo, setModo] = useState<"local" | "ia">("local");
  const [redacao, setRedacao] = useState<Redacao | null>(null);
  const gerar = useServerFn(gerarRedacao);

  const localMutation = useMutation({
    mutationFn: async () => gerarRedacaoLocal(tema, modelo),
    onSuccess: (r) => {
      setRedacao({ ...r, linhas: estimarLinhas(r) });
      toast.success("Estrutura de redação montada. Edite os parágrafos como quiser.");
    },
  });

  const iaMutation = useMutation({
    mutationFn: () => gerar({ data: { tema, modelo } }),
    onSuccess: (r) => setRedacao(r),
    onError: (e: Error) => {
      const msg = e.message || "";
      if (msg.includes("402") || msg.toLowerCase().includes("payment required") || msg.toLowerCase().includes("crédito")) {
        toast.error("Créditos de IA esgotados. Use o modo local ou adicione créditos.");
      } else if (msg.includes("429")) {
        toast.error("Muitas solicitações à IA. Tente novamente em instantes.");
      } else {
        toast.error(e.message || "Não foi possível gerar a redação.");
      }
    },
  });

  const mutation = modo === "local" ? localMutation : iaMutation;

  function atualizarBloco(campo: keyof Redacao, valor: string | string[]) {
    setRedacao((atual) => {
      if (!atual) return atual;
      const proximo = { ...atual, [campo]: valor };
      return { ...proximo, linhas: estimarLinhas(proximo) };
    });
  }

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

        <div className="flex gap-2 rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setModo("local")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              modo === "local" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Pencil className="size-4" /> Modo local
          </button>
          <button
            type="button"
            onClick={() => setModo("ia")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              modo === "ia" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Bot className="size-4" /> Com IA
          </button>
        </div>

        {modo === "ia" && (
          <p className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
            O modo IA gasta créditos do workspace. Se eles acabarem, use o modo local.
          </p>
        )}

        <Button
          className="w-full"
          disabled={tema.trim().length < 5 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> {modo === "local" ? "Montando…" : "Escrevendo…"}
            </>
          ) : modo === "local" ? (
            <>
              <Pencil className="mr-2 size-4" /> Montar redação local
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" /> Gerar redação com IA
            </>
          )}
        </Button>
        <LegendaCores />
      </section>

      {redacao && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
            <h2 className="font-display text-sm font-bold">{redacao.titulo}</h2>
            <span className="text-xs font-semibold text-primary">{redacao.linhas}/35 linhas</span>
          </div>

          <BlocoEditavel
            titulo="Introdução"
            paragrafos={[redacao.introducao]}
            onChange={(v) => atualizarBloco("introducao", v[0] ?? "")}
          />

          <BlocoEditavel
            titulo="Desenvolvimento"
            paragrafos={redacao.desenvolvimento}
            onChange={(v) => atualizarBloco("desenvolvimento", v)}
          />

          <BlocoEditavel
            titulo="Conclusão"
            paragrafos={[redacao.conclusao]}
            onChange={(v) => atualizarBloco("conclusao", v[0] ?? "")}
          />

          {modo === "local" && (
            <p className="text-xs text-muted-foreground">
              Texto gerado localmente. Os parágrafos acima são editáveis. Para marcar conectivos manualmente, use{" "}
              {"{{"}azul|texto{"}}"}, {"{{"}vermelho|texto{"}}"} ou {"{{"}amarelo|texto{"}}"}.
            </p>
          )}
        </>
      )}
    </AppShell>
  );
}
