# Extrair e limpar no texto de leis

Hoje o campo "Texto de leis (Vade Mecum)" em Incluir só guarda o texto colado como contexto da IA — ele não vira lei consultável na aba Leis e o campo nunca é limpo. A leitura em "Texto Integral" só funciona com PDF anexado.

## Como vai funcionar

1. Ao lado do campo aparece o botão **Extrair e limpar** (sem IA, sem créditos).
2. O texto colado é lido pelo mesmo parser do Vade Mecum: reconhece lei/código, título, capítulo, seção e artigos.
3. As leis reconhecidas são salvas no sistema como um item de leis colado (ex.: "Texto colado — 29/08/2026"), aparecendo na lista de leis igual aos PDFs, com a contagem de artigos.
4. A caixa de texto é limpa automaticamente, com aviso do tipo "Lei X — 84 artigos salvos. Cole a próxima parte".
5. Se nada for reconhecido, o texto é mantido e aparece a dica de colar a partir de "LEI Nº ..." ou "Art. 1º".
6. Na aba **Leis → Texto Integral**, o item colado passa a ser selecionável como fonte, com sumário em árvore, busca, marcação de artigos e favoritos, exatamente como os PDFs.
7. Cada lei salva pode ser removida pelo ícone de lixeira, apagando também o texto guardado.

## Detalhes técnicos

- `src/routes/_authenticated/inclusao.tsx`: novo botão ao lado do textarea de leis; chama `lerVadeMecum` (de `src/lib/vademecum.ts`) para validar, grava o texto integral via `salvarTextoAnexo` e adiciona um `ArquivoAnexo` marcado com `marcarComoLei` em `acervo.provas` (nome com sufixo de data para não sobrescrever), depois `atualizar({ leis: "" })`.
- Nenhuma chamada de servidor nesse caminho; o texto integral fica no IndexedDB e só o trecho de contexto (`LIMITE_TRECHO_IA`) fica no acervo.
- `src/components/LeiIntegral.tsx` já lista `acervo.provas` filtrados por `ehAnexoDeLei` e lê o texto por `lerTextoAnexo`, então o item colado entra na seleção sem mudança de lógica; ajuste apenas do texto de ajuda ("PDF ou texto colado").
- Sem mudança de banco de dados.
