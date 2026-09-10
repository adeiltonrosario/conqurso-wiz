# Nome da lei igual ao do Detalhamento do edital, sem duplicar

Hoje, ao tocar em "Buscar texto", o app salva a lei com o nome que ele mesmo detecta no texto (por ex. "LEI N. 13.869, DE 5 DE SETEMBRO DE 2019") e ainda acrescenta a data do dia. Se você buscar de novo, nasce uma segunda cópia com "(2)" no fim. Por isso aparecem leis duplicadas e com nomes diferentes do seu edital.

## Como vai funcionar

1. O nome usado para guardar a lei passa a ser exatamente o nome que você cadastrou naquela matéria do Detalhamento do edital (ex.: "Lei de Abuso de Autoridade"). Sem data no fim e sem numeração automática.
2. Se você cadastrou o link sem nome, o app usa o nome encontrado no texto da lei, como hoje, apenas como reserva.
3. Buscar o texto outra vez da mesma lei **substitui** o conteúdo já salvo em vez de criar outra cópia. O que você marcou como favorito e como oculto continua valendo, porque o nome não muda.
4. Na aba **Leis**, a lista "Lei salva" mostra esse mesmo nome, então o que você vê no edital e o que vê em Leis passa a ser igual.
5. Se duas matérias diferentes cadastrarem a mesma lei com o mesmo nome, ela continua sendo um único registro compartilhado — nada é duplicado.

## Detalhes técnicos

- `src/lib/leis-salvar.ts`: `salvarLeiNoAcervo(bruto, tituloSugerido?)` passa a aceitar um nome preferido explícito. Ordem do nome final: nome preferido (título do `LinkLei`) → `leis[0].nome` → "Texto colado". Remove o sufixo `— data` e o contador `(n)`; em vez de gerar nome único, procura em `acervo.provas` um anexo de lei com o mesmo `nomeLimpo` e, se existir, sobrescreve o item (texto/`chars`) e regrava o texto no IndexedDB com a mesma chave; se não existir, insere.
- `src/components/EditalRelevancia.tsx` (`buscar`): chama `salvarLeiNoAcervo(r.texto, l.titulo || r.titulo)` já com o título da matéria tendo prioridade (comportamento atual do argumento passa a ser "nome preferido"), e continua gravando `anexo` no link via `comLeiAlterada`.
- `src/routes/_authenticated/inclusao.tsx`: chamada existente de `salvarLeiNoAcervo` mantém o comportamento de reserva (nome detectado no texto) — só muda que não há mais sufixo de data.
- Sem migração de dados: registros antigos com data no nome continuam legíveis; ao buscar o texto de novo, o link passa a apontar para o nome limpo. Sem IA, sem banco novo, sem dependências.
