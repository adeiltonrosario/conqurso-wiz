import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  List,
  Loader2,
  ScrollText,
  Search,
  Star,
} from "lucide-react";
import { alternarFavorito, chaveFavorito, useFavoritos } from "@/lib/favoritos";
import {
  alternarArtigoOculto,
  alternarParagrafoOculto,
  chaveArtigo,
  chaveLei,
  chaveParagrafo,
  normalizarTrecho,
  ocultarTrecho,
  reexibirTrecho,
  reexibirTudo,
  useOcultos,
} from "@/lib/ocultos";
import { ehRevogado, limparRuidoLei } from "@/lib/limpeza-lei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ArtigoIntegral,
  type LeiIntegral as LeiIntegralTipo,
} from "@/lib/ai.functions";
import { lerTextoAnexo } from "@/lib/anexos-store";
import {
  artigosDoCapitulo,
  artigosDosAssuntos,
  fatiarPorPaginas,
  lerFaixa,
  lerVadeMecum,
  numeroArtigo,
  type LeiDoPdf,
} from "@/lib/vademecum";
import {
  faixaDaNorma,
  GRUPOS_VADE_MECUM,
  MAPA_VADE_MECUM,
  normaDoTopico,
  normasDoEdital,
} from "@/lib/mapa-vademecum";
import { materiasAtivas, topicosDaMateria, useEdital } from "@/lib/edital";




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

type Pedaco = { texto: string; oculto: boolean };

/** Quebra o texto nos trechos que o candidato escondeu. */
function partirOcultos(texto: string, trechos: string[]): Pedaco[] {
  let pedacos: Pedaco[] = [{ texto, oculto: false }];
  for (const trecho of [...trechos].sort((a, b) => b.length - a.length)) {
    const proximos: Pedaco[] = [];
    for (const p of pedacos) {
      if (p.oculto) {
        proximos.push(p);
        continue;
      }
      let resto = p.texto;
      let i = resto.indexOf(trecho);
      while (i >= 0) {
        if (i > 0) proximos.push({ texto: resto.slice(0, i), oculto: false });
        proximos.push({ texto: trecho, oculto: true });
        resto = resto.slice(i + trecho.length);
        i = resto.indexOf(trecho);
      }
      if (resto) proximos.push({ texto: resto, oculto: false });
    }
    pedacos = proximos;
  }
  return pedacos;
}

/**
 * Texto legal com realce da busca, trechos escondidos e ação "Ocultar" ao
 * selecionar um pedaço com o dedo ou com o mouse.
 */
function TextoOcultavel({
  texto,
  termo,
  lei,
  trechos,
  mostrarOcultos,
}: {
  texto: string;
  termo: string;
  /** Nome da lei: o trecho escondido vale para o arquivo inteiro. */
  lei: string;
  trechos: string[];
  mostrarOcultos: boolean;
}) {
  const [selecao, setSelecao] = useState<{ texto: string; x: number; y: number } | null>(null);

  const capturar = () => {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    const bruto = normalizarTrecho(sel?.toString() ?? "");
    if (!sel || sel.isCollapsed || bruto.length < 2 || !texto.includes(bruto)) {
      setSelecao(null);
      return;
    }
    const r = sel.getRangeAt(0).getBoundingClientRect();
    setSelecao({ texto: bruto, x: r.left + r.width / 2, y: r.top });
  };

  const pedacos = partirOcultos(texto, trechos);

  return (
    <>
      <span onMouseUp={capturar} onTouchEnd={capturar}>
        {pedacos.map((p, i) =>
          p.oculto ? (
            <button
              key={i}
              type="button"
              title="Trecho oculto — toque para mostrar"
              aria-label="Mostrar trecho oculto"
              onClick={() => reexibirTrecho(lei, p.texto)}
              className="mx-0.5 rounded bg-muted px-1 text-xs align-middle text-muted-foreground"
            >
              {mostrarOcultos ? <span className="line-through opacity-70">{p.texto}</span> : "▪▪▪"}
            </button>
          ) : (
            <Realce key={i} texto={p.texto} termo={termo} />
          ),
        )}
      </span>
      {selecao && (
        <span
          className="fixed z-50 -translate-x-1/2 -translate-y-full"
          style={{ left: selecao.x, top: selecao.y - 6 }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              ocultarTrecho(lei, selecao.texto);
              window.getSelection()?.removeAllRanges();
              setSelecao(null);
            }}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
          >
            <EyeOff className="size-3" /> Ocultar
          </button>
        </span>
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
  const [termo, setTermo] = useState("");
  const [faixa, setFaixa] = useState("");
  const [soMarcados, setSoMarcados] = useState(false);
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [soAssuntos, setSoAssuntos] = useState(false);
  const [emFoco, setEmFoco] = useState<string | null>(null);
  const { favoritos } = useFavoritos();
  const [arquivo, setArquivo] = useState("");
  const [leisPdf, setLeisPdf] = useState<LeiDoPdf[]>([]);
  const [leiPdfSel, setLeiPdfSel] = useState("");
  const [soCapitulo, setSoCapitulo] = useState(true);
  const sugerido = useMemo(() => normaDoTopico(`${capitulo} ${materia}`), [capitulo, materia]);
  const [itemMapa, setItemMapa] = useState("");
  const { edital } = useEdital();
  const [soDoEdital, setSoDoEdital] = useState(true);
  const [limparPdf, setLimparPdf] = useState(true);
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const { ocultos } = useOcultos();


  /** Normas do Vade Mecum cobradas pelo edital/banca/cargo em estudo. */
  const normasEdital = useMemo(() => normasDoEdital(materiasAtivas(edital)), [edital]);
  const filtrando = soDoEdital && normasEdital.length > 0;
  const itensEdital = useMemo(() => new Set(normasEdital.map((n) => n.item)), [normasEdital]);
  const visiveis = filtrando ? normasEdital : MAPA_VADE_MECUM;

  const itemAtivo = useMemo(() => {
    const preferido = itemMapa || sugerido?.item || "";
    if (!filtrando) return preferido;
    if (preferido && itensEdital.has(preferido)) return preferido;
    return sugerido && itensEdital.has(sugerido.item)
      ? sugerido.item
      : (normasEdital[0]?.item ?? "");
  }, [itemMapa, sugerido, filtrando, itensEdital, normasEdital]);
  const normaAtiva = MAPA_VADE_MECUM.find((m) => m.item === itemAtivo) ?? null;
  const faixaAtiva = normaAtiva ? faixaDaNorma(normaAtiva.item) : null;


  const arquivoAtivo = arquivo || pdfsLei[0]?.nome || "";

  const mutPdf = useMutation({
    mutationFn: async ({ nome, item }: { nome: string; item: string }) => {
      const texto = await lerTextoAnexo(nome);
      if (!texto) throw new Error("O texto deste PDF não está mais salvo. Reanexe o arquivo em Inclusão.");
      const faixaPaginas = item ? faixaDaNorma(item) : null;
      if (faixaPaginas) {
        const recorte = fatiarPorPaginas(texto, faixaPaginas[0], faixaPaginas[1]);
        if (recorte.trim().length > 200) return lerVadeMecum(recorte);
        toast.info("As páginas do mapa não foram localizadas neste PDF; lendo o arquivo inteiro.");
      }
      return lerVadeMecum(texto);
    },
    onSuccess: (leis, { nome }) => {
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


  const leiPdfAtiva = leisPdf.find((l) => l.nome === leiPdfSel) ?? leisPdf[0];
  const baseLegal = leiPdfAtiva?.nome ?? "";

  const brutos = useMemo<ArtigoIntegral[]>(() => {
    const base =
      soCapitulo && capitulo.trim().length > 2
        ? artigosDoCapitulo(leiPdfAtiva?.artigos ?? [], capitulo)
        : (leiPdfAtiva?.artigos ?? []);
    if (!limparPdf) return base;
    // Sem revogados/vetados e sem lixo de rodapé do PDF.
    return base
      .filter((a) => !ehRevogado(a.texto))
      .map((a) => ({
        ...a,
        texto: limparRuidoLei(a.texto),
        paragrafos: (a.paragrafos ?? []).filter((p) => !ehRevogado(p)).map(limparRuidoLei),
      }))
      .filter((a) => a.texto.trim().length > 2);
  }, [leiPdfAtiva, capitulo, soCapitulo, limparPdf]);


  const carregado = leisPdf.length > 0;

  const chavesFavoritas = useMemo(() => new Set(favoritos.map((f) => f.chave)), [favoritos]);
  const ehFavorito = (a: ArtigoIntegral) => chavesFavoritas.has(chaveFavorito(baseLegal, a));

  const artigosOcultos = useMemo(() => new Set(ocultos.artigos), [ocultos.artigos]);
  const paragrafosOcultos = useMemo(() => new Set(ocultos.paragrafos), [ocultos.paragrafos]);
  /** Trechos escondidos valem para a lei inteira (todas as ocorrências no arquivo). */
  const trechosDaLei = useMemo(() => {
    const chave = chaveLei(baseLegal);
    return ocultos.trechos.filter((t) => t.lei === chave).map((t) => t.texto);
  }, [ocultos.trechos, baseLegal]);

  /** Quantas vezes cada trecho escondido aparece no texto visível da lei. */
  const contarOcorrencias = (textos: string[]) =>
    trechosDaLei.reduce(
      (soma, trecho) =>
        soma +
        textos.reduce((n, t) => n + (trecho ? t.split(trecho).length - 1 : 0), 0),
      0,
    );

  /** Assuntos (tópicos) da matéria selecionada, vindos do Detalhamento do edital. */
  const topicos = useMemo(() => topicosDaMateria(edital, materia), [edital, materia]);

  /** Artigos ligados a esses assuntos, casados localmente (sem IA). */
  const casadosAssuntos = useMemo(
    () => (topicos.length ? artigosDosAssuntos(brutos, topicos) : []),
    [brutos, topicos],
  );
  const chavesAssuntos = useMemo(
    () => new Set(casadosAssuntos.map((a) => chaveArtigo(baseLegal, a))),
    [casadosAssuntos, baseLegal],
  );

  const artigos = useMemo<Indexado[]>(() => {
    const limites = lerFaixa(faixa);
    return brutos
      .map((artigo, indice) => ({ artigo, indice }))
      .filter(({ artigo }) => {
        if (!combina(artigo, termo)) return false;
        if (!mostrarOcultos && artigosOcultos.has(chaveArtigo(baseLegal, artigo))) return false;
        if (soMarcados && !marcados.includes(`${artigo.referencia} — ${artigo.texto}`)) return false;
        if (soFavoritos && !chavesFavoritas.has(chaveFavorito(baseLegal, artigo))) return false;
        if (soAssuntos && !chavesAssuntos.has(chaveArtigo(baseLegal, artigo))) return false;
        if (limites) {
          const n = numeroArtigo(artigo);
          if (Number.isNaN(n) || n < limites[0] || n > limites[1]) return false;
        }
        return true;
      });
  }, [
    brutos,
    termo,
    faixa,
    soMarcados,
    marcados,
    soFavoritos,
    chavesFavoritas,
    soAssuntos,
    chavesAssuntos,
    baseLegal,
    mostrarOcultos,
    artigosOcultos,
  ]);

  /** Quantos itens desta lei estão escondidos (para o contador e o "reexibir tudo"). */
  const totalOcultosDaLei = useMemo(() => {
    const chaves = new Set(brutos.map((a) => chaveArtigo(baseLegal, a)));
    const arts = ocultos.artigos.filter((c) => chaves.has(c)).length;
    const paras = ocultos.paragrafos.filter((c) => chaves.has(c.split("|p:")[0] ?? "")).length;
    const trechos = contarOcorrencias(
      brutos.flatMap((a) => [a.texto, ...(a.paragrafos ?? [])]),
    );
    return { arts, paras, trechos, total: arts + paras + trechos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brutos, baseLegal, ocultos, trechosDaLei]);

  const arvore = useMemo(() => montarArvore(artigos), [artigos]);


  const irPara = (id: string) => {
    setEmFoco(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Filtra os artigos ligados aos assuntos da matéria e favorita todos (sem IA). */
  const filtrarPelosAssuntos = () => {
    if (!carregado) {
      toast.error("Escolha a lei salva e extraia o texto integral primeiro.");
      return;
    }
    if (!topicos.length) {
      toast.error("Cadastre os assuntos desta matéria no Detalhamento do edital.");
      return;
    }
    const casados = casadosAssuntos.filter(
      (a) => !artigosOcultos.has(chaveArtigo(baseLegal, a)),
    );
    if (!casados.length) {
      setSoAssuntos(false);
      toast.error("Nenhum artigo casou com os assuntos desta matéria.");
      return;
    }
    let novos = 0;
    for (const a of casados) {
      if (chavesFavoritas.has(chaveFavorito(baseLegal, a))) continue;
      alternarFavorito(a, { lei: baseLegal, materia, capituloEdital: capitulo });
      novos++;
    }
    setSoAssuntos(true);
    toast.success(
      `${casados.length} artigo(s) de ${topicos.length} assunto(s) favoritados (${novos} novo(s)).`,
    );
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

      <div className="space-y-1">
        <button
          type="button"
          onClick={filtrarPelosAssuntos}
          className={`w-full rounded-lg border px-3 py-2 text-xs transition-colors ${
            soAssuntos
              ? "border-primary bg-secondary font-semibold text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <Star className="mr-1 inline size-3.5" /> Assuntos da matéria (★)
        </button>
        <p className="text-[11px] text-muted-foreground">
          Sem IA: mantém só os artigos ligados aos assuntos de “{materia || "sua matéria"}” e
          favorita todos.
        </p>
        {soAssuntos && (
          <button
            type="button"
            onClick={() => setSoAssuntos(false)}
            className="text-[11px] font-semibold text-primary underline"
          >
            Ver todos os artigos de novo
          </button>
        )}
      </div>

      {pdfsLei.length === 0 ? (
          <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
            Nenhuma lei salva. Envie o PDF ou cole o texto e use “Extrair e limpar” em “Inclusão →
            Texto de leis (Vade Mecum)”.
          </p>

        ) : (
          <div className="space-y-2">
            <select
              value={arquivoAtivo}
              onChange={(e) => setArquivo(e.target.value)}
              aria-label="Lei salva (PDF ou texto colado)"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {pdfsLei.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.chars.toLocaleString("pt-BR")} caracteres)
                </option>
              ))}
            </select>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={soDoEdital}
                    onChange={(e) => setSoDoEdital(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Somente as leis do edital
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {normasEdital.length
                    ? `${normasEdital.length} de ${MAPA_VADE_MECUM.length} normas do seu edital`
                    : "Sem matérias do edital cadastradas — mostrando todo o Vade Mecum"}
                </span>
              </div>
              <select
                value={itemAtivo}
                onChange={(e) => setItemMapa(e.target.value)}
                aria-label="Norma do edital (mapa PC-BA → páginas do Vade Mecum)"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {filtrando
                    ? "Todo o PDF — inclui leis fora do edital"
                    : "Todo o PDF (sem corte por página)"}
                </option>
                {GRUPOS_VADE_MECUM.filter((g) => visiveis.some((m) => m.grupo === g.nome)).map(
                  (g) => (
                    <optgroup key={g.nome} label={`${g.nome} (p. ${g.de}–${g.ate})`}>
                      {visiveis
                        .filter((m) => m.grupo === g.nome)
                        .map((m) => (
                          <option key={m.item} value={m.item}>
                            {m.item} · {m.norma} — p. {m.pagina_vade_mecum}
                            {!filtrando && itensEdital.has(m.item) ? " · Edital" : ""}
                          </option>
                        ))}
                    </optgroup>
                  ),
                )}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {normaAtiva
                  ? `${normaAtiva.edital}${
                      faixaAtiva ? ` → páginas ${faixaAtiva[0]}–${faixaAtiva[1]} do Vade Mecum` : ""
                    }${!itemMapa && sugerido ? " (sugerido pelo tópico do edital)" : ""}`
                  : "Escolha a norma do edital para ir direto ao ponto de corte do PDF."}
              </p>
            </div>


            <Button
              variant={leisPdf.length ? "outline" : "default"}
              className="w-full"
              disabled={mutPdf.isPending || !arquivoAtivo}
              onClick={() => mutPdf.mutate({ nome: arquivoAtivo, item: itemAtivo })}
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
            {capitulo.trim().length > 2 && (
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
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={limparPdf}
                onChange={(e) => setLimparPdf(e.target.checked)}
                className="size-3.5 accent-primary"
              />
              Esconder revogados e rodapés do PDF
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {artigos.length} de {brutos.length} artigo(s)
                {marcados.length > 0 ? ` · ${marcados.length} marcado(s)` : ""}
                {favoritos.length > 0 ? ` · ${favoritos.length} favorito(s)` : ""}
                {totalOcultosDaLei.total > 0
                  ? ` · ${totalOcultosDaLei.arts} artigo(s) e ${
                      totalOcultosDaLei.paras + totalOcultosDaLei.trechos
                    } trecho(s) oculto(s)`
                  : ""}
              </span>
              <span className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={soMarcados}
                    onChange={(e) => setSoMarcados(e.target.checked)}
                    className="size-3.5 accent-primary"
                  />
                  Ver só os marcados
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={soFavoritos}
                    onChange={(e) => setSoFavoritos(e.target.checked)}
                    className="size-3.5 accent-primary"
                  />
                  Ver só os favoritos (★)
                </label>
              </span>
            </div>
            {totalOcultosDaLei.total > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMostrarOcultos((v) => !v)}
                >
                  {mostrarOcultos ? (
                    <>
                      <EyeOff className="mr-1.5 size-3.5" /> Voltar a esconder
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1.5 size-3.5" /> Mostrar o que está oculto
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    reexibirTudo(baseLegal);
                    toast.success("Tudo o que estava oculto voltou para a leitura.");
                  }}
                >
                  Reexibir tudo
                </Button>
              </div>
            )}

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
                            const chave = chaveArtigo(baseLegal, a);
                            const oculto = artigosOcultos.has(chave);
                            return (
                              <li
                                key={id}
                                id={id}
                                className={`scroll-mt-24 rounded-lg border p-3 ${
                                  oculto
                                    ? "border-dashed border-border/70 opacity-60"
                                    : marcado
                                      ? "border-primary bg-primary/5"
                                      : emFoco === id
                                        ? "border-accent"
                                        : "border-border/70"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
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
                                  <span className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      aria-label={
                                        oculto
                                          ? `Mostrar ${a.referencia} na leitura`
                                          : `Ocultar ${a.referencia} da leitura`
                                      }
                                      aria-pressed={oculto}
                                      onClick={() => {
                                        // Artigo escondido também sai da marcação para questões.
                                        if (!oculto && marcado) onAlternarMarcado(trecho);
                                        alternarArtigoOculto(chave);
                                      }}
                                    >

                                      {oculto ? (
                                        <EyeOff className="size-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="size-4 text-muted-foreground" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={
                                        ehFavorito(a)
                                          ? `Remover ${a.referencia} dos favoritos`
                                          : `Favoritar ${a.referencia}`
                                      }
                                      aria-pressed={ehFavorito(a)}
                                      onClick={() =>
                                        alternarFavorito(a, {
                                          lei: baseLegal,
                                          materia,
                                          capituloEdital: capitulo,
                                        })
                                      }
                                    >
                                      <Star
                                        className={`size-4 ${
                                          ehFavorito(a)
                                            ? "fill-mark-yellow text-mark-yellow"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    </button>
                                  </span>
                                </div>
                                {oculto ? (
                                  <p className="mt-1.5 text-xs italic text-muted-foreground">
                                    {a.referencia} oculto — toque no olho para mostrar.
                                  </p>
                                ) : (
                                  <>
                                    <p className="mt-1.5 text-sm leading-relaxed">
                                      <TextoOcultavel
                                        texto={a.texto}
                                        termo={termo}
                                        lei={baseLegal}
                                        trechos={trechosDaLei}
                                        mostrarOcultos={mostrarOcultos}
                                      />
                                    </p>
                                    {(a.paragrafos ?? []).length > 0 && (
                                      <ul className="mt-2 space-y-1.5 border-l border-border/70 pl-3 text-sm leading-relaxed text-muted-foreground">
                                        {a.paragrafos!.map((p, j) => {
                                          const chaveP = chaveParagrafo(chave, j);
                                          const pOculto = paragrafosOcultos.has(chaveP);
                                          if (pOculto && !mostrarOcultos)
                                            return (
                                              <li key={j} className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  aria-label="Mostrar item oculto"
                                                  onClick={() => alternarParagrafoOculto(chaveP)}
                                                  className="text-xs italic text-muted-foreground"
                                                >
                                                  ▪▪▪ item oculto — mostrar
                                                </button>
                                              </li>
                                            );
                                          return (
                                            <li key={j} className="flex items-start gap-2">
                                              <button
                                                type="button"
                                                aria-label={
                                                  pOculto
                                                    ? "Mostrar este item na leitura"
                                                    : "Ocultar este item da leitura"
                                                }
                                                aria-pressed={pOculto}
                                                onClick={() => alternarParagrafoOculto(chaveP)}
                                                className="mt-0.5 shrink-0"
                                              >
                                                {pOculto ? (
                                                  <EyeOff className="size-3.5 text-muted-foreground" />
                                                ) : (
                                                  <Eye className="size-3.5 text-muted-foreground/60" />
                                                )}
                                              </button>
                                              <span className={pOculto ? "line-through opacity-60" : ""}>
                                                <TextoOcultavel
                                                  texto={p}
                                                  termo={termo}
                                                  lei={baseLegal}
                                                  trechos={trechosDaLei}
                                                  mostrarOcultos={mostrarOcultos}
                                                />
                                              </span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </>
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

