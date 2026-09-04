import { useRef, useState } from "react";
import { Image as ImageIcon, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagemCard } from "@/components/ImagemCard";
import { cardVazio, enviarImagemDoCard, removerImagemDoCard, type CardProprio } from "@/lib/cards";
import { useAuth } from "@/hooks/useAuth";

const LIMITE = 10 * 1024 * 1024;

export function CardForm({
  inicial,
  materias,
  salvando,
  onSalvar,
  onCancelar,
}: {
  inicial?: CardProprio;
  materias: string[];
  salvando: boolean;
  onSalvar: (card: CardProprio) => void;
  onCancelar: () => void;
}) {
  const { user } = useAuth();
  const [card, setCard] = useState<CardProprio>(inicial ?? cardVazio());
  const [modoImagem, setModoImagem] = useState<"arquivo" | "link">(
    inicial?.imagemUrl ? "link" : "arquivo",
  );
  const [enviando, setEnviando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  const valido = card.pergunta.trim().length > 0 && card.resposta.trim().length > 0;

  function mudar(patch: Partial<CardProprio>) {
    setCard((c) => ({ ...c, ...patch }));
  }

  async function escolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (arquivo.size > LIMITE) {
      toast.error("A imagem é muito grande. Use uma foto de até 10 MB.");
      return;
    }
    if (!user) {
      toast.error("Faça login novamente para enviar imagens.");
      return;
    }
    setEnviando(true);
    try {
      const path = await enviarImagemDoCard(arquivo, user.id);
      const antigo = card.imagemPath;
      mudar({ imagemPath: path, imagemUrl: "" });
      if (antigo) await removerImagemDoCard(antigo);
    } catch {
      toast.error("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviando(false);
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  }

  async function limparImagem() {
    const antigo = card.imagemPath;
    mudar({ imagemPath: "", imagemUrl: "" });
    if (antigo) await removerImagemDoCard(antigo);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Pergunta (frente)</label>
        <CampoFormatado
          value={card.pergunta}
          onChange={(v) => mudar({ pergunta: v })}
          placeholder="Ex.: Qual o prazo da prisão temporária em crimes hediondos?"
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground">Resposta (verso)</label>
        <CampoFormatado
          value={card.resposta}
          onChange={(v) => mudar({ resposta: v })}
          placeholder="Ex.: 30 dias, prorrogáveis por igual período."
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground">
          Explicação / observação (opcional)
        </label>
        <CampoFormatado
          value={card.explicacao}
          onChange={(v) => mudar({ explicacao: v })}
          rows={2}
          className="mt-1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Matéria</label>
          {materias.length ? (
            <select
              value={materias.includes(card.materia) ? card.materia : ""}
              onChange={(e) => mudar({ materia: e.target.value })}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Sem matéria</option>
              {materias.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={card.materia}
              onChange={(e) => mudar({ materia: e.target.value })}
              placeholder="Ex.: Direito Penal"
              className="mt-1"
            />
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Assunto (opcional)</label>
          <Input
            value={card.assunto}
            onChange={(e) => mudar({ assunto: e.target.value })}
            placeholder="Ex.: Crimes contra a Administração"
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <ImageIcon className="size-3.5 text-primary" /> Imagem da resposta (opcional)
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={modoImagem === "arquivo" ? "default" : "outline"}
            onClick={() => setModoImagem("arquivo")}
          >
            <Upload className="size-3.5" /> Enviar do aparelho
          </Button>
          <Button
            type="button"
            size="sm"
            variant={modoImagem === "link" ? "default" : "outline"}
            onClick={() => setModoImagem("link")}
          >
            <Link2 className="size-3.5" /> Colar link
          </Button>
        </div>

        {modoImagem === "arquivo" ? (
          <input
            ref={arquivoRef}
            type="file"
            accept="image/*"
            onChange={(e) => void escolherArquivo(e.target.files?.[0])}
            className="w-full text-xs"
          />
        ) : (
          <Input
            value={card.imagemUrl}
            onChange={(e) => mudar({ imagemUrl: e.target.value, imagemPath: "" })}
            placeholder="https://..."
          />
        )}

        {enviando ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Enviando imagem...
          </p>
        ) : null}

        <ImagemCard card={card} className="max-h-48 w-full rounded-xl object-contain" />

        {card.imagemPath || card.imagemUrl ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => void limparImagem()}>
            <Trash2 className="size-3.5" /> Remover imagem
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={!valido || salvando || enviando}
          onClick={() => onSalvar(card)}
        >
          {salvando ? <Loader2 className="size-4 animate-spin" /> : null} Salvar card
        </Button>
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
      {!valido ? (
        <p className="text-xs text-muted-foreground">Preencha a pergunta e a resposta.</p>
      ) : null}
    </section>
  );
}
