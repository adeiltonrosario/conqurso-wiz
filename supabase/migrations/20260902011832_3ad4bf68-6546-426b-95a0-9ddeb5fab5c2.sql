CREATE POLICY cards_imagens_ler ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY cards_imagens_inserir ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY cards_imagens_atualizar ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY cards_imagens_apagar ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);