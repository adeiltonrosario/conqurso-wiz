/**
 * Armazenamento do texto integral dos PDFs anexados.
 * O localStorage não aguenta um Vade Mecum inteiro, então o texto vai para o IndexedDB.
 */
const DB = "concurseiro-anexos";
const STORE = "textos";

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

export async function salvarTextoAnexo(nome: string, texto: string) {
  await transacao("readwrite", (store) => store.put(texto, nome));
}

export async function lerTextoAnexo(nome: string): Promise<string> {
  const texto = await transacao<string>("readonly", (store) => store.get(nome));
  return typeof texto === "string" ? texto : "";
}

export async function removerTextoAnexo(nome: string) {
  await transacao("readwrite", (store) => store.delete(nome));
}
