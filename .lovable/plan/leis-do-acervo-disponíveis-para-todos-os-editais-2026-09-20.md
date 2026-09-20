# Leis do acervo disponíveis para todos os editais

Hoje, ao selecionar banca e cargo, as leis salvas só aparecem se o arquivo estiver anexado a uma matéria daquele concurso. Quem cadastrou a lei em outro edital deixa de vê-la, mesmo que o assunto esteja no edital atual.

## O que muda

Uma lei do acervo passa a aparecer sempre que o assunto dela existir no edital em estudo, não importa em qual edital ela foi incluída:

- A lei aparece quando o nome do arquivo bate com uma matéria, um tópico ou uma lei citada no Detalhamento do edital ativo (por exemplo "Lei 8.112" aparece em qualquer concurso que cobre a Lei 8.112).
- A lei continua aparecendo quando está anexada a uma matéria do concurso ativo (comportamento atual).
- Leis cujo assunto não consta em nenhum lugar do edital ativo seguem ocultas, com o aviso de quantas estão escondidas e o atalho para voltar a "Todas/Todos".
- Nada é apagado nem duplicado; é só regra de exibição, sem IA e sem custo.

## Onde aparece

- Tela Leis (lista de leis salvas e leitura integral).
- Tela Incluir (lista de leis anexadas).

## Detalhes técnicos

- Em `src/lib/edital.ts`: nova função `leiDoConcurso(edital, nomeArquivo)` que normaliza o nome do arquivo (minúsculas, sem acentos, só dígitos para o número da lei) e retorna verdadeiro se casar com: um `anexo` de `LinkLei` das matérias ativas, um título de `LinkLei`, o nome de uma matéria ativa, ou um tópico/norma do edital ativo (reaproveitando `normasDoEdital` / `materiasAtivas`). `anexosDoConcurso` é mantida para uso interno.
- `src/components/LeiIntegral.tsx`: `pdfsPermitidos` passa a usar `leiDoConcurso` em vez da checagem estrita por `anexo`.
- `src/routes/_authenticated/inclusao.tsx`: mesmo critério no filtro de `leisPdf`.
- `src/routes/_authenticated/leis.tsx`: conferir que a listagem usa o mesmo critério.
- Verificação: `bunx tsgo --noEmit`, `/tmp/observability/build-errors.log` e teste no navegador com dois concursos que compartilham a mesma lei.
