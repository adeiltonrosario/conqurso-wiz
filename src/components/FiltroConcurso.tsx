import {
  bancaDoCargo,
  bancasDoEdital,
  cargosDaBanca,
  cargosDoEdital,
  useEdital,
} from "@/lib/edital";

/**
 * Filtro do concurso em estudo (banca + cargo). Enquanto estiver selecionado,
 * o app mostra apenas as matérias, tópicos e leis daquele edital.
 * Cargo e banca andam juntos: cada cargo é vinculado a uma banca, então
 * escolher o cargo já seleciona a banca dele, e trocar a banca limita os
 * cargos oferecidos.
 */
export function FiltroConcurso({ compacto = false }: { compacto?: boolean }) {
  const { edital, definirFiltro } = useEdital();
  const bancas = bancasDoEdital(edital);
  const todosCargos = cargosDoEdital(edital);
  const bancaAtiva = edital.bancaAtiva ?? "";
  const cargoAtivo = edital.cargoAtivo ?? "";
  const cargos = cargosDaBanca(edital, bancaAtiva);

  if (!bancas.length && !todosCargos.length) return null;

  const classe = "h-9 rounded-md border border-input bg-background px-2 text-xs";

  const aoTrocarBanca = (banca: string) => {
    // Se o cargo escolhido não pertence a esta banca, limpa a seleção de cargo.
    const cargosNovos = cargosDaBanca(edital, banca);
    const cargoValido = !cargoAtivo || cargosNovos.some((c) => c === cargoAtivo);
    definirFiltro({ banca, cargo: cargoValido ? cargoAtivo : "" });
  };

  const aoTrocarCargo = (cargo: string) => {
    // O cargo já traz a banca dele: os dois mudam juntos.
    const vinculada = bancaDoCargo(edital, cargo);
    definirFiltro({ cargo, banca: cargo && vinculada ? vinculada : bancaAtiva });
  };

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
              value={bancaAtiva}
              onChange={(e) => aoTrocarBanca(e.target.value)}
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
              value={cargoAtivo}
              onChange={(e) => aoTrocarCargo(e.target.value)}
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
