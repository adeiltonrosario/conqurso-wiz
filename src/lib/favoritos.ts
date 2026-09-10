import { useEffect, useState } from "react";
import type { ArtigoIntegral } from "./ai.functions";

/**
 * Artigos favoritados (estrela) na aba Leis: ficam salvos no aparelho e podem
 * ser lidos depois sem carregar o PDF nem gastar IA.
 */
export type ArtigoFavorito = {
  chave: string;
  lei: string;
  referencia: string;
  texto: string;
  paragrafos: string[];
  titulo: string;
  capitulo_lei: string;
  secao: string;
  materia: string;
  capituloEdital: string;
  salvoEm: number;
};

const KEY = "concurseiro:favoritos";
const EVENTO = "favoritos:mudou";

/** Hash curto e estável do texto, para não duplicar o mesmo artigo entre PDFs. */
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function chaveFavorito(lei: string, artigo: ArtigoIntegral) {
  return `${lei.trim().toLowerCase()}|${artigo.referencia.trim().toLowerCase()}|${hash(
    artigo.texto.slice(0, 400),
  )}`;
}

export function lerFavoritos(): ArtigoFavorito[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const lista = raw ? (JSON.parse(raw) as ArtigoFavorito[]) : [];
    return Array.isArray(lista) ? lista.filter((f) => f && typeof f.chave === "string") : [];
  } catch {
    return [];
  }
}

function salvar(favoritos: ArtigoFavorito[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(favoritos.slice(0, 2000)));
  window.dispatchEvent(new Event(EVENTO));
}

type InfoFavorito = { lei: string; materia: string; capituloEdital: string };

function montar(artigo: ArtigoIntegral, info: InfoFavorito, chave: string): ArtigoFavorito {
  return {
    chave,
    lei: info.lei || "Legislação anexada",
    referencia: artigo.referencia,
    texto: artigo.texto,
    paragrafos: artigo.paragrafos ?? [],
    titulo: artigo.titulo?.trim() ?? "",
    capitulo_lei: artigo.capitulo_lei?.trim() ?? "",
    secao: artigo.secao?.trim() ?? "",
    materia: info.materia,
    capituloEdital: info.capituloEdital,
    salvoEm: Date.now(),
  };
}

/**
 * Favorita vários artigos de uma vez (leitura completa da lei), sem repetir o
 * que já estava favoritado. Devolve as chaves realmente incluídas.
 */
export function favoritarArtigos(artigos: ArtigoIntegral[], info: InfoFavorito): string[] {
  const atuais = lerFavoritos();
  const existentes = new Set(atuais.map((f) => f.chave));
  const novos: ArtigoFavorito[] = [];
  for (const artigo of artigos) {
    const chave = chaveFavorito(info.lei, artigo);
    if (existentes.has(chave)) continue;
    existentes.add(chave);
    novos.push(montar(artigo, info, chave));
  }
  if (novos.length) salvar([...atuais, ...novos]);
  return novos.map((n) => n.chave);
}

/** Remove um conjunto de favoritos pelas chaves (usado pelo "Desfazer"). */
export function desfavoritarArtigos(chaves: string[]) {
  if (!chaves.length) return;
  const fora = new Set(chaves);
  salvar(lerFavoritos().filter((f) => !fora.has(f.chave)));
}

/** Favorita ou desfavorita o artigo. Retorna true quando ficou favoritado. */
export function alternarFavorito(artigo: ArtigoIntegral, info: InfoFavorito) {
  const chave = chaveFavorito(info.lei, artigo);
  if (lerFavoritos().some((f) => f.chave === chave)) {
    desfavoritarArtigos([chave]);
    return false;
  }
  favoritarArtigos([artigo], info);
  return true;
}

export function removerFavorito(chave: string) {
  salvar(lerFavoritos().filter((f) => f.chave !== chave));
}

export function limparFavoritos() {
  salvar([]);
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<ArtigoFavorito[]>([]);

  useEffect(() => {
    const sync = () => setFavoritos(lerFavoritos());
    sync();
    window.addEventListener(EVENTO, sync);
    return () => window.removeEventListener(EVENTO, sync);
  }, []);

  return { favoritos };
}

/** Número do artigo, para ordenar a leitura dos favoritos. */
function numero(f: ArtigoFavorito) {
  const m = /(\d+)/.exec(f.referencia);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export type GrupoFavoritos = {
  lei: string;
  titulo: string;
  capitulo: string;
  secao: string;
  itens: ArtigoFavorito[];
};

/** Agrupa os favoritos por lei → título → capítulo → seção, em ordem de artigo. */
export function agruparFavoritos(favoritos: ArtigoFavorito[]): GrupoFavoritos[] {
  const grupos: GrupoFavoritos[] = [];
  for (const f of [...favoritos].sort(
    (a, b) => a.lei.localeCompare(b.lei) || numero(a) - numero(b),
  )) {
    const chave = `${f.lei}|${f.titulo}|${f.capitulo_lei}|${f.secao}`;
    let grupo = grupos.find(
      (g) => `${g.lei}|${g.titulo}|${g.capitulo}|${g.secao}` === chave,
    );
    if (!grupo) {
      grupo = { lei: f.lei, titulo: f.titulo, capitulo: f.capitulo_lei, secao: f.secao, itens: [] };
      grupos.push(grupo);
    }
    grupo.itens.push(f);
  }
  return grupos;
}

/** Trecho no formato usado pela geração de questões ("Art. X — texto"). */
export function trechoDoFavorito(f: ArtigoFavorito) {
  return `${f.referencia} — ${f.texto}`;
}
