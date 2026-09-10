import { useEffect, useRef } from "react";
import { CHAVES, carregarEstado, salvarEstado, type ChaveEstado } from "./sync.functions";
import { migrarAnexosParaNuvem } from "./anexos-store";

/**
 * Sincroniza o estado de estudo (acervo, revisão, leituras e trilha) entre o
 * aparelho e a nuvem. Os módulos continuam lendo/gravando no armazenamento
 * local; esta camada espelha tudo na conta do usuário e traz de volta em
 * qualquer aparelho.
 */
const MAPA: Record<ChaveEstado, { storage: string; evento: string }> = {
  acervo: { storage: "concurseiro:acervo", evento: "acervo:mudou" },
  revisao: { storage: "concurseiro:revisao", evento: "revisao:mudou" },
  leituras: { storage: "concurseiro:leituras", evento: "leituras:mudou" },
  trilha: { storage: "concurseiro:trilha", evento: "trilha:mudou" },
  edital: { storage: "concurseiro:edital", evento: "edital:mudou" },
};

function vazio(json: string | null) {
  if (!json) return true;
  const texto = json.trim();
  if (!texto || texto === "null" || texto === "{}" || texto === "[]") return true;
  try {
    const valor = JSON.parse(texto) as unknown;
    if (Array.isArray(valor)) return valor.length === 0;
    if (valor && typeof valor === "object") {
      return Object.values(valor).every(
        (v) =>
          v === null ||
          v === "" ||
          v === false ||
          (Array.isArray(v) && v.length === 0) ||
          (typeof v === "object" && v !== null && Object.keys(v).length === 0),
      );
    }
    return false;
  } catch {
    return false;
  }
}

export function SincronizaEstado() {
  const aplicando = useRef(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  useEffect(() => {
    let ativo = true;

    const push = async (chave: ChaveEstado) => {
      if (aplicando.current) return;
      const json = window.localStorage.getItem(MAPA[chave].storage) ?? "null";
      try {
        await salvarEstado({ data: { chave, json } });
      } catch (erro) {
        console.error("Falha ao salvar na nuvem", erro);
      }
    };

    const agendar = (chave: ChaveEstado) => {
      clearTimeout(timers.current[chave]);
      timers.current[chave] = setTimeout(() => void push(chave), 700);
    };

    const ouvintes = CHAVES.map((chave) => {
      const handler = () => agendar(chave);
      window.addEventListener(MAPA[chave].evento, handler);
      return { evento: MAPA[chave].evento, handler };
    });

    (async () => {
      try {
        const linhas = await carregarEstado({});
        if (!ativo) return;
        const nuvem = new Map(linhas.map((l) => [l.chave, l.json]));

        aplicando.current = true;
        for (const chave of CHAVES) {
          const remoto = nuvem.get(chave) ?? null;
          const local = window.localStorage.getItem(MAPA[chave].storage);
          if (!vazio(remoto)) {
            window.localStorage.setItem(MAPA[chave].storage, remoto!);
            window.dispatchEvent(new Event(MAPA[chave].evento));
          } else if (!vazio(local)) {
            // Primeira entrada: migra o que já existia no aparelho para a conta.
            await salvarEstado({ data: { chave, json: local! } });
          }
        }
      } catch (erro) {
        console.error("Falha ao carregar da nuvem", erro);
      } finally {
        aplicando.current = false;
      }
      // Textos integrais dos PDFs: sobem para a conta uma vez por aparelho.
      try {
        await migrarAnexosParaNuvem();
      } catch (erro) {
        console.error("Falha ao migrar os textos dos anexos", erro);
      }
    })();

    return () => {
      ativo = false;
      ouvintes.forEach(({ evento, handler }) => window.removeEventListener(evento, handler));
      Object.values(timers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  return null;
}

export function limparEstadoLocal() {
  for (const chave of CHAVES) {
    window.localStorage.removeItem(MAPA[chave].storage);
    window.dispatchEvent(new Event(MAPA[chave].evento));
  }
}
