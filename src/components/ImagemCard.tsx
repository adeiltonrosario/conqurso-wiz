import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { temImagem, urlDaImagem, type CardProprio } from "@/lib/cards";

/** Exibe a imagem do card (link direto ou arquivo enviado, via URL temporária). */
export function ImagemCard({
  card,
  className = "max-h-72 w-full rounded-xl object-contain",
}: {
  card: CardProprio;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let ativo = true;
    setFalhou(false);
    setUrl("");
    if (!temImagem(card)) return;
    urlDaImagem(card)
      .then((u) => {
        if (!ativo) return;
        if (u) setUrl(u);
        else setFalhou(true);
      })
      .catch(() => ativo && setFalhou(true));
    return () => {
      ativo = false;
    };
  }, [card.id, card.imagemPath, card.imagemUrl]);

  if (!temImagem(card)) return null;

  if (falhou) {
    return (
      <p className="flex items-center gap-1.5 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <ImageOff className="size-3.5" /> A imagem deste card não pôde ser carregada.
      </p>
    );
  }

  if (!url) {
    return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <img
      src={url}
      alt="Imagem de apoio da resposta do card"
      loading="lazy"
      className={className}
      onError={() => setFalhou(true)}
    />
  );
}
