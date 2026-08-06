import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, List, Loader2, ScrollText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  leiIntegral,
  type ArtigoIntegral,
  type LeiIntegral as LeiIntegralTipo,
} from "@/lib/ai.functions";
import { lerTextoAnexo } from "@/lib/anexos-store";
import { artigosDoCapitulo, lerFaixa, lerVadeMecum, numeroArtigo, type LeiDoPdf } from "@/lib/vademecum";


/** Realça as ocorrências da palavra-chave dentro do texto legal. */
function Realce({ texto, termo }: { texto: string; termo: string }) {
  const t = termo.trim();
  if (t.length < 2) return <>{texto}</>;
  const partes = texto.split(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {partes.map((p, i) =>
        p.toLowerCase() === t.toLowerCase() ? (
          <mark key={i} className="rounded bg-mark-yellow/40 px-0.5 text-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function combina(a: ArtigoIntegral, termo: string) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return true;
  return `${a.referencia} ${a.texto} ${(a.paragrafos ?? []).join(" ")}`.toLowerCase().includes(t);
}

const idArtigo = (a: ArtigoIntegral, i: number) =>
  `art-${i}-${a.referencia.replace(/[^\w]+/g, "-").toLowerCase()}`;

type Indexado = { artigo: ArtigoIntegral; indice: number };
type NoSecao = { nome: string; artigos: Indexado[] };
type NoCapitulo = { nome: string; secoes: NoSecao[] };
type NoTitulo = { nome: string; capitulos: NoCapitulo[] };

/** Agrupa os artigos filtrados em título → capítulo → seção, preservando a ordem legal. */
function montarArvore(itens: Indexado[]): NoTitulo[] {
  const titulos: NoTitulo[] = [];
  for (const item of itens) {
    const nomeTitulo = item.artigo.titulo?.trim() || "Dispositivos";
    const nomeCapitulo = item.artigo.capitulo_lei?.trim() || "";
    const nomeSecao = item.artigo.secao?.trim() || "";

    let titulo = titulos.find((t) => t.nome === nomeTitulo);
    if (!titulo) {
      titulo = { nome: nomeTitulo, capitulos: [] };
      titulos.push(titulo);
    }
    let capitulo = titulo.capitulos.find((c) => c.nome === nomeCapitulo);
    if (!capitulo) {
      capitulo = { nome: nomeCapitulo, secoes: [] };
      titulo.capitulos.push(capitulo);
    }
    let secao = capitulo.secoes.find((s) => s.nome === nomeSecao);
    if (!secao) {
      secao = { nome: nomeSecao, artigos: [] };
      capitulo.secoes.push(secao);
    }
    secao.artigos.push(item);
  }
  return titulos;
}

function Sumario({
  arvore,
  marcados,
  onIr,
}: {
  arvore: NoTitulo[];
  marcados: string[];
  onIr: (id: string) => void;
}) {
  const [fechados, setFechados] = useState<string[]>([]);
  const alternar = (chave: string) =>
    setFechados((atual) =>
      atual.includes(chave) ? atual.filter((c) => c !== chave) : [...atual, chave],
    );

  return (
    <nav aria-label="Sumário da lei" className="rounded-lg border border-border/70 bg-secondary/40 p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <List className="size-3.5" /> Sumário
      </p>
      <ul className="space-y-1.5 text-sm">
        {arvore.map((titulo) => {
          const chaveT = `t:${titulo.nome}`;
          const abertoT = !fechados.includes(chaveT);
          return (
            <li key={chaveT}>
              <button
                type="button"
                onClick={() => alternar(chaveT)}
                className="flex w-full items-start gap-1.5 text-left font-semibold"
              >
                {abertoT ? (
                  <ChevronDown className="mt-0.5 size-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0" />
                )}
                <span className="text-xs">{titulo.nome}</span>
              </button>

              {abertoT && (
                <ul className="ml-4 mt-1 space-y-1">
                  {titulo.capitulos.map((capitulo) => {
                    const chaveC = `${chaveT}|c:${capitulo.nome}`;
                    const abertoC = !fechados.includes(chaveC);
                    return (
                      <li key={chaveC}>
                        {capitulo.nome && (
                          <button
                            type="button"
                            onClick={() => alternar(chaveC)}
                            className="flex w-full items-start gap-1.5 text-left"
                          >
                            {abertoC ? (
                              <ChevronDown className="mt-0.5 size-3.5 shrink-0" />
                            ) : (
                              <ChevronRight className="mt-0.5 size-3.5 shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground">{capitulo.nome}</span>
                          </button>
                        )}

                        {(abertoC || !capitulo.nome) && (
                          <ul className={capitulo.nome ? "ml-5 mt-1 space-y-1" : "space-y-1"}>
                            {capitulo.secoes.map((secao) => (
                              <li key={`${chaveC}|s:${secao.nome}`}>
                                {secao.nome && (
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    {secao.nome}
                                  </p>
                                )}
                                <ul className="flex flex-wrap gap-1.5 py-1">
                                  {secao.artigos.map(({ artigo, indice }) => {
                                    const marcado = marcados.includes(
                                      `${artigo.referencia} — ${artigo.texto}`,
                                    );
                                    return (
                                      <li key={idArtigo(artigo, indice)}>
                                        <button
                                          type="button"
                                          onClick={() => onIr(idArtigo(artigo, indice))}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] ${
                                            marcado
                                              ? "border-primary bg-primary/10 font-semibold text-primary"
                                              : "border-border bg-background text-muted-foreground"
                                          }`}
                                        >
                                          {artigo.referencia}
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LeiIntegralPainel({
  materia,
  capitulo,
  contexto,
  marcados,
  pdfsLei = [],
  onAlternarMarcado,
  onCarregado,
}: {
  materia: string;
  capitulo: string;
  contexto: string | null;
  marcados: string[];
  /** PDFs de lei anexados (nome já sem o prefixo interno). */
  pdfsLei?: { nome: string; chars: number }[];
  onAlternarMarcado: (trecho: string) => void;
  onCarregado?: (lei: LeiIntegralTipo) => void;
}) {
  const buscar = useServerFn(leiIntegral);
  const [lei, setLei] = useState<LeiIntegralTipo | null>(null);
  const [termo, setTermo] = useState("");
  const [faixa, setFaixa] = useState("");
  const [soMarcados, setSoMarcados] = useState(false);
  const [emFoco, setEmFoco] = useState<string | null>(null);
  const [fonte, setFonte] = useState<"pdf" | "ia">(pdfsLei.length ? "pdf" : "ia");
  const [arquivo, setArquivo] = useState("");
  const [leisPdf, setLeisPdf] = useState<LeiDoPdf[]>([]);
  const [leiPdfSel, setLeiPdfSel] = useState("");
  const [soCapitulo, setSoCapitulo] = useState(true);

  const arquivoAtivo = arquivo || pdfsLei[0]?.nome || "";

  const mutPdf = useMutation({
    mutationFn: async (nome: string) => {
      const texto = await lerTextoAnexo(nome);
      if (!texto) throw new Error("O texto deste PDF não está mais salvo. Reanexe o arquivo em Inclusão.");
      return lerVadeMecum(texto);
    },
    onSuccess: (leis, nome) => {
      setLeisPdf(leis);
      setLeiPdfSel(leis[0]?.nome ?? "");
      setLei(null);
      if (!leis.length) {
        toast.error("Não foi possível localizar artigos neste PDF.");
        return;
      }
      const total = leis.reduce((s, l) => s + l.artigos.length, 0);
      toast.success(`${total} artigo(s) extraídos de “${nome}”.`);
      onCarregado?.({
        materia,
        capitulo,
        base_legal: leis.map((l) => l.nome).join(" · "),
        artigos: leis.flatMap((l) => l.artigos),
      });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao ler o PDF anexado."),
  });

  const mut = useMutation({
    mutationFn: () => buscar({ data: { materia, capitulo, contexto } }),
    onSuccess: (r) => {
      setLei(r);
      setLeisPdf([]);
      onCarregado?.(r);
      if (!(r.artigos ?? []).length) toast.error("A IA não retornou os artigos deste capítulo.");
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível carregar o texto integral."),
  });

  const leiPdfAtiva = leisPdf.find((l) => l.nome === leiPdfSel) ?? leisPdf[0];
  const baseLegal = fonte === "pdf" ? (leiPdfAtiva?.nome ?? "") : (lei?.base_legal ?? "");

  const brutos = useMemo<ArtigoIntegral[]>(() => {
    if (fonte === "pdf") {
      const lista = leiPdfAtiva?.artigos ?? [];
      return soCapitulo && capitulo.trim().length > 2 ? artigosDoCapitulo(lista, capitulo) : lista;
    }
    return lei?.artigos ?? [];
  }, [fonte, leiPdfAtiva, lei, capitulo, soCapitulo]);

  const carregado = fonte === "pdf" ? leisPdf.length > 0 : lei !== null;

  const artigos = useMemo<Indexado[]>(() => {
    const limites = lerFaixa(faixa);
    return brutos
      .map((artigo, indice) => ({ artigo, indice }))
      .filter(({ artigo }) => {
        if (!combina(artigo, termo)) return false;
        if (soMarcados && !marcados.includes(`${artigo.referencia} — ${artigo.texto}`)) return false;
        if (limites) {
          const n = numeroArtigo(artigo);
          if (Number.isNaN(n) || n < limites[0] || n > limites[1]) return false;
        }
        return true;
      });
  }, [brutos, termo, faixa, soMarcados, marcados]);

  const arvore = useMemo(() => montarArvore(artigos), [artigos]);

  const irPara = (id: string) => {
    setEmFoco(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <ScrollText className="size-4 text-primary" /> Texto integral (Vade Mecum)
        </h2>
        <p className="text-xs text-muted-foreground">
          Leitura literal dos artigos, com sumário em árvore, filtro por palavra-chave e marcação de
          artigos para gerar questões só do que você marcou.
        </p>
      </header>

      <div className="flex gap-2">
        {(["pdf", "ia"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFonte(f)}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
              fonte === f
                ? "border-primary bg-secondary font-semibold text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {f === "pdf" ? "PDF anexado" : "IA (reserva)"}
          </button>
        ))}
      </div>

      {fonte === "pdf" ? (
        pdfsLei.length === 0 ? (
          <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
            Nenhum PDF de lei anexado. Envie o Vade Mecum em “Inclusão → Upload de PDF para leis”.
          </p>
        ) : (
          <div className="space-y-2">
            <select
              value={arquivoAtivo}
              onChange={(e) => setArquivo(e.target.value)}
              aria-label="PDF de lei anexado"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {pdfsLei.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.chars.toLocaleString("pt-BR")} caracteres)
                </option>
              ))}
            </select>
            <Button
              variant={leisPdf.length ? "outline" : "default"}
              className="w-full"
              disabled={mutPdf.isPending || !arquivoAtivo}
              onClick={() => mutPdf.mutate(arquivoAtivo)}
            >
              {mutPdf.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Extraindo os artigos do PDF…
                </>
              ) : leisPdf.length ? (
                "Reler o PDF"
              ) : (
                "Extrair o texto integral do PDF"
              )}
            </Button>
            {leisPdf.length > 1 && (
              <select
                value={leiPdfSel}
                onChange={(e) => setLeiPdfSel(e.target.value)}
                aria-label="Lei ou código dentro do PDF"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {leisPdf.map((l) => (
                  <option key={l.nome} value={l.nome}>
                    {l.nome} — {l.artigos.length} artigo(s)
                  </option>
                ))}
              </select>
            )}
          </div>
        )
      ) : (
        <Button
          variant={lei ? "outline" : "default"}
          className="w-full"
          disabled={mut.isPending || capitulo.trim().length < 3}
          onClick={() => mut.mutate()}
        >
          {mut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Buscando os artigos…
            </>
          ) : lei ? (
            "Recarregar texto integral"
          ) : (
            "Carregar texto integral dos artigos"
          )}
        </Button>
      )}

      {carregado && (
        <>
          <div className="space-y-2">
            {baseLegal && <p className="text-xs font-semibold text-muted-foreground">{baseLegal}</p>}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={termo}
                onChange={(e) => setTermo(e.target.value.slice(0, 60))}
                placeholder="Filtrar por palavra-chave (ex.: funcionário público)"
                className="pl-9"
                aria-label="Filtrar artigos por palavra-chave"
              />
            </div>
            <Input
              value={faixa}
              onChange={(e) => setFaixa(e.target.value.slice(0, 12))}
              placeholder="Faixa de artigos (ex.: 312-327)"
              aria-label="Filtrar por faixa de artigos"
            />
            {fonte === "pdf" && capitulo.trim().length > 2 && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={soCapitulo}
                  onChange={(e) => setSoCapitulo(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                Restringir ao capítulo “{capitulo}”
              </label>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {artigos.length} de {brutos.length} artigo(s)
                {marcados.length > 0 ? ` · ${marcados.length} marcado(s)` : ""}
              </span>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={soMarcados}
                  onChange={(e) => setSoMarcados(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                Ver só os marcados
              </label>
            </div>
          </div>

          {artigos.length > 0 && <Sumario arvore={arvore} marcados={marcados} onIr={irPara} />}

          <div className="space-y-4">
            {arvore.map((titulo) => (
              <div key={titulo.nome} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-accent">
                  {titulo.nome}
                </h3>
                {titulo.capitulos.map((cap) => (
                  <div key={`${titulo.nome}|${cap.nome}`} className="space-y-2">
                    {cap.nome && <h4 className="text-xs font-semibold">{cap.nome}</h4>}
                    {cap.secoes.map((secao) => (
                      <div key={`${cap.nome}|${secao.nome}`} className="space-y-2">
                        {secao.nome && (
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {secao.nome}
                          </p>
                        )}
                        <ol className="space-y-3">
                          {secao.artigos.map(({ artigo: a, indice }) => {
                            const trecho = `${a.referencia} — ${a.texto}`;
                            const marcado = marcados.includes(trecho);
                            const id = idArtigo(a, indice);
                            return (
                              <li
                                key={id}
                                id={id}
                                className={`scroll-mt-24 rounded-lg border p-3 ${
                                  marcado
                                    ? "border-primary bg-primary/5"
                                    : emFoco === id
                                      ? "border-accent"
                                      : "border-border/70"
                                }`}
                              >
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={marcado}
                                    onChange={() => onAlternarMarcado(trecho)}
                                    className="size-4 accent-primary"
                                  />
                                  <span className="text-xs font-bold text-primary">
                                    {a.referencia}
                                  </span>
                                </label>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                  <Realce texto={a.texto} termo={termo} />
                                </p>
                                {(a.paragrafos ?? []).length > 0 && (
                                  <ul className="mt-2 space-y-1.5 border-l border-border/70 pl-3 text-sm leading-relaxed text-muted-foreground">
                                    {a.paragrafos!.map((p, j) => (
                                      <li key={j}>
                                        <Realce texto={p} termo={termo} />
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {artigos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum artigo corresponde ao filtro aplicado.
            </p>
          )}

          {fonte === "ia" && lei?.observacao && (
            <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              {lei.observacao}
            </p>
          )}
        </>
      )}
    </section>
  );
}

