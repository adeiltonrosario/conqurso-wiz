import { Flame, Target } from "lucide-react";

function faixa(valor: number) {
  if (valor >= 10) return "border-mark-red/50 bg-mark-red-soft/40 text-mark-red";
  if (valor >= 5) return "border-mark-yellow/50 bg-mark-yellow-soft/40 text-foreground";
  return "border-border bg-secondary text-muted-foreground";
}

function formatar(valor: number) {
  return `${valor.toFixed(1).replace(".", ",")}%`;
}

export function Relevancia({
  materia,
  assunto,
  relevanciaMateria,
  relevanciaAssunto,
}: {
  materia?: string;
  assunto?: string;
  relevanciaMateria?: number;
  relevanciaAssunto?: number;
}) {
  if (relevanciaMateria == null && relevanciaAssunto == null) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
      {relevanciaMateria != null && (
        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${faixa(relevanciaMateria)}`}
          title="Relevância da matéria na prova"
        >
          <Flame className="size-3" />
          {materia ? `${materia}: ` : "Matéria: "}
          {formatar(relevanciaMateria)}
        </span>
      )}
      {relevanciaAssunto != null && (
        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${faixa(relevanciaAssunto)}`}
          title="Relevância do assunto dentro da matéria"
        >
          <Target className="size-3" />
          {assunto ? `${assunto}: ` : "Assunto: "}
          {formatar(relevanciaAssunto)}
        </span>
      )}
    </div>
  );
}

export function ResumoRelevancia({
  itens,
}: {
  itens: { assunto: string; relevancia: number; total: number }[];
}) {
  if (!itens.length) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-card">
      <h2 className="font-display text-base font-bold">Foco por assunto cobrado</h2>
      <ul className="mt-2 space-y-2">
        {itens.map((i) => (
          <li key={i.assunto} className="text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{i.assunto}</span>
              <span className="text-xs text-muted-foreground">
                {formatar(i.relevancia)} · {i.total} {i.total === 1 ? "questão" : "questões"}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, i.relevancia)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
