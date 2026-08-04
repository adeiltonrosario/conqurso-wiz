import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PenLine, FilePlus2, ScanSearch, ListChecks, FileText } from "lucide-react";

const NAV = [
  { to: "/redacao", label: "Redação", icon: PenLine },
  { to: "/inclusao", label: "Incluir", icon: FilePlus2 },
  { to: "/analise-padroes", label: "Padrões", icon: ScanSearch },
  { to: "/questoes", label: "Questões", icon: ListChecks },
  { to: "/prova-interativa", label: "Prova", icon: FileText },
] as const;

export function AppShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      <header className="no-print sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-sm font-bold tracking-tight">
            Concurseiro <span className="text-accent">Inteligente</span>
          </Link>
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
            estudo vertical
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5">
        <h1 className="text-2xl font-bold sm:text-3xl">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
        <div className="mt-5 space-y-5">{children}</div>
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <Icon className="size-5" strokeWidth={1.9} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
