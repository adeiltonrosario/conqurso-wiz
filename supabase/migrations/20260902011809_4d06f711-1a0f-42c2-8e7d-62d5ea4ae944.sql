CREATE TABLE public.cards_estudo (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  pergunta text NOT NULL,
  resposta text NOT NULL,
  explicacao text,
  materia text,
  assunto text,
  imagem_url text,
  imagem_path text,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards_estudo TO authenticated;
GRANT ALL ON public.cards_estudo TO service_role;

ALTER TABLE public.cards_estudo ENABLE ROW LEVEL SECURITY;

CREATE POLICY cards_proprio ON public.cards_estudo
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER cards_estudo_atualizado_em
  BEFORE UPDATE ON public.cards_estudo
  FOR EACH ROW EXECUTE FUNCTION public.tocar_atualizado_em();

CREATE INDEX cards_estudo_user_idx ON public.cards_estudo (user_id, criado_em DESC);