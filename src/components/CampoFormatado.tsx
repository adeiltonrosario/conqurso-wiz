import { useRef, type ClipboardEvent, type CSSProperties } from "react";
import { Eraser } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Marcado } from "@/components/Marcado";
import { alternarMarca, limparTrecho, type Marca } from "@/lib/formatacao";

const CORES: { marca: Marca; classe: string; rotulo: string }[] = [
  { marca: "amarelo", classe: "bg-mark-yellow", rotulo: "Realçar em amarelo" },
  { marca: "vermelho", classe: "bg-mark-red", rotulo: "Realçar em vermelho" },
  { marca: "azul", classe: "bg-mark-blue", rotulo: "Realçar em azul" },
];

export function CampoFormatado({
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
  preview = true,
  maxLength,
  style,
  ariaLabel,
  id,
  onPaste,
}: {
  value: string;
  onChange: (valor: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  preview?: boolean;
  maxLength?: number;
  style?: CSSProperties;
  ariaLabel?: string;
  id?: string;
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function aplicar(fn: (t: string, i: number, f: number) => { texto: string; inicio: number; fim: number }) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: i, selectionEnd: f } = el;
    const r = fn(value, i ?? 0, f ?? 0);
    if (r.texto === value) return;
    onChange(maxLength ? r.texto.slice(0, maxLength) : r.texto);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.inicio, r.fim);
    });
  }

  const botao =
    "flex size-7 items-center justify-center rounded-md border border-border bg-background text-xs transition hover:bg-secondary";

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-label="Negrito"
          title="Negrito (Ctrl+B)"
          className={`${botao} font-bold`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => aplicar((t, i, f) => alternarMarca(t, i, f, "negrito"))}
        >
          N
        </button>
        {CORES.map((c) => (
          <button
            key={c.marca}
            type="button"
            aria-label={c.rotulo}
            title={c.rotulo}
            className={botao}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => aplicar((t, i, f) => alternarMarca(t, i, f, c.marca))}
          >
            <span className={`size-3.5 rounded-full ${c.classe}`} />
          </button>
        ))}
        <button
          type="button"
          aria-label="Limpar formatação"
          title="Limpar formatação do trecho selecionado"
          className={botao}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => aplicar(limparTrecho)}
        >
          <Eraser className="size-3.5 text-muted-foreground" />
        </button>
        <span className="ml-1 text-[11px] text-muted-foreground">
          selecione o texto e clique
        </span>
      </div>

      <Textarea
        ref={ref}
        id={id}
        onPaste={onPaste}
        value={value}
        rows={rows}
        placeholder={placeholder}
        className={className}
        style={style}
        maxLength={maxLength}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            aplicar((t, i, f) => alternarMarca(t, i, f, "negrito"));
          }
        }}
      />

      {preview && value.includes("{{") ? (
        <div className="rounded-md border border-dashed border-border bg-muted/40 px-2.5 py-1.5">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Prévia
          </span>
          <Marcado texto={value} className="text-sm leading-relaxed" />
        </div>
      ) : null}
    </div>
  );
}
