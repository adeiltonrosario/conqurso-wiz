CREATE TABLE public.perfis (
  id UUID NOT NULL PRIMARY KEY,
  nome TEXT,
  email TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO authenticated;
GRANT ALL ON public.perfis TO service_role;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfis_proprio" ON public.perfis FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.estado_estudo (
  user_id UUID NOT NULL,
  chave TEXT NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chave)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estado_estudo TO authenticated;
GRANT ALL ON public.estado_estudo TO service_role;
ALTER TABLE public.estado_estudo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estado_proprio" ON public.estado_estudo FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tocar_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER perfis_atualizado_em BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.tocar_atualizado_em();
CREATE TRIGGER estado_atualizado_em BEFORE UPDATE ON public.estado_estudo
  FOR EACH ROW EXECUTE FUNCTION public.tocar_atualizado_em();

CREATE OR REPLACE FUNCTION public.criar_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER criar_perfil_ao_cadastrar
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.criar_perfil();