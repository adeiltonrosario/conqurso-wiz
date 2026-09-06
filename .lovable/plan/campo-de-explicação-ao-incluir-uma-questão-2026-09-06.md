# Campo de explicação ao incluir uma questão

## O que muda

No formulário **Incluir → Nova questão**, passa a existir um campo **Explicação (opcional)**, logo abaixo das alternativas/gabarito:

- Caixa de texto com a barra de formatação (negrito e realce amarelo/vermelho/azul), igual aos demais campos.
- Você escreve a explicação antes de salvar; ela fica gravada junto com a questão, no aparelho e na nuvem.
- Ao salvar, o campo é limpo junto com o restante do formulário.
- Na aba **Questões**, o cartão da questão cadastrada exibe a explicação salva (com a formatação), e ela também aparece no modo de edição do cartão para ajustes posteriores.
- Campo opcional: deixar em branco não impede salvar, e questões antigas sem explicação continuam funcionando.

## Detalhes técnicos

- `src/lib/acervo.ts`: adicionar `explicacao?: string` ao tipo `QuestaoCadastrada` (opcional, sem migração necessária).
- `src/routes/_authenticated/inclusao.tsx`: novo estado `explicacao`, componente `CampoFormatado` abaixo do seletor de gabarito; incluir `explicacao.trim()` no objeto `nova` ao salvar e limpar o estado após salvar.
- `src/routes/_authenticated/questoes.tsx`: na conversão de `QuestaoCadastrada` para o cartão (acervo), carregar `explicacao` quando existir e exibi-la via `<Marcado />`; no modo de edição, o campo já existente de explicação passa a vir preenchido.
- Sem mudança de schema no banco (explicação viaja dentro do JSON da questão) e sem uso de IA.
