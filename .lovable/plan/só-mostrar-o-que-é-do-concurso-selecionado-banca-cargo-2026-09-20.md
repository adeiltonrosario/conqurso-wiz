# Só mostrar o que é do concurso selecionado (banca + cargo)

Hoje o filtro "Concurso em estudo" (banca + cargo) já limita parte do app, mas o **Detalhamento do Edital** (lista de matérias e tópicos), as **leis salvas** e os **flashcards** continuam mostrando tudo, mesmo quando você escolheu um concurso específico. Este plano fecha essas brechas.

## O que vai mudar

0. **Detalhamento do Edital (matérias e tópicos)**
   - A lista de matérias passa a mostrar só as matérias da banca e do cargo selecionados; as demais ficam ocultas (nada é apagado).
   - Ao adicionar uma matéria nova com um concurso selecionado, ela já nasce marcada com essa banca e esse cargo, para continuar aparecendo.
   - Um aviso curto indica quantas matérias estão ocultas pelo filtro, com a opção de voltar para "Todas/Todos".
   - O painel de relevância acompanha a mesma lista filtrada.


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

- `src/components/EditalMaterias.tsx`: trocar `edital.materias` por `materiasAtivas(edital)` na renderização da lista; ao criar matéria, preencher `banca: edital.bancaAtiva` e `cargo: edital.cargoAtivo`; mostrar contagem de ocultas.
- `src/components/EditalRelevancia.tsx`: `materiasPorRelevancia` restrito às matérias ativas.
- Nova função em `src/lib/edital.ts`: `anexosDoConcurso(edital)` — junta os `LinkLei.anexo` das matérias visíveis (`materiasAtivas`) e devolve o conjunto de nomes de anexo permitidos.
- `src/components/LeiIntegral.tsx` e as listas de leis (`src/routes/_authenticated/leis.tsx`, `src/routes/_authenticated/inclusao.tsx`) filtram os anexos por esse conjunto quando `editalRestrito(edital)` for verdade.
- `src/routes/_authenticated/flashcards.tsx`: filtrar cards com `materiaPermitida(edital, card.materia)`.
- Revisar `questoes.tsx` / `prova-local.ts` garantindo `questaoPermitida` em todas as listagens.
- Nenhum dado é excluído — é só filtro de visualização; sem IA e sem custo.
