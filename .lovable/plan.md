# Cards próprios: pergunta, resposta e imagem

## O que muda na tela Cards

A aba **Cards** ganha duas seções:

1. **Meus cards** — cards criados por você, com botão **Novo card**.
2. **Revisar** — o baralho atual, agora misturando as questões do acervo/PDFs com os seus cards próprios; o filtro por matéria continua funcionando.

### Criar um card

Formulário simples:
- **Pergunta** (frente) — texto obrigatório.
- **Resposta** (verso) — texto obrigatório.
- **Explicação/observação** — opcional.
- **Matéria** — escolhida entre as matérias do edital ativo (ou digitada livremente quando não houver detalhamento).
- **Imagem da resposta** — duas formas: enviar uma foto/print do aparelho ou colar o link de uma imagem. Mostra miniatura antes de salvar.

Botões: **Salvar card** e **Cancelar**. Cada card salvo aparece na lista com pergunta, matéria, miniatura (se tiver imagem) e ações **Editar** e **Excluir**.

### Ao revisar

O card mostra só a pergunta. Ao tocar para virar, aparecem a resposta, a explicação e **a imagem**, em tamanho confortável para o celular e ampliável ao toque. Os botões "Errei"/"Acertei" continuam alimentando a repetição espaçada, igual aos cards de questões.

Se a imagem não carregar (link removido, por exemplo), o card mostra um aviso discreto no lugar da foto — nunca uma tela quebrada.

## Onde fica salvo

Cards e imagens ficam salvos na sua conta, na nuvem, e aparecem em qualquer aparelho depois do login. A lista também é guardada no aparelho para abrir rápido e funcionar mesmo com internet instável.

## Detalhes técnicos

**Banco (migração nova)**
- Tabela `public.cards_estudo`: `id uuid pk`, `user_id uuid not null`, `pergunta text not null`, `resposta text not null`, `explicacao text`, `materia text`, `assunto text`, `imagem_url text`, `imagem_path text`, `criado_em`, `atualizado_em` (trigger `tocar_atualizado_em` já existente).
- GRANTs: `SELECT, INSERT, UPDATE, DELETE` para `authenticated`; `ALL` para `service_role` (sem `anon`).
- RLS habilitada com política única `cards_proprio ALL` usando/checando `auth.uid() = user_id`, no mesmo padrão de `questoes_extraidas`.
- Bucket de storage `cards` (privado), com políticas em `storage.objects` restritas ao prefixo `auth.uid()/…` para select/insert/update/delete do próprio usuário. Upload feito pelo client (`supabase.storage`) e leitura via URL assinada renovada ao exibir.

**Código**
- `src/lib/cards.functions.ts` (novo): `listarCards`, `salvarCard`, `removerCard` com `createServerFn` + `requireSupabaseAuth`, seguindo o formato de `src/lib/questoes-banco.functions.ts`.
- `src/lib/cards.ts` (novo): tipo `CardProprio`, cache em `localStorage` (`concurseiro:cards`) com hook `useCards` no mesmo padrão de `src/lib/acervo.ts`, e conversão `cardParaQuestao` para o baralho de revisão (alternativa única marcada como correta, `explicacao` com o texto de apoio) — assim `registrarResposta` e a repetição espaçada funcionam sem alteração.
- `src/components/CardForm.tsx` (novo): formulário de criação/edição, upload (`input[type=file]` com validação de tipo e limite ~5 MB, compressão simples via canvas quando maior) ou campo de link, miniatura e validações.
- `src/routes/_authenticated/flashcards.tsx`: adiciona as seções "Meus cards" e o formulário, injeta os cards próprios no baralho junto de `bancoLocal`, e exibe imagem + resposta no verso do cartão. Usa `useQuery(["cards"])` com `useServerFn` e invalidação após salvar/excluir.
- Sem novas dependências e sem uso de IA.
