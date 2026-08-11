# Por que a redação não foi gerada

## Causa confirmada

Os registros do servidor mostram que, nas suas tentativas de agora (13:31 a 13:36), o pedido saiu do app corretamente e a IA respondeu com **402 – Payment Required**: os créditos de IA do workspace acabaram (0 de 100 créditos do período; restam apenas 4 créditos do limite diário).

Ou seja: não é bug no estudo de caso nem no texto que você colou. Nenhuma chamada de IA (redação, questões, leis, análise de padrões) vai funcionar até os créditos serem renovados/adicionados em Configurações → Plans & credits.

Hoje, quando isso acontece, a tela mostra apenas "Não foi possível gerar a redação" (ou nada perceptível), então parece que o app travou.

## O que será feito no app

1. **Mensagem clara de crédito esgotado**
   - Traduzir o erro 402 para: "Os créditos de IA acabaram. Adicione créditos para continuar gerando." Erro 429 vira: "Muitas solicitações — tente novamente em instantes."
   - Aplicar em todas as telas que chamam a IA: Redação, Questões, Prova interativa, Revisão, Leis (resumo e texto integral), Análise de padrões e o simulado da aba Incluir.

2. **Preservar o que você escreveu**
   - O tema/estudo de caso continua no campo após a falha (já é o caso hoje, será garantido), com botão "Tentar novamente" no aviso.

3. **Aviso visível em vez de falha silenciosa**
   - Além do toast, um bloco de erro fixo na tela da redação, para não passar batido se o toast desaparecer.

## Detalhes técnicos

- Em `src/lib/ai-gateway.server.ts`: capturar o erro do gateway e relançar `Error` com mensagem por status (402, 429, demais), preservando o texto original para depuração.
- Em `src/lib/ai.functions.ts`: nenhuma mudança de contrato; os handlers apenas propagam a mensagem já tratada.
- Em `src/routes/_authenticated/redacao.tsx` (e nas outras telas de IA): guardar `mutation.error` e renderizar um bloco de alerta com a mensagem + botão de repetir.

Nada disso recria créditos — é para você saber na hora o que está acontecendo. Para voltar a gerar redações agora, é preciso adicionar créditos ao workspace.
