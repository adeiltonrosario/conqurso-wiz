import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  PenLine,
  Target,
  PlayCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EditalRelevancia } from "@/components/EditalRelevancia";
import { RelogioEstudo } from "@/components/RelogioEstudo";

import { bancasComMaterias, cargosDaBanca, useEdital } from "@/lib/edital";
import {
  diasAte,
  formatarData,
  hojeIso,
  iso,
  pontoDeRetomada,
  progressoGeral,
  tarefasDoDia,
  useTrilha,
} from "@/lib/trilha";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({
    meta: [
      { title: "Trilha de estudo no calendário — Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Monte sua trilha diária no calendário, defina cargo e data prevista da prova e retome o estudo exatamente de onde parou no dia anterior.",
      },
      { property: "og:title", content: "Trilha de estudo no calendário" },
      {
        property: "og:description",
        content:
          "Cargo, contagem de dias até a prova, tarefas por dia e link para retomar de onde você parou.",
      },
    ],
  }),
  component: Pagina,
});

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

function Pagina() {
  const { trilha, aplicar } = useTrilha();
  const [mesBase, setMesBase] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selecionado, setSelecionado] = useState(hojeIso());
  const { edital, definirFiltro } = useEdital();
  const BANCAS_EDITAL = bancasComMaterias(edital);
  const bancaSel = edital.bancaAtiva ?? "";
  const CARGOS = cargosDaBanca(edital, bancaSel);
  useEffect(() => {
    if (trilha.banca !== bancaSel || trilha.cargo !== (edital.cargoAtivo ?? ""))
      aplicar({ banca: bancaSel, cargo: edital.cargoAtivo ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancaSel, edital.cargoAtivo]);

  const dias = useMemo(() => {
    const primeiro = new Date(mesBase.getFullYear(), mesBase.getMonth(), 1);
    const total = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 0).getDate();
    const vazios = Array.from({ length: primeiro.getDay() }, () => null);
    const doMes = Array.from({ length: total }, (_, i) =>
      iso(new Date(mesBase.getFullYear(), mesBase.getMonth(), i + 1)),
    );
    return [...vazios, ...doMes];
  }, [mesBase]);

  const retomar = pontoDeRetomada(trilha);
  const restantes = diasAte(trilha.dataProva);
  const progresso = progressoGeral(trilha);
  const nomeMes = mesBase.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <AppShell
      titulo="Hoje"
      descricao="Cargo, data da prova e o plano de cada dia — sem perder o direcionamento."
    >
      <RelogioEstudo variante="resumo" />

      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Target className="size-4 text-accent" /> Meu objetivo
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">Cargo (do edital)</span>
            {CARGOS.length === 0 ? (
              <>
                <select
                  disabled
                  className="mt-1 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  <option>{bancaSel ? "Nenhum cargo nesta banca" : "Escolha a banca primeiro"}</option>
                </select>
                <Link to="/inclusao" className="mt-1 block text-xs font-semibold text-primary">
                  Cadastrar cargos do edital
                </Link>
              </>
            ) : (
              <select
                value={CARGOS.includes(edital.cargoAtivo ?? "") ? edital.cargoAtivo : ""}
                onChange={(e) => definirFiltro({ cargo: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione o cargo</option>
                {CARGOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Banca prevista (do edital)</span>
            {BANCAS_EDITAL.length === 0 ? (
              <>
                <select
                  disabled
                  className="mt-1 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  <option>Nenhuma banca no edital</option>
                </select>
                <Link to="/inclusao" className="mt-1 block text-xs font-semibold text-primary">
                  Cadastrar bancas do edital
                </Link>
              </>
            ) : (
              <select
                value={BANCAS_EDITAL.includes(bancaSel) ? bancaSel : ""}
                onChange={(e) => definirFiltro({ banca: e.target.value, cargo: "" })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione a banca</option>
                {BANCAS_EDITAL.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Data prevista da prova</span>
            <input
              type="date"
              value={trilha.dataProva}
              onChange={(e) => aplicar({ dataProva: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="rounded-lg bg-secondary p-3 text-sm">
            {restantes === null ? (
              <span className="text-muted-foreground">Defina a data para ver a contagem.</span>
            ) : (
              <>
                <strong className="font-display text-lg">
                  {restantes > 0 ? `${restantes} dias` : restantes === 0 ? "É hoje!" : "Prova passou"}
                </strong>
                <span className="block text-muted-foreground">
                  até {formatarData(trilha.dataProva)}
                  {trilha.cargo ? ` — ${trilha.cargo}` : ""}
                </span>
              </>
            )}
            <span className="mt-1 block text-xs text-muted-foreground">
              {progresso.feitas}/{progresso.total} tarefas concluídas
            </span>
          </div>
        </div>
      </section>

      {retomar && (
        <section className="rounded-xl border border-accent/40 bg-accent/10 p-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <PlayCircle className="size-4 text-accent" /> Continuar de onde parou
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatarData(retomar.data)} — {retomar.rotulo}
          </p>
          <Link
            to={retomar.rota}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            Retomar agora <ChevronRight className="size-4" />
          </Link>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <CalendarDays className="size-4 text-accent" /> <span className="capitalize">{nomeMes}</span>
          </h2>
          <div className="flex gap-1">
            <button
              aria-label="Mês anterior"
              onClick={() => setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() - 1, 1))}
              className="rounded-md border border-border p-1.5"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              aria-label="Próximo mês"
              onClick={() => setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1))}
              className="rounded-md border border-border p-1.5"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {SEMANA.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {dias.map((dia, i) =>
            dia === null ? (
              <span key={`v${i}`} />
            ) : (
              (() => {
                const tarefas = tarefasDoDia(trilha, dia);
                const feitas = tarefas.filter((t) => t.concluida).length;
                const ehHoje = dia === hojeIso();
                const ehProva = dia === trilha.dataProva;
                return (
                  <button
                    key={dia}
                    onClick={() => setSelecionado(dia)}
                    className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition-colors ${
                      selecionado === dia
                        ? "border-primary bg-primary text-primary-foreground"
                        : ehProva
                          ? "border-accent bg-accent/15"
                          : ehHoje
                            ? "border-primary/50 bg-secondary"
                            : "border-border"
                    }`}
                  >
                    <span className={ehHoje ? "font-bold" : ""}>{Number(dia.slice(-2))}</span>
                    {tarefas.length > 0 && (
                      <span className="flex gap-0.5">
                        {tarefas.slice(0, 3).map((t, k) => (
                          <span
                            key={t.id + k}
                            className={`size-1.5 rounded-full ${
                              t.concluida ? "bg-emerald-500" : "bg-muted-foreground/60"
                            }`}
                          />
                        ))}
                      </span>
                    )}
                    {ehProva && <span className="text-[9px] font-semibold">prova</span>}
                    {tarefas.length > 0 && feitas === tarefas.length && (
                      <span className="sr-only">dia concluído</span>
                    )}
                  </button>
                );
              })()
            ),
          )}
        </div>
      </section>

      <EditalRelevancia />


      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="font-display text-base font-bold">Mais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O que não é do estudo do dia fica aqui — continua a no máximo 2 toques.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            to="/redacao"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold"
          >
            <PenLine className="size-4 text-accent" /> Redação
          </Link>
          <Link
            to="/inclusao"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold"
          >
            <FilePlus2 className="size-4 text-accent" /> Adicionar conteúdo
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
