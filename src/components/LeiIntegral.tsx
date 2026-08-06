import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ScrollText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { leiIntegral, type LeiIntegral as LeiIntegralTipo } from "@/lib/ai.functions";

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

function combina(a: { referencia: string; texto: string; paragrafos?: string[] }, termo: string) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return true;
  return `${a.referencia} ${a.texto} ${(a.paragrafos ?? []).join(" ")}`.toLowerCase().includes(t);
}

export function LeiIntegralPainel({
  materia,
  capitulo,
  contexto,
  marcados,
  onAlternarMarcado,
  onCarregado,
}: {
  materia: string;
  capitulo: string;
  contexto: string | null;
  marcados: string[];
  onAlternarMarcado: (trecho: string) => void;
  onCarregado?: (lei: LeiIntegralTipo) => void;
}) {
  const buscar = useServerFn(leiIntegral);
  const [lei, setLei] = useState<LeiIntegralTipo | null>(null);
  const [termo, setTermo] = useState("");
  const [soMarcados, setSoMarcados] = useState(false);

  const mut = useMutation({
    mutationFn: () => buscar({ data: { materia, capitulo, contexto } }),
    onSuccess: (r) => {
      setLei(r);
      onCarregado?.(r);
      if (!(r.artigos ?? []).length) toast.error("A IA não retornou os artigos deste capítulo.");
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível carregar o texto integral."),
  });

  const artigos = useMemo(() => {
    const lista = lei?.artigos ?? [];
    return lista.filter(
      (a) =>
        combina(a, termo) &&
        (!soMarcados || marcados.includes(`${a.referencia} — ${a.texto}`)),
    );
  }, [lei, termo, soMarcados, marcados]);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <ScrollText className="size-4 text-primary" /> Texto integral (Vade Mecum)
        </h2>
        <p className="text-xs text-muted-foreground">
          Leitura literal dos artigos do capítulo, com filtro por palavra-chave e marcação de artigos
          para gerar questões só do que você marcou.
        </p>
      </header>

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

      {lei && (
        <>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{lei.base_legal}</p>
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {artigos.length} de {lei.artigos?.length ?? 0} artigo(s)
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

          <ol className="space-y-3">
            {artigos.map((a, i) => {
              const trecho = `${a.referencia} — ${a.texto}`;
              const marcado = marcados.includes(trecho);
              return (
                <li
                  key={`${a.referencia}-${i}`}
                  className={`rounded-lg border p-3 ${
                    marcado ? "border-primary bg-primary/5" : "border-border/70"
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => onAlternarMarcado(trecho)}
                      className="size-4 accent-primary"
                    />
                    <span className="text-xs font-bold text-primary">{a.referencia}</span>
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

          {artigos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum artigo corresponde ao filtro aplicado.
            </p>
          )}

          {lei.observacao && (
            <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              {lei.observacao}
            </p>
          )}
        </>
      )}
    </section>
  );
}
