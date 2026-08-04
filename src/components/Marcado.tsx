import { Fragment, type ReactNode } from "react";

const CLASSES: Record<string, string> = {
  azul: "mark-blue",
  vermelho: "mark-red",
  amarelo: "mark-yellow",
};

/**
 * Renderiza texto com marcação {{azul|texto}}, {{vermelho|texto}}, {{amarelo|texto}}.
 */
export function Marcado({ texto, className }: { texto: string; className?: string }) {
  const partes: ReactNode[] = [];
  const regex = /\{\{(azul|vermelho|amarelo)\|([^}]*)\}\}/g;
  let ultimo = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index));
    partes.push(
      <mark key={`m-${i++}`} className={`bg-transparent ${CLASSES[match[1]]}`}>
        {match[2]}
      </mark>,
    );
    ultimo = match.index + match[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));

  return (
    <span className={className}>
      {partes.map((p, idx) => (
        <Fragment key={idx}>{p}</Fragment>
      ))}
    </span>
  );
}

export function LegendaCores() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-mark-blue" /> conectivo / correto
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-mark-red" /> oposição / erro
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-mark-yellow" /> idêntico ao gabarito
      </span>
    </div>
  );
}
