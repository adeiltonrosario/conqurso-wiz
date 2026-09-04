import { Fragment, type ReactNode } from "react";

const CLASSES: Record<string, string> = {
  azul: "mark-blue",
  vermelho: "mark-red",
  amarelo: "mark-yellow",
};

const REGEX = /\{\{(negrito|azul|vermelho|amarelo)\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}/g;

function analisar(texto: string, chave: string): ReactNode[] {
  const partes: ReactNode[] = [];
  const regex = new RegExp(REGEX.source, "g");
  let ultimo = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index));
    const tipo = match[1] ?? "";
    const conteudo = analisar(match[2] ?? "", `${chave}-${i}`);
    partes.push(
      tipo === "negrito" ? (
        <strong key={`${chave}-b${i}`} className="font-bold">
          {conteudo}
        </strong>
      ) : (
        <mark key={`${chave}-m${i}`} className={`bg-transparent ${CLASSES[tipo] ?? ""}`}>
          {conteudo}
        </mark>
      ),
    );
    i++;
    ultimo = match.index + match[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

/**
 * Renderiza texto com marcação {{negrito|…}}, {{azul|…}}, {{vermelho|…}}, {{amarelo|…}}.
 * Aceita aninhamento simples (uma marca dentro de outra).
 */
export function Marcado({ texto, className }: { texto: string; className?: string }) {
  const partes = analisar(texto ?? "", "m");
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
        <strong className="font-bold text-foreground">N</strong> negrito
      </span>
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
