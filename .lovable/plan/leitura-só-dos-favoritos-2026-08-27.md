# Leitura só dos favoritos (★)

Hoje a aba Leis já tem a caixinha de marcação, mas ela é temporária: serve para gerar questões e some quando você troca de PDF, de capítulo ou recarrega a página. Não existe favorito com estrela nem uma leitura só dos favoritos.

O objetivo é ter uma estrela em cada artigo, que fica salva no aparelho, e um filtro/painel para ler apenas os artigos favoritados — com o cabeçalho e os títulos (lei, título, capítulo, seção) de cada um.

## O que muda

**1. Estrela em cada artigo**
- Ao lado da referência (ex.: `Art. 312`) aparece uma estrela. Clicar favorita; clicar de novo desfavorita.
- O favorito guarda, junto com o texto literal, a lei/código, o TÍTULO, o CAPÍTULO e a SEÇÃO do artigo, além da matéria e do capítulo do edital em que foi lido.
- Fica salvo no aparelho (não se perde ao trocar de PDF nem ao recarregar). A caixinha de marcação atual continua existindo para gerar questões — a estrela é a leitura salva.

**2. Filtro "Só favoritos (★)"**
- No bloco de filtros do Texto integral, ao lado de "Ver só os marcados", entra "Ver só os favoritos", com a contagem de favoritos.
- Combina com os filtros que já existem (palavra-chave com realce, faixa de artigos, restringir ao capítulo).

**3. Painel "Meus favoritos"**
- Uma seção nova na aba Leis lista todos os favoritos agrupados por lei → título → capítulo → seção, com cabeçalhos visíveis, em ordem de artigo.
- Funciona sem carregar PDF nem IA: o texto vem do que foi salvo.
- Cada grupo pode ser recolhido; cada item tem botão para desfavoritar; há busca por palavra-chave dentro dos favoritos e um botão para gerar questões só dos favoritos (usa o mesmo caminho de "gerar questões dos artigos marcados").

## Detalhes técnicos

- Novo `src/lib/favoritos.ts`: tipo `ArtigoFavorito` (`chave`, `lei`, `referencia`, `texto`, `paragrafos`, `titulo`, `capitulo_lei`, `secao`, `materia`, `capituloEdital`, `salvoEm`), armazenamento em `localStorage` (`concurseiro:favoritos`) com evento `favoritos:mudou`, hook `useFavoritos()` e `alternarFavorito()`. Chave = `lei|referencia|hash curto do texto` para não duplicar entre PDFs.
- `src/components/LeiIntegral.tsx`: botão estrela (`Star`/`lucide-react`) no cabeçalho de cada artigo, checkbox "Ver só os favoritos" no bloco de filtros e contagem; reaproveita `montarArvore` e `Realce`.
- Novo `src/components/Favoritos.tsx`: painel agrupado (lei → título → capítulo → seção) com busca, recolher/expandir, desfavoritar e "Gerar questões dos favoritos".
- `src/routes/_authenticated/leis.tsx`: renderiza o painel de favoritos e liga o botão de questões ao fluxo de geração já existente (respeita o aviso de créditos de IA esgotados).
- Sem mudanças no banco de dados; nada é enviado à IA para exibir os favoritos.
