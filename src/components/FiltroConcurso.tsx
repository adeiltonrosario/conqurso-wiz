import { bancasComMaterias, cargosDaBanca, useEdital } from "@/lib/edital";

/**
 * Filtro do concurso em estudo (banca → cargo). As opções vêm só das matérias
 * incluídas no edital: primeiro escolhe-se a banca, depois os cargos dela.
 */
export function FiltroConcurso({ compacto = false }: { compacto?: boolean }) {
  const { edital, definirFiltro } = useEdital();
  const bancas = bancasComMaterias(edital);
  const bancaAtiva = edital.bancaAtiva ?? "";
  const cargoAtivo = edital.cargoAtivo ?? "";
  const cargos = cargosDaBanca(edital, bancaAtiva);

  if (!bancas.length) return null;

  const classe = "h-9 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50";

  return (
    <div className="no-print space-y-1.5 rounded-xl border border-border bg-card p-3 shadow-card">
      {!compacto && (
        <p className="text-xs text-muted-foreground">
          Concurso em estudo — escolha a banca e depois o cargo.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          Banca
          <select
            value={bancaAtiva}
            onChange={(e) => definirFiltro({ banca: e.target.value, cargo: "" })}
            className={classe}
          >
            <option value="">Selecione a banca</option>
            {bancas.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          Cargo
          <select
            value={cargoAtivo}
            disabled={!bancaAtiva}
            onChange={(e) => definirFiltro({ cargo: e.target.value })}
            className={classe}
          >
            <option value="">{bancaAtiva ? "Selecione o cargo" : "Escolha a banca primeiro"}</option>
            {cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
