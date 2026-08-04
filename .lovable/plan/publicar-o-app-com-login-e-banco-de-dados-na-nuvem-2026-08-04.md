# Publicar o app com login e banco de dados na nuvem

Hoje tudo (acervo, histórico de revisão, leituras e trilha) é salvo apenas no navegador do aparelho: se você trocar de celular, limpar o navegador ou abrir no tablet, os dados não aparecem. Para publicar com usuário e senha e o banco atualizando sozinho, o app precisa de um backend.

## O que será feito

### 1. Ativar o Lovable Cloud
Banco de dados, autenticação e código de servidor embutidos — sem contas externas.

### 2. Login por e-mail e senha (+ Google)
- Tela `/auth` com cadastro, entrada e recuperação de senha.
- Página `/redefinir-senha` para criar nova senha.
- As telas de estudo passam a exigir login; visitante é levado para `/auth`.
- Cada usuário vê só os seus dados (isolamento no banco por usuário).

### 3. Banco de dados na nuvem, atualizado automaticamente
Quatro conjuntos de dados saem do aparelho e vão para o banco, gravando a cada ação (responder questão, ler lei, concluir tarefa, cadastrar questão):
- **Acervo**: questões cadastradas, leis, gramáticas, provas, edital.
- **Revisão espaçada**: histórico de acertos/erros e agendamento de cada questão.
- **Leituras de leis**: capítulos lidos e recortes de artigos selecionados.
- **Trilha**: cargo, banca, data da prova, tarefas do calendário e "onde parou".

Na primeira entrada, o que já existe no aparelho é migrado para a conta automaticamente, uma única vez. Assim celular e tablet ficam sincronizados.

### 4. Publicar
Depois disso, publicação pelo botão **Publish**: o app fica no ar em uma URL pública (`.lovable.app`), com opção de domínio próprio. Alterações de backend (banco) sobem na hora; alterações de tela sobem quando você clicar em atualizar no diálogo de publicação.

## Detalhes técnicos

- Migração SQL criando `perfis`, `acervo_itens`, `questoes_cadastradas`, `revisao_itens`, `leituras`, `trilha_objetivo`, `trilha_tarefas`, todas com `user_id`, GRANTs e RLS por `auth.uid()`.
- Rotas protegidas movidas para `src/routes/_authenticated/` (trilha, questões, prova, revisão, leis, inclusão, redação, análise); home e `/auth` públicas.
- `src/lib/acervo.ts`, `revisao.ts`, `leituras.ts` e `trilha.ts` mantêm a mesma interface, mas passam a ler/gravar via TanStack Query + server functions autenticadas, com fallback local enquanto carrega.
- Google habilitado via `configure_social_auth`; auto-confirmação de e-mail ligada para entrar direto após o cadastro (posso deixar a confirmação por e-mail se preferir).
