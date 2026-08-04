import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Target,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MATERIAS_ESPECIFICO, MATERIAS_GERAL, BANCAS } from "@/lib/acervo";
import {
  DESTINOS,
  diasAte,
  formatarData,
  hojeIso,
  iso,
  pontoDeRetomada,
  progressoGeral,
  tarefasDoDia,
  useTrilha,
} from "@/lib/trilha";

export const Route = createFileRoute("/_authenticated/_authenticated/trilha")({
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
const MATERIAS = [...MATERIAS_GERAL, ...MATERIAS_ESPECIFICO];

function Pagina() {
  const { trilha, aplicar, adicionarTarefa, alternarTarefa, removerTarefa, marcarPonto } = useTrilha();
  const [mesBase, setMesBase] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selecionado, setSelecionado] = useState(hojeIso());
  const [materia, setMateria] = useState(MATERIAS[0]!);
  const [topico, setTopico] = useState("");
  const [rota, setRota] = useState<string>(DESTINOS[0]!.rota);
  const [minutos, setMinutos] = useState(45);

  const dias = useMemo(() => {
    const primeiro = new Date(mesBase.getFullYear(), mesBase.getMonth(), 1);
    const total = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 0).getDate();
    const vazios = Array.from({ length: primeiro.getDay() }, () => null);
    const doMes = Array.from({ length: total }, (_, i) =>
      iso(new Date(mesBase.getFullYear(), mesBase.getMonth(), i + 1)),
    );
    return [...vazios, ...doMes];
  }, [mesBase]);

  const doDia = tarefasDoDia(trilha, selecionado);
  const retomar = pontoDeRetomada(trilha);
  const restantes = diasAte(trilha.dataProva);
  const progresso = progressoGeral(trilha);
  const nomeMes = mesBase.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <AppShell
      titulo="Trilha de estudo"
      descricao="Cargo, data da prova e o plano de cada dia — sem perder o direcionamento."
    >
      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Target className="size-4 text-accent" /> Meu objetivo
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">Cargo</span>
            <input
              value={trilha.cargo}
              onChange={(e) => aplicar({ cargo: e.target.value })}
              placeholder="Ex.: Escrivão de Polícia Civil"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Banca prevista</span>
            <select
              value={trilha.banca}
              onChange={(e) => aplicar({ banca: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Não definida</option>
              {BANCAS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
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

      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="font-display text-base font-bold">Plano de {formatarData(selecionado)}</h2>

        {doDia.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma tarefa neste dia. Adicione abaixo o que você vai estudar.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {doDia.map((t) => {
              const destino = DESTINOS.find((d) => d.rota === t.rota);
              return (
                <li
                  key={t.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <button
                    aria-label={t.concluida ? "Marcar como pendente" : "Marcar como concluída"}
                    onClick={() => alternarTarefa(t.id)}
                    className="mt-0.5"
                  >
                    <CheckCircle2
                      className={`size-5 ${t.concluida ? "text-emerald-500" : "text-muted-foreground/50"}`}
                    />
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${t.concluida ? "line-through opacity-60" : ""}`}>
                      {t.materia} — {t.topico}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {destino?.label ?? t.rota} · {t.minutos} min
                    </p>
                    <Link
                      to={t.rota}
                      onClick={() => marcarPonto(t)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      Estudar agora <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                  <button
                    aria-label="Remover tarefa"
                    onClick={() => removerTarefa(t.id)}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <form
          className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!topico.trim()) return;
            adicionarTarefa({ data: selecionado, materia, topico: topico.trim(), rota, minutos });
            setTopico("");
          }}
        >
          <label className="text-sm">
            <span className="text-muted-foreground">Matéria</span>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {MATERIAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Tópico / capítulo do edital</span>
            <input
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              placeholder="Ex.: Crimes contra a Administração Pública"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Onde estudar</span>
            <select
              value={rota}
              onChange={(e) => setRota(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {DESTINOS.map((d) => (
                <option key={d.rota} value={d.rota}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Minutos previstos</span>
            <input
              type="number"
              min={10}
              step={5}
              value={minutos}
              onChange={(e) => setMinutos(Number(e.target.value) || 45)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:col-span-2"
          >
            <Plus className="size-4" /> Adicionar ao dia
          </button>
        </form>
      </section>
    </AppShell>
  );
}
