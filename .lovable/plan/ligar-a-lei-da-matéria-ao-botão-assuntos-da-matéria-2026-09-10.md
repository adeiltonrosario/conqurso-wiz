# Ligar a lei da matéria ao botão "Assuntos da matéria (★)"

Hoje o botão só funciona se você antes escolher a lei na lista e tocar em "Extrair o texto integral". Além disso, ele exige que **todas** as palavras do assunto apareçam no artigo, então quase nada casa. E a lei cadastrada no link da matéria não é reconhecida como sendo daquela matéria.

## Como vai funcionar

1. Quando você busca o texto de um link dentro do Detalhamento do edital, o app passa a guardar no próprio link qual lei foi salva. Assim a matéria e a lei ficam ligadas.
2. Na aba **Leis**, ao escolher a matéria, a lista "Lei salva" já vem com as leis daquela matéria em primeiro lugar e a primeira delas é selecionada e lida sozinha — sem você tocar em nada. Um selo mostra "lei desta matéria".
3. Se a matéria tem link cadastrado mas o texto ainda não foi buscado, aparece um aviso curto orientando a tocar em "Buscar texto" no Detalhamento do edital.
4. O botão **Assuntos da matéria (★)** passa a ler a lei automaticamente se ela ainda não estiver aberta, e só depois filtra e favorita — nunca mais fica sem resposta.
5. A comparação com os assuntos fica mais tolerante: cada assunto casa quando alguma de suas palavras significativas aparece no artigo (ou no título/capítulo/seção), ignorando palavras genéricas como "artigo", "lei", "aspectos", "geral", "noções". O aviso passa a dizer quantos assuntos casaram e quantos artigos foram favoritados.
6. Se mesmo assim nada casar, o aviso explica que os assuntos daquela matéria não aparecem no texto da lei, e nada é favoritado.

## Detalhes técnicos

- `src/lib/edital.ts`: `LinkLei` ganha `anexo?: string` (nome do item salvo no acervo). `comLeiAlterada` já cobre a gravação.
- `src/components/EditalRelevancia.tsx`: após `salvarLeiNoAcervo`, chamar `onLeis(comLeiAlterada(materia, l.id, { anexo: nome }))` usando o `nome` retornado (já existe no retorno `ResultadoLeiSalva`). `jaSalva` passa a considerar `l.anexo` primeiro, mantendo o casamento por título/número como reserva.
- `src/components/LeiIntegral.tsx`:
  - novo `useMemo` `leisDaMinhaMateria`: nomes vindos de `leisDaMateria(materiaEdital)` (via `materiasAtivas(edital)` + nome igual a `materia`), cruzados com `pdfsLei` por `anexo` e, na falta, por título/número.
  - a lista de leis salvas ordena essas primeiro e marca-as com "· desta matéria"; `useEffect` define `arquivo` para a primeira lei da matéria quando `materia` muda e dispara `mutPdf.mutate` uma vez por arquivo (guarda por `useRef` do último nome lido para não reler em loop).
  - `filtrarPelosAssuntos`: se `!carregado` e existe `arquivoAtivo`, aguarda `mutPdf.mutateAsync` e usa o resultado para casar; mensagens de erro atuais preservadas.
  - contagem de assuntos casados calculada com a nova assinatura de retorno.
- `src/lib/vademecum.ts`: `artigosDosAssuntos` passa a devolver `{ artigos, assuntosCasados }` e a casar por termo relevante (`length > 3`, fora de uma lista de palavras genéricas) com `some` em vez de `every`; termos numéricos de artigo (ex.: "12") continuam ignorados por tamanho.
- Sem IA, sem banco e sem novas dependências.
