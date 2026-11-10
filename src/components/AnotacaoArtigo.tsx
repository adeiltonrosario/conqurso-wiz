import { useState } from "react";
import { MessageSquare, NotebookPen, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { salvarAnotacao, type AnotacaoArtigo as Anotacao } from "@/lib/anotacoes-lei";

/** Espaço recolhido abaixo do artigo para a explicação pessoal do aluno. */
export function AnotacaoArtigo({
  chave,
  lei,
  referencia,
  anotacao,
}: {
  chave: string;
  lei: string;
  referencia: string;
  anotacao?: Anotacao | undefined;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState("");

  const editar = () => {
    setRascunho(anotacao?.texto ?? "");
    setEditando(true);
    setAberto(true);
  };
  const salvar = () => {
    if (!rascunho.trim()) {
      toast.error("Escreva a explicação antes de salvar.");
      return;
    }
    salvarAnotacao(chave, { texto: rascunho, lei, referencia });
    setEditando(false);
    toast.success(`Explicação do ${referencia} salva na nuvem.`);
  };
  const excluir = () => {
    if (!window.confirm(`Excluir a explicação do ${referencia}?`)) return;
    salvarAnotacao(chave, null);
    setEditando(false);
    setAberto(false);
  };

  if (!aberto)
    return (
      <button
        type="button"
        onClick={() => (anotacao ? setAberto(true) : editar())}
        className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${
          anotacao ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {anotacao ? <NotebookPen className="size-3.5" /> : <MessageSquare className="size-3.5" />}
        {anotacao ? "Ver minha explicação" : "Adicionar explicação"}
      </button>
    );

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-primary/30 bg-secondary/60 p-2">
      {editando ? (
        <>
          <Textarea
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            placeholder="Explique o artigo, anote pegadinhas ou mnemônicos…"
            aria-label={`Explicação do ${referencia}`}
            rows={4}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={salvar}>
              <Save className="mr-1 size-3.5" /> Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditando(false);
                if (!anotacao) setAberto(false);
              }}
            >
              <X className="mr-1 size-3.5" /> Cancelar
            </Button>
            {anotacao && (
              <Button size="sm" variant="ghost" onClick={excluir}>
                <Trash2 className="mr-1 size-3.5" /> Excluir
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] font-semibold text-primary">Minha explicação</p>
          <p className="whitespace-pre-wrap text-sm">{anotacao?.texto}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={editar}>
              <Pencil className="mr-1 size-3.5" /> Alterar anotação
            </Button>
            <Button size="sm" variant="ghost" onClick={excluir}>
              <Trash2 className="mr-1 size-3.5" /> Excluir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAberto(false)}>
              Recolher
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
