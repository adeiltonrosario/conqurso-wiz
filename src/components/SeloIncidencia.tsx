import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEdital } from "@/lib/edital";
import { calcularIncidencia, chaveNorma, useIncidencia, type ItemIncidencia } from "@/lib/incidencia";
import { EstrelasIcone } from "@/components/PainelIncidencia";

/** Mapa artigo → incidência da norma aberta no leitor (concurso ativo). */
export function useIncidenciaDaNorma(baseLegal: string) {
  const { edital } = useEdital();
  const r = useIncidencia(edital.bancaAtiva, edital.cargoAtivo);
  return useMemo(() => {
    const lei = chaveNorma(baseLegal);
    const mapa = new Map<number, ItemIncidencia>();
    if (!r || !lei) return { mapa, questoes: r?.questoes ?? [] };
    for (const i of calcularIncidencia(r.questoes, r.config)) {
      if (i.tipo === "artigo" && i.lei === lei && i.artigo) mapa.set(i.artigo, i);
    }
    return { mapa, questoes: r.questoes };
  }, [r, baseLegal]);
}

export function SeloIncidencia({
  item,
  questoes,
}: {
  item: ItemIncidencia | undefined;
  questoes: { hash: string; prova: string; ano?: number; materia: string; questao: { banca: string; enunciado: string; alternativas: { letra: string; texto: string; correta: boolean }[] } }[];
}) {
  const [aberto, setAberto] = useState(false);
  if (!item) return null;
  const rel = questoes.filter((q) => item.questoes.includes(q.hash));
  const bancas = [...new Set(rel.map((q) => q.questao.banca).filter(Boolean))];
  const materias = [...new Set(rel.map((q) => q.materia).filter(Boolean))];
  const nivel = ["", "Baixa", "Média", "Alta"][item.estrelas];
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1 rounded-full border border-mark-yellow/50 px-1.5 py-0.5"
        aria-label={`Incidência ${nivel}: ${item.questoes.length} questões`}
      >
        <EstrelasIcone n={item.estrelas} />
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.rotulo}</DialogTitle>
            <DialogDescription>
              Incidência {nivel} · {item.questoes.length} questão(ões) · {item.provas} prova(s)
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 text-xs">
            <li>Bancas: {bancas.join(", ") || "—"}</li>
            <li>Anos: {item.anos.join(", ") || "—"}</li>
            <li>Matérias: {materias.join(", ") || "—"}</li>
          </ul>
          <ol className="space-y-2">
            {rel.map((q) => (
              <li key={q.hash} className="rounded-lg border border-border p-2 text-sm">
                <p className="text-[11px] text-muted-foreground">
                  {[q.questao.banca, q.prova, q.ano].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1">{q.questao.enunciado}</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {q.questao.alternativas.map((a) => (
                    <li key={a.letra} className={a.correta ? "font-semibold text-primary" : ""}>
                      {a.letra}) {a.texto}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
