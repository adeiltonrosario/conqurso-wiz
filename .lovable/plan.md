# Separação de matérias e tópicos sem gastar crédito

Hoje já existem dois caminhos na aba Incluir: "Extrair matérias com a IA" (gasta créditos) e "Extrair e limpar" (gratuito, roda no próprio aparelho). A separação por numeração que você pediu (MEDICINA LEGAL como matéria; 1, 1.1, 1.2… como tópicos) já funciona no caminho gratuito. O que falta é deixar isso claro e tornar o gratuito o caminho principal, para você não precisar gastar crédito.

## Como vai funcionar

1. **Caminho gratuito em destaque**: o botão "Extrair e limpar" passa a ser o botão principal, com texto mais claro: "Extrair matérias e tópicos (grátis)". Ele separa matéria e tópicos numerados sem usar IA.
2. **IA vira opção reserva**: o botão da IA fica discreto, com aviso de que consome créditos, para usar só quando o texto estiver tão bagunçado que o extrator gratuito não reconhecer nada.
3. **Aviso quando o gratuito não reconhecer**: se o extrator local não achar matérias, a mensagem sugere tentar a IA — em vez de parecer erro.
4. **Resultado idêntico**: nos dois caminhos o resultado vai para a mesma lista de matérias, cargos e tópicos do Detalhamento do Edital.

## Detalhes técnicos

- `src/components/EditalMaterias.tsx`: trocar a ordem e o destaque dos botões (extrator local vira o botão principal; IA vira `variant="outline"` com selo "usa créditos"); ajustar textos e dicas ao lado da caixa de texto.
- Nenhuma mudança no `edital-parser.ts` neste passo — a separação por numeração já está corrigida e testada com o exemplo de Medicina Legal (1 matéria, 21 tópicos).
- Sem mudança no banco de dados e sem custo de IA para a extração.
