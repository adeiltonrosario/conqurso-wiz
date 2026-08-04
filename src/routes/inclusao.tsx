import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { BANCAS, contextoDoAcervo, useAcervo, type QuestaoCadastrada } from "../lib/acervo";
import { gerarQuestoes } from "../lib/ai.functions";

export const Route = createFileRoute("/inclusao")({
  head: () => ({
    meta: [
      { title: "Inclusão de conteúdo e simulados | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Cadastre questões, assuntos, leis do Vade Mecum, gramática, provas anteriores e edital para gerar simulados e provas interativas.",
      },
      { property: "og:title", content: "Inclusão de conteúdo e simulados" },
      {
        property: "og:description",
        content: "Questões, leis, gramática, provas anteriores e edital no seu acervo de estudo.",
      },
    ],
  }),
  component: InclusaoPage,
});

const LETRAS = ["A", "B", "C", "D", "E"];

function UploadCampo({
  label,
  ajuda,
  arquivos,
  onAdd,
  onRemove,
}: {
  label: string;
  ajuda: string;
  arquivos: string[];
  onAdd: (nomes: string[]) => void;
  onRemove: (nome: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const nomes = Array.from(e.target.files ?? []).map((f) => f.name);
          if (nomes.length) onAdd(nomes);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" className="w-full" onClick={() => ref.current?.click()}>
        <FileUp className="mr-2 size-4" /> Selecionar PDF
      </Button>
      {arquivos.length > 0 && (
        <ul className="space-y-1">
          {arquivos.map((nome) => (
            <li
              key={nome}
              className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs"
            >
              <span className="truncate">{nome}</span>
              <button type="button" onClick={() => onRemove(nome)} aria-label={`Remover ${nome}`}>
                <Trash2 className="size-3.5 text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InclusaoPage() {
  const { acervo, atualizar } = useAcervo();
  const navigate = useNavigate();
  const gerar = useServerFn(gerarQuestoes);

  const [enunciado, setEnunciado] = useState("");
  const [assunto, setAssunto] = useState("");
  const [banca, setBanca] = useState(BANCAS[0]!);
  const [formato, setFormato] = useState<"multipla" | "certo-errado">("multipla");
  const [alternativas, setAlternativas] = useState<string[]>(["", "", "", "", ""]);
  const [correta, setCorreta] = useState("A");

  const simulado = useMutation({
    mutationFn: async () =>
      gerar({
        data: {
          materia: assunto || "Língua Portuguesa",
          grupo: "Conhecimento Geral",
          banca,
          quantidade: 5,
          formato,
          contexto: contextoDoAcervo(acervo) || null,
        },
      }),
    onSuccess: (questoes) => {
      atualizar({ simulado: questoes });
      toast.success("Simulado gerado com explicações.");
      navigate({ to: "/questoes" });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar o simulado."),
  });

  const salvarQuestao = () => {
    if (enunciado.trim().length < 10) {
      toast.error("Escreva o enunciado da questão.");
      return;
    }

    const nova: QuestaoCadastrada = {
      id: crypto.randomUUID(),
      enunciado: enunciado.trim(),
      assunto: assunto.trim() || "Geral",
      banca,
      formato,
      alternativas: formato === "multipla" ? alternativas : ["Certo", "Errado"],
      correta,
    };
    atualizar({ questoes: [nova, ...acervo.questoes] });
    setEnunciado("");
    setAlternativas(["", "", "", "", ""]);
    toast.success("Questão cadastrada no acervo.");
  };

  return (
    <AppShell
      titulo="Inclusão de conteúdo"
      descricao="Alimente o agente com questões, leis, gramática, provas anteriores e edital."
    >
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="font-display text-base font-bold">Nova questão</h2>

        <div className="space-y-2">
          <Label htmlFor="enunciado">Enunciado</Label>
          <Textarea
            id="enunciado"
            rows={4}
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value.slice(0, 4000))}
            placeholder="Digite o enunciado da questão…"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value.slice(0, 80))}
              placeholder="Ex.: Concordância verbal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banca">Banca</Label>
            <select
              id="banca"
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {BANCAS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {(["multipla", "certo-errado"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFormato(f);
                setCorreta(f === "multipla" ? "A" : "Certo");
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                formato === f
                  ? "border-primary bg-secondary font-semibold text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {f === "multipla" ? "Alternativas A a E" : "Certo / Errado"}
            </button>
          ))}
        </div>

        {formato === "multipla" ? (
          <div className="space-y-2">
            {LETRAS.map((letra, i) => (
              <div key={letra} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorreta(letra)}
                  className={`size-8 shrink-0 rounded-full border text-sm font-bold ${
                    correta === letra
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {letra}
                </button>
                <Input
                  value={alternativas[i] ?? ""}
                  onChange={(e) => {
                    const proximo = [...alternativas];
                    proximo[i] = e.target.value.slice(0, 500);
                    setAlternativas(proximo);
                  }}
                  placeholder={`Alternativa ${letra}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2">
            {["Certo", "Errado"].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setCorreta(op)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  correta === op
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        )}

        <Button className="w-full" onClick={salvarQuestao}>
          <Plus className="mr-2 size-4" /> Adicionar ao acervo
        </Button>
        {acervo.questoes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {acervo.questoes.length} questão(ões) no acervo.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="font-display text-base font-bold">Leis, gramática, provas e edital</h2>

        <div className="space-y-2">
          <Label htmlFor="leis">Texto de leis (Vade Mecum)</Label>
          <Textarea
            id="leis"
            rows={5}
            value={acervo.leis}
            onChange={(e) => atualizar({ leis: e.target.value.slice(0, 20000) })}
            placeholder="Cole aqui artigos, súmulas ou dispositivos legais…"
          />
        </div>

        <UploadCampo
          label="Upload de PDF para leis"
          ajuda="PDFs com legislação usada como base das explicações."
          arquivos={acervo.provas.filter((n) => n.startsWith("lei:")).map((n) => n.slice(4))}
          onAdd={(nomes) => atualizar({ provas: [...acervo.provas, ...nomes.map((n) => `lei:${n}`)] })}
          onRemove={(nome) => atualizar({ provas: acervo.provas.filter((n) => n !== `lei:${nome}`) })}
        />

        <UploadCampo
          label="Upload de gramática (PDF)"
          ajuda="O agente cita a gramática e a página nas explicações, ex.: “conforme a Gramática de Cintra, pág. 123”."
          arquivos={acervo.gramatica}
          onAdd={(nomes) => atualizar({ gramatica: [...acervo.gramatica, ...nomes] })}
          onRemove={(nome) => atualizar({ gramatica: acervo.gramatica.filter((n) => n !== nome) })}
        />

        <UploadCampo
          label="Provas anteriores por banca (PDF)"
          ajuda="Usadas para buscar questões reais e montar a prova interativa."
          arquivos={acervo.provas.filter((n) => !n.startsWith("lei:"))}
          onAdd={(nomes) => atualizar({ provas: [...acervo.provas, ...nomes] })}
          onRemove={(nome) => atualizar({ provas: acervo.provas.filter((n) => n !== nome) })}
        />

        <UploadCampo
          label="Upload de edital (PDF)"
          ajuda="Define as matérias de Conhecimento Geral e Específico."
          arquivos={acervo.edital}
          onAdd={(nomes) => atualizar({ edital: [...acervo.edital, ...nomes] })}
          onRemove={(nome) => atualizar({ edital: acervo.edital.filter((n) => n !== nome) })}
        />
      </section>

      <section className="grid gap-2 rounded-xl border border-border bg-card p-4 shadow-card">
        <Button disabled={simulado.isPending} onClick={() => simulado.mutate()}>
          {simulado.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Gerando…
            </>
          ) : (
            "Gerar simulado com explicações"
          )}
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/prova-interativa" })}>
          Gerar prova interativa em PDF
        </Button>
      </section>
    </AppShell>
  );
}
