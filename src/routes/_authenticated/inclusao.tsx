import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BancaAtual } from "@/components/BancaAtual";
import { EditalMaterias } from "@/components/EditalMaterias";
import { EditalRelevancia } from "@/components/EditalRelevancia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  contextoDoAcervo,
  ehAnexoDeLei,
  marcarComoLei,
  nomeLimpo,
  provasAnteriores,
  useAcervo,
  type ArquivoAnexo,
  type QuestaoCadastrada,
} from "@/lib/acervo";
import { extrairTextoPdf, LIMITE_TRECHO_IA } from "@/lib/pdf";
import { removerTextoAnexo, salvarTextoAnexo } from "@/lib/anexos-store";

import { useBancaPrevista } from "@/lib/trilha";
import { gerarQuestoes } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/inclusao")({
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
  arquivos: ArquivoAnexo[];
  onAdd: (anexos: ArquivoAnexo[]) => void;
  onRemove: (nome: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);

  async function selecionar(files: File[]) {
    setLendo(true);
    const anexos: ArquivoAnexo[] = [];
    for (const file of files) {
      try {
        const { texto, paginas } = await extrairTextoPdf(file);
        if (!texto) {
          toast.warning(
            `Não foi possível ler o texto de “${file.name}” (PDF escaneado). Cole o conteúdo manualmente.`,
          );
        }
        // Texto integral no IndexedDB; no acervo fica só o trecho de contexto da IA.
        await salvarTextoAnexo(file.name, texto);
        anexos.push({
          nome: file.name,
          texto: texto.slice(0, LIMITE_TRECHO_IA),
          chars: texto.length,
          paginas,
        });
      } catch {
        toast.error(`Falha ao ler “${file.name}”.`);
        anexos.push({ nome: file.name, texto: "", chars: 0 });
      }
    }
    setLendo(false);
    if (anexos.length) onAdd(anexos);
  }


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
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void selecionar(files);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={lendo}
        onClick={() => ref.current?.click()}
      >
        {lendo ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Lendo o PDF…
          </>
        ) : (
          <>
            <FileUp className="mr-2 size-4" /> Selecionar PDF
          </>
        )}
      </Button>
      {arquivos.length > 0 && (
        <ul className="space-y-1">
          {arquivos.map((a) => (
            <li
              key={a.nome}
              className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate">
                {nomeLimpo(a)}
                <span
                  className={`ml-2 text-[10px] font-semibold ${a.chars ? "text-primary" : "text-destructive"}`}
                >
                  {a.chars
                    ? `${a.chars.toLocaleString("pt-BR")} caracteres${a.paginas ? ` · ${a.paginas} página(s)` : ""} lidos`
                    : "sem texto lido — reanexe o PDF"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  void removerTextoAnexo(nomeLimpo(a));
                  onRemove(a.nome);
                }}
                aria-label={`Remover ${nomeLimpo(a)}`}
              >
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
  const { banca, definida: bancaDefinida } = useBancaPrevista();

  const { edital } = useEdital();
  const MATERIAS = todasAsMaterias(edital);
  const [materiaSel, setMateriaSel] = useState("");
  const materia = MATERIAS.includes(materiaSel) ? materiaSel : (MATERIAS[0] ?? "");
  const semMaterias = MATERIAS.length === 0;
  const [enunciado, setEnunciado] = useState("");
  const [assunto, setAssunto] = useState("");
  const [formato, setFormato] = useState<"multipla" | "certo-errado">("multipla");
  const [alternativas, setAlternativas] = useState<string[]>(["", "", "", "", ""]);
  const [correta, setCorreta] = useState("A");

  const simulado = useMutation({
    mutationFn: async () =>
      gerar({
        data: {
          materia: assunto ? `${materia} — ${assunto}` : materia || "Língua Portuguesa",
          grupo: materia ? grupoDaMateria(edital, materia) : "Conhecimento Geral",
          banca,
          quantidade: 5,
          formato,
          contexto:
            [contextoDoEdital(edital, materia), contextoDoAcervo(acervo)]
              .filter(Boolean)
              .join("\n\n") || null,
        },
      }),
    onSuccess: (questoes) => {
      atualizar({ simulado: questoes });
      toast.success("Simulado gerado com explicações.");
      navigate({ to: "/questoes", search: { materia: undefined, assunto: undefined } });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar o simulado."),
  });

  const salvarQuestao = () => {
    if (enunciado.trim().length < 10) {
      toast.error("Escreva o enunciado da questão.");
      return;
    }
    if (!materiaPermitida(edital, materia)) {
      toast.error("Escolha uma matéria do edital/banca/cargo selecionados.");
      return;
    }
    if (assunto.trim() && !topicoPermitido(edital, materia, assunto)) {
      toast.error("Este assunto não consta no edital da banca/cargo em estudo.");
      return;
    }

    const nova: QuestaoCadastrada = {
      id: crypto.randomUUID(),
      enunciado: enunciado.trim(),
      assunto: assunto.trim() ? `${materia} — ${assunto.trim()}` : materia || "Geral",
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

  const leisPdf = acervo.provas.filter(ehAnexoDeLei);
  const provas = provasAnteriores(acervo);

  return (
    <AppShell
      titulo="Inclusão de conteúdo"
      descricao="Alimente o agente com questões, leis, gramática, provas anteriores e edital."
    >
      <BancaAtual banca={banca} definida={bancaDefinida} />

      <EditalMaterias />

      <EditalRelevancia />

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

        <div className="space-y-2">
          <Label htmlFor="assunto">Assunto</Label>
          <Input
            id="assunto"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value.slice(0, 80))}
            placeholder="Ex.: Concordância verbal"
          />
          <p className="text-xs text-muted-foreground">
            A banca usada é a prevista na Trilha: <strong>{banca}</strong>.
          </p>
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
          arquivos={leisPdf}
          onAdd={(anexos) =>
            atualizar({
              provas: [
                ...acervo.provas,
                ...anexos.map((a) => ({ ...a, nome: marcarComoLei(a.nome) })),
              ],
            })
          }
          onRemove={(nome) => atualizar({ provas: acervo.provas.filter((a) => a.nome !== nome) })}
        />

        <UploadCampo
          label="Upload de gramática (PDF)"
          ajuda="O agente cita a gramática e a página nas explicações, ex.: “conforme a Gramática de Cintra, pág. 123”."
          arquivos={acervo.gramatica}
          onAdd={(anexos) => atualizar({ gramatica: [...acervo.gramatica, ...anexos] })}
          onRemove={(nome) =>
            atualizar({ gramatica: acervo.gramatica.filter((a) => a.nome !== nome) })
          }
        />

        <UploadCampo
          label="Provas anteriores por banca (PDF)"
          ajuda="O texto é lido e vira banco de questões: a IA reaproveita os assuntos e o estilo dessas provas."
          arquivos={provas}
          onAdd={(anexos) => atualizar({ provas: [...acervo.provas, ...anexos] })}
          onRemove={(nome) => atualizar({ provas: acervo.provas.filter((a) => a.nome !== nome) })}
        />

        <UploadCampo
          label="Upload de edital (PDF)"
          ajuda="Define as matérias de Conhecimento Geral e Específico."
          arquivos={acervo.edital}
          onAdd={(anexos) => atualizar({ edital: [...acervo.edital, ...anexos] })}
          onRemove={(nome) => atualizar({ edital: acervo.edital.filter((a) => a.nome !== nome) })}
        />
      </section>

      <section className="grid gap-2 rounded-xl border border-border bg-card p-4 shadow-card">
        <Button disabled={simulado.isPending} onClick={() => simulado.mutate()}>
          {simulado.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Gerando…
            </>
          ) : (
            `Gerar simulado no padrão ${banca}`
          )}
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/prova-interativa" })}>
          Gerar prova interativa em PDF
        </Button>
      </section>
    </AppShell>
  );
}
