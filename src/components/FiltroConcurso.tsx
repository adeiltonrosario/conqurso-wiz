import { bancasDoEdital, cargosDoEdital, useEdital } from "@/lib/edital";

/**
 * Filtro do concurso em estudo (banca + cargo). Enquanto estiver selecionado,
 * o app mostra apenas as matérias, tópicos e leis daquele edital.
 */
export function FiltroConcurso({ compacto = false }: { compacto?: boolean }) {
  const { edital, definirFiltro } = useEdital();
  const bancas = bancasDoEdital(edital);
  const cargos = cargosDoEdital(edital);

  if (!bancas.length && !cargos.length) return null;

  const classe = "h-9 rounded-md border border-input bg-background px-2 text-xs";

  return (
    <div className="no-print space-y-1.5 rounded-xl border border-border bg-card p-3 shadow-card">
      {!compacto && (
        <p className="text-xs text-muted-foreground">
          Concurso em estudo — só os assuntos e as leis deste edital aparecem no app.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {bancas.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs font-semibold">
            Banca
            <select
              value={edital.bancaAtiva ?? ""}
              onChange={(e) => definirFiltro({ banca: e.target.value })}
              className={classe}
            >
              <option value="">Todas</option>
              {bancas.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        )}
        {cargos.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs font-semibold">
            Cargo
            <select
              value={edital.cargoAtivo ?? ""}
              onChange={(e) => definirFiltro({ cargo: e.target.value })}
              className={classe}
            >
              <option value="">Todos</option>
              {cargos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
