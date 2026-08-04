import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Chaves de estado guardadas na nuvem, uma linha por chave e por usuário. */
export const CHAVES = ["acervo", "revisao", "leituras", "trilha"] as const;
export type ChaveEstado = (typeof CHAVES)[number];

/** Os dados trafegam como texto JSON para atravessar o RPC sem perda de tipo. */
export const carregarEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("estado_estudo")
      .select("chave, dados")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((linha) => ({
      chave: String(linha.chave),
      json: JSON.stringify(linha.dados ?? null),
    }));
  });

export const salvarEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        chave: z.enum(CHAVES),
        json: z.string().max(4_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    let dados: unknown;
    try {
      dados = JSON.parse(data.json);
    } catch {
      throw new Error("Conteúdo inválido");
    }
    const { error } = await context.supabase.from("estado_estudo").upsert(
      {
        user_id: context.userId,
        chave: data.chave,
        dados: dados as never,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "user_id,chave" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
