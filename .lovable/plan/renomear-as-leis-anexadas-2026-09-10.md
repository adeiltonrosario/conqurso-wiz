# Renomear as leis anexadas

Hoje o nome da lei salva só pode ser trocado apagando e buscando/anexando de novo — e isso faz perder marcações. Passa a existir um botão de renomear em cada lei da lista.

## Como vai funcionar

1. Na tela **Incluir**, na lista de leis anexadas (PDF, texto colado ou lei baixada por link), cada item ganha um ícone de lápis ao lado da lixeira.
2. Ao tocar, o nome vira um campo editável com o nome atual; você corrige e confirma (Enter ou botão de salvar), ou cancela com Esc.
3. O novo nome vale em todo o app: na lista de Incluir, na seleção "Lei salva" em **Leis → Texto Integral** e no selo "desta matéria".
4. As marcações continuam valendo depois de renomear: artigos favoritos, trechos ocultos e artigos marcados seguem ligados à mesma lei.
5. Se o link daquela lei estiver cadastrado numa matéria do Detalhamento do edital, o vínculo é atualizado — buscar o texto de novo continua atualizando a mesma lei, sem criar cópia.
6. Nome vazio ou já usado por outra lei salva não é aceito, com aviso curto na tela.

## Detalhes técnicos

- Novo helper `renomearLei(antigo, novo)` em `src/lib/leis-salvar.ts`:
  - valida nome não vazio e sem colisão com outro anexo de lei em `acervo.provas`;
  - renomeia o item em `acervo.provas` (`marcarComoLei(novo)`) e grava com `salvarAcervo`;
  - move o texto no IndexedDB: `lerTextoAnexo(antigo)` → `salvarTextoAnexo(novo, texto)` → `removerTextoAnexo(antigo)`;
  - migra as chaves por lei em `src/lib/favoritos.ts`, `src/lib/ocultos.ts` e `src/lib/leituras.ts`/marcados (o que estiver chaveado pelo nome da lei), preservando favoritos, trechos ocultos e artigos marcados;
  - atualiza `LinkLei.anexo` em todas as matérias de `src/lib/edital.ts` cujo `anexo === antigo`, via `atualizarMateria`.
- `src/routes/_authenticated/inclusao.tsx`: na lista de anexos de lei (`IncluirArquivos`/bloco de leis), estado local `editando`/`rascunho`, ícone `Pencil`, input inline, Enter salva, Esc cancela; chama `renomearLei` e mostra erro em `sonner` quando inválido.
- Sem IA, sem migração de banco, sem novas dependências.
