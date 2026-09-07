ALTER TABLE public.questoes_extraidas
  ADD COLUMN IF NOT EXISTS favorita boolean NOT NULL DEFAULT false;