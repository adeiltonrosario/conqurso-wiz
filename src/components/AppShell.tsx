import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ListChecks, Brain, BookOpen, CalendarDays, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { limparEstadoLocal } from "@/lib/sync";
import { useRastreadorTempoEstudo } from "@/lib/tempo-estudo";
import { RelogioEstudo } from "@/components/RelogioEstudo";
import { ROTA_DA_TELA, telaDaRota, type Tela } from "@/lib/navegacao";

/** Menu de baixo: só 4 telas — Hoje, Leis, Treinar, Revisar. */
const NAV: readonly { tela: Tela; label: string; icon: typeof CalendarDays }[] = [
  { tela: "hoje", label: "Hoje", icon: CalendarDays },
  { tela: "leis", label: "Leis", icon: BookOpen },
  { tela: "treinar", label: "Treinar", icon: ListChecks },
  { tela: "revisar", label: "Revisar", icon: Brain },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Único rastreador do relógio automático: deriva a atividade da rota.
  useRastreadorTempoEstudo();
  // Tela ativa do menu: Treinar fica ativo em Questões, Prova e Padrões;
  // Revisar em Revisão e Cards; Hoje em / e /trilha.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const telaAtiva = telaDaRota(pathname);

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    limparEstadoLocal();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="no-print sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-sm font-bold tracking-tight">
            Concurseiro <span className="text-accent">Inteligente</span>
          </Link>
          {user ? (
            <button
              type="button"
              onClick={sair}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <LogOut className="size-3.5" />
              <span className="max-w-[130px] truncate">{user.email ?? "sair"}</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <LogIn className="size-3.5" />
              entrar
            </Link>
          )}
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <RelogioEstudo variante="compacto" />
        </div>
      </header>


      <main className="mx-auto max-w-3xl px-4 pt-5">
        <h1 className="text-2xl font-bold sm:text-3xl">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
        <div className="mt-5 space-y-5">{children}</div>
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {NAV.map(({ tela, label, icon: Icon }) => (
            <Link
              key={tela}
              to={ROTA_DA_TELA[tela]}
              className={
                telaAtiva === tela
                  ? "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-primary transition-colors"
                  : "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors"
              }
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
