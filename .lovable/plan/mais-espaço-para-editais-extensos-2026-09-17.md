# Mais espaço para editais extensos

Hoje, na aba Incluir, o local onde você cola o conteúdo programático e o campo onde digita um tópico são pequenos e cortam o conteúdo no meio. Verificado no código:

- a caixa de cola do edital tem 5 linhas de altura e corta o texto em 40.000 caracteres;
- a IA lê só os primeiros 30.000 caracteres do que foi colado — o resto é ignorado sem aviso;
- na extração local ("Extrair e limpar"), tópicos com mais de 240 caracteres são descartados;
- o campo "Adicionar tópico do edital" aceita no máximo 200 caracteres em uma única linha;
- na análise de relevância, matérias além da 40ª e tópicos além do 120º por matéria ficam de fora.

## Como vai funcionar

1. **Caixa maior que cresce sozinha**: o campo do conteúdo programático passa a abrir com bem mais linhas e vai aumentando conforme você cola, com contador de caracteres e o aviso de que dá para colar em partes (cada parte é somada às anteriores).
2. **Limite muito maior**: o texto aceita até 500.000 caracteres (antes 40.000).
3. **IA lê o edital inteiro**: textos longos são divididos em blocos e lidos um a um, com progresso ("Lendo parte 2 de 4…") e o resultado final unificado. Nada fica de fora silenciosamente.
4. **Extração local não descarta mais nada**: tópicos e nomes de matéria de qualquer tamanho são aproveitados (é o caminho gratuito, que funciona para editais do tamanho que forem).
5. **Tópico em várias linhas**: o campo de tópico vira uma caixa que cresce conforme o texto, aceita até 1.000 caracteres e permite incluir vários tópicos de uma vez (um por linha, ou separados por ";").
6. **Relevância cobre o edital todo**: os limites de matérias e tópicos na análise de relevância são ampliados.
7. **Tópicos longos aparecem por inteiro**, quebrando linha no celular em vez de cortar ou estourar a tela — tanto na lista de matérias quanto na tabela do Detalhamento.
8. **Aviso claro se faltar espaço** no aparelho, em vez de falha silenciosa ao salvar.

## Detalhes técnicos

- `src/components/EditalMaterias.tsx`: caixa de texto com altura mínima maior e auto-ajuste (`rows`/`min-h` + crescimento), contador de caracteres, limite de 40.000 para 500.000; campo de tópico multilinha com auto-ajuste, limite de 200 para 1.000 caracteres e inclusão em lote (linhas ou ";"); pills de tópicos com quebra de linha.
- `src/lib/edital-parser.ts`: remover o filtro que descarta tópicos com mais de 240 caracteres e ampliar o reconhecimento de nomes de matéria (80 → 160 caracteres).
- `src/lib/ai.functions.ts`: `extrairMateriasEdital` passa a aceitar até 500.000 caracteres e o servidor divide o texto em blocos de até 30.000 caracteres por linha, chamando a IA por bloco e mesclando matérias, cargos e bancas (sem duplicar). `estimarRelevanciaEdital` amplia os limites (matérias 40 → 200, tópicos por matéria 120 → 400).
- `src/components/EditalRelevancia.tsx`: remover o `topicos.slice(0, 120)` e permitir quebra de linha na coluna "Assunto analisado".
- `src/lib/edital.ts`: gravação no armazenamento do aparelho protegida contra falta de espaço, com mensagem compreensível.
- Observação de custo: a leitura do edital pela IA consome créditos por bloco lido; a extração local continua gratuita e sem limite prático de tamanho.
- Sem mudança no banco de dados: o edital continua sincronizando pelo canal atual (que suporta até 4 milhões de caracteres, bem acima do novo limite).
