# Área de leis do edital só com matérias que têm leis, no visual do Detalhamento

Na tela **Leis**, a escolha de matéria deixa de ser uma lista simples e passa a ser uma lista **recolhível, igual ao Detalhamento do edital**, mostrando **somente as matérias que têm leis cadastradas** no concurso em estudo.

## Como vai funcionar

1. A tela Leis mostra as matérias em cartões com seta (mesmo modelo do Detalhamento do edital): tocou na matéria, ela abre; tocou de novo, recolhe.
2. Só aparecem as matérias do concurso em estudo (banca + cargo do filtro) que possuem **pelo menos uma lei cadastrada** (link salvo no Detalhamento ou texto já buscado para o acervo).
3. Ao abrir a matéria, você vê as leis dela: nome, se o texto já está salvo para leitura, e atalhos para **abrir a lei** e **ler o texto integral**.
4. Ao tocar numa lei/m matéria, ela já fica selecionada para a leitura resumida por capítulo, como hoje.
5. Matérias sem nenhuma lei não aparecem nessa área — nada é apagado, elas continuam no Detalhamento e voltam a aparecer assim que você cadastrar uma lei nelas.
6. O filtro "Concurso em estudo" (banca + cargo) continua valendo: trocou o concurso, a lista acompanha.

## Detalhes técnicos

- `src/lib/edital.ts`: novo helper `materiasComLeis(edital)` — `materiasAtivas(edital).filter(m => leisDaMateria(m).length > 0)`.
- `src/routes/_authenticated/leis.tsx`: substituir o `<select>` de matéria por uma lista recolhível (`ul` com `divide-y`, linha com `ChevronRight/ChevronDown`, `aria-expanded`, mesmo padrão visual de `LinhaMateria` em `EditalRelevancia.tsx`), renderizando `materiasComLeis(edital)`; ao abrir, lista as leis da matéria (título, selo "texto salvo", botões Abrir/Ler) e define a matéria ativa para o fluxo de resumo existente.
- Quando nenhuma matéria tiver lei, mostrar aviso curto orientando a cadastrar o link da lei no Detalhamento do edital (tela Incluir), com atalho para lá.
- Demais blocos da tela (banca, capítulo, resumo, questões de reforço) permanecem iguais; a matéria ativa continua vindo do estado `materia` já existente.
- Sem banco, sem IA, sem novas dependências — só filtro de visualização e reorganização do componente.
