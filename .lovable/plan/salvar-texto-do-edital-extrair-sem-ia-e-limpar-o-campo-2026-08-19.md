# Salvar texto do edital: extrair sem IA e limpar o campo

Hoje o botão "Salvar texto" apenas guarda o texto colado — quem extrai as matérias é a IA. O campo também nunca é limpo, então colar a próxima parte do edital exige apagar tudo na mão.

## Como vai funcionar

O botão passa a ser "Extrair e limpar" e faz tudo sozinho, sem gastar créditos:

1. Lê o texto colado e reconhece as matérias (linhas em MAIÚSCULAS, "DISCIPLINA:", "Língua Portuguesa:" etc.) e os tópicos abaixo delas (itens numerados `1.1`, marcadores `-`/`•` ou trechos separados por `;`).
2. Cadastra as matérias novas com o grupo sugerido (Conhecimento Geral para as clássicas — Português, Raciocínio Lógico, Informática, Atualidades; Específico para as demais), já marcadas com a banca e o cargo em estudo do filtro atual.
3. Se a matéria já existe, apenas acrescenta os tópicos novos, sem duplicar.
4. Ao terminar, **limpa a caixa de texto** e mostra um aviso do tipo "3 matérias e 27 tópicos incluídos — cole a próxima parte do edital".
5. Se nada for reconhecido, o texto é mantido e aparece a dica para usar a extração por IA.

O botão de IA continua ali, para editais em formato corrido/confuso.

## Detalhes técnicos

- Novo `src/lib/edital-parser.ts`: `extrairMateriasDoTexto(texto)` → `{ materias: { nome, grupo, topicos[] }[] }`, puramente local (regex + heurísticas de cabeçalho/lista), com normalização de espaços, remoção de numeração inicial e corte de itens muito curtos.
- Novo helper em `src/lib/edital.ts`: `mesclarMaterias(atuais, novas, { banca, cargo })` — cria matérias inexistentes e faz união de tópicos nas existentes (comparação case-insensitive).
- `src/components/EditalMaterias.tsx`: botão "Salvar texto" vira "Extrair e limpar", chamando o parser + `definirMaterias(mesclarMaterias(...))` e depois `setTexto("")` com `aplicar({ texto: "" })`. Sem chamadas de servidor nesse caminho.
- Nenhuma mudança de banco: o estado continua em `localStorage` sincronizado por `src/lib/sync.ts`.
