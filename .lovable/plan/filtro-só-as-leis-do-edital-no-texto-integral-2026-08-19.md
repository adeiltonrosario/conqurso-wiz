# Filtro "só as leis do edital" no Texto integral

Hoje o seletor de normas do painel "Texto integral (Vade Mecum)" lista **todas** as 45 normas do mapa do Vade Mecum, agrupadas por bloco de páginas, mesmo quando o edital/banca/cargo em estudo cobra apenas parte delas. A sugestão automática pelo tópico existe, mas a lista continua inteira.

## O que muda

**1. Interruptor "Somente as leis do edital" (ligado por padrão)**
- Acima do seletor de normas, um botão de alternância. Ligado: a lista mostra apenas as normas que aparecem no edital ativo (matérias e tópicos da banca/cargo em estudo). Desligado: volta a lista completa do Vade Mecum.
- Grupos que ficarem sem nenhuma norma do edital deixam de aparecer.
- Cada norma do edital ganha um selo "Edital" no texto da opção, e a lista mostra a contagem (ex.: "12 de 45 normas do seu edital").

**2. Como uma norma é considerada "do edital"**
- Para cada matéria e cada tópico do edital ativo, o app já sabe encontrar a norma correspondente (por número da lei citado ou pelo nome da norma). Esse casamento passa a ser feito para a lista inteira de tópicos, montando o conjunto de normas cobradas.
- Se o edital ainda não tem matérias cadastradas (ou nada casar), o filtro se desliga sozinho e avisa: "Sem matérias do edital cadastradas — mostrando todo o Vade Mecum".

**3. Coerência com a leitura**
- Ao ligar o filtro, se a norma selecionada não pertencer ao edital, a seleção passa para a sugestão do tópico atual (ou para a primeira norma do edital).
- A opção "Todo o PDF (sem corte por página)" continua disponível; com o filtro ligado ela é acompanhada de "Todo o PDF — inclui leis fora do edital".
- Nada muda na extração, no sumário, na marcação de artigos nem na geração de questões.

## Detalhes técnicos

- `src/lib/mapa-vademecum.ts`: nova função `normasDoEdital(materias)` que reaproveita `normaDoTopico` sobre `nome` + `topicos` de cada matéria ativa e devolve os `NormaMapeada` sem repetição, na ordem de página.
- `src/components/LeiIntegral.tsx`: usa `useEdital()` + `materiasAtivas()` para obter as matérias do concurso em estudo; novo estado `soDoEdital` (padrão `true`); a lista do `<select>` e os `optgroup` passam a ser derivados de um `useMemo` que aplica o filtro; efeito de correção da seleção quando a norma atual sai da lista.
- Sem mudança de banco de dados, sem chamada de IA e sem alteração no parser do PDF.
- Correção incidental: o rótulo de páginas usa `faixaDaNorma(...)?.join()` sem checar o retorno em um ponto; será protegido para evitar o erro de leitura de índice indefinido observado no preview.
