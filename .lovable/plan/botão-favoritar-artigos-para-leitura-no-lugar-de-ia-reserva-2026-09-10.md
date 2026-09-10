# Botão "Favoritar artigos para leitura" no lugar de "IA (reserva)"

Na aba **Leis → Texto Integral**, o botão **IA (reserva)** sai e no lugar entra um botão que extrai os artigos das leis da matéria em estudo e já marca todos como **favoritos**. Assim a leitura começa completa e você só desmarca a estrela do que não quiser ler.

## Como vai funcionar

1. No topo da tela fica só **PDF anexado** (o texto salvo das suas leis) — a opção "IA (reserva)" é retirada.
2. Um novo botão **Favoritar artigos para leitura** aparece junto aos filtros.
3. Ao tocar nele:
   - se o texto da lei ainda não estiver aberto, o sistema carrega e extrai os artigos sozinho (sem gastar IA);
   - todos os artigos da lei/norma selecionada da matéria são marcados com estrela;
   - artigos revogados, rodapés e trechos que você escondeu continuam fora;
   - aparece um aviso do tipo "128 artigos favoritados para leitura" e um **Desfazer** por alguns segundos.
4. Quem já estava favoritado permanece; nada é duplicado.
5. Ao lado dele, um botão **Desfavoritar todos desta lei**, para limpar a leitura de uma vez.
6. O filtro **★ Só favoritos** e a aba de leitura dos favoritos continuam funcionando como hoje, agora já cheios.

## Detalhes técnicos

- `src/lib/favoritos.ts`: novas funções `favoritarArtigos(artigos, info)` e `desfavoritarArtigos(chaves)` — gravam em lote no `localStorage` reaproveitando `chaveFavorito`, ignorando chaves já existentes e retornando quantos foram incluídos; `alternarFavorito` passa a delegar para elas.
- `src/components/LeiIntegral.tsx`:
  - remover o par de botões `["pdf","ia"]` e o estado `fonte` (fixar em PDF), junto com a mutation `mut` de `leiIntegral`, o estado `lei` e o import `leiIntegral`, mantendo `onCarregado` alimentado pela extração do PDF;
  - novo botão que, quando `leisPdf` está vazio, dispara `mutPdf.mutateAsync({ nome: arquivoAtivo, item: itemAtivo })` e depois favorita;
  - favorita a lista já filtrada (`brutos`, que exclui revogados/ruído) usando `baseLegal`, `materia` e `capitulo` como info, com `toast` de contagem e ação **Desfazer** chamando `desfavoritarArtigos`;
  - segundo botão que remove os favoritos cujas chaves pertencem à lei atual.
- Sem migração de banco, sem IA e sem novas dependências.
