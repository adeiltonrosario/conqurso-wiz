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
import { EDITAIS_MATERIAS, escopoDoConcurso, escoposPeso, filtrarPesosPorEdital, pesoDentroDaMateria, pesoPorBanca, rankingCompleto } from "@/lib/incidencia-provas";
import { LEITURA_RESUMIDA, MATERIAS_POR_BLOCO, itensDaMateria, nuncaCobradosDaMateria } from "@/lib/leis-resumidas";
import { QUESTOES_CRASE_TREINO, embaralharAlternativas } from "@/lib/treino-crase";
import {
  QUESTOES_CADERNO_MUSE,
  embaralharAlternativasCadernoMuse,
  materiasComTreino,
  questoesPendentes,
  questoesPorMateria,
  questoesTreinaveis,
  type QuestaoCadernoMuse,
} from "@/lib/caderno-muse";
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

function TreinoCraseQuestao({
  q,
  ordem,
  escolha,
  mostrar,
  onEscolha,
  onRepetir,
  onMostrar,
}: {
  q: (typeof QUESTOES_CRASE_TREINO)[number];
  ordem: number;
  escolha: string;
  mostrar: boolean;
  onEscolha: (letra: string) => void;
  onRepetir: () => void;
  onMostrar: () => void;
}) {
  const embaralhadas = useMemo(() => embaralharAlternativas(q), [q, ordem]);
  const revelado = mostrar || !!escolha;
  return (
    <li className="rounded-lg border border-border p-2">
      <span className="font-medium">
        {q.prova} {q.ano} — Q{q.numero} ·{" "}
        {q.modelo === "crase-direta"
          ? "Crase pedida"
          : q.modelo === "regencia"
            ? "Regência (crase mascarada)"
            : "Outro assunto (crase como distrator)"}
      </span>
      <span className="block text-muted-foreground">{q.comando}</span>
      <span className="block font-semibold">Como descobrir: {q.insight}</span>
      <div className="mt-2 space-y-1">
        {embaralhadas.map((a) => (
          <button
            key={a.letra + a.texto}
            type="button"
            onClick={() => onEscolha(a.letra)}
            className={`block w-full rounded-lg border px-2 py-1.5 text-left ${
              escolha === a.letra
                ? a.correta
                  ? "border-green-600 bg-green-50 dark:bg-green-950"
                  : "border-red-600 bg-red-50 dark:bg-red-950"
                : "border-border"
            }`}
          >
            <b>{a.letra})</b> {a.texto}
            {revelado && (
              <span className="block text-muted-foreground">
                {a.correta ? "✓ Certa — " : "✗ Errada — "}
                {a.porQue}
              </span>
            )}
          </button>
        ))}
      </div>
      <span className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onRepetir}>
          Repetir embaralhando
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onMostrar}>
          Ver explicação
        </Button>
      </span>
      <span className="block text-muted-foreground">Gabarito: {q.gabaritoVersao} (pelo texto da alternativa, não pela letra).</span>
    </li>
  );
}

/**
 * Treino de Crase: cada questão traz o insight de como descobrir a certa
 * pelo comando, e um botão "Repetir embaralhando" troca as alternativas
 * de lugar — a resposta certa muda de letra, então só acerta quem julga
 * o conteúdo. A explicação de cada alternativa só aparece depois que o
 * usuário escolhe uma (ou toca em "Ver explicação").
 */
function TreinoCrase() {
  const [ordem, setOrdem] = useState<Record<string, number>>({});
  const [escolha, setEscolha] = useState<Record<string, string>>({});
  const [mostrar, setMostrar] = useState<Record<string, boolean>>({});

  return (
    <details className="mb-2 rounded-lg border border-border p-2 text-xs" open>
      <summary className="cursor-pointer font-semibold">
        Treino de Crase — como descobrir a certa ({QUESTOES_CRASE_TREINO.length} questões verificadas)
      </summary>
      <p className="mt-1 text-muted-foreground">
        Leia o insight antes de responder. Depois, repita com as alternativas embaralhadas — a letra certa muda,
        o conteúdo não.
      </p>
      <ol className="mt-2 space-y-3">
        {QUESTOES_CRASE_TREINO.map((q) => (
          <TreinoCraseQuestao
            key={q.id}
            q={q}
            ordem={ordem[q.id] ?? 0}
            escolha={escolha[q.id] ?? ""}
            mostrar={mostrar[q.id] ?? false}
            onEscolha={(letra) => setEscolha((s) => ({ ...s, [q.id]: letra }))}
            onRepetir={() => {
              setEscolha((s) => ({ ...s, [q.id]: "" }));
              setMostrar((s) => ({ ...s, [q.id]: false }));
              setOrdem((o) => ({ ...o, [q.id]: (o[q.id] ?? 0) + 1 }));
            }}
            onMostrar={() => setMostrar((s) => ({ ...s, [q.id]: true }))}
          />
        ))}
      </ol>
    </details>
  );
}

function TreinoCadernoMuseQuestao({
  q,
  ordem,
  escolha,
  mostrar,
  onEscolha,
  onRepetir,
  onMostrar,
}: {
  q: QuestaoCadernoMuse;
  ordem: number;
  escolha: string;
  mostrar: boolean;
  onEscolha: (letra: string) => void;
  onRepetir: () => void;
  onMostrar: () => void;
}) {
  const embaralhadas = useMemo(() => embaralharAlternativasCadernoMuse(q), [q, ordem]);
  const revelado = mostrar || !!escolha;
  return (
    <li className="rounded-lg border border-border p-2">
      <span className="font-medium">
        {q.prova} {q.ano} — Q{q.numero ?? "?"} · {q.materia}
        {q.assunto ? ` · ${q.assunto}` : ""}
      </span>
      {q.artigo && <span className="block text-muted-foreground">{q.artigo}</span>}
      <span className="block whitespace-pre-wrap">{q.enunciado}</span>
      <span className="block font-semibold">Como descobrir: {q.insight}</span>
      <div className="mt-2 space-y-1">
        {embaralhadas.map((a) => (
          <button
            key={a.letra + a.texto}
            type="button"
            onClick={() => onEscolha(a.letra)}
            className={`block w-full rounded-lg border px-2 py-1.5 text-left ${
              escolha === a.letra
                ? a.correta
                  ? "border-green-600 bg-green-50 dark:bg-green-950"
                  : "border-red-600 bg-red-50 dark:bg-red-950"
                : "border-border"
            }`}
          >
            <b>{a.letra})</b> {a.texto}
            {revelado && (
              <span className="block text-muted-foreground">
                {a.correta ? "✓ Certa — " : "✗ Errada — "}
                {a.porQue ?? "Por que não determinado nos dados coletados — veja o insight e o gabarito."}
              </span>
            )}
          </button>
        ))}
      </div>
      <span className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onRepetir}>
          Repetir embaralhando
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onMostrar}>
          Ver explicação
        </Button>
      </span>
      <span className="block text-muted-foreground">
        Gabarito: {q.gabaritoFonte} (pelo texto da alternativa, não pela letra).
      </span>
    </li>
  );
}

/**
 * Treino Caderno Muse: as 111 questões confirmadas do caderno, com
 * enunciado, alternativas e gabarito oficial — mesmo modelo do Treino de
 * Crase (insight antes de responder, repetição com alternativas
 * embaralhadas). Filtro por matéria; as pendentes (texto parcial por
 * imagem, sem como resolver) aparecem só numa lista, sem treino.
 */
function TreinoCadernoMuse() {
  const [materia, setMateria] = useState("Todas");
  const [ordem, setOrdem] = useState<Record<string, number>>({});
  const [escolha, setEscolha] = useState<Record<string, string>>({});
  const [mostrar, setMostrar] = useState<Record<string, boolean>>({});
  const treinaveis = useMemo(
    () => (materia === "Todas" ? questoesTreinaveis() : questoesPorMateria(materia)),
    [materia],
  );
  const pendentes = questoesPendentes();
  const materias = materiasComTreino();

  return (
    <details className="mb-2 rounded-lg border border-border p-2 text-xs" open>
      <summary className="cursor-pointer font-semibold">
        Treino Caderno Muse — questões reais da VUNESP 2025 ({treinaveis.length} nesta matéria ·{" "}
        {questoesTreinaveis().length} treináveis de {QUESTOES_CADERNO_MUSE.length} confirmadas)
      </summary>
      <p className="mt-1 text-muted-foreground">
        As 111 questões confirmadas do caderno, com enunciado, alternativas e gabarito oficial. Leia o insight antes
        de responder. Depois, repita com as alternativas embaralhadas — a letra certa muda, o conteúdo não. Só entram
        as confirmadas; as 20 extras marcadas &quot;pertinência a confirmar&quot; ficaram fora.
      </p>
      <label className="mt-2 block">
        <span className="font-semibold">Matéria: </span>
        <select
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          className="rounded border border-border bg-background px-1 py-0.5"
        >
          <option value="Todas">Todas as matérias</option>
          {materias.map((m) => (
            <option key={m} value={m}>
              {m} ({questoesPorMateria(m).length})
            </option>
          ))}
        </select>
      </label>
      <ol className="mt-2 space-y-3">
        {treinaveis.map((q) => (
          <TreinoCadernoMuseQuestao
            key={q.id}
            q={q}
            ordem={ordem[q.id] ?? 0}
            escolha={escolha[q.id] ?? ""}
            mostrar={mostrar[q.id] ?? false}
            onEscolha={(letra) => setEscolha((s) => ({ ...s, [q.id]: letra }))}
            onRepetir={() => {
              setEscolha((s) => ({ ...s, [q.id]: "" }));
              setMostrar((s) => ({ ...s, [q.id]: false }));
              setOrdem((o) => ({ ...o, [q.id]: (o[q.id] ?? 0) + 1 }));
            }}
            onMostrar={() => setMostrar((s) => ({ ...s, [q.id]: true }))}
          />
        ))}
      </ol>
      {pendentes.length > 0 && (
        <details className="mt-2 rounded-lg border border-border p-2 text-xs">
          <summary className="cursor-pointer font-semibold">
            Aguardando gabarito/alternativas ({pendentes.length} — sem treino)
          </summary>
          <ul className="mt-1 space-y-1">
            {pendentes.map((q) => (
              <li key={q.id} className="rounded border border-border px-2 py-1">
                <span className="font-medium">
                  {q.id} · {q.prova} {q.ano} — Q{q.numero ?? "?"} · {q.materia}
                </span>
                <span className="block text-muted-foreground">{q.motivoPendente}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </details>
  );
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
  // Peso por matéria a partir de provas anteriores contadas no Qconcursos
  // (src/lib/incidencia-provas.ts) — contagem real, sem IA. Mostra o escopo
  // do concurso ativo; sem banca/cargo ativo, mostra todos os escopos.
  const escopoAtivo = escopoDoConcurso(banca, cargo);
  const escoposContados = escopoAtivo ? [escopoAtivo] : escoposPeso();
  // Mesma banca, outros cargos: questões semelhantes entram para mostrar
  // como a banca cobra cada assunto — o estilo se repete entre cargos.
  const bancaGeral = pesoPorBanca(banca);
  // Só entra o que é do mesmo assunto cobrado no edital ativo: matérias
  // de outro cargo que não estão no edital ficam de fora, e o app mostra
  // quais foram excluídas.
  const materiasEdital = materiasAtivas(edital).map((m) => m.nome);
  const escoposNoEdital = escoposContados.map((e) => {
    const f = filtrarPesosPorEdital(e.pesos, materiasEdital);
    return { ...e, pesos: f.dentro, fora: f.fora };
  });
  const bancaNoEdital = bancaGeral
    ? { ...bancaGeral, ...filtrarPesosPorEdital(bancaGeral.pesos, materiasEdital) }
    : null;
  // Ranking completo: todas as matérias do edital, do maior peso para o
  // menor, com as sem contagem no fim — nunca fora do treino. Sem edital
  // importado, usa a lista do edital do cargo ativo (Anexo VIII / Anexo I).
  const materiasRanking =
    materiasEdital.length > 0
      ? materiasEdital
      : (Object.entries(EDITAIS_MATERIAS).find(([k]) => cargo && k.toLowerCase().includes(cargo.toLowerCase().split(" ")[0]!))?.[1] ??
        EDITAIS_MATERIAS["TJ-SP · Escrevente Técnico Judiciário"]!);
  const pesosRanking = escopoAtivo ? escopoAtivo.pesos : (bancaNoEdital?.dentro ?? []);
  const ranking = rankingCompleto(pesosRanking, materiasRanking);

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

      <div>
        <h3 className="mb-1 text-sm font-semibold">Peso por matéria — provas anteriores contadas</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Contagem real no Qconcursos, prova por prova, sem IA. O peso é a
          porcentagem de questões da matéria nas provas em que ela foi contada.
        </p>
        {escoposNoEdital.map((escopo) => (
          <details key={`${escopo.banca}|${escopo.instituicao}|${escopo.cargo}`} open={!!escopoAtivo} className="mb-2 rounded-lg border border-border p-2 text-xs">
            <summary className="cursor-pointer font-semibold">
              {escopo.banca} · {escopo.instituicao} · {escopo.cargo} — {escopo.provas.length} prova(s)
            </summary>
            <ul className="mt-2 space-y-1">
              {escopo.pesos.map((p) => (
                <li key={p.materia} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5">
                  <span className="min-w-0">
                    <span className="font-medium">{p.materia}</span>
                    <span className="block text-muted-foreground">
                      {p.questoes} questão(ões) em {p.provas} prova(s) · {p.totalContado} questões contadas
                    </span>
                  </span>
                  <b className="shrink-0">{p.peso.toLocaleString("pt-BR")}%</b>
                </li>
              ))}
            </ul>
            {escopo.fora.length > 0 && (
              <p className="mt-2 text-muted-foreground">
                Fora do edital deste concurso, por isso não entrou: {escopo.fora.map((p) => p.materia).join(", ")}.
              </p>
            )}
            <p className="mt-2 text-muted-foreground">
              Provas: {escopo.provas.map((p) => `${p.ano} (${p.aplicadaEm})`).join(", ")}. Fontes no Qconcursos — ver
              src/lib/incidencia-provas.ts.
            </p>
          </details>
        ))}
        <details open className="mb-2 rounded-lg border border-border p-2 text-xs">
          <summary className="cursor-pointer font-semibold">
            Ranking de incidência — todas as matérias do edital ({ranking.length} matérias)
          </summary>
          <p className="mt-1 text-muted-foreground">
            Do maior peso para o menor. Dentro de cada matéria, os assuntos também estão em ranking, do mais cobrado
            para o menos — é assim que fica objetivo o que estudar primeiro. Matéria sem contagem nas provas
            verificadas fica no fim, marcada — ela ainda entra no treino e na repetição.
          </p>
          <ol className="mt-2 space-y-1">
            {ranking.map((r, i) => (
              <li key={r.materia} className="rounded-lg border border-border px-2 py-1.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{i + 1}. {r.materia}</span>
                  <b className="shrink-0">{r.contada ? `${r.peso.toLocaleString("pt-BR")}%` : "sem contagem"}</b>
                </span>
                <span className="block text-muted-foreground">
                  {r.contada ? `${r.questoes} questão(ões) em ${r.provas} prova(s)` : "Não contada nas provas verificadas — buscar questões variadas na Quest API para treinar."}
                </span>
                {r.assuntos.length > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold">Ranking dentro da matéria:</span>
                    <ul className="mt-1 space-y-1">
                      {r.assuntos.map((a, j) => (
                        <li key={a.assunto} className="rounded border border-border px-2 py-1">
                          <span className="font-medium">
                            {j + 1}º — {a.assunto} — {a.questoes} questão(ões) em {a.provas} prova(s)
                            {r.materia === "Língua Portuguesa" && pesoDentroDaMateria(a, 136) !== null
                              ? ` — ${pesoDentroDaMateria(a, 136)!.toLocaleString("pt-BR")}% do Português`
                              : ""}
                          </span>
                          {a.separacaoCraseRegencia && (
                            <span className="block">
                              Separado por comando — Crase pedida: {a.separacaoCraseRegencia.craseDireta} · Regência (crase mascarada):{" "}
                              {a.separacaoCraseRegencia.regenciaMascarada}
                              {a.separacaoCraseRegencia.outroAssuntoMascarada
                                ? ` · Outro assunto (crase como distrator): ${a.separacaoCraseRegencia.outroAssuntoMascarada}`
                                : ""}
                            </span>
                          )}
                          {a.comoCobra && <span className="block text-muted-foreground">{a.comoCobra}</span>}
                          {a.alertaMascarado && (
                            <span className="block font-semibold text-foreground">
                              ⚠ Prioridade alta — muito cobrado, mascarado pela regência: {a.alertaMascarado}
                            </span>
                          )}
                          {a.observacao && <span className="block text-muted-foreground">{a.observacao}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.assuntos.length === 0 && (
                  <span className="block text-muted-foreground">
                    Sem contagem por assunto nas provas verificadas — treinar pelos assuntos do edital.
                  </span>
                )}
              </li>
            ))}
          </ol>
        </details>
        <details open className="mb-2 rounded-lg border border-border p-2 text-xs">
          <summary className="cursor-pointer font-semibold">
            Leitura resumida — só o que foi cobrado ({LEITURA_RESUMIDA.length} itens)
          </summary>
          <p className="mt-1 text-muted-foreground">
            Todas as matérias do edital, na ordem dos blocos da prova. Cada item tem uma linha só: o que diz e como a
            banca cobrou. Só entra o que foi verificado em prova real contada questão por questão; o que está no edital
            e nunca foi identificado vai para a lista de &quot;nunca cobrado&quot; da matéria, para estudar do zero.
          </p>
          {MATERIAS_POR_BLOCO.map(({ bloco, materias }) => (
            <div key={bloco}>
              <h4 className="mt-3 text-sm font-semibold">{bloco}</h4>
              {materias.map((materia) => {
                const itens = itensDaMateria(materia);
                const nunca = nuncaCobradosDaMateria(materia);
                return (
                  <details key={materia} className="mb-2 rounded-lg border border-border p-2 text-xs">
                    <summary className="cursor-pointer font-semibold">
                      {materia} — {itens.length} item(ns) cobrado(s)
                      {nunca.length > 0 ? ` · ${nunca.length} no edital, nunca cobrado(s)` : ""}
                    </summary>
                    <ol className="mt-2 space-y-1">
                      {itens.map((item) => (
                        <li key={`${item.materia}|${item.artigo}`} className="rounded border border-border px-2 py-1">
                          <span className="font-medium">
                            {item.artigo} — cobrado em {item.provas} prova(s)
                            {item.questoes ? ` · ${item.questoes} questão(ões)` : ""}
                          </span>
                          <span className="block text-muted-foreground">{item.resumo}</span>
                          {item.exemplo && <span className="block text-muted-foreground">Como cobrou: {item.exemplo}</span>}
                          {item.separacaoCraseRegencia && (
                            <span className="block">
                              Separado por comando — Crase pedida: {item.separacaoCraseRegencia.craseDireta} · Regência
                              (crase mascarada): {item.separacaoCraseRegencia.regenciaMascarada}
                              {item.separacaoCraseRegencia.outroAssuntoMascarada
                                ? ` · Outro assunto (crase como distrator): ${item.separacaoCraseRegencia.outroAssuntoMascarada}`
                                : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                    {nunca.length > 0 && (
                      <div className="mt-2">
                        <span className="font-semibold">No edital, nunca cobrado — estudar do zero:</span>
                        <ul className="mt-1 space-y-1">
                          {nunca.map((n) => (
                            <li key={`${n.materia}|${n.artigo}`} className="rounded border border-border px-2 py-1">
                              <span className="font-medium">{n.artigo}</span>
                              <span className="block text-muted-foreground">{n.motivo}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          ))}
        </details>
        <TreinoCrase />
        <TreinoCadernoMuse />
        {bancaNoEdital && bancaNoEdital.provas.length > (escopoAtivo?.provas.length ?? 0) && (
          <details className="mb-2 rounded-lg border border-border p-2 text-xs">
            <summary className="cursor-pointer font-semibold">
              Mesma banca, outros cargos — como a {banca} cobra cada assunto ({bancaNoEdital.provas.length} provas)
            </summary>
            <p className="mt-1 text-muted-foreground">
              Inclui questões semelhantes de cargo diferente, porque o estilo da banca se repete: os assuntos mais
              cobrados e o jeito de perguntar são os mesmos. Só entra o assunto que também está no seu edital.
            </p>
            <ul className="mt-2 space-y-1">
              {bancaNoEdital.dentro.slice(0, 10).map((p) => (
                <li key={p.materia} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5">
                  <span className="min-w-0">
                    <span className="font-medium">{p.materia}</span>
                    <span className="block text-muted-foreground">
                      {p.questoes} questão(ões) em {p.provas} prova(s) · {p.totalContado} questões contadas
                    </span>
                  </span>
                  <b className="shrink-0">{p.peso.toLocaleString("pt-BR")}%</b>
                </li>
              ))}
            </ul>
            {bancaNoEdital.fora.length > 0 && (
              <p className="mt-2 text-muted-foreground">
                Fora do seu edital, por isso não entrou: {bancaNoEdital.fora.map((p) => p.materia).join(", ")}.
              </p>
            )}
            <p className="mt-2 text-muted-foreground">
              Cargos incluídos: {[...new Set(bancaNoEdital.provas.map((p) => `${p.cargo} (${p.instituicao} ${p.ano})`))].join(", ")}.
              As pegadinhas em si — o texto de cada questão — ainda não estão aqui: esta tabela conta disciplinas e
              assuntos. Para ver a pegadinha, importe as questões da prova no acervo.
            </p>
          </details>
        )}
      </div>

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
