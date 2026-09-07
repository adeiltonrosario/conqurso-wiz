# Excluir e favoritar questões

Hoje cada questão das suas provas só tem o botão **Editar**. Passa a ter também **Excluir** e **★ Favoritar**, para você montar um estudo direcionado.

## O que muda

**1. Excluir questão**
- No cabeçalho do cartão, ao lado de Editar, um botão de lixeira.
- Pede confirmação ("Excluir esta questão?") e, ao confirmar, a questão sai da tela, do aparelho e da sua conta (vale em qualquer dispositivo).
- Aviso curto de confirmação, com opção de **Desfazer** por alguns segundos.
- Também funciona nos cartões da seção "Pendentes de classificação".

**2. Favoritar questão (★)**
- Estrela no cabeçalho do cartão: um toque favorita, outro desfavorita.
- Novo filtro no topo da lista: **Todas** / **★ Só favoritas**, com a contagem de favoritas.
- O favorito acompanha a conta (salvo junto com a questão), então continua marcado em outro aparelho.
- Questões favoritas aparecem primeiro quando o filtro está em "Todas"? Não — a ordem atual é mantida; a estrela serve para filtrar.

**3. Estudo direcionado**
- Com "★ Só favoritas" ligado, os filtros de matéria e assunto continuam valendo, e a prova/simulado montado sem IA pode usar apenas as favoritas quando o filtro estiver ativo.

## Detalhes técnicos

- `src/lib/ai.functions.ts` (tipo `Questao`): novo campo opcional `favorita?: boolean`.
- Banco: migração adicionando `favorita boolean not null default false` em `public.questoes_extraidas` (tabela já existe com RLS e grants); `paraLinha`/`paraQuestao` em `src/lib/questoes-banco.functions.ts` passam a ler/gravar o campo.
- Nova server fn `removerQuestao` em `src/lib/questoes-banco.functions.ts` (`.middleware([requireSupabaseAuth])`, delete por `user_id` + `id`), ao lado da já existente `removerQuestoesDaProva`.
- `src/routes/_authenticated/questoes.tsx`:
  - `CartaoQuestao` recebe `onExcluir?` e `onFavoritar?`; botões `Trash2` e `Star` no cabeçalho, junto ao Editar.
  - `excluirExtraida(id)`: remove de `acervo.extraidas` (localStorage) e chama `removerQuestao`, invalidando `["questoes-extraidas"]`; toast com ação Desfazer que regrava via `salvarQuestoesExtraidas`.
  - `favoritar(q)`: reaproveita `atualizarExtraida` com `{ ...q, favorita: !q.favorita }`.
  - Estado `soFavoritas` e filtro aplicado sobre `doPdf` antes de renderizar; chips "Todas / ★ Só favoritas (n)".
  - A sincronização com a nuvem (`useEffect` sobre `banco.data`) passa a preferir a versão da nuvem quando a questão foi excluída, evitando que o item apagado volte.
- Sem IA e sem novas dependências.
