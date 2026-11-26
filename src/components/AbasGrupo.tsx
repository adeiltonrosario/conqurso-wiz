import { Link, useRouterState } from "@tanstack/react-router";
import type { AbaGrupo } from "@/lib/navegacao";

/**
 * Abas dentro de uma tela agrupada (Treinar ou Revisar).
 * As telas em si não mudam de conteúdo — as abas só navegam entre as
 * rotas do grupo, com a aba da rota atual marcada.
 */
export function AbasGrupo({ abas }: { abas: readonly AbaGrupo[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="no-print flex gap-2" role="tablist" aria-label="Seções desta tela">
      {abas.map(({ to, label }) => {
        const ativa = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            role="tab"
            aria-selected={ativa}
            className={
              ativa
                ? "flex-1 rounded-lg border border-primary bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
                : "flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center text-sm text-muted-foreground"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
