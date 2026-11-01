import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Link2, Pencil, Plus, Scale, Trash2 } from "lucide-react";
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
import {
  catalogoDeLeis,
  chaveLei,
  definirVinculosDaLei,
  lerEdital,
  leisDaMateria,
  novoId,
  useEdital,
  vinculosDaLei,
  type LeiCatalogo,
  type MateriaEdital,
} from "@/lib/edital";
import { ehAnexoDeLei, lerAcervo, nomeLimpo, salvarAcervo } from "@/lib/acervo";
import { removerTextoAnexo } from "@/lib/anexos-store";

const concursoDe = (m: MateriaEdital) =>
  `${(m.banca ?? "").trim() || "Todas as bancas"} · ${(m.cargo ?? "").trim() || "Todos os cargos"}`;

/**
 * Catálogo central de leis: cada lei é cadastrada uma vez (link e/ou arquivo)
 * e pode ser vinculada a matérias de qualquer banca e cargo.
 */
export function CatalogoLeis({ arquivos }: { arquivos: string[] }) {
  const { edital, aplicar } = useEdital();
  const leis = useMemo(() => catalogoDeLeis(edital, arquivos), [edital, arquivos]);

  const [editando, setEditando] = useState<LeiCatalogo | null>(null);
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [anexo, setAnexo] = useState("");
  const [vinculando, setVinculando] = useState<LeiCatalogo | null>(null);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());

  const abrirForm = (lei: LeiCatalogo | null) => {
    setEditando(lei ?? { id: "", titulo: "", url: "" });
    setTitulo(lei?.titulo ?? "");
    setUrl(lei?.url.startsWith("acervo:") ? "" : (lei?.url ?? ""));
    setAnexo(lei?.anexo ?? "");
  };

  const salvar = () => {
    if (!editando) return;
    const t = titulo.trim();
    const u = url.trim();
    const a = anexo.trim();
    if (t.length < 2) { toast.error("Informe o nome da lei."); return; }
    if (!u && !a) { toast.error("Informe o link ou escolha o arquivo da lei."); return; }
    if (u && !/^https?:\/\//i.test(u)) { toast.error("O link precisa começar com http:// ou https://"); return; }
    const nova: LeiCatalogo = { id: editando.id || novoId(), titulo: t, url: u || `acervo:${a}`, anexo: a || undefined };
    const atual = lerEdital();
    const chaveAntiga = editando.id ? chaveLei(editando) : "";
    const outra = catalogoDeLeis(atual, arquivos).find((l) => chaveLei(l) === chaveLei(nova) && chaveLei(l) !== chaveAntiga);
    if (outra) { toast.error(`Essa lei já está no catálogo: ${outra.titulo}`); return; }
    const catalogo = (atual.catalogoLeis ?? []).filter((l) => !chaveAntiga || chaveLei(l) !== chaveAntiga);
    // Atualiza também os vínculos já existentes nas matérias.
    const materias = chaveAntiga
      ? atual.materias.map((m) => ({
          ...m,
          leis: leisDaMateria(m).map((l) =>
            chaveLei(l) === chaveAntiga ? { ...l, titulo: nova.titulo, url: nova.url, anexo: nova.anexo } : l,
          ),
        }))
      : atual.materias;
    aplicar({ catalogoLeis: [...catalogo, nova], materias });
    toast.success(editando.id ? "Lei atualizada." : "Lei incluída no catálogo.");
    setEditando(null);
  };

  const excluir = (lei: LeiCatalogo) => {
    if (!window.confirm(`Excluir "${lei.titulo}" do catálogo, das matérias e do acervo?`)) return;
    const k = chaveLei(lei);
    const atual = lerEdital();
    aplicar({
      catalogoLeis: (atual.catalogoLeis ?? []).filter((l) => chaveLei(l) !== k),
      materias: atual.materias.map((m) => ({ ...m, leis: leisDaMateria(m).filter((l) => chaveLei(l) !== k) })),
    });
    // Remove também o arquivo do acervo, senão ele volta a aparecer na lista.
    const arquivo = (lei.anexo ?? "").trim();
    if (arquivo) {
      const acervo = lerAcervo();
      salvarAcervo({
        ...acervo,
        provas: acervo.provas.filter(
          (a) => !(ehAnexoDeLei(a) && nomeLimpo(a).toLowerCase() === arquivo.toLowerCase()),
        ),
      });
      void removerTextoAnexo(arquivo);
    }
    toast.success("Lei excluída.");
  };

  const abrirVinculos = (lei: LeiCatalogo) => {
    setMarcadas(new Set(vinculosDaLei(edital, lei).map((m) => m.id)));
    setVinculando(lei);
  };

  const salvarVinculos = () => {
    if (!vinculando) return;
    const atual = lerEdital();
    const k = chaveLei(vinculando);
    const noCatalogo = (atual.catalogoLeis ?? []).some((l) => chaveLei(l) === k);
    aplicar({
      materias: definirVinculosDaLei(atual, vinculando, marcadas),
      catalogoLeis: noCatalogo ? atual.catalogoLeis : [...(atual.catalogoLeis ?? []), { ...vinculando, id: novoId() }],
    });
    toast.success(`${vinculando.titulo}: ${marcadas.size} matéria(s) vinculada(s).`);
    setVinculando(null);
  };

  const grupos = useMemo(() => {
    const mapa = new Map<string, MateriaEdital[]>();
    for (const m of edital.materias) {
      const g = concursoDe(m);
      mapa.set(g, [...(mapa.get(g) ?? []), m]);
    }
    return [...mapa.entries()];
  }, [edital.materias]);

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <Scale className="size-4 text-primary" /> Catálogo de leis
          </h2>
          <p className="text-xs text-muted-foreground">
            Cadastre a lei uma vez, com link e arquivo, e vincule a matérias de qualquer edital ou banca.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => abrirForm(null)}>
          <Plus className="mr-1 size-4" /> Nova lei
        </Button>
      </div>

      {leis.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nenhuma lei no catálogo ainda.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {leis.map((lei) => {
            const vinc = vinculosDaLei(edital, lei);
            return (
              <li key={chaveLei(lei)} className="space-y-1.5 p-3">
                <p className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{lei.titulo}</p>
                {!lei.url.startsWith("acervo:") && (
                  <a
                    href={lei.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 break-all text-xs text-primary underline"
                  >
                    <Link2 className="size-3 shrink-0" /> {lei.url}
                  </a>
                )}
                {lei.anexo && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="size-3 shrink-0" />
                    <span className="break-words [overflow-wrap:anywhere]">{lei.anexo}</span>
                  </p>
                )}
                {vinc.length > 0 ? (
                  <ul className="space-y-0.5 text-xs">
                    {vinc.map((m) => (
                      <li key={m.id} className="break-words [overflow-wrap:anywhere]">
                        <span className="text-muted-foreground">[{concursoDe(m)}]</span> → <span className="font-medium">{m.nome}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Ainda não vinculada a nenhuma matéria.</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => abrirVinculos(lei)}>
                    <Link2 className="mr-1 size-3" /> Vincular a matérias
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => abrirForm(lei)} aria-label={`Editar ${lei.titulo}`}>
                    <Pencil className="size-3" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => excluir(lei)} aria-label={`Excluir ${lei.titulo}`}>
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editando !== null} onOpenChange={(a) => !a && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando?.id ? "Editar lei" : "Nova lei"}</DialogTitle>
            <DialogDescription>Informe o link, o arquivo do acervo ou os dois.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="cat-titulo">Nome da lei</Label>
              <Input id="cat-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value.slice(0, 160))} placeholder="Ex.: Código Penal — Decreto-Lei nº 2.848/1940" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-url">Link</Label>
              <Input id="cat-url" value={url} onChange={(e) => setUrl(e.target.value.slice(0, 500))} placeholder="https://www.planalto.gov.br/…" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-anexo">Arquivo do acervo</Label>
              <select
                id="cat-anexo"
                value={anexo}
                onChange={(e) => setAnexo(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Nenhum arquivo</option>
                {arquivos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Para enviar um PDF novo, use “Upload de PDF para leis” abaixo.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vinculando !== null} onOpenChange={(a) => !a && setVinculando(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vincular a matérias</DialogTitle>
            <DialogDescription className="break-words [overflow-wrap:anywhere]">{vinculando?.titulo}</DialogDescription>
          </DialogHeader>
          {grupos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Cadastre matérias no Detalhamento do edital primeiro.</p>
          ) : (
            <div className="space-y-3">
              {grupos.map(([g, ms]) => (
                <fieldset key={g} className="space-y-1">
                  <legend className="text-xs font-bold uppercase text-primary">{g}</legend>
                  {ms.map((m) => (
                    <label key={m.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={marcadas.has(m.id)}
                        onChange={() =>
                          setMarcadas((s) => {
                            const n = new Set(s);
                            if (n.has(m.id)) n.delete(m.id);
                            else n.add(m.id);
                            return n;
                          })
                        }
                      />
                      <span className="break-words [overflow-wrap:anywhere]">
                        {m.bloco ? `${m.bloco} · ` : ""}{m.nome}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculando(null)}>Cancelar</Button>
            <Button onClick={salvarVinculos}>Salvar vínculos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
