import { Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

/**
 * Selo da banca prevista na Trilha: deixa explícito o padrão que a IA está
 * seguindo nas alternativas e explicações das questões geradas.
 */
export function BancaAtual({ banca, definida }: { banca: string; definida: boolean }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
        <Landmark className="size-3.5" aria-hidden="true" />
        Padrão da banca: {banca}
      </span>
      <span className="text-muted-foreground">
        {definida ? (
          <>
            definida na{" "}
            <Link to="/trilha" className="underline underline-offset-2">
              Trilha
            </Link>
          </>
        ) : (
          <>
            banca prevista ainda não escolhida —{" "}
            <Link to="/trilha" className="underline underline-offset-2">
              definir na Trilha
            </Link>
          </>
        )}
      </span>
    </div>
  );
}
