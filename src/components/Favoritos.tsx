import { useMemo, useState } from "react";
import { Brain, ChevronDown, ChevronRight, Loader2, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  agruparFavoritos,
  removerFavorito,
  trechoDoFavorito,
  useFavoritos,
  type ArtigoFavorito,
} from "@/lib/favoritos";
import { useOcultos } from "@/lib/ocultos";


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

function combina(f: ArtigoFavorito, termo: string) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return true;
  return `${f.referencia} ${f.texto} ${f.paragrafos.join(" ")} ${f.titulo} ${f.capitulo_lei} ${f.secao}`
    .toLowerCase()
    .includes(t);
}

/**
 * Leitura só dos artigos favoritados (estrela), com os cabeçalhos e títulos
 * da lei. Não depende de PDF carregado nem de IA.
 */
export function FavoritosPainel({
  onGerarQuestoes,
  gerando = false,
  podeGerar = true,
}: {
  onGerarQuestoes?: (trechos: string[]) => void;
  gerando?: boolean;
  podeGerar?: boolean;
}) {
  const { favoritos } = useFavoritos();
  const { ocultos } = useOcultos();
  const [termo, setTermo] = useState("");
  const [fechados, setFechados] = useState<string[]>([]);

  const ocultados = useMemo(() => new Set(ocultos.artigos), [ocultos.artigos]);
  const visiveis = useMemo(
    () => favoritos.filter((f) => !ocultados.has(f.chave)),
    [favoritos, ocultados],
  );
  const filtrados = useMemo(() => visiveis.filter((f) => combina(f, termo)), [visiveis, termo]);
  const grupos = useMemo(() => agruparFavoritos(filtrados), [filtrados]);

  if (!visiveis.length) return null;


  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Star className="size-4 fill-mark-yellow text-mark-yellow" /> Meus favoritos
        </h2>
        <p className="text-xs text-muted-foreground">
          {visiveis.length} artigo(s) favoritado(s) — leitura literal com lei, título, capítulo e
          seção, sem precisar carregar o PDF.
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value.slice(0, 60))}
          placeholder="Buscar nos favoritos"
          className="pl-9"
          aria-label="Buscar nos favoritos"
        />
      </div>

      {grupos.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum favorito corresponde à busca.</p>
      )}

      <div className="space-y-3">
        {grupos.map((g) => {
          const id = `${g.lei}|${g.titulo}|${g.capitulo}|${g.secao}`;
          const aberto = !fechados.includes(id);
          return (
            <div key={id} className="rounded-lg border border-border/70">
              <button
                type="button"
                onClick={() =>
                  setFechados((atual) =>
                    atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
                  )
                }
                className="flex w-full items-start gap-2 px-3 py-2 text-left"
                aria-expanded={aberto}
              >
                {aberto ? (
                  <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="space-y-0.5">
                  <span className="block text-xs font-bold text-primary">{g.lei}</span>
                  {g.titulo && (
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {g.titulo}
                    </span>
                  )}
                  {g.capitulo && <span className="block text-[11px] font-semibold">{g.capitulo}</span>}
                  {g.secao && (
                    <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                      {g.secao}
                    </span>
                  )}
                  <span className="block text-[11px] text-muted-foreground">
                    {g.itens.length} artigo(s)
                  </span>
                </span>
              </button>

              {aberto && (
                <ol className="space-y-3 border-t border-border/70 p-3">
                  {g.itens.map((f) => (
                    <li key={f.chave}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-primary">{f.referencia}</span>
                        <button
                          type="button"
                          aria-label={`Remover ${f.referencia} dos favoritos`}
                          onClick={() => removerFavorito(f.chave)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed">
                        <Realce texto={f.texto} termo={termo} />
                      </p>
                      {f.paragrafos.length > 0 && (
                        <ul className="mt-2 space-y-1.5 border-l border-border/70 pl-3 text-sm leading-relaxed text-muted-foreground">
                          {f.paragrafos.map((p, j) => (
                            <li key={j}>
                              <Realce texto={p} termo={termo} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>

      {onGerarQuestoes && (
        <Button
          className="w-full"
          disabled={gerando || !podeGerar || filtrados.length === 0}
          onClick={() => onGerarQuestoes(filtrados.map(trechoDoFavorito))}
        >
          {gerando ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Criando questões dos favoritos…
            </>
          ) : (
            <>
              <Brain className="mr-2 size-4" /> Gerar questões dos favoritos
            </>
          )}
        </Button>
      )}
    </section>
  );
}
