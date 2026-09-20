# Só mostrar o que é do concurso selecionado (banca + cargo)

Hoje o filtro "Concurso em estudo" (banca + cargo) já limita matérias, tópicos e questões, mas as **leis salvas** e os **flashcards** continuam mostrando tudo, mesmo quando você escolheu um concurso específico. Este plano fecha essas brechas.

## O que vai mudar

1. **Leis**
   - Criar uma regra única: "leis do concurso em estudo" = leis vinculadas às matérias da banca/cargo selecionados (os links salvos no Detalhamento do Edital).
   - Aplicar essa regra em:
     - Lista de leis da tela **Leis** (leitura por capítulo);
     - Lista de leis salvas em **Incluir**;
     - Leitor de lei integral (só abre direto as leis do concurso ativo).
   - Leis salvas sem vínculo com nenhuma matéria do concurso ativo ficam ocultas enquanto houver banca/cargo selecionado — nada é apagado, basta voltar o filtro para "Todas/Todos".

2. **Flashcards**
   - Quando houver banca/cargo selecionado, mostrar só os cards das matérias daquele edital; cards de outras matérias ficam ocultos até o filtro ser removido.

3. **Questões**
   - Conferir e garantir que as listas de questões (banco extraído, pendentes de classificação, prova interativa e busca por link) continuem mostrando apenas o que é da banca/cargo ativos — ajustar o que estiver escapando.

4. **Nada muda quando o filtro está em "Todas/Todos"**: o app mostra tudo, como hoje.

## Detalhes técnicos

- Nova função em `src/lib/edital.ts`: `anexosDoConcurso(edital)` — junta os `LinkLei.anexo` das matérias visíveis (`materiasAtivas`) e devolve o conjunto de nomes de anexo permitidos.
- `src/components/LeiIntegral.tsx` e as listas de leis (`src/routes/_authenticated/leis.tsx`, `src/routes/_authenticated/inclusao.tsx`) filtram os anexos por esse conjunto quando `editalRestrito(edital)` for verdade.
- `src/routes/_authenticated/flashcards.tsx`: filtrar cards com `materiaPermitida(edital, card.materia)`.
- Revisar `questoes.tsx` / `prova-local.ts` garantindo `questaoPermitida` em todas as listagens.
- Nenhum dado é excluído — é só filtro de visualização; sem IA e sem custo.
