# Botão (IA) vira "Assuntos da matéria (★)"

Hoje, na aba **Leis → Texto integral**, existem dois botões de fonte: "PDF anexado" e "IA (reserva)". O segundo pede o texto à IA e gasta crédito.

## Como vai funcionar

1. O botão "IA (reserva)" sai da tela. No lugar dele entra **"Assuntos da matéria (★)"**, que não usa IA e não gasta crédito.
2. Ao tocar nele, o app varre os artigos da lei aberta e mantém apenas os que combinam com os assuntos da matéria selecionada (os tópicos do Detalhamento do edital dessa matéria).
3. Todos os artigos encontrados são favoritados automaticamente (recebem a estrela) e ficam salvos no aparelho, disponíveis também no painel "Meus favoritos".
4. Um aviso curto informa o resultado: quantos artigos casaram com quantos assuntos (ex.: "34 artigos de 7 assuntos favoritados"). Se nada casar, aparece "Nenhum artigo casou com os assuntos desta matéria" e nada é favoritado.
5. Se a matéria não tiver assuntos no Detalhamento do edital, o botão avisa "Cadastre os assuntos desta matéria no Detalhamento do edital" e não faz nada.
6. Se a lei ainda não estiver carregada, o botão avisa para escolher a lei salva primeiro.
7. A leitura continua igual: a lista fica filtrada nos artigos encontrados, e os filtros que já existem (palavra-chave, faixa de artigos, "só favoritos", "só marcados", ocultos) continuam funcionando por cima.

## Detalhes técnicos

- `src/components/LeiIntegral.tsx`:
  - remover o par de botões de fonte e o estado `fonte`; a fonte passa a ser sempre o PDF/texto salvo. Remover o `useMutation mut` que chama `leiIntegral`, o estado `lei` e o `useServerFn(leiIntegral)`; `baseLegal` e `brutos` passam a depender só de `leiPdfAtiva`.
  - novo botão "Assuntos da matéria (★)" acima dos filtros, com estado `soAssuntos: boolean` que entra no `useMemo` de `artigos` (mantém o artigo quando sua chave está no conjunto casado).
  - casamento sem IA: nova função em `src/lib/vademecum.ts`, `artigosDosAssuntos(artigos, topicos)`, que reaproveita a normalização de `artigosDoCapitulo` (minúsculas, sem acento, termos com mais de 3 letras) e casa cada tópico contra `titulo + capitulo_lei + secao + texto` do artigo; devolve os artigos casados sem repetição, em ordem original.
  - assuntos vindos de `topicosDaMateria(edital, materia)` (`src/lib/edital.ts`), com `useEdital()` que o componente já usa.
  - favoritar em lote com `alternarFavorito` de `src/lib/favoritos.ts`, pulando os que já estão favoritados (via `chaveFavorito`) e ignorando artigos ocultos.
- Sem mudança de banco, sem dependências novas e sem chamada de IA. A função `leiIntegral` continua existindo no backend, apenas deixa de ser chamada por esta tela.
