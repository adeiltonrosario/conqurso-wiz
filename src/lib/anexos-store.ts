/**
 * Armazenamento do texto integral dos PDFs anexados.
 * O localStorage não aguenta um Vade Mecum inteiro, então o texto fica no
 * IndexedDB (cache do aparelho) e é espelhado no espaço privado do usuário na
 * nuvem, para abrir em qualquer celular ou tablet.
 */
import { supabase } from "@/integrations/supabase/client";

const DB = "concurseiro-anexos";
const STORE = "textos";
const BUCKET = "anexos";

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB indisponível"));
  });
}

async function transacao<T>(modo: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return null;
  try {
    const db = await abrir();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, modo);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error ?? new Error("Falha no IndexedDB"));
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/** Nomes de lei têm acentos e pontuação; o caminho na nuvem usa base64url. */
function codificar(nome: string) {
  const bytes = new TextEncoder().encode(nome);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function usuario(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

async function caminho(nome: string) {
  const uid = await usuario();
  return uid ? `${uid}/${codificar(nome)}.txt` : null;
}

async function enviarParaNuvem(nome: string, texto: string) {
  const path = await caminho(nome);
  if (!path) return;
  try {
    await supabase.storage
      .from(BUCKET)
      .upload(path, new Blob([texto], { type: "text/plain; charset=utf-8" }), {
        contentType: "text/plain; charset=utf-8",
        upsert: true,
      });
  } catch (erro) {
    console.error("Falha ao enviar o texto do anexo para a nuvem", erro);
  }
}

async function baixarDaNuvem(nome: string): Promise<string> {
  const path = await caminho(nome);
  if (!path) return "";
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) return "";
    return await data.text();
  } catch {
    return "";
  }
}

export async function salvarTextoAnexo(nome: string, texto: string) {
  await transacao("readwrite", (store) => store.put(texto, nome));
  await enviarParaNuvem(nome, texto);
}

/** Lê do aparelho; se não houver, busca na nuvem e guarda em cache local. */
export async function lerTextoAnexo(nome: string): Promise<string> {
  const local = await transacao<string>("readonly", (store) => store.get(nome));
  if (typeof local === "string" && local) return local;
  const remoto = await baixarDaNuvem(nome);
  if (remoto) await transacao("readwrite", (store) => store.put(remoto, nome));
  return remoto;
}

export async function removerTextoAnexo(nome: string) {
  await transacao("readwrite", (store) => store.delete(nome));
  const path = await caminho(nome);
  if (path) {
    try {
      await supabase.storage.from(BUCKET).remove([path]);
    } catch {
      /* remoção na nuvem é melhor esforço */
    }
  }
}

/** Nomes com texto guardado neste aparelho. */
export async function nomesLocais(): Promise<string[]> {
  const chaves = await transacao<IDBValidKey[]>("readonly", (store) => store.getAllKeys());
  return (chaves ?? []).filter((c): c is string => typeof c === "string");
}

/**
 * Migração única por aparelho: envia para a conta os textos que só existem
 * localmente, sem precisar reanexar nenhum PDF.
 */
export async function migrarAnexosParaNuvem() {
  const uid = await usuario();
  if (!uid) return;
  let remotos = new Set<string>();
  try {
    const { data } = await supabase.storage.from(BUCKET).list(uid, { limit: 1000 });
    remotos = new Set((data ?? []).map((f) => f.name));
  } catch {
    return;
  }
  for (const nome of await nomesLocais()) {
    if (remotos.has(`${codificar(nome)}.txt`)) continue;
    const texto = await transacao<string>("readonly", (store) => store.get(nome));
    if (typeof texto === "string" && texto) await enviarParaNuvem(nome, texto);
  }
}
