import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { lerPlanilhaEdital, normalizarBanca, type CargoPlanilha } from "@/lib/edital-planilha";
import { importarCargosPlanilha, lerEdital, useEdital } from "@/lib/edital";

/** Botão que lê um edital verticalizado (.xlsx) e cria banca, cargos e matérias por bloco. */
export function ImportarPlanilhaEdital() {
  const { aplicar } = useEdital();
  const ref = useRef<HTMLInputElement | null>(null);
  const [lendo, setLendo] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [cargos, setCargos] = useState<CargoPlanilha[] | null>(null);
  const [banca, setBanca] = useState("");
  const [marcados, setMarcados] = useState<Set<number>>(new Set());

  const ler = async (f: File) => {
    setLendo(true);
    try {
      const lidos = await lerPlanilhaEdital(f);
      if (!lidos.length) {
        toast.error("Não encontrei matérias nessa planilha. Confira se ela tem as linhas “BLOCO …” e os tópicos numerados.");
        return;
      }
      setNomeArquivo(f.name);
      setBanca(lidos.find((c) => c.banca)?.banca ?? "");
      setMarcados(new Set(lidos.map((_, i) => i)));
      setCargos(lidos);
    } catch {
      toast.error("Não consegui abrir a planilha. Envie um arquivo .xlsx.");
    } finally {
      setLendo(false);
    }
  };

  const confirmar = () => {
    if (!cargos) return;
    const b = normalizarBanca(banca);
    if (!b) {
      toast.error("Informe a banca do edital.");
      return;
    }
    const escolhidos = cargos.filter((_, i) => marcados.has(i)).map((c) => ({ ...c, banca: b }));
    if (!escolhidos.length) {
      toast.error("Marque pelo menos um cargo.");
      return;
    }
    aplicar(importarCargosPlanilha(lerEdital(), escolhidos));
    const total = escolhidos.reduce((s, c) => s + c.materias.length, 0);
    toast.success(`${b}: ${escolhidos.length} cargo(s) e ${total} matéria(s) importados, separados por bloco.`);
    setCargos(null);
  };

  return (
    <div className="space-y-1">
      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        aria-label="Planilha do edital"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void ler(f);
        }}
      />
      <Button type="button" variant="secondary" className="w-full" disabled={lendo} onClick={() => ref.current?.click()}>
        {lendo ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileSpreadsheet className="mr-2 size-4" />}
        {lendo ? "Lendo a planilha…" : "Carregar de planilha (.xlsx)"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Edital verticalizado: cada aba vira um cargo, já ligado à banca e dividido em blocos. Sem gastar IA.
      </p>

      <Dialog open={cargos !== null} onOpenChange={(a) => !a && setCargos(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar edital da planilha</DialogTitle>
            <DialogDescription className="break-words [overflow-wrap:anywhere]">{nomeArquivo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="planilha-banca">Banca</Label>
            <Input id="planilha-banca" value={banca} onChange={(e) => setBanca(e.target.value.slice(0, 60))} placeholder="Ex.: VUNESP" />
          </div>
          <ul className="space-y-2">
            {(cargos ?? []).map((c, i) => {
              const blocos = [...new Set(c.materias.map((m) => m.bloco).filter(Boolean))];
              return (
                <li key={c.cargo + i} className="rounded-lg border border-border p-3">
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={marcados.has(i)}
                      onChange={() =>
                        setMarcados((s) => {
                          const n = new Set(s);
                          if (n.has(i)) n.delete(i);
                          else n.add(i);
                          return n;
                        })
                      }
                    />
                    <span>
                      <span className="block font-semibold">{c.cargo}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.materias.length} matérias · {c.materias.reduce((s, m) => s + m.topicos.length, 0)} tópicos
                        {blocos.length ? ` · ${blocos.join(", ")}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground">
            A banca e os cargos são criados e vinculados automaticamente. Matérias de outras bancas não são alteradas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCargos(null)}>Cancelar</Button>
            <Button onClick={confirmar}>Confirmar e importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
