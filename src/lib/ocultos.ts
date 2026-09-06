import { useEffect, useState } from "react";
import type { ArtigoIntegral } from "./ai.functions";
import { chaveFavorito } from "./favoritos";

/**
 * Trechos que o candidato escondeu na leitura das leis: artigos inteiros,
 * parágrafos/incisos e pedaços de texto selecionados. Fica só no aparelho.
 */
export type Ocultos = {
  artigos: string[];
  paragrafos: string[];
  trechos: { chave: string; texto: string }[];
};

const KEY = "concurseiro:ocultos";
const EVENTO = "ocultos:mudou";

const VAZIO: Ocultos = { artigos: [], paragrafos: [], trechos: [] };

export const chaveArtigo = (lei: string, artigo: ArtigoIntegral) => chaveFavorito(lei, artigo);
export const chaveParagrafo = (chave: string, i: number) => `${chave}|p:${i}`;

/** Normaliza espaços para comparar o trecho selecionado com o texto renderizado. */
export const normalizarTrecho = (s: string) => s.replace(/\s+/g, " ").trim();

export function lerOcultos(): Ocultos {
  if (typeof window === "undefined") return VAZIO;
  try {
    const raw = window.localStorage.getItem(KEY);
    const o = raw ? (JSON.parse(raw) as Partial<Ocultos>) : null;
    return {
      artigos: Array.isArray(o?.artigos) ? o!.artigos.filter((c) => typeof c === "string") : [],
      paragrafos: Array.isArray(o?.paragrafos)
        ? o!.paragrafos.filter((c) => typeof c === "string")
        : [],
      trechos: Array.isArray(o?.trechos)
        ? o!.trechos.filter((t) => t && typeof t.chave === "string" && typeof t.texto === "string")
        : [],
    };
  } catch {
    return VAZIO;
  }
}

function salvar(o: Ocultos) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      artigos: o.artigos.slice(0, 5000),
      paragrafos: o.paragrafos.slice(0, 20000),
      trechos: o.trechos.slice(0, 5000),
    }),
  );
  window.dispatchEvent(new Event(EVENTO));
}

/** Esconde ou reexibe o artigo inteiro. Retorna true quando ficou oculto. */
export function alternarArtigoOculto(chave: string) {
  const o = lerOcultos();
  if (o.artigos.includes(chave)) {
    salvar({ ...o, artigos: o.artigos.filter((c) => c !== chave) });
    return false;
  }
  salvar({ ...o, artigos: [...o.artigos, chave] });
  return true;
}

/** Esconde ou reexibe um parágrafo/inciso/alínea do artigo. */
export function alternarParagrafoOculto(chave: string) {
  const o = lerOcultos();
  if (o.paragrafos.includes(chave)) {
    salvar({ ...o, paragrafos: o.paragrafos.filter((c) => c !== chave) });
    return false;
  }
  salvar({ ...o, paragrafos: [...o.paragrafos, chave] });
  return true;
}

/** Esconde um pedaço de texto selecionado dentro de um artigo. */
export function ocultarTrecho(chave: string, texto: string) {
  const limpo = normalizarTrecho(texto);
  if (limpo.length < 2) return false;
  const o = lerOcultos();
  if (o.trechos.some((t) => t.chave === chave && t.texto === limpo)) return false;
  salvar({ ...o, trechos: [...o.trechos, { chave, texto: limpo }] });
  return true;
}

export function reexibirTrecho(chave: string, texto: string) {
  const o = lerOcultos();
  salvar({ ...o, trechos: o.trechos.filter((t) => !(t.chave === chave && t.texto === texto)) });
}

/** Reexibe tudo (ou apenas o que pertence a uma lei, pelo prefixo da chave). */
export function reexibirTudo(prefixo?: string) {
  if (!prefixo) return salvar(VAZIO);
  const p = prefixo.trim().toLowerCase();
  const dentro = (c: string) => c.startsWith(`${p}|`);
  const o = lerOcultos();
  salvar({
    artigos: o.artigos.filter((c) => !dentro(c)),
    paragrafos: o.paragrafos.filter((c) => !dentro(c)),
    trechos: o.trechos.filter((t) => !dentro(t.chave)),
  });
}

export function useOcultos() {
  const [ocultos, setOcultos] = useState<Ocultos>(VAZIO);

  useEffect(() => {
    const sync = () => setOcultos(lerOcultos());
    sync();
    window.addEventListener(EVENTO, sync);
    return () => window.removeEventListener(EVENTO, sync);
  }, []);

  return { ocultos };
}
