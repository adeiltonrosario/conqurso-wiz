# Publicar o app com o acervo e os PDFs na nuvem

Hoje o acervo (questões, matérias, edital, revisão, leituras, trilha, cards) já é salvo na sua conta e volta em qualquer aparelho. O que **ainda fica só no aparelho** é o texto integral dos PDFs anexados (Vade Mecum, provas, gabaritos, gramáticas, edital). Se você publicar e abrir no celular ou no tablet, as leis e provas aparecem na lista, mas o conteúdo delas vem vazio.

Então, antes de publicar, os PDFs passam para a nuvem.

## O que será feito

### 1. PDFs guardados na sua conta
- Ao anexar um PDF, o texto extraído é enviado para um espaço privado da sua conta na nuvem (só você acessa).
- Ao abrir a leitura das leis, das provas ou do edital em qualquer aparelho, o texto é buscado da nuvem.
- O aparelho continua guardando uma cópia para abrir rápido e funcionar sem internet.
- Ao excluir um anexo, o arquivo também é apagado da nuvem.

### 2. Migração automática do que você já tem
Na primeira vez que você abrir depois da mudança, os PDFs que já estão neste aparelho sobem para a conta automaticamente, uma única vez. Nada se perde.

### 3. Publicar
Com isso pronto, publico o app: ele fica no ar numa URL pública `.lovable.app`, com login por e-mail e senha (e Google), e a opção de ligar um domínio próprio depois. As mudanças de banco valem na hora; mudanças de tela sobem quando você atualiza a publicação.

## Observações
- PDFs muito grandes (Vade Mecum inteiro) sobem sem problema: o limite por arquivo será de 25 MB de texto.
- Se a internet cair no meio do envio, aparece um aviso e o anexo continua funcionando neste aparelho até o próximo envio.

## Detalhes técnicos

- Novo bucket privado `anexos` (25MB por arquivo) via `storage_create_bucket`, com políticas RLS em `storage.objects` restritas a `auth.uid()::text = (storage.foldername(name))[1]`; caminho `{user_id}/{nome-do-anexo}.txt`.
- `src/lib/anexos-store.ts` mantém a mesma interface (`salvarTextoAnexo`, `lerTextoAnexo`, `removerTextoAnexo`) e passa a: gravar no IndexedDB (cache) + upload para o bucket; na leitura, tentar o IndexedDB e cair para download do bucket, populando o cache; no remover, apagar nos dois.
- Upload/download pelo cliente do navegador (`supabase.storage.from("anexos")`), sem server function — o bucket é privado e a RLS já isola por usuário.
- Migração única: `SincronizaEstado` (`src/lib/sync.ts`) ganha um passo que percorre os nomes de anexos do acervo (`gramatica`, `provas`, `edital`) e envia ao bucket os que existem no IndexedDB e não na nuvem, marcando conclusão em `localStorage`.
- Chamadas afetadas: `src/routes/_authenticated/inclusao.tsx` (linhas 113, 116, 188, 552, 618, 916) e `src/components/LeiIntegral.tsx` (linha 396) — sem mudança de assinatura, apenas passam a ser assíncronas onde já são.
- Depois: `security--run_security_scan` e publicação via `preview_ui--publish`.
