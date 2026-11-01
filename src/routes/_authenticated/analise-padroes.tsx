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
  FileText,
  Image as ImageIcon,
  Loader2,
  Printer,
  Send,
  Trash2,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ehDoEdital, todasAsMaterias, useEdital } from "@/lib/edital";
import { analisarPadroes, conversarPadroes, type PadraoAnalise } from "@/lib/ai.functions";
import { analisarPadroesLocal } from "@/lib/padroes-local";
import { PainelIncidencia } from "@/components/PainelIncidencia";
import {
  consolidarConteudo,
  imagensDe,
  lerArquivoRef,
  type ArquivoRef,
} from "@/lib/documentos";

export const Route = createFileRoute("/_authenticated/analise-padroes")({
  head: () => ({
    meta: [
      { title: "Análise de padrões de provas | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Envie provas em PDF, Word ou imagens e veja os padrões de acertos e erros questão por questão, com modo local sem gastar créditos.",
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

type Modo = "local" | "ia";

function AnalisePage() {
  const { edital } = useEdital();
  const MATERIAS = ["Todas", ...todasAsMaterias(edital)];
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<ArquivoRef[]>([]);
  const [lendo, setLendo] = useState(false);
  const [conteudo, setConteudo] = useState("");
  const [materia, setMateria] = useState("Todas");
  const [modo, setModo] = useState<Modo>("local");
  const [analise, setAnalise] = useState<PadraoAnalise | null>(null);
  const [indice, setIndice] = useState(0);
  const [pergunta, setPergunta] = useState("");
  const [chat, setChat] = useState<{ autor: "voce" | "ia"; texto: string }[]>([]);

  const analisar = useServerFn(analisarPadroes);
  const conversar = useServerFn(conversarPadroes);

  const textoTotal = consolidarConteudo(conteudo, arquivos);
  const imagens = imagensDe(arquivos);
  const podeAnalisar =
    modo === "local" ? textoTotal.trim().length >= 10 : textoTotal.trim().length >= 10 || imagens.length > 0;

  async function receberArquivos(files: File[]) {
    if (!files.length) return;
    setLendo(true);
    for (const file of files) {
      const ref = await lerArquivoRef(file);
      setArquivos((a) => [...a, ref]);
      if (ref.status === "erro") toast.error(`${ref.nome}: ${ref.aviso ?? "não foi possível ler"}`);
    }
    setLendo(false);
  }

  const analiseMut = useMutation({
    mutationFn: async () => {
      if (modo === "local") {
        return analisarPadroesLocal(textoTotal, materia === "Todas" ? "" : materia);
      }
      return await analisar({
        data: {
          conteudo: textoTotal,
          materia: materia === "Todas" ? "" : materia,
          imagens,
        },
      });
    },
    onSuccess: (r) => {
      setAnalise(r);
      setIndice(0);
      if (!r.questoes.length) {
        toast.warning("Nenhuma questão foi reconhecida no material enviado.");
      }
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível analisar a prova."),
  });

  const chatMut = useMutation({
    mutationFn: (texto: string) =>
      conversar({
        data: {
          pergunta: texto,
          contexto: analise ? JSON.stringify(analise).slice(0, 15000) : textoTotal.slice(0, 15000),
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
      descricao="Envie PDF, Word ou fotos da prova: o app grifa os padrões e gera o PDF respondido para impressão."
    >
      <FiltroConcurso compacto />
      <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <Label>Arquivos de referência (PDF, Word, imagens)</Label>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            void receberArquivos(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/60 px-4 py-8 text-sm text-muted-foreground"
        >
          {lendo ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="size-6 text-primary" />
          )}
          {lendo ? "Lendo o conteúdo dos arquivos…" : "Toque para selecionar PDF, Word ou imagens"}
        </button>

        {arquivos.length > 0 && (
          <ul className="space-y-1.5">
            {arquivos.map((a, i) => (
              <li
                key={`${a.nome}-${i}`}
                className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs"
              >
                {a.status === "imagem" ? (
                  <ImageIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : a.status === "erro" ? (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-mark-red" />
                ) : (
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.nome}</p>
                  <p className="text-muted-foreground">
                    {a.status === "texto"
                      ? `${a.chars.toLocaleString("pt-BR")} caracteres lidos`
                      : a.status === "imagem"
                        ? "será lido pela IA como imagem"
                        : (a.aviso ?? "não foi possível ler")}
                  </p>
                  {a.status === "imagem" && a.aviso && (
                    <p className="text-muted-foreground">{a.aviso}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${a.nome}`}
                  onClick={() => setArquivos((lista) => lista.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-mark-red"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <Label htmlFor="conteudo">Cole o texto da prova e do gabarito (opcional)</Label>
          <Textarea
            id="conteudo"
            rows={6}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value.slice(0, 40000))}
            placeholder="Cole aqui as questões e o gabarito (ex.: 1-A, 2-C, 3-B) para extrair os padrões…"
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
                {ehDoEdital(edital, m) ? " (edital)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Modo de análise</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={modo === "local" ? "default" : "outline"}
              onClick={() => setModo("local")}
            >
              Local (sem créditos)
            </Button>
            <Button
              type="button"
              variant={modo === "ia" ? "default" : "outline"}
              onClick={() => setModo("ia")}
            >
              Com IA
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {modo === "local"
              ? "O modo local calcula os padrões no seu navegador, sem gastar créditos. Precisa do texto (PDF, Word ou colado) e do gabarito no formato 1-A, 2-C."
              : "O modo IA lê também imagens e PDFs escaneados, resolve a prova e explica cada distrator — consome créditos."}
          </p>
        </div>

        <Button className="w-full" disabled={!podeAnalisar || analiseMut.isPending} onClick={() => analiseMut.mutate()}>
          {analiseMut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Analisando padrões…
            </>
          ) : (
            "Analisar padrões da prova"
          )}
        </Button>
        {!podeAnalisar && (
          <p className="text-xs text-muted-foreground">
            {modo === "local"
              ? "Anexe um PDF/Word com texto ou cole o conteúdo da prova."
              : "Anexe um arquivo (PDF, Word ou imagem) ou cole o conteúdo da prova."}
          </p>
        )}
        <LegendaCores />
      </section>

      <PainelIncidencia
        analise={analise}
        materia={materia}
        prova={arquivos.map((a) => a.nome).join(", ") || "Texto colado"}
        textoProva={textoTotal}
      />

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
            <p className="text-xs text-muted-foreground">O chat usa IA e consome créditos.</p>
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
