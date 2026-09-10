# Publicar o app com tudo salvo na nuvem

Hoje quase tudo já vai para a sua conta na nuvem (acervo, questões, revisão, leituras, trilha, edital e cards). Falta uma coisa: o **texto integral dos PDFs** (Vade Mecum, leis, provas, gramáticas, edital) ainda fica guardado só no aparelho. Se você abrir no celular ou no tablet, as leis aparecem na lista mas sem o texto ("sem texto lido — reanexe o PDF").

Então o trabalho é: subir esses textos para a nuvem e depois publicar.

## O que será feito

### 1. Textos dos PDFs na nuvem
- Cada texto anexado passa a ser gravado também na sua conta, dentro de um espaço privado só seu.
- Ao abrir o app em outro aparelho, o texto é baixado automaticamente na primeira vez que a lei for aberta, e fica em cache local para leitura rápida e offline.
- Renomear ou excluir uma lei também renomeia/apaga na nuvem, mantendo favoritos, trechos ocultos e o vínculo com a matéria do edital.
- O que já está no seu aparelho hoje é enviado para a conta automaticamente, uma vez, sem você precisar reanexar nada.

### 2. Publicar
- Verificação de segurança do projeto antes de publicar.
- Publicação no ar em uma URL pública `.lovable.app` (dá para renomear o endereço e depois ligar um domínio próprio).
- O login por e-mail e senha continua valendo: cada pessoa vê só os seus dados.

## Detalhes técnicos

- Bucket privado `anexos` (limite por arquivo ~50 MB), com políticas RLS em `storage.objects` restritas a `auth.uid()` como primeiro segmento do caminho: `anexos/<user_id>/<nome>.txt`.
- `src/lib/anexos-store.ts` ganha camada remota: `salvarTextoAnexo` grava no IndexedDB e faz upload; `lerTextoAnexo` tenta local e, se vazio, baixa da nuvem e recacheia; `removerTextoAnexo` remove nos dois.
- `renomearLei` em `src/lib/leis-salvar.ts` passa a mover o objeto na nuvem (copiar + remover).
- Migração única: ao entrar autenticado, `SincronizaEstado` envia os textos locais que ainda não existem na nuvem.
- Publicação via ferramenta de publish depois de `security--run_security_scan`.
