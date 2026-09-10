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

/** Favorita ou desfavorita o artigo. Retorna true quando ficou favoritado. */
export function alternarFavorito(
  artigo: ArtigoIntegral,
  info: { lei: string; materia: string; capituloEdital: string },
) {
  const chave = chaveFavorito(info.lei, artigo);
  const atuais = lerFavoritos();
  if (atuais.some((f) => f.chave === chave)) {
    salvar(atuais.filter((f) => f.chave !== chave));
    return false;
  }
  const novo: ArtigoFavorito = {
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
  salvar([...atuais, novo]);
  return true;
}

/** Mantém os favoritos ao renomear a lei (a chave começa com o nome da lei). */
export function renomearLeiNosFavoritos(antigo: string, novo: string) {
  const a = antigo.trim().toLowerCase();
  const n = novo.trim().toLowerCase();
  if (!a || a === n) return;
  salvar(
    lerFavoritos().map((f) => {
      const daLei = f.chave.startsWith(`${a}|`) || f.lei.trim().toLowerCase() === a;
      if (!daLei) return f;
      const resto = f.chave.startsWith(`${a}|`) ? f.chave.slice(a.length + 1) : f.chave;
      return { ...f, lei: novo.trim(), chave: `${n}|${resto}` };
    }),
  );
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
