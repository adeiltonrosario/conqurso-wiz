import { Clock } from "lucide-react";
import { ROTULOS_ATIVIDADE, formatarTempo, leisDoDia, totalDia, useTempoEstudo } from "@/lib/tempo-estudo";

/**
 * Relógio de estudo ao vivo. Variante "compacto" para o topo do AppShell
 * ("Hoje: 1h23min • Leitura 45min • Questões 38min") e "resumo" para a
 * tela Trilha (totais por atividade + tempo por lei no dia).
 */
export function RelogioEstudo({ variante = "compacto" }: { variante?: "compacto" | "resumo" }) {
  const { hoje, atividade, lei, pausado } = useTempoEstudo();
  const total = totalDia(hoje);
  const leis = leisDoDia(hoje);

  if (variante === "resumo") {
    return (
      <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Clock className="size-4 text-accent" /> Tempo de estudo hoje
        </h2>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nada contado ainda hoje. Abra uma lei ou uma questão que o relógio começa sozinho.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li className="rounded-lg bg-secondary p-2">
                Total hoje: <b>{formatarTempo(total)}</b>
              </li>
              {(["leitura", "questoes", "revisao"] as const).map((a) => (
                <li key={a} className="rounded-lg bg-secondary p-2">
                  {ROTULOS_ATIVIDADE[a]}: <b>{formatarTempo(hoje.porAtividade[a])}</b>
                </li>
              ))}
            </ul>
            {leis.length > 0 && (
              <div>
                <p className="text-xs font-semibold">Tempo por lei hoje</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {leis.map(({ lei: nome, segundos }) => (
                    <li
                      key={nome}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/70 px-2 py-1.5"
                    >
                      <span className="min-w-0 flex-1 truncate">{nome}</span>
                      <b className="shrink-0">{formatarTempo(segundos)}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              O ciclo do dia fecha à meia-noite. Trocar de lei ou de tela pausa uma atividade e
              começa a outra na hora — voltar para a mesma lei retoma o tempo dela.
            </p>
          </>
        )}
      </section>
    );
  }

  return (
    <p className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
      <Clock className="size-3.5 shrink-0 text-accent" />
      {total === 0 && !pausado ? (
        <span>Hoje: 0min — abra uma lei ou uma questão para começar a contar</span>
      ) : (
        <span className="truncate">
          Hoje: <b className="text-foreground">{formatarTempo(total)}</b>
          {" • "}
          Leitura {formatarTempo(hoje.porAtividade.leitura)}
          {" • "}
          Questões {formatarTempo(hoje.porAtividade.questoes)}
          {hoje.porAtividade.revisao > 0 && (
            <>
              {" • "}
              Revisão {formatarTempo(hoje.porAtividade.revisao)}
            </>
          )}
          {pausado && " • pausado"}
          {atividade === "leitura" && lei && ` • ${lei}`}
        </span>
      )}
    </p>
  );
}
