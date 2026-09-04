# Colar a questão inteira e o sistema separar os campos

Sim, dá para fazer sem IA e sem gastar créditos. Você cola o texto todo (enunciado + alternativas + gabarito, se houver) no campo Enunciado e o sistema separa automaticamente.

## Como vai funcionar

1. No bloco **Nova questão**, o campo Enunciado ganha o aviso "Cole a questão inteira — as alternativas vão para os campos certos" e um botão **Separar enunciado e alternativas**.
2. Ao colar um texto que já traga marcações de alternativa (A), B., c) , (D), "Alternativa E -"), a separação roda na hora, sem precisar clicar:
   - o trecho antes da primeira alternativa fica no Enunciado;
   - cada alternativa vai para o campo A–E correspondente, na ordem;
   - se o texto tiver "Certo/Errado" em vez de A–E, o formato muda automaticamente para **Certo / Errado**.
3. Se aparecer uma linha de gabarito no texto ("Gabarito: C", "Resposta correta: letra B"), o gabarito é marcado no botão da letra e essa linha é removida do enunciado.
4. Se o texto tiver mais de 5 alternativas (F, G…), as extras são descartadas com aviso; se não reconhecer nenhuma alternativa, nada é alterado e aparece o aviso "Não encontrei alternativas nesse texto — confira as letras (A), B) …".
5. Um botão **Desfazer separação** volta ao texto colado original, caso a divisão saia errada.
6. Limpeza automática: números de questão no início ("15."), quebras de linha soltas, espaços duplicados e marcas de rodapé/página.

## Detalhes técnicos

- Novo módulo `src/lib/questao-colada.ts` com `separarQuestaoColada(texto)` retornando `{ enunciado, alternativas: string[], formato, correta? }`. Reaproveita a lógica de reconhecimento de alternativas e limpeza já usada em `src/lib/padroes-local.ts` (rótulos A–E com `)`/`.`/`-`, corte de rodapé), mas para uma única questão, sem exigir número de questão.
- Detecção de gabarito por regex do tipo `/gabarito|resposta\s*(correta)?\s*[:\-]?\s*(letra\s*)?([A-E]|certo|errado)/i`.
- `src/routes/_authenticated/inclusao.tsx`: no `Textarea` do enunciado, `onPaste`/`onChange` chama `separarQuestaoColada`; quando houver 2+ alternativas reconhecidas, aplica `setEnunciado`, `setAlternativas`, `setFormato` e `setCorreta`, guardando o texto original em um `useState` para o Desfazer. Botão manual para quem digitou/colou sem disparo automático.
- Sem IA, sem migração de banco, sem novas dependências. Matéria e Assunto continuam sendo escolhidos manualmente nos seletores do edital.
