import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Brain, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FiltroConcurso } from "@/components/FiltroConcurso";
import { Marcado, LegendaCores } from "@/components/Marcado";
import { LeiIntegralPainel } from "@/components/LeiIntegral";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BANCAS, contextoDoAcervo, ehAnexoDeLei, nomeLimpo, useAcervo } from "@/lib/acervo";
import { useBancaPrevista } from "@/lib/trilha";
import {
  contextoDoEdital,
  ehDoEdital,
  grupoDaMateria,
  todasAsMaterias,
  topicosDaMateria,
  useEdital,
} from "@/lib/edital";
import {
  contextoDaLeitura,
  definirFocos,
  registrarLeitura,
  somarQuestoesGeradas,
  type Leitura,
} from "@/lib/leituras";
import { registrarResposta } from "@/lib/revisao";
import { gerarQuestoes, resumirLei, type LeiResumida } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/leis")({
  head: () => ({
    meta: [
      { title: "Leitura resumida das leis do edital | Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Leia só o capítulo da lei cobrado no edital: síntese em tópicos, artigos essenciais comentados, pegadinhas da banca e pontos para memorizar.",
      },
      { property: "og:title", content: "Leitura resumida das leis do edital" },
      {
        property: "og:description",
        content:
          "Escolha a matéria e o capítulo do edital e receba um resumo enxuto da legislação com artigos comentados.",
      },
    ],
  }),
  component: LeisPage,
});

const SUGESTOES: Record<string, string[]> = {
  "Direito Penal": [
    "Crimes contra a Administração Pública",
    "Crimes contra a pessoa",
    "Crimes contra o patrimônio",
  ],
  "Direito Constitucional": [
    "Direitos e garantias fundamentais",
    "Organização do Estado",
    "Administração Pública (art. 37 a 41)",
  ],
  "Direito Administrativo": [
    "Atos administrativos",
    "Licitações e contratos (Lei 14.133/2021)",
    "Improbidade administrativa",
  ],
  "Processo Penal": ["Inquérito policial", "Prisões e liberdade provisória", "Provas"],
};

function LeisPage() {
  const { acervo, atualizar } = useAcervo();
  const { edital } = useEdital();
  const gerar = useServerFn(resumirLei);
  const gerarQ = useServerFn(gerarQuestoes);

  const [materia, setMateria] = useState("");
  const { banca: bancaTrilha } = useBancaPrevista();
  const [bancaSel, setBancaSel] = useState("");
  const banca = bancaSel || bancaTrilha;
  const opcoesBanca = BANCAS.includes(banca) ? BANCAS : [banca, ...BANCAS];
  const [capitulo, setCapitulo] = useState("");
  const [topicos, setTopicos] = useState<string[]>([]);
  const [resumo, setResumo] = useState<LeiResumida | null>(null);
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const [auto, setAuto] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const MATERIAS = todasAsMaterias(edital);
  const materiaAtiva = MATERIAS.includes(materia) ? materia : (MATERIAS[0] ?? "");
  const doEdital = topicosDaMateria(edital, materiaAtiva);
  const sugestoes = doEdital.length ? doEdital : (SUGESTOES[materiaAtiva] ?? []);

  const alternarFoco = (trecho: string) =>
    setSelecionados((atual) =>
      atual.includes(trecho) ? atual.filter((t) => t !== trecho) : [...atual, trecho],
    );

  const reforco = useMutation({
    mutationFn: async (l: Leitura) => {
      const questoes = await gerarQ({
        data: {
          materia: l.materia,
          grupo: grupoDaMateria(edital, l.materia),
          banca,
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
      // Entram na fila da revisão já vencidas, para estudo imediato.
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
      toast.success(
        (l.focos ?? []).length
          ? `${questoes.length} questões dos ${l.focos.length} tópico(s) selecionado(s) foram para a revisão.`
          : `${questoes.length} questões da leitura enviadas para a revisão espaçada.`,
      );
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao gerar as questões da leitura."),
  });

  const mut = useMutation({
    mutationFn: (cap: string) =>
      gerar({
        data: {
          materia: materiaAtiva,
          capitulo: cap,
          banca,
          contexto:
            [contextoDoEdital(edital, materiaAtiva), contextoDoAcervo(acervo)]
              .filter(Boolean)
              .join("\n\n") || null,
        },
      }),
    onSuccess: (r, cap) => {
      setResumo(r);
      const nova = registrarLeitura({
        materia: r.materia || materiaAtiva,
        capitulo: r.capitulo || cap,
        baseLegal: r.base_legal ?? "",
        resumo: [
          ...(r.sintese ?? []),
          ...(r.artigos ?? []).map((a) => `${a.referencia}: ${a.texto} — ${a.comentario}`),
          ...(r.pegadinhas ?? []),
        ].join("\n"),
      });
      setLeitura(nova);
      setSelecionados([]);
      if (auto) reforco.mutate(nova);
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível resumir a lei."),
  });

  const ler = (cap: string) => {
    if (cap.trim().length < 3) {
      toast.error("Informe o capítulo cobrado no edital.");
      return;
    }
    setCapitulo(cap);
    mut.mutate(cap.trim());
  };


  const adicionarTopico = () => {
    const cap = capitulo.trim();
    if (cap.length < 3) return;
    if (topicos.includes(cap)) return;
    setTopicos([cap, ...topicos]);
  };

  return (
    <AppShell
      titulo="Leis do edital, em resumo"
      descricao="Escolha a matéria e o capítulo exigido no edital: a leitura vem só desse trecho, em tópicos curtos."
    >
      <FiltroConcurso compacto />
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="materia">Matéria</Label>
            <select
              id="materia"
              value={materiaAtiva}
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
            <Label htmlFor="banca-lei">Banca</Label>
            <select
              id="banca-lei"
              value={banca}
              onChange={(e) => setBancaSel(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {opcoesBanca.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capitulo">Capítulo / tópico do edital</Label>
          <div className="flex gap-2">
            <Input
              id="capitulo"
              value={capitulo}
              onChange={(e) => setCapitulo(e.target.value.slice(0, 200))}
              placeholder="Ex.: Crimes contra a Administração Pública"
            />
            <Button type="button" variant="outline" onClick={adicionarTopico} aria-label="Salvar tópico">
              <Plus className="size-4" />
            </Button>
          </div>
          {sugestoes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCapitulo(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {acervo.edital.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Edital anexado: {acervo.edital.map((a) => nomeLimpo(a)).join(", ")} — o resumo usa esse
            conteúdo como referência.

          </p>
        )}

        <label className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="font-semibold">Enviar automaticamente para a revisão espaçada</span>
            <span className="block text-muted-foreground">
              Ao terminar a leitura, a IA cria 5 questões só desse capítulo e coloca na fila de hoje.
            </span>
          </span>
        </label>


        <Button className="w-full" disabled={mut.isPending} onClick={() => ler(capitulo)}>
          {mut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Resumindo o capítulo…
            </>
          ) : (
            <>
              <BookOpen className="mr-2 size-4" /> Ler capítulo resumido
            </>
          )}
        </Button>
      </section>

      <LeiIntegralPainel
        materia={materiaAtiva}
        capitulo={capitulo}
        pdfsLei={acervo.provas
          .filter(ehAnexoDeLei)
          .map((a) => ({ nome: nomeLimpo(a), chars: a.chars }))}

        contexto={
          [contextoDoEdital(edital, materiaAtiva), contextoDoAcervo(acervo)]
            .filter(Boolean)
            .join("\n\n") || null
        }
        marcados={selecionados}
        onAlternarMarcado={alternarFoco}
        onCarregado={(lei) => {
          const nova = registrarLeitura({
            materia: lei.materia || materiaAtiva,
            capitulo: lei.capitulo || capitulo,
            baseLegal: lei.base_legal ?? "",
            resumo: (lei.artigos ?? [])
              .map((a) => `${a.referencia}: ${a.texto}\n${(a.paragrafos ?? []).join("\n")}`)
              .join("\n\n"),
          });
          setLeitura(nova);
        }}
      />

      {selecionados.length > 0 && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">
            {selecionados.length} artigo(s)/tópico(s) marcados — as questões sairão só deles.
          </p>
          <Button
            className="w-full"
            disabled={!leitura || reforco.isPending}
            onClick={() => {
              if (!leitura) return;
              definirFocos(leitura.id, selecionados);
              const alvo = { ...leitura, focos: selecionados };
              setLeitura(alvo);
              reforco.mutate(alvo);
            }}
          >
            {reforco.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Criando questões dos artigos marcados…
              </>
            ) : (
              <>
                <Brain className="mr-2 size-4" /> Gerar questões dos artigos marcados
              </>
            )}
          </Button>
        </section>
      )}


      {topicos.length > 0 && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-base font-bold">Meus tópicos do edital</h2>
          <ul className="space-y-1">
            {topicos.map((t) => (
              <li key={t} className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs">
                <button type="button" className="flex-1 truncate text-left" onClick={() => ler(t)}>
                  {t}
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${t}`}
                  onClick={() => setTopicos(topicos.filter((x) => x !== t))}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resumo && (
        <article className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {resumo.materia || materia}
            </p>
            <h2 className="font-display text-lg font-bold">{resumo.capitulo || capitulo}</h2>
            <p className="text-xs text-muted-foreground">{resumo.base_legal}</p>
          </header>

          <LegendaCores />

          {resumo.sintese?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Síntese para leitura rápida</h3>
              <p className="text-xs text-muted-foreground">
                Marque os tópicos que você quer treinar: as questões e reforços sairão só deles.
              </p>
              <ul className="space-y-1.5 text-sm leading-relaxed">
                {resumo.sintese.map((s, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(s)}
                        onChange={() => alternarFoco(s)}
                        className="mt-1 size-4 shrink-0 accent-primary"
                      />
                      <span>
                        <Marcado texto={s} />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resumo.artigos?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Artigos essenciais</h3>
              <div className="space-y-2">
                {resumo.artigos.map((a, i) => {
                  const trecho = `${a.referencia} — ${a.texto}`;
                  return (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${
                      selecionados.includes(trecho)
                        ? "border-primary bg-primary/5"
                        : "border-border/70"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(trecho)}
                        onChange={() => alternarFoco(trecho)}
                        className="size-4 accent-primary"
                      />
                      <span className="text-xs font-bold text-primary">{a.referencia}</span>
                    </label>
                    <p className="mt-1 text-sm leading-relaxed">
                      <Marcado texto={a.texto} />
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <Marcado texto={a.comentario} />
                    </p>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {resumo.pegadinhas?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Pegadinhas da banca</h3>
              <ul className="space-y-1.5 text-sm">
                {resumo.pegadinhas.map((p, i) => (
                  <li key={i}>
                    <Marcado texto={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resumo.memorizar?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Para memorizar</h3>
              <ul className="space-y-1.5 text-sm">
                {resumo.memorizar.map((m, i) => (
                  <li key={i}>
                    <Marcado texto={m} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid gap-2 rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">
              {selecionados.length > 0
                ? `Recorte ativo: ${selecionados.length} artigo(s)/tópico(s) marcados — as questões sairão só deles.`
                : leitura && leitura.questoesGeradas > 0
                ? `${leitura.questoesGeradas} questão(ões) desta leitura já estão na revisão espaçada.`
                : "Transforme esta leitura em questões e reforços agendados."}
            </p>
            <Button
              disabled={!leitura || reforco.isPending}
              onClick={() => {
                if (!leitura) return;
                definirFocos(leitura.id, selecionados);
                const alvo = { ...leitura, focos: selecionados };
                setLeitura(alvo);
                reforco.mutate(alvo);
              }}
            >
              {reforco.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Criando questões da leitura…
                </>
              ) : (
                <>
                  <Brain className="mr-2 size-4" />{" "}
                  {selecionados.length
                    ? `Gerar questões dos ${selecionados.length} tópico(s) marcados`
                    : "Gerar questões deste capítulo para revisão"}
                </>
              )}
            </Button>
            <Button asChild variant="outline">
              <Link to="/revisao">Ir para a revisão espaçada</Link>
            </Button>
          </div>


          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              atualizar({
                leis: `${acervo.leis ? `${acervo.leis}\n\n` : ""}${resumo.capitulo || capitulo} — ${resumo.base_legal}\n${(resumo.sintese ?? []).join("\n")}`.slice(
                  0,
                  20000,
                ),
              });
              toast.success("Resumo salvo no acervo de leis.");
            }}
          >
            Salvar resumo no acervo
          </Button>
        </article>
      )}
    </AppShell>
  );
}
