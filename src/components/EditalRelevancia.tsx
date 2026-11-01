import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  LineChart,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estimarRelevanciaEdital } from "@/lib/ai.functions";
import {
  comLeiAdicionada,
  comLeiAlterada,
  comLeiRemovida,
  leisDaMateria,
  materiasAtivas,
  materiasPorRelevancia,
  relevanciaGeral,
  topicosPorRelevancia,
  useEdital,
  type LinkLei,
  type MateriaEdital,
} from "@/lib/edital";
import { buscarLeiPorUrl } from "@/lib/leis-url.functions";
import { salvarLeiNoAcervo } from "@/lib/leis-salvar";
import { ehAnexoDeLei, nomeLimpo, useAcervo } from "@/lib/acervo";
import { useRevisao, type HistoricoRevisao } from "@/lib/revisao";
import { useTrilha } from "@/lib/trilha";

function pct(valor?: number) {
  if (valor == null) return "—";
  return `${valor.toFixed(2).replace(".", ",")} %`;
}

function cor(valor?: number) {
  if (valor == null) return "text-muted-foreground";
  if (valor >= 10) return "text-mark-red font-semibold";
  if (valor >= 5) return "text-foreground font-semibold";
  return "text-muted-foreground";
}

function normaliza(texto: string) {
  return texto.trim().toLowerCase();
}

/** Desempenho do usuário nas questões já respondidas de uma matéria/assunto. */
function desempenho(historico: HistoricoRevisao, materia: string, assunto?: string) {
  let acertos = 0;
  let total = 0;
  for (const card of Object.values(historico.cards)) {
    const q = card.questao;
    if (normaliza(card.materia || q.materia || "") !== normaliza(materia)) continue;
    if (assunto) {
      const alvo = normaliza(q.assunto || "");
      if (!alvo || !(alvo.includes(normaliza(assunto)) || normaliza(assunto).includes(alvo)))
        continue;
    }
    acertos += card.acertos;
    total += card.acertos + card.erros;
  }
  return { acertos, total, taxa: total ? Math.round((acertos / total) * 100) : 0 };
}

function IrParaQuestoes({ materia, assunto }: { materia: string; assunto?: string }) {
  return (
    <Link
      to="/questoes"
      search={{ materia, assunto }}
      className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
    >
      <LineChart className="size-3.5" /> Ir para questões
    </Link>
  );
}

/** Campo de % editável manualmente. */
function CampoPct({
  valor,
  onChange,
  titulo,
}: {
  valor?: number | undefined;
  onChange: (valor: number | undefined) => void;
  titulo: string;
}) {
  const [texto, setTexto] = useState<string | null>(null);
  const exibido = texto ?? (valor == null ? "" : String(valor).replace(".", ","));

  return (
    <span className="inline-flex items-center gap-0.5">
      <input
        type="text"
        inputMode="decimal"
        title={titulo}
        aria-label={titulo}
        placeholder="—"
        value={exibido}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => {
          const bruto = (texto ?? "").trim().replace(",", ".");
          setTexto(null);
          if (texto === null) return;
          if (!bruto) {
            onChange(undefined);
            return;
          }
          const n = Number(bruto);
          onChange(Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : undefined);
        }}
        className={`w-14 rounded border border-border bg-background px-1 py-0.5 text-right text-xs outline-none focus:border-accent ${cor(valor)}`}
      />
      <span className="text-xs text-muted-foreground">%</span>
    </span>
  );
}

/** Links das leis de uma matéria: cadastrar, buscar o texto, editar e excluir. */
function LeisDaMateria({
  materia,
  onLeis,
}: {
  materia: MateriaEdital;
  onLeis: (leis: LinkLei[]) => void;
}) {
  const leis = leisDaMateria(materia);
  const { acervo } = useAcervo();
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<{ titulo: string; url: string }>({
    titulo: "",
    url: "",
  });
  const [buscando, setBuscando] = useState<string | null>(null);

  const salvasNoSistema = acervo.provas.filter(ehAnexoDeLei).map((a) => nomeLimpo(a).toLowerCase());
  const jaSalva = (l: LinkLei) => {
    const anexo = (l.anexo ?? "").trim().toLowerCase();
    if (anexo && salvasNoSistema.includes(anexo)) return true;
    const alvo = l.titulo.trim().toLowerCase();
    const numero = l.titulo.replace(/\D/g, "").slice(0, 6);
    return salvasNoSistema.some(
      (n) => (alvo.length > 4 && n.includes(alvo)) || (numero.length >= 4 && n.includes(numero)),
    );
  };

  const [previa, setPrevia] = useState<{
    lei: LinkLei;
    base: LinkLei[];
    titulo: string;
    texto: string;
    consultadoEm: string;
    relatorio: RelatorioLei;
  } | null>(null);

  const adicionar = () => {
    const endereco = url.trim();
    if (!/^https?:\/\//i.test(endereco)) {
      toast.error("Cole o endereço completo da lei, começando com https://");
      return;
    }
    const proximas = comLeiAdicionada(materia, titulo, endereco);
    if (proximas.length === leis.length) {
      toast.error("Esse endereço já está cadastrado nesta matéria.");
      return;
    }
    onLeis(proximas);
    setTitulo("");
    setUrl("");
    toast.success("Link salvo. Lendo a lei…");
    void buscar(proximas[proximas.length - 1]!, proximas);
  };

  const buscar = async (l: LinkLei, base: LinkLei[] = leis) => {
    setBuscando(l.id);
    try {
      const r = await buscarLeiPorUrl({ data: { url: l.url } });
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      setPrevia({
        lei: l,
        base,
        titulo: l.titulo || r.titulo,
        texto: r.texto,
        consultadoEm: r.consultadoEm,
        relatorio: r.relatorio,
      });
    } catch {
      toast.error(
        "Não foi possível acessar o conteúdo da legislação. Verifique o endereço eletrônico ou tente novamente.",
      );
    } finally {
      setBuscando(null);
    }
  };

  const confirmar = () => {
    if (!previa) return;
    const { artigos, titulo: nome, nome: anexo } = salvarLeiNoAcervo(previa.texto, previa.titulo);
    if (!artigos) {
      toast.warning("Nenhum artigo reconhecido nessa página — confira o endereço da lei.");
      return;
    }
    onLeis(previa.base.map((x) => (x.id === previa.lei.id ? { ...x, anexo } : x)));
    toast.success(`${nome} — ${artigos} artigo(s) salvos para leitura em Leis.`);
    setPrevia(null);
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
      <p className="text-xs font-semibold">Leis desta matéria</p>
      <p className="text-xs text-muted-foreground">
        Cadastre o nome e o endereço da lei conforme o seu edital. O texto é lido e salvo em “Leis →
        Texto Integral”, sem gastar IA.
      </p>

      {leis.length > 0 && (
        <ul className="space-y-2">
          {leis.map((l) => (
            <li key={l.id} className="rounded-md border border-border/70 p-2">
              {editando === l.id ? (
                <div className="space-y-2">
                  <Input
                    className="h-8"
                    value={rascunho.titulo}
                    onChange={(e) =>
                      setRascunho((s) => ({ ...s, titulo: e.target.value.slice(0, 120) }))
                    }
                    placeholder="Nome da lei"
                  />
                  <Input
                    className="h-8"
                    inputMode="url"
                    value={rascunho.url}
                    onChange={(e) =>
                      setRascunho((s) => ({ ...s, url: e.target.value.slice(0, 2000) }))
                    }
                    placeholder="https://…"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!/^https?:\/\//i.test(rascunho.url.trim())) {
                          toast.error("O endereço deve começar com https://");
                          return;
                        }
                        onLeis(
                          comLeiAlterada(materia, l.id, {
                            titulo: rascunho.titulo.trim() || rascunho.url.trim(),
                            url: rascunho.url.trim(),
                          }),
                        );
                        setEditando(null);
                      }}
                    >
                      <Check className="mr-1 size-3.5" /> Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditando(null)}>
                      <X className="mr-1 size-3.5" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{l.titulo}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{l.url}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {jaSalva(l) ? "já está no sistema" : "ainda falta buscar o texto"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={buscando === l.id}
                      onClick={() => void buscar(l)}
                    >
                      {buscando === l.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <Download className="mr-1 size-3.5" /> Buscar texto
                        </>
                      )}
                    </Button>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir ${l.titulo}`}
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                    <button
                      type="button"
                      aria-label={`Editar ${l.titulo}`}
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditando(l.id);
                        setRascunho({ titulo: l.titulo, url: l.url });
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${l.titulo}`}
                      className="rounded p-1.5"
                      onClick={() => onLeis(comLeiRemovida(materia, l.id))}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          adicionar();
        }}
      >
        <Input
          className="h-8"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value.slice(0, 120))}
          placeholder="Nome da lei (ex.: Lei 13.869/2019)"
        />
        <Input
          className="h-8"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value.slice(0, 2000))}
          placeholder="https://www.planalto.gov.br/…"
        />
        <Button type="submit" size="sm" variant="outline">
          <Plus className="mr-1 size-3.5" /> Salvar link
        </Button>
      </form>
    </div>
  );
}

function LinhaMateria({
  materia,
  historico,
  onMateria,
  onTopico,
  onLeis,
}: {
  materia: MateriaEdital;
  historico: HistoricoRevisao;
  onMateria: (valor: number | undefined) => void;
  onTopico: (topico: string, valor: number | undefined) => void;
  onLeis: (leis: LinkLei[]) => void;
}) {
  const [aberta, setAberta] = useState(false);
  const geral = desempenho(historico, materia.nome);
  const topicos = topicosPorRelevancia(materia);

  return (
    <li className="border-l-4 border-accent/70">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 bg-secondary/60 px-3 py-2.5 text-left">
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          className="flex flex-1 items-center gap-x-3 text-left"
        >
          {aberta ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="flex-1 font-display text-sm font-bold">{materia.nome}</span>
        </button>
        <span className="flex items-center gap-1 text-xs">
          Relevância:
          <CampoPct
            valor={materia.relevancia}
            onChange={onMateria}
            titulo={`Relevância de ${materia.nome} na prova`}
          />
        </span>
        <span className="text-xs text-muted-foreground">
          Meu desempenho: {geral.total ? `${geral.taxa}%` : "—"}
        </span>
      </div>

      {aberta && (
        <div className="px-3 py-2">
          {topicos.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">
              Nenhum tópico cadastrado para esta matéria.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 text-left font-medium">Assunto analisado</th>
                  <th className="py-2 text-right font-medium">Relev. na disciplina</th>
                  <th className="py-2 text-right font-medium">Relev. geral</th>
                  <th className="py-2 text-right font-medium">Meu desempenho</th>
                  <th className="py-2 text-right font-medium">Praticar</th>
                </tr>
              </thead>
              <tbody>
                {topicos.map((t, i) => {
                  const disciplina = materia.relevanciaTopicos?.[t];
                  const desempenhoTopico = desempenho(historico, materia.nome, t);
                  return (
                    <tr key={t} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-2 align-top [overflow-wrap:anywhere]">
                        <span className="text-muted-foreground">{i + 1}. </span>
                        {t}
                      </td>
                      <td className="py-2 text-right align-top">
                        <CampoPct
                          valor={disciplina}
                          onChange={(v) => onTopico(t, v)}
                          titulo={`Relevância de "${t}" dentro de ${materia.nome}`}
                        />
                      </td>
                      <td
                        className={`py-2 text-right align-top ${cor(relevanciaGeral(materia, t))}`}
                      >
                        {pct(relevanciaGeral(materia, t))}
                      </td>
                      <td className="py-2 text-right align-top text-muted-foreground">
                        {desempenhoTopico.total
                          ? `${desempenhoTopico.taxa} % em ${desempenhoTopico.total} questões`
                          : "0 % em 0 questões"}
                      </td>
                      <td className="py-2 pl-2 align-top">
                        <div className="flex justify-end">
                          <IrParaQuestoes materia={materia.nome} assunto={t} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <LeisDaMateria materia={materia} onLeis={onLeis} />
        </div>
      )}
    </li>
  );
}

/** Detalhamento de relevância das matérias e assuntos do edital. */
export function EditalRelevancia() {
  const { edital, definirMaterias, atualizarMateria } = useEdital();
  const { historico } = useRevisao();
  const { trilha } = useTrilha();
  const estimar = useServerFn(estimarRelevanciaEdital);

  const definirRelevanciaMateria = (m: MateriaEdital, valor: number | undefined) =>
    atualizarMateria(m.id, valor == null ? { relevancia: undefined } : { relevancia: valor });

  const definirRelevanciaTopico = (m: MateriaEdital, topico: string, valor: number | undefined) => {
    const mapa = { ...(m.relevanciaTopicos ?? {}) };
    if (valor == null) delete mapa[topico];
    else mapa[topico] = valor;
    atualizarMateria(m.id, { relevanciaTopicos: mapa });
  };

  const mut = useMutation({
    mutationFn: () =>
      estimar({
        data: {
          banca: trilha.banca || undefined,
          cargo: trilha.cargo || undefined,
          materias: materiasAtivas(edital).map((m) => ({
            nome: m.nome,
            topicos: m.topicos,
          })),
        },
      }),
    onSuccess: (resultado) => {
      if (!resultado.length) {
        toast.error("A IA não retornou relevâncias.");
        return;
      }
      definirMaterias(
        edital.materias.map((m) => {
          const achada = resultado.find((r) => normaliza(r.nome) === normaliza(m.nome));
          if (!achada) return m;
          const relevanciaTopicos: Record<string, number> = {};
          for (const t of achada.topicos ?? []) {
            const topico = m.topicos.find((x) => normaliza(x) === normaliza(t.nome));
            if (topico && typeof t.relevancia_disciplina === "number") {
              relevanciaTopicos[topico] = t.relevancia_disciplina;
            }
          }
          return { ...m, relevancia: achada.relevancia, relevanciaTopicos };
        }),
      );
      toast.success("Relevâncias do edital atualizadas.");
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao calcular a relevância."),
  });

  if (!materiasAtivas(edital).length) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold">Detalhamento do edital</h2>
          <p className="text-xs text-muted-foreground">
            Relevância de cada matéria na prova e de cada assunto dentro da matéria, com o seu
            desempenho e atalho para praticar.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mut.isPending}
          onClick={() => mut.mutate()}
        >
          {mut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Calculando…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" /> Calcular relevância
            </>
          )}
        </Button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {materiasPorRelevancia(edital).map((m) => (
          <LinhaMateria
            key={m.id}
            materia={m}
            historico={historico}
            onMateria={(v) => definirRelevanciaMateria(m, v)}
            onTopico={(t, v) => definirRelevanciaTopico(m, t, v)}
            onLeis={(leis) => atualizarMateria(m.id, { leis })}
          />
        ))}
      </ul>
    </section>
  );
}
