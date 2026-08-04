import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Chaves de estado guardadas na nuvem, uma linha por chave e por usuário. */
export const CHAVES = ["acervo", "revisao", "leituras", "trilha"] as const;
export type ChaveEstado = (typeof CHAVES)[number];

export const carregarEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("estado_estudo")
      .select("chave, dados, atualizado_em")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []) as { chave: string; dados: unknown; atualizado_em: string }[];
  });

export const salvarEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        chave: z.enum(CHAVES),
        dados: z.unknown(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("estado_estudo").upsert(
      {
        user_id: context.userId,
        chave: data.chave,
        dados: (data.dados ?? {}) as never,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "user_id,chave" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
