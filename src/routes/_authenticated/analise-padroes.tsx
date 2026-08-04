import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Printer,
  Send,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MATERIAS_ESPECIFICO, MATERIAS_GERAL } from "@/lib/acervo";
import { analisarPadroes, conversarPadroes, type PadraoAnalise } from "@/lib/ai.functions";

export const Route = createFileRoute("/analise-padroes")({
  head: () => ({
    meta: [
      { title: "Análise de padrões de provas | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Envie provas, gabaritos e imagens e veja a IA identificar padrões de acertos e erros questão por questão, com PDF pronto para impressão.",
      },
      { property: "og:title", content: "Análise de padrões de provas" },
      {
        property: "og:description",
        content: "Grifos coloridos, setas por frase e chat com IA para validar suas hipóteses de padrão.",
      },
    ],
  }),
  component: AnalisePage,
});

const MATERIAS = ["Todas", ...MATERIAS_GERAL, ...MATERIAS_ESPECIFICO];

function AnalisePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<string[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [materia, setMateria] = useState("Todas");
  const [analise, setAnalise] = useState<PadraoAnalise | null>(null);
  const [indice, setIndice] = useState(0);
  const [pergunta, setPergunta] = useState("");
  const [chat, setChat] = useState<{ autor: "voce" | "ia"; texto: string }[]>([]);

  const analisar = useServerFn(analisarPadroes);
  const conversar = useServerFn(conversarPadroes);

  const analiseMut = useMutation({
    mutationFn: () =>
      analisar({
        data: {
          conteudo: `${arquivos.length ? `Arquivos enviados: ${arquivos.join(", ")}\n` : ""}${conteudo}`,
          materia: materia === "Todas" ? "" : materia,
        },
      }),
    onSuccess: (r) => {
      setAnalise(r);
      setIndice(0);
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível analisar a prova."),
  });

  const chatMut = useMutation({
    mutationFn: (texto: string) =>
      conversar({
        data: {
          pergunta: texto,
          contexto: analise ? JSON.stringify(analise).slice(0, 15000) : conteudo,
        },
      }),
    onSuccess: (resposta) => setChat((c) => [...c, { autor: "ia", texto: resposta }]),
    onError: (e: Error) => toast.error(e.message || "A IA não respondeu."),
  });

  const questoes = (analise?.questoes ?? []).filter(
    (q) => materia === "Todas" || q.materia?.toLowerCase().includes(materia.toLowerCase()),
  );
  const questao = questoes[Math.min(indice, Math.max(0, questoes.length - 1))];

  return (
    <AppShell
      titulo="Análise de padrões"
      descricao="A IA resolve a prova, grifa os padrões e gera o PDF respondido para impressão."
    >
      <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <Label>Arquivos de prova, gabarito e imagens</Label>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            setArquivos((a) => [...a, ...Array.from(e.target.files ?? []).map((f) => f.name)]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/60 px-4 py-8 text-sm text-muted-foreground"
        >
          <UploadCloud className="size-6 text-primary" />
          Toque para selecionar ou arraste os arquivos
        </button>
        {arquivos.length > 0 && (
          <p className="text-xs text-muted-foreground">{arquivos.join(", ")}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="conteudo">Cole o texto da prova e do gabarito</Label>
          <Textarea
            id="conteudo"
            rows={6}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value.slice(0, 40000))}
            placeholder="Cole aqui as questões e o gabarito para a IA extrair os padrões…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="materia">Matéria do edital</Label>
          <select
            id="materia"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {MATERIAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <Button
          className="w-full"
          disabled={conteudo.trim().length < 10 || analiseMut.isPending}
          onClick={() => analiseMut.mutate()}
        >
          {analiseMut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Analisando padrões…
            </>
          ) : (
            "Analisar padrões da prova"
          )}
        </Button>
        <LegendaCores />
      </section>

      {analise && (
        <>
          <section className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="font-display text-base font-bold">Padrões descobertos</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {analise.resumo?.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                  <Marcado texto={p} />
                </li>
              ))}
            </ul>
          </section>

          {questao && (
            <section className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="no-print mb-3 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={indice === 0}
                  onClick={() => setIndice((i) => Math.max(0, i - 1))}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <span className="text-xs font-semibold text-muted-foreground">
                  Questão {indice + 1} de {questoes.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={indice >= questoes.length - 1}
                  onClick={() => setIndice((i) => Math.min(questoes.length - 1, i + 1))}
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>

              <p className="text-[15px] leading-relaxed">
                <Marcado texto={questao.enunciado} />
              </p>

              {questao.frases?.length > 0 && (
                <ul className="mt-3 space-y-2 border-l-2 border-border pl-3">
                  {questao.frases.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {f.sentido === "correta" ? (
                        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-mark-blue" />
                      ) : (
                        <ArrowDownRight className="mt-0.5 size-4 shrink-0 text-mark-red" />
                      )}
                      <Marcado texto={f.texto} />
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mt-4 space-y-2">
                {questao.alternativas?.map((a) => (
                  <li
                    key={a.letra}
                    className={`rounded-lg border p-3 text-sm ${
                      a.correta ? "border-mark-blue bg-mark-blue-soft/40" : "border-border"
                    }`}
                  >
                    <span className="font-bold">{a.letra})</span> <Marcado texto={a.texto} />
                    {a.padrao && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        <Marcado texto={a.padrao} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="font-display text-base font-bold">Chat de padrões</h2>
            <div className="space-y-2">
              {chat.map((m, i) => (
                <p
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    m.autor === "voce"
                      ? "ml-8 bg-primary text-primary-foreground"
                      : "mr-8 bg-secondary"
                  }`}
                >
                  {m.texto}
                </p>
              ))}
              {chatMut.isPending && (
                <p className="text-xs text-muted-foreground">A IA está analisando sua hipótese…</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value.slice(0, 1000))}
                placeholder="Ex.: a correta sempre termina em vogal?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pergunta.trim()) {
                    setChat((c) => [...c, { autor: "voce", texto: pergunta.trim() }]);
                    chatMut.mutate(pergunta.trim());
                    setPergunta("");
                  }
                }}
              />
              <Button
                disabled={!pergunta.trim() || chatMut.isPending}
                onClick={() => {
                  setChat((c) => [...c, { autor: "voce", texto: pergunta.trim() }]);
                  chatMut.mutate(pergunta.trim());
                  setPergunta("");
                }}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </section>

          <Button className="no-print w-full" variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 size-4" /> Gerar PDF da prova respondida
          </Button>
        </>
      )}
    </AppShell>
  );
}
