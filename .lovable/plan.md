# Separar corretamente matéria e tópicos numerados do edital

O texto informado será interpretado assim:

- **Matéria:** `MEDICINA LEGAL` — o texto antes dos primeiros dois-pontos.
- **Tópicos:** cada item iniciado por numeração, incluindo `1.`, `1.1.`, `2.`, `2.1.`, `5.1.`, `7.1.` e os demais.
- A numeração permanecerá visível no tópico salvo.
- Dois-pontos dentro de um tópico, como em `7. Aspectos...: 7.1. Violência sexual`, não criarão outra matéria.
- Ponto e vírgula dentro do conteúdo não dividirá o tópico; ele continuará pertencendo ao item numerado correspondente.

## Implementação

1. Ajustar a leitura local para reconhecer o primeiro cabeçalho terminado em `:` como matéria, mesmo quando matéria e tópicos estão no mesmo parágrafo.
2. Separar o restante pelo início de cada marcador numérico, aceitando formatos como `1.`, `1.1.`, `(1.2)`, `1.2)` e níveis maiores.
3. Impedir que itens de primeiro nível, como `1. Conceito` ou `2. Documentos`, sejam confundidos com novas matérias quando já existe uma matéria aberta.
4. Preservar frases completas, dois-pontos e ponto e vírgula dentro de cada tópico.
5. Validar com o exemplo completo de **MEDICINA LEGAL**, confirmando uma matéria e todos os itens numerados em tópicos separados, sem usar IA.

## Detalhes técnicos

A alteração ficará concentrada no extrator local do edital. O botão **Extrair e limpar**, a união com matérias já cadastradas e o armazenamento atual serão mantidos.
