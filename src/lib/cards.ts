import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CardProprio } from "./cards.functions";
import type { Questao } from "./ai.functions";

export type { CardProprio };

const KEY = "concurseiro:cards";
const BUCKET = "cards";

/** Cache local para abrir rápido e funcionar com internet instável. */
export function lerCards(): CardProprio[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const bruto = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(bruto) ? (bruto as CardProprio[]) : [];
  } catch {
    return [];
  }
}

export function salvarCardsLocal(cards: CardProprio[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event("cards:mudou"));
}

export function useCardsLocais() {
  const [cards, setCards] = useState<CardProprio[]>([]);

  useEffect(() => {
    const sync = () => setCards(lerCards());
    sync();
    window.addEventListener("cards:mudou", sync);
    return () => window.removeEventListener("cards:mudou", sync);
  }, []);

  return { cards, salvarCardsLocal };
}

export function cardVazio(): CardProprio {
  return {
    id: crypto.randomUUID(),
    pergunta: "",
    resposta: "",
    explicacao: "",
    materia: "",
    assunto: "",
    imagemUrl: "",
    imagemPath: "",
  };
}

/** Converte o card próprio em Questao para entrar no baralho e na repetição espaçada. */
export function cardParaQuestao(card: CardProprio): Questao {
  return {
    id: `card:${card.id}`,
    banca: "",
    grupo: "Conhecimento Geral",
    materia: card.materia || "Meus cards",
    ...(card.assunto ? { assunto: card.assunto } : {}),
    titulo: [card.materia || "Meu card", card.assunto].filter(Boolean).join(" · "),
    origem: "Card próprio",
    enunciado: card.pergunta,
    alternativas: [
      { letra: "A", texto: card.resposta, correta: true, explicacao: card.explicacao },
    ],
    explicacao: card.explicacao,
  } as Questao;
}

export function ehCardProprio(q: Questao) {
  return q.id.startsWith("card:");
}

/** Reduz a foto antes de enviar (celular gera arquivos grandes). */
async function comprimir(arquivo: File): Promise<Blob> {
  if (typeof document === "undefined") return arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo);
    const max = 1400;
    const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (escala === 1 && arquivo.size < 1_000_000) return arquivo;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? arquivo;
  } catch {
    return arquivo;
  }
}

/** Envia a imagem do card para o armazenamento privado do usuário. */
export async function enviarImagemDoCard(arquivo: File, userId: string) {
  const blob = await comprimir(arquivo);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function removerImagemDoCard(path: string) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/** URL temporária para exibir a imagem guardada no armazenamento privado. */
export async function urlDaImagem(card: CardProprio): Promise<string> {
  if (card.imagemPath) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(card.imagemPath, 60 * 60);
    if (data?.signedUrl) return data.signedUrl;
    return "";
  }
  return card.imagemUrl;
}

export function temImagem(card: CardProprio) {
  return Boolean(card.imagemPath || card.imagemUrl);
}
