import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, FileText, ListPlus, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  extrairMateriasEdital,
  LIMITE_BLOCO_EDITAL,
  LIMITE_EDITAL,
} from "@/lib/ai.functions";
import { extrairMateriasDoTexto, organizarTextoEdital } from "@/lib/edital-parser";
import {
  bancaDoCargo,
  bancasDoEdital,
  cargosDoEdital,
  materiasAtivas,
  mesclarMaterias,
  novoId,
  useEdital,
  type GrupoEdital,
  type MateriaEdital,
} from "@/lib/edital";
import { cn } from "@/lib/utils";

import { FiltroConcurso } from "@/components/FiltroConcurso";

const GRUPOS: GrupoEdital[] = ["Conhecimento Geral", "Conhecimento Específico"];
const LIMITE_TOPICO = 1000;
const LIMITE_NOME = 160;

/** Caixa de texto que cresce conforme o conteúdo, para caber editais extensos. */
function CaixaCrescente({
  valor,
  aoMudar,
  limite,
  minLinhas = 3,
  maxAltura = 900,
  id,
  placeholder,
  ariaLabel,
  className,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  limite: number;
  minLinhas?: number;
  maxAltura?: number;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const minimo = minLinhas * 20 + 20;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minimo), maxAltura)}px`;
  }, [valor, minLinhas, maxAltura]);

  return (
    <Textarea
      id={id}
      ref={ref}
      rows={minLinhas}
      aria-label={ariaLabel}
      value={valor}
      placeholder={placeholder}
      className={cn("resize-none leading-5", className)}
      onChange={(e) => aoMudar(e.target.value.slice(0, limite))}
    />
  );
}

/** Cadastro das matérias do edital: extração por IA e edição manual. */
export function EditalMaterias() {
  const {
    edital,
    aplicar,
    definirMaterias,
    atualizarMateria,
    removerMateria,
    adicionarCargo,
    removerCargo,
    adicionarBanca,
    removerBanca,
    definirFiltro,
  } = useEdital();
  const extrair = useServerFn(extrairMateriasEdital);
  const [texto, setTexto] = useState<string | null>(null);
  const [nova, setNova] = useState("");
  const [novoGrupo, setNovoGrupo] = useState<GrupoEdital>("Conhecimento Específico");
  const [topicoNovo, setTopicoNovo] = useState<Record<string, string>>({});
  const [novoCargo, setNovoCargo] = useState("");
  const [bancaDoNovoCargo, setBancaDoNovoCargo] = useState("");
  const [novaBanca, setNovaBanca] = useState("");
  const [materiasAbertas, setMateriasAbertas] = useState<Set<string>>(() => new Set());
  const pdfRef = useRef<HTMLInputElement | null>(null);
  const [lendoPdf, setLendoPdf] = useState(false);

  const carregarPdf = async (arquivo: File) => {
    setLendoPdf(true);
    try {
      const { extrairTextoPdf } = await import("@/lib/pdf");
      const { texto: bruto } = await extrairTextoPdf(arquivo);
      const organizado = organizarTextoEdital(bruto);
      if (!organizado) {
        toast.error("Não encontrei matérias nesse PDF. Copie o conteúdo programático e cole na caixa.");
        return;
      }
      setTexto(organizado.slice(0, LIMITE_EDITAL));
      toast.success("Edital organizado na caixa — confira e clique em “Extrair e limpar”.");
    } catch {
      toast.error("Não consegui ler esse PDF.");
    } finally {
      setLendoPdf(false);
    }
  };

  const valor = texto ?? edital.texto;
  const cargos = edital.cargos ?? [];
  const bancas = edital.bancas ?? [];
  const bancasDisponiveis = bancasDoEdital(edital);
  const cargosDisponiveis = cargosDoEdital(edital);
  const partes = Math.max(1, Math.ceil(valor.trim().length / LIMITE_BLOCO_EDITAL));
  const estourou = valor.length >= LIMITE_EDITAL;
  const materiasVisiveis = materiasAtivas(edital);
  const ocultas = edital.materias.length - materiasVisiveis.length;
  const filtroAtivo = Boolean((edital.bancaAtiva ?? "").trim() || (edital.cargoAtivo ?? "").trim());

  const alternarMateria = (id: string) => {
    setMateriasAbertas((atuais) => {
      const proximas = new Set(atuais);
      if (proximas.has(id)) proximas.delete(id);
      else proximas.add(id);
      return proximas;
    });
  };

  const mut = useMutation({
    mutationFn: () => extrair({ data: { texto: valor.trim() } }),
    onSuccess: ({ materias, cargos: cargosIA, bancas: bancasIA, partes }) => {
      if (!materias.length) {
        toast.error("A IA não encontrou matérias nesse texto.");
        return;
      }
      const existentes = new Set(edital.materias.map((m) => m.nome.trim().toLowerCase()));
      const novas = materias
        .filter((m) => m.nome && !existentes.has(m.nome.trim().toLowerCase()))
        .map((m) => ({
          id: novoId(),
          nome: m.nome.trim(),
          grupo: m.grupo === "Conhecimento Geral" ? "Conhecimento Geral" : "Conhecimento Específico",
          topicos: (m.topicos ?? []).map((t) => t.trim()).filter(Boolean),
          banca: edital.bancaAtiva ?? "",
          cargo: edital.cargoAtivo ?? "",
        })) as typeof edital.materias;
      const cargosAtuais = edital.cargos ?? [];
      const vistos = new Set(cargosAtuais.map((c) => c.trim().toLowerCase()));
      const cargosNovos = (cargosIA ?? [])
        .map((c) => c.trim())
        .filter((c) => c && !vistos.has(c.toLowerCase()) && vistos.add(c.toLowerCase()));
      const bancasAtuais = edital.bancas ?? [];
      const vistasBancas = new Set(bancasAtuais.map((b) => b.trim().toLowerCase()));
      const bancasNovas = (bancasIA ?? [])
        .map((b) => b.trim())
        .filter((b) => b && !vistasBancas.has(b.toLowerCase()) && vistasBancas.add(b.toLowerCase()));
      aplicar({
        texto: valor.trim(),
        materias: [...edital.materias, ...novas],
        cargos: [...cargosAtuais, ...cargosNovos],
        bancas: [...bancasAtuais, ...bancasNovas],
      });
      toast.success(
        `${novas.length} matéria(s), ${cargosNovos.length} cargo(s) e ${bancasNovas.length} banca(s) do edital cadastrados${
          partes > 1 ? ` — edital lido em ${partes} partes` : ""
        }.`,
      );
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao ler o edital."),
  });

  /** Inclui vários tópicos de uma vez: um por linha ou separados por ";". */
  const adicionarTopicos = (m: MateriaEdital) => {
    const novos = (topicoNovo[m.id] ?? "")
      .split(/\r?\n|;/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
    if (!novos.length) return;
    const atuais = [...m.topicos];
    let incluidos = 0;
    for (const t of novos) {
      if (atuais.some((x) => x.trim().toLowerCase() === t.toLowerCase())) continue;
      atuais.push(t);
      incluidos += 1;
    }
    setTopicoNovo((s) => ({ ...s, [m.id]: "" }));
    if (!incluidos) return;
    atualizarMateria(m.id, { topicos: atuais });
    if (incluidos > 1) toast.success(`${incluidos} tópicos incluídos em ${m.nome}.`);
  };

  const adicionar = () => {
    const nome = nova.trim();
    if (nome.length < 2) return;
    if (edital.materias.some((m) => m.nome.trim().toLowerCase() === nome.toLowerCase())) {
      toast.error("Essa matéria já está cadastrada.");
      return;
    }
    definirMaterias([
      ...edital.materias,
      {
        id: novoId(),
        nome,
        grupo: novoGrupo,
        topicos: [],
        banca: edital.bancaAtiva ?? "",
        cargo: edital.cargoAtivo ?? "",
      },
    ]);
    setNova("");
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
      <div>
        <h2 className="font-display text-base font-bold">Matérias do edital</h2>
        <p className="text-xs text-muted-foreground">
          Cole o conteúdo programático para a IA extrair as matérias e os tópicos, ou cadastre na mão.
          Elas aparecem em Questões, Leis, Prova, Padrões e Trilha, separadas por banca e cargo.
        </p>
      </div>

      <FiltroConcurso />

      <div className="space-y-2">
        <Label htmlFor="edital-texto">Conteúdo programático do edital</Label>
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          aria-label="PDF do edital"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void carregarPdf(f);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={lendoPdf}
          onClick={() => pdfRef.current?.click()}
        >
          {lendoPdf ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <FileText className="mr-2 size-4" />
          )}
          {lendoPdf ? "Lendo o PDF…" : "Carregar do PDF do edital"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Lê o PDF no seu aparelho, sem gastar IA, e organiza as matérias e tópicos na caixa abaixo.
          Confira e clique em “Extrair e limpar”.
        </p>
        <CaixaCrescente
          id="edital-texto"
          valor={valor}
          aoMudar={setTexto}
          limite={LIMITE_EDITAL}
          minLinhas={14}
          placeholder="Cole aqui o trecho do edital com as disciplinas e os tópicos…"
        />
        <p className="text-xs text-muted-foreground">
          {valor.length.toLocaleString("pt-BR")} de {LIMITE_EDITAL.toLocaleString("pt-BR")}{" "}
          caracteres — pode colar em partes: cada parte é somada às matérias já cadastradas.
        </p>
        {estourou && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
            O campo aceita até {LIMITE_EDITAL.toLocaleString("pt-BR")} caracteres e já está cheio.
            Extraia o que está aqui e cole o restante do edital em seguida.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={valor.trim().length < 20 || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {partes > 1 ? `Lendo o edital (parte a parte)…` : "Lendo o edital…"}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" /> Extrair matérias com a IA
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={valor.trim().length < 10}
            onClick={() => {
              const extraidas = extrairMateriasDoTexto(valor);
              if (!extraidas.length) {
                toast.error(
                  "Não reconheci matérias nesse formato — use 'Extrair matérias com a IA'.",
                );
                return;
              }
              const { materias, criadas, topicosNovos } = mesclarMaterias(
                edital.materias,
                extraidas,
                { banca: edital.bancaAtiva, cargo: edital.cargoAtivo },
              );
              aplicar({ materias, texto: "" });
              setTexto("");
              toast.success(
                `${criadas} matéria(s) e ${topicosNovos} tópico(s) incluídos — cole a próxima parte do edital.`,
              );
            }}
          >
            <ListPlus className="mr-2 size-4" /> Extrair e limpar
          </Button>

        </div>
        {partes > 1 && (
          <p className="text-xs text-muted-foreground">
            Texto longo: a IA vai ler em {partes} partes e juntar tudo no final. A extração local
            ("Extrair e limpar") também aceita o texto inteiro e não gasta créditos.
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="edital-cargo">Cargos do edital</Label>
        <p className="text-xs text-muted-foreground">
          Todo cargo é vinculado a uma banca — assim o seletor de concurso muda os dois juntos.
          Só estes cargos aparecem na Trilha, para você não estudar o conteúdo de outro cargo.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!bancaDoNovoCargo) {
              toast.error("Escolha a banca deste cargo — o cargo fica vinculado a ela.");
              return;
            }
            if (cargos.some((c) => c.trim().toLowerCase() === novoCargo.trim().toLowerCase())) {
              toast.error("Esse cargo já está cadastrado.");
              return;
            }
            if (!novoCargo.trim()) return;
            adicionarCargo(novoCargo, bancaDoNovoCargo);
            setNovoCargo("");
          }}
        >
          <Input
            id="edital-cargo"
            value={novoCargo}
            onChange={(e) => setNovoCargo(e.target.value.slice(0, 160))}
            placeholder="Ex.: Escrivão de Polícia Civil"
            className="h-9"
          />
          <select
            value={bancaDoNovoCargo}
            onChange={(e) => setBancaDoNovoCargo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            aria-label="Banca deste cargo"
          >
            <option value="">Banca do cargo…</option>
            {bancasDisponiveis.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" aria-label="Adicionar cargo">
            <Plus className="size-4" />
          </Button>
        </form>
        {cargos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum cargo cadastrado — extraia do edital ou adicione acima.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {cargos.map((c) => {
              const banca = bancaDoCargo(edital, c);
              return (
                <li
                  key={c}
                  className="flex max-w-full items-start gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
                >
                  <span className="break-words [overflow-wrap:anywhere]">
                    {c}
                    {banca ? <span className="text-muted-foreground"> — {banca}</span> : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => removerCargo(c)}
                    aria-label={`Remover ${c}`}
                    className="shrink-0"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="edital-banca">Bancas do edital</Label>
        <p className="text-xs text-muted-foreground">
          Só estas bancas aparecem como banca prevista na Trilha, para o estudo seguir o estilo da
          organizadora certa.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            adicionarBanca(novaBanca);
            setNovaBanca("");
          }}
        >
          <Input
            id="edital-banca"
            value={novaBanca}
            onChange={(e) => setNovaBanca(e.target.value.slice(0, 60))}
            placeholder="Ex.: Cebraspe"
            className="h-9"
          />
          <Button type="submit" variant="outline" aria-label="Adicionar banca">
            <Plus className="size-4" />
          </Button>
        </form>
        {bancas.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma banca cadastrada — extraia do edital ou adicione acima.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {bancas.map((b) => (
              <li
                key={b}
                className="flex max-w-full items-start gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
              >
                <span className="break-words [overflow-wrap:anywhere]">{b}</span>
                <button
                  type="button"
                  onClick={() => removerBanca(b)}
                  aria-label={`Remover ${b}`}
                  className="shrink-0"
                >
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>


      <div className="grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={nova}
          onChange={(e) => setNova(e.target.value.slice(0, LIMITE_NOME))}
          placeholder="Adicionar matéria manualmente"
        />
        <select
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value as GrupoEdital)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={adicionar} aria-label="Adicionar matéria">
          <Plus className="size-4" />
        </Button>
      </div>

      {ocultas > 0 && filtroAtivo && (
        <p className="rounded-lg border border-border bg-secondary/60 p-2 text-xs text-muted-foreground">
          {ocultas} matéria(s) de outro concurso estão ocultas pelo filtro.{" "}
          <button
            type="button"
            className="font-semibold text-accent underline"
            onClick={() => definirFiltro({ banca: "", cargo: "" })}
          >
            Voltar para Todas/Todos
          </button>
        </p>
      )}

      {edital.materias.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nenhuma matéria do edital cadastrada ainda — o app usa as matérias padrão.
        </p>
      ) : materiasVisiveis.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nenhuma matéria deste concurso (banca/cargo) cadastrada ainda — extraia do edital ou
          adicione acima; ela já nasce marcada com a seleção atual.
        </p>
      ) : (
        <ul className="space-y-3">
          {materiasVisiveis.map((m, i) => (
            <Fragment key={m.id}>
            {m.bloco && m.bloco !== materiasVisiveis[i - 1]?.bloco && (
              <li className="pt-2 font-display text-xs font-bold uppercase tracking-wide text-primary">
                {m.bloco} · {m.grupo}
              </li>
            )}
            <li className="overflow-hidden rounded-lg border border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => alternarMateria(m.id)}
                aria-expanded={materiasAbertas.has(m.id)}
                aria-controls={`materia-${m.id}`}
                className="h-auto w-full justify-start rounded-none px-3 py-3 text-left hover:bg-secondary/60"
              >
                {materiasAbertas.has(m.id) ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold [overflow-wrap:anywhere]">
                    {m.nome}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-normal text-muted-foreground">
                    <span>{m.grupo}</span>
                    <span>{m.banca || "Todas as bancas"}</span>
                    <span>{m.cargo || "Todos os cargos"}</span>
                    <span>{m.topicos.length} tópico(s)</span>
                  </span>
                </span>
              </Button>

              {materiasAbertas.has(m.id) && (
              <div id={`materia-${m.id}`} className="border-t border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={m.nome}
                  onChange={(e) =>
                    atualizarMateria(m.id, { nome: e.target.value.slice(0, LIMITE_NOME) })
                  }
                  className="h-8 flex-1 min-w-40"
                />
                <select
                  value={m.grupo}
                  onChange={(e) =>
                    atualizarMateria(m.id, { grupo: e.target.value as GrupoEdital })
                  }
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {GRUPOS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={m.banca ?? ""}
                  onChange={(e) => atualizarMateria(m.id, { banca: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  aria-label={`Banca de ${m.nome}`}
                >
                  <option value="">Todas as bancas</option>
                  {bancasDisponiveis.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={m.cargo ?? ""}
                  onChange={(e) => atualizarMateria(m.id, { cargo: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  aria-label={`Cargo de ${m.nome}`}
                >
                  <option value="">Todos os cargos</option>
                  {cargosDisponiveis.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removerMateria(m.id)}
                  aria-label={`Remover ${m.nome}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>

              {m.topicos.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {m.topicos.map((t) => (
                    <li
                      key={t}
                      className="flex max-w-full items-start gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
                    >
                      <span className="break-words [overflow-wrap:anywhere]">{t}</span>
                      <button
                        type="button"
                        onClick={() =>
                          atualizarMateria(m.id, { topicos: m.topicos.filter((x) => x !== t) })
                        }
                        aria-label={`Remover tópico ${t}`}
                        className="shrink-0"
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="mt-2 flex items-start gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  adicionarTopicos(m);
                }}
              >
                <CaixaCrescente
                  valor={topicoNovo[m.id] ?? ""}
                  aoMudar={(v) => setTopicoNovo((s) => ({ ...s, [m.id]: v }))}
                  limite={LIMITE_TOPICO}
                  minLinhas={2}
                  maxAltura={320}
                  ariaLabel={`Adicionar tópico do edital em ${m.nome}`}
                  placeholder="Adicionar tópico do edital — um por linha, ou separados por ;"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  aria-label="Adicionar tópico"
                  className="mt-1 shrink-0"
                >
                  <Plus className="size-4" />
                </Button>
              </form>
              </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
