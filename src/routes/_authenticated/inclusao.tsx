import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, ListPlus, Loader2, Plus, Trash2 } from "lucide-react";
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
  lerAcervo,
  provasAnteriores,
  useAcervo,
  type ArquivoAnexo,
  type QuestaoCadastrada,
} from "@/lib/acervo";
import { extrairTextoPdf, LIMITE_TRECHO_IA } from "@/lib/pdf";
import { lerVadeMecum } from "@/lib/vademecum";
import { removerTextoAnexo, salvarTextoAnexo } from "@/lib/anexos-store";
import { separarQuestaoColada } from "@/lib/questao-colada";

import {
  aplicarGabaritoNaProva,
  extrairQuestoesDePdf,
  limparGabarito,
  temGabarito,
} from "@/lib/questoes-pdf";
import {
  removerQuestoesDaProva,
  salvarQuestoesExtraidas,
} from "@/lib/questoes-banco.functions";

import { useBancaPrevista } from "@/lib/trilha";
import { gerarQuestoes, type Questao } from "@/lib/ai.functions";
import {
  contextoDoEdital,
  ehDoEdital,
  grupoDaMateria,
  materiaPermitida,
  materiasAtivas,
  relevanciaNaDisciplina,
  todasAsMaterias,
  topicoPermitido,
  topicosPorRelevancia,
  useEdital,
} from "@/lib/edital";

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
  onArquivoLido,
}: {
  label: string;
  ajuda: string;
  arquivos: ArquivoAnexo[];
  onAdd: (anexos: ArquivoAnexo[]) => void;
  onRemove: (nome: string) => void;
  /**
   * Recebe o texto integral logo após a leitura (usado para extrair questões sem IA).
   * Retornar "descartar" impede que o arquivo entre na lista (ex.: PDF só de gabarito).
   */
  onArquivoLido?: (nome: string, texto: string) => void | "descartar";
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
        const resultado = texto ? onArquivoLido?.(file.name, texto) : undefined;
        if (resultado === "descartar") {
          await removerTextoAnexo(file.name);
          continue;
        }
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

/** Inclusão de prova e gabarito no MESMO passo — evita gabarito na prova errada. */
function IncluirProva({
  lendo,
  onIncluir,
}: {
  lendo: boolean;
  onIncluir: (prova: File, gabarito: File | null) => void;
}) {
  const refProva = useRef<HTMLInputElement>(null);
  const refGab = useRef<HTMLInputElement>(null);
  const [prova, setProva] = useState<File | null>(null);
  const [gabarito, setGabarito] = useState<File | null>(null);

  const campo = (
    titulo: string,
    arquivo: File | null,
    ref: React.RefObject<HTMLInputElement | null>,
    limpar: () => void,
    opcional?: boolean,
  ) => (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
        {opcional && <span className="ml-1 font-normal normal-case">(opcional)</span>}
      </p>
      {arquivo ? (
        <div className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs">
          <span className="min-w-0 flex-1 truncate">{arquivo.name}</span>
          <button type="button" onClick={limpar} aria-label={`Remover ${arquivo.name}`}>
            <Trash2 className="size-3.5 text-destructive" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={lendo}
          onClick={() => ref.current?.click()}
        >
          <FileUp className="mr-2 size-3.5" /> Selecionar PDF
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div>
        <Label>Incluir prova anterior (PDF)</Label>
        <p className="text-xs text-muted-foreground">
          Escolha a prova e, no mesmo passo, o gabarito dela. As questões são extraídas sem gastar
          IA e o gabarito é aplicado só a esta prova.
        </p>
      </div>

      <input
        ref={refProva}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          setProva(f);
        }}
      />
      <input
        ref={refGab}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          setGabarito(f);
        }}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {campo("Prova", prova, refProva, () => setProva(null))}
        {campo("Gabarito", gabarito, refGab, () => setGabarito(null), true)}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!prova || lendo}
        onClick={() => {
          if (!prova) return;
          onIncluir(prova, gabarito);
          setProva(null);
          setGabarito(null);
        }}
      >
        {lendo ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Lendo os PDFs…
          </>
        ) : (
          <>
            <ListPlus className="mr-2 size-4" /> Incluir prova e gabarito
          </>
        )}
      </Button>
    </div>
  );
}


function InclusaoPage() {
  const { acervo, atualizar } = useAcervo();
  const navigate = useNavigate();
  const gerar = useServerFn(gerarQuestoes);
  const salvarBanco = useServerFn(salvarQuestoesExtraidas);
  const removerBanco = useServerFn(removerQuestoesDaProva);
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
  const [incluindoProva, setIncluindoProva] = useState(false);
  const [lendoGabarito, setLendoGabarito] = useState<string | null>(null);


  /** Assuntos do Detalhamento do edital para a matéria selecionada. */
  const assuntosDaMateria = useMemo(() => {
    const achada = materiasAtivas(edital).find(
      (m) => m.nome.trim().toLowerCase() === materia.trim().toLowerCase(),
    );
    if (!achada) return [];
    return topicosPorRelevancia(achada).map((t) => ({
      topico: t,
      relevancia: relevanciaNaDisciplina(achada, t),
    }));
  }, [edital, materia]);

  // Trocou de matéria: limpa o assunto que não pertence mais à lista.
  useEffect(() => {
    if (!assunto) return;
    if (assuntosDaMateria.length && !assuntosDaMateria.some((a) => a.topico === assunto)) {
      setAssunto("");
    }
  }, [assunto, assuntosDaMateria]);


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
    onSuccess: (resultado) => {
      if (resultado.indisponivel) {
        toast.error(resultado.indisponivel);
        return;
      }
      atualizar({ simulado: resultado.questoes });
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

  /** Salva as questões no banco da conta (fica disponível em qualquer aparelho). */
  const salvarNoBanco = (questoes: Questao[]) => {
    if (!questoes.length) return;
    void salvarBanco({ data: { questoes } }).catch(() =>
      toast.error("As questões ficaram salvas no aparelho, mas não subiram para a nuvem agora."),
    );
  };

  /** Aplica um gabarito já lido a UMA prova específica (sem adivinhar). */
  const vincularGabarito = (
    prova: string,
    nomeGabarito: string,
    gabarito: Record<number, string>,
  ) => {
    const atual = lerAcervo();
    if (!Object.keys(gabarito).length) {
      toast.warning(`Nenhuma resposta reconhecida em “${nomeGabarito}”.`);
      return;
    }
    const res = aplicarGabaritoNaProva(atual.extraidas, gabarito, prova);
    atualizar({
      extraidas: res.questoes,
      provas: atual.provas.map((a) => (a.nome === prova ? { ...a, gabaritoNome: nomeGabarito } : a)),
    });
    salvarNoBanco(res.questoes.filter((q) => q.prova === prova));
    
    toast.success(
      `Gabarito de “${nomeGabarito}” aplicado a ${res.aplicadas} questão(ões) de “${prova}”.`,
    );
    if (res.naoCasadas.length) {
      toast.warning(
        `${res.naoCasadas.length} resposta(s) não correspondem às questões desta prova. Confira se o gabarito é o certo.`,
      );
    }
  };

  /** Remove o vínculo do gabarito e zera as respostas daquela prova. */
  const removerGabarito = (prova: string) => {
    const atual = lerAcervo();
    const questoes = limparGabarito(atual.extraidas, prova);
    atualizar({
      extraidas: questoes,
      provas: atual.provas.map((a) =>
        a.nome === prova ? { nome: a.nome, texto: a.texto, chars: a.chars, ...(a.paginas ? { paginas: a.paginas } : {}) } : a,
      ),
    });
    salvarNoBanco(questoes.filter((q) => q.prova === prova));
    toast.success(`Gabarito removido de “${prova}”.`);
  };

  /** Lê o PDF de gabarito escolhido dentro do cartão de uma prova. */
  const lerGabaritoDaProva = async (prova: string, file: File) => {
    setLendoGabarito(prova);
    try {
      const { texto } = await extrairTextoPdf(file);
      if (!texto) {
        toast.warning(`Não foi possível ler “${file.name}” (PDF escaneado).`);
        return;
      }
      const res = extrairQuestoesDePdf(file.name, texto, edital, banca);
      vincularGabarito(prova, file.name, res.gabarito);
    } catch {
      toast.error(`Falha ao ler “${file.name}”.`);
    } finally {
      setLendoGabarito(null);
    }
  };

  /** Inclui prova + gabarito juntos: extrai as questões (sem IA) e aplica o gabarito à prova. */
  const incluirProva = async (arquivoProva: File, arquivoGabarito: File | null) => {
    setIncluindoProva(true);
    try {
      const nome = arquivoProva.name;
      const { texto, paginas } = await extrairTextoPdf(arquivoProva);
      if (!texto) {
        toast.warning(
          `Não foi possível ler o texto de “${nome}” (PDF escaneado). Use a Análise de padrões com imagem.`,
        );
        return;
      }

      const res = extrairQuestoesDePdf(nome, texto, edital, banca);
      if (res.soGabarito) {
        toast.error(
          `“${nome}” parece ser só o gabarito. Coloque-o no campo “Gabarito” e escolha o PDF da prova.`,
        );
        return;
      }

      await salvarTextoAnexo(nome, texto);
      const atual = lerAcervo();
      const anexo: ArquivoAnexo = {
        nome,
        texto: texto.slice(0, LIMITE_TRECHO_IA),
        chars: texto.length,
        ...(paginas ? { paginas } : {}),
      };
      atualizar({
        provas: [...atual.provas.filter((a) => a.nome !== nome), anexo],
        extraidas: [...atual.extraidas.filter((q) => q.prova !== nome), ...res.questoes],
      });

      if (!res.questoes.length) {
        toast.warning(
          `Nenhuma questão reconhecida em “${nome}”. Se o PDF for escaneado, use a Análise de padrões com imagem.`,
        );
      } else {
        salvarNoBanco(res.questoes);
        toast.success(
          `${nome} — ${res.questoes.length} questão(ões) extraídas (${res.comGabarito} com gabarito), sem gastar IA.`,
        );
      }

      if (arquivoGabarito) {
        const lido = await extrairTextoPdf(arquivoGabarito);
        if (!lido.texto) {
          toast.warning(`Não foi possível ler “${arquivoGabarito.name}” (PDF escaneado).`);
          return;
        }
        const gab = extrairQuestoesDePdf(arquivoGabarito.name, lido.texto, edital, banca);
        vincularGabarito(nome, arquivoGabarito.name, gab.gabarito);
      }
    } catch {
      toast.error("Falha ao ler os PDFs escolhidos.");
    } finally {
      setIncluindoProva(false);
    }
  };



  /** Salva o texto de lei colado como item consultável em Leis → Texto Integral e limpa o campo. */
  const extrairLeiColada = () => {
    const texto = acervo.leis.trim();
    if (texto.length < 100) {
      toast.error("Cole o texto da lei (a partir de “LEI Nº …” ou “Art. 1º”) antes de extrair.");
      return;
    }

    const leis = lerVadeMecum(texto);
    const artigos = leis.reduce((s, l) => s + l.artigos.length, 0);
    if (!artigos) {
      toast.warning(
        "Nenhum artigo reconhecido. Confira se o texto começa em “LEI Nº …”, “CÓDIGO …” ou “Art. 1º”.",
      );
      return;
    }

    const titulo = leis[0]?.nome?.trim() || "Texto colado";
    const data = new Date().toLocaleDateString("pt-BR");
    const jaUsados = new Set(acervo.provas.filter(ehAnexoDeLei).map((a) => nomeLimpo(a)));
    let nome = `${titulo} — ${data}`;
    let n = 2;
    while (jaUsados.has(nome)) nome = `${titulo} — ${data} (${n++})`;

    void salvarTextoAnexo(nome, texto);
    atualizar({
      leis: "",
      provas: [
        ...acervo.provas,
        {
          nome: marcarComoLei(nome),
          texto: texto.slice(0, LIMITE_TRECHO_IA),
          chars: texto.length,
        },
      ],
    });
    toast.success(
      `${titulo} — ${artigos} artigo(s) salvos para leitura em Leis. Cole a próxima parte.`,
    );
  };




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
          <Label htmlFor="materia-questao">Matéria do edital</Label>
          {semMaterias ? (
            <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              Cadastre acima as matérias do edital (com banca e cargo) para poder incluir questões.
            </p>
          ) : (
            <select
              id="materia-questao"
              value={materia}
              onChange={(e) => setMateriaSel(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {MATERIAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                  {ehDoEdital(edital, m) ? " (edital)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assunto">Assunto (detalhamento do edital)</Label>
          {assuntosDaMateria.length ? (
            <select
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Sem assunto específico</option>
              {assuntosDaMateria.map((a) => (
                <option key={a.topico} value={a.topico}>
                  {a.topico}
                  {a.relevancia == null ? "" : ` — ${a.relevancia}%`}
                </option>
              ))}
            </select>
          ) : (
            <>
              <Input
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value.slice(0, 80))}
                placeholder="Ex.: Concordância verbal"
              />
              <p className="text-xs text-muted-foreground">
                Nenhum assunto detalhado para esta matéria — digite livremente.
              </p>
            </>
          )}

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
          <Button variant="outline" className="w-full" onClick={extrairLeiColada}>
            <ListPlus className="mr-2 size-4" /> Extrair e limpar
          </Button>
          <p className="text-xs text-muted-foreground">
            A lei fica salva no sistema e aparece em “Leis → Texto Integral” para leitura, busca e
            marcação — sem gastar IA.
          </p>
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

        <div className="space-y-3">
          <IncluirProva lendo={incluindoProva} onIncluir={(p, g) => void incluirProva(p, g)} />


          {provas.map((p) => {
            const daProva = acervo.extraidas.filter((q) => q.prova === p.nome);
            const comGab = daProva.filter(temGabarito).length;
            return (
              <div key={p.nome} className="space-y-2 rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{p.nome}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {daProva.length} questão(ões) · {comGab} com gabarito
                      {daProva.length - comGab > 0 ? ` · ${daProva.length - comGab} sem` : ""}
                      {p.chars ? "" : " · sem texto lido — reanexe o PDF"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remover prova ${p.nome}`}
                    onClick={() => {
                      void removerTextoAnexo(p.nome);
                      atualizar({
                        provas: acervo.provas.filter((a) => a.nome !== p.nome),
                        extraidas: acervo.extraidas.filter((q) => q.prova !== p.nome),
                      });
                      void removerBanco({ data: { prova: p.nome } }).catch(() => {});
                    }}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </button>
                </div>

                <div className="space-y-1.5 border-t border-border pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Gabarito desta prova
                  </p>
                  {p.gabaritoNome ? (
                    <div className="flex items-center justify-between gap-2 rounded-md bg-card px-2 py-1.5 text-[11px]">
                      <span className="min-w-0 flex-1 truncate">
                        {p.gabaritoNome}
                        <span className="ml-2 font-semibold text-primary">
                          {comGab} resposta(s) aplicada(s)
                        </span>
                      </span>
                      <button
                        type="button"
                        className="text-destructive"
                        onClick={() => removerGabarito(p.nome)}
                      >
                        remover
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) void lerGabaritoDaProva(p.nome, file);
                        }}
                      />
                      <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-[11px] font-semibold">
                        {lendoGabarito === p.nome ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" /> Lendo o gabarito…
                          </>
                        ) : (
                          <>
                            <FileUp className="size-3.5" /> Anexar gabarito desta prova
                          </>
                        )}
                      </span>
                    </label>
                  )}
                </div>

              </div>
            );
          })}
        </div>


        <UploadCampo
          label="Upload de edital (PDF)"
          ajuda="Apenas arquivo de consulta. A referência do sistema é o Detalhamento do edital (matérias e assuntos analisados)."
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
