CREATE TABLE public.questoes_extraidas (
  user_id uuid NOT NULL,
  id text NOT NULL,
  prova text,
  numero integer,
  banca text,
  grupo text,
  materia text,
  assunto text,
  enunciado text NOT NULL,
  alternativas jsonb NOT NULL DEFAULT '[]'::jsonb,
  explicacao text,
  origem text,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questoes_extraidas TO authenticated;
GRANT ALL ON public.questoes_extraidas TO service_role;

ALTER TABLE public.questoes_extraidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY questoes_extraidas_proprio ON public.questoes_extraidas
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER questoes_extraidas_atualizado_em
  BEFORE UPDATE ON public.questoes_extraidas
  FOR EACH ROW EXECUTE FUNCTION public.tocar_atualizado_em();

CREATE INDEX questoes_extraidas_materia_idx ON public.questoes_extraidas (user_id, materia);
