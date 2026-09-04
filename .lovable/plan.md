# Formatação de texto: negrito e realce em amarelo, vermelho e azul

## Objetivo

Poder selecionar um trecho de texto em qualquer campo de escrita do app e aplicar
negrito ou realce nas cores amarela, vermelha e azul, com o resultado aparecendo
formatado na leitura.

## Como vai funcionar

1. **Barra de formatação acima de cada campo**
   - Botões: **N** (negrito), e três círculos coloridos (amarelo, vermelho, azul).
   - Você seleciona o trecho, clica no botão e a marcação é aplicada.
   - Clicar de novo no mesmo botão sobre um trecho já marcado remove a marcação.
   - Um botão "limpar formatação" remove marcas do trecho selecionado.
   - Atalhos de teclado: Ctrl/Cmd+B para negrito.

2. **Pré-visualização**
   - Abaixo do campo, um pequeno bloco "Prévia" mostra como o texto ficará
     formatado, usando as mesmas cores já usadas hoje no app.

3. **Onde aparece**
   - Cards: pergunta, resposta e explicação.
   - Questões: enunciado, alternativas e explicação (inclusão e edição).
   - Redação: título, introdução, parágrafos do desenvolvimento e conclusão.
   - Demais campos longos de texto do app (edital, análise de padrões, revisão)
     recebem a mesma barra.

4. **Leitura**
   - Onde o texto já é exibido, ele passa a mostrar negrito e realces em vez das
     marcas cruas. Textos antigos, sem marcação, continuam iguais.

## Detalhes técnicos

- `src/components/Marcado.tsx`: estender o parser para aceitar `{{negrito|...}}`
  além de `{{azul|...}}`, `{{vermelho|...}}`, `{{amarelo|...}}`, com suporte a
  aninhamento simples (negrito dentro de cor). Atualizar `LegendaCores`.
- Novo `src/lib/formatacao.ts`: funções puras
  `aplicarMarca(texto, inicio, fim, marca)`, `removerMarca`, `limparMarcas`,
  `temMarca` — operando sobre índices de seleção do textarea/input.
- Novo `src/components/CampoFormatado.tsx`: wrapper com `Textarea` (ou `Input`),
  barra de botões, controle de `selectionStart/End` via ref, reposicionamento do
  cursor após a edição e prévia opcional (`preview` prop) usando `Marcado`.
  Mantém a API de `value`/`onChange` para trocar 1:1 com os campos atuais.
- Substituir os `Textarea` de: `CardForm.tsx`, `questoes.tsx`, `redacao.tsx`,
  `inclusao.tsx`, `analise-padroes.tsx`, `EditalMaterias.tsx`, `revisao.tsx`.
- Onde esses textos são exibidos, garantir renderização via `<Marcado />`
  (cards no verso, enunciado/alternativas/explicação, blocos da redação).
- Persistência não muda: as marcas viajam dentro da própria string já salva no
  IndexedDB e no banco na nuvem.
- Nenhuma chamada de IA e nenhum crédito consumido.

## Resultado esperado

Em qualquer campo de escrita, selecionar uma palavra e clicar em N, amarelo,
vermelho ou azul aplica a formatação, visível na prévia e na leitura do card,
da questão ou da redação.
