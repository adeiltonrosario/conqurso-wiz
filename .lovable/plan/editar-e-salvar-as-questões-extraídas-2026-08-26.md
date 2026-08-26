# Editar e salvar as questões extraídas

## O que muda

Cada questão vinda dos PDFs das provas ganha um botão **Editar** no cabeçalho do cartão. Ao clicar, o cartão entra em modo de edição:

- **Enunciado**: caixa de texto grande, editável.
- **Alternativas**: uma linha por letra (A–E ou Certo/Errado), texto editável; é possível **remover** uma alternativa e **adicionar** outra (as letras são renumeradas automaticamente).
- **Gabarito**: seletor de letra correta, dentro do mesmo formulário.
- **Explicação**: campo opcional para ajustar a explicação já existente.

Botões do modo edição: **Salvar** e **Cancelar**. Ao salvar:
- a questão é atualizada na tela e no aparelho;
- é gravada também na sua conta (banco na nuvem), então a correção vale em qualquer dispositivo e nas outras telas (Revisão, Prova interativa);
- aparece a confirmação "Questão salva".

Validações simples: enunciado não pode ficar vazio, pelo menos 2 alternativas com texto. Se algo faltar, o botão Salvar fica desativado com aviso curto.

Também vale para as questões da seção "Pendentes de classificação", que já têm o mesmo tipo de cartão — assim é possível padronizar enunciado/alternativas e ainda definir matéria/assunto.

## Detalhes técnicos

- `src/routes/_authenticated/questoes.tsx`: em `CartaoQuestao`, quando `onAtualizar` existe, adicionar estado `editando` e um rascunho local (`Questao`) com enunciado/alternativas/explicação. O modo edição substitui o bloco de enunciado + lista de alternativas por inputs (`Textarea`/`Input`) e mantém o seletor de gabarito existente (`definirGabarito` passa a operar no rascunho). Ao salvar, chamar `onAtualizar(rascunho normalizado)` — letras reatribuídas em sequência a partir de "A" quando o formato for múltipla escolha.
- O `onAtualizar` da página já grava em `acervo.extraidas` (linha ~357); estender esse handler para também chamar `salvarQuestoesExtraidas` (já importado e usado na página) com a questão editada, e invalidar a query `["questoes-extraidas"]` para refletir o banco.
- Nenhuma mudança de schema: `questoes_extraidas` já guarda enunciado, alternativas (JSON com `correta`) e explicação, e o upsert usa `onConflict: "user_id,id"`.
- Sem novas dependências e sem uso de IA.
