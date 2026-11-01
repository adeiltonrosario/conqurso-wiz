import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PadraoAnalise, Questao } from "@/lib/ai.functions";
import { useAcervo } from "@/lib/acervo";
import { grupoDaMateria, materiasAtivas, useEdital } from "@/lib/edital";
import {
  analisarQuestoes,
  calcularIncidencia,
  CONFIG_PADRAO,
  hashQuestao,
  mesclarConcurso,
  salvarResultado,
  selecionarCards,
  selecionarRevisao,
  useIncidencia,
  type ConfigIncidencia,
  type Estrelas,
} from "@/lib/incidencia";
import { adicionarNaRevisao } from "@/lib/revisao";
import { listarCards, salvarCard } from "@/lib/cards.functions";
import { lerCards, salvarCardsLocal } from "@/lib/cards";

export function EstrelasIcone({ n }: { n: Estrelas }) {
  return (
    <span className="inline-flex" aria-label={`${n} de 3 estrelas`}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= n ? "fill-mark-yellow text-mark-yellow" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

function perguntaDoCard(q: Questao) {
  return `${q.enunciado}\n\n${q.alternativas.map((a) => `${a.letra}) ${a.texto}`).join("\n")}`.slice(0, 4000);
}

export function PainelIncidencia({
  analise,
  materia,
  prova,
  textoProva,
}: {
  analise: PadraoAnalise | null;
  materia: string;
  prova: string;
  textoProva: string;
}) {
  const { edital } = useEdital();
  const { acervo } = useAcervo();
  const banca = edital.bancaAtiva ?? "";
  const cargo = edital.cargoAtivo ?? "";
  const resultado = useIncidencia(banca, cargo);
  const [cfg, setCfg] = useState<ConfigIncidencia>(resultado?.config ?? CONFIG_PADRAO);
  const [usarAcervo, setUsarAcervo] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [resumoEnvio, setResumoEnvio] = useState<{ revisao: number; cards: number; materias: number; duplicadas: number } | null>(null);
  const listar = useServerFn(listarCards);
  const salvar = useServerFn(salvarCard);
  const ultima = useRef<PadraoAnalise | null>(null);

  const materias = materiasAtivas(edital).map((m) => ({ nome: m.nome, topicos: m.topicos }));
  const filtro = materia === "Todas" ? "" : materia;

  async function processar(daProva: PadraoAnalise | null) {
    if (!banca || !cargo) {
      toast.error("Escolha a banca e o cargo no topo antes de calcular a incidência.");
      return;
    }
    setProcessando(true);
    try {
      const ano = Number(/\b(20\d{2}|19\d{2})\b/.exec(textoProva)?.[1]) || undefined;
      const daAnalise: Questao[] = (daProva?.questoes ?? []).map((q) => {
        const base = {
          enunciado: q.enunciado,
          alternativas: q.alternativas.map((a) => ({ letra: a.letra, texto: a.texto, correta: a.correta, explicacao: "" })),
        };
        const mat = q.materia || filtro;
        return {
          id: `analise:${hashQuestao(base)}`,
          banca,
          grupo: grupoDaMateria(edital, mat),
          materia: mat,
          ...(ano ? { ano } : {}),
          prova,
          numero: q.numero,
          origem: `Análise de padrões · ${prova}`,
          explicacao: "",
          ...base,
        } as Questao;
      });
      const doAcervo = usarAcervo ? acervo.extraidas : [];
      const todas = [...daAnalise, ...doAcervo];
      const analisadas = analisarQuestoes(todas, materias, filtro);
      const duplicadas = todas.length - analisadas.length;
      const mescladas = mesclarConcurso(resultado?.questoes ?? [], analisadas);
      salvarResultado({ banca, cargo, questoes: mescladas, config: cfg, atualizado: Date.now() });

      const itens = calcularIncidencia(mescladas, cfg);
      // Revisão espaçada: até 20 por artigo/assunto ★★★, histórico preservado.
      const conjuntos = selecionarRevisao(itens, mescladas, banca);
      const revisao = adicionarNaRevisao(conjuntos.flatMap((c) => c.questoes.map((q) => q.questao)));

      // Cards: até 10 por matéria, sem repetir cards existentes.
      const porMateria = selecionarCards(mescladas, banca);
      let existentes = lerCards();
      try {
        existentes = await listar();
      } catch {
        /* usa o cache local */
      }
      const ja = new Set(existentes.map((c) => c.pergunta.trim()));
      let cards = 0;
      const novos = [...existentes];
      for (const grupo of porMateria) {
        const daMateria = existentes.filter((c) => c.materia === grupo.materia && c.assunto.startsWith("Incidência")).length;
        let vagas = Math.max(0, 10 - daMateria);
        for (const qa of grupo.questoes) {
          if (!vagas) break;
          const certa = qa.questao.alternativas.find((a) => a.correta);
          const pergunta = perguntaDoCard(qa.questao);
          if (!certa || ja.has(pergunta.trim())) continue;
          const card = {
            id: crypto.randomUUID(),
            pergunta,
            resposta: `${certa.letra}) ${certa.texto}`.slice(0, 4000),
            explicacao: [qa.questao.banca, qa.prova, qa.ano].filter(Boolean).join(" · "),
            materia: grupo.materia,
            assunto: `Incidência${qa.assunto ? ` · ${qa.assunto}` : ""}`,
            imagemUrl: "",
            imagemPath: "",
          };
          try {
            await salvar({ data: { card } });
            novos.unshift(card);
            ja.add(pergunta.trim());
            cards++;
            vagas--;
          } catch (e) {
            console.error("Falha ao salvar card", e);
          }
        }
      }
      if (cards) salvarCardsLocal(novos);
      setResumoEnvio({ revisao, cards, materias: porMateria.length, duplicadas });
      toast.success(`Incidência atualizada: ${revisao} questão(ões) na Revisão e ${cards} card(s) novos.`);
    } finally {
      setProcessando(false);
    }
  }

  // Executa automaticamente quando uma nova análise termina.
  useEffect(() => {
    if (analise && analise !== ultima.current && analise.questoes.length) {
      ultima.current = analise;
      void processar(analise);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analise]);

  const questoes = resultado?.questoes ?? [];
  const itens = useMemo(() => calcularIncidencia(questoes, cfg), [questoes, cfg]);
  const visiveis = filtro ? itens.filter((i) => i.materia.toLowerCase() === filtro.toLowerCase()) : itens;
  const artigos = visiveis.filter((i) => i.tipo === "artigo");
  const assuntos = visiveis.filter((i) => i.tipo === "assunto");
  const pendentes = questoes.filter((q) => q.pendente);
  const fora = questoes.filter((q) => q.foraDoEdital).length;
  const provas = new Set(questoes.map((q) => q.prova)).size;
  const origens = [...new Set(questoes.map((q) => (q.questao.origem ?? "").split(" · ")[0] || "Sem origem"))];

  const numero = (v: string) => Math.max(1, Math.min(99, Number(v) || 1));

  return (
    <section className="no-print space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold">Incidência de cobrança</h2>
        <span className="text-[11px] font-semibold text-muted-foreground">sem IA · sem créditos</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {banca && cargo ? `${banca} · ${cargo}` : "Escolha banca e cargo no topo."} Conta questões únicas, provas
        distintas e anos. Só matérias do edital ativo entram na contagem.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={usarAcervo} onChange={(e) => setUsarAcervo(e.target.checked)} className="size-4 accent-primary" />
        Incluir as questões do acervo (PDFs, links e Quest API)
      </label>

      <details className="rounded-lg border border-border p-2 text-xs">
        <summary className="cursor-pointer font-semibold">Regras das estrelas</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["alta", "media"] as const).map((nivel) => (
            <div key={nivel} className="space-y-1">
              <Label className="text-xs">{nivel === "alta" ? "★★★ Alta" : "★★☆ Média"}</Label>
              <div className="flex items-center gap-1">
                <Input type="number" min={1} value={cfg[nivel].questoes} aria-label={`Mínimo de questões ${nivel}`}
                  onChange={(e) => setCfg((c) => ({ ...c, [nivel]: { ...c[nivel], questoes: numero(e.target.value) } }))} />
                <span>questões</span>
              </div>
              <div className="flex items-center gap-1">
                <Input type="number" min={1} value={cfg[nivel].provas} aria-label={`Mínimo de provas ${nivel}`}
                  onChange={(e) => setCfg((c) => ({ ...c, [nivel]: { ...c[nivel], provas: numero(e.target.value) } }))} />
                <span>provas</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-muted-foreground">Abaixo da média: ★☆☆ Baixa.</p>
      </details>

      <Button className="w-full" variant="secondary" disabled={processando} onClick={() => void processar(null)}>
        {processando ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
        Recalcular e alimentar Revisão e Cards
      </Button>

      {questoes.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            <li className="rounded-lg bg-secondary p-2">Provas: <b>{provas}</b></li>
            <li className="rounded-lg bg-secondary p-2">Questões: <b>{questoes.length}</b></li>
            <li className="rounded-lg bg-secondary p-2">Classificadas: <b>{questoes.length - pendentes.length}</b></li>
            <li className="rounded-lg bg-secondary p-2">Para revisar: <b>{pendentes.length}</b></li>
            <li className="rounded-lg bg-secondary p-2">Fora do edital: <b>{fora}</b></li>
            <li className="rounded-lg bg-secondary p-2">Artigos ★★★: <b>{itens.filter((i) => i.tipo === "artigo" && i.estrelas === 3).length}</b></li>
            {resumoEnvio && (
              <>
                <li className="rounded-lg bg-secondary p-2">Enviadas à Revisão: <b>{resumoEnvio.revisao}</b></li>
                <li className="rounded-lg bg-secondary p-2">Cards novos: <b>{resumoEnvio.cards}</b> ({resumoEnvio.materias} matérias)</li>
                <li className="col-span-2 rounded-lg bg-secondary p-2">Duplicadas ignoradas: <b>{resumoEnvio.duplicadas}</b></li>
              </>
            )}
            <li className="col-span-2 rounded-lg bg-secondary p-2">Origem: {origens.join(", ")}</li>
          </ul>

          {[["Artigos mais cobrados", artigos], ["Assuntos mais cobrados", assuntos]].map(([titulo, lista]) => (
            <div key={titulo as string}>
              <h3 className="mb-1 text-sm font-semibold">{titulo as string}</h3>
              {(lista as typeof itens).length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum identificado com segurança.</p>
              ) : (
                <ul className="space-y-1">
                  {(lista as typeof itens).slice(0, 15).map((i) => (
                    <li key={i.chave} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5 text-xs">
                      <span className="min-w-0">
                        <span className="font-medium">{i.rotulo}</span>
                        <span className="block text-muted-foreground">
                          {i.materia} · {i.questoes.length} questão(ões) · {i.provas} prova(s){i.anos.length ? ` · ${i.anos.join(", ")}` : ""}
                        </span>
                      </span>
                      <EstrelasIcone n={i.estrelas} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {pendentes.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold">Questões para revisão manual ({pendentes.length})</summary>
              <ul className="mt-1 space-y-1">
                {pendentes.slice(0, 30).map((q) => (
                  <li key={q.hash} className="rounded border border-border p-1.5">
                    <span className="text-mark-red">{q.pendente}</span> — {q.questao.enunciado.slice(0, 140)}…
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
