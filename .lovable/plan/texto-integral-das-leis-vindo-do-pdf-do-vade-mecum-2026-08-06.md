# Texto integral das leis vindo do PDF do Vade Mecum

Hoje o PDF anexado é lido só parcialmente (o leitor para em 60.000 caracteres — exatamente o número que apareceu na tela) e a aba "Texto integral (Vade Mecum)" não usa esse texto: ela pede à IA para transcrever os artigos de memória. Por isso o conteúdo do seu PDF não chega à leitura.

O objetivo é: ler o PDF inteiro, guardar esse texto e apresentar os artigos **literalmente como estão no PDF**, com a marcação, o filtro por palavra-chave e o sumário que já existem.

## O que muda

**1. Ler o PDF completo**
- Remover o corte de 60.000 caracteres na extração; percorrer todas as páginas do PDF.
- Guardar o texto completo de cada anexo num armazenamento próprio do navegador (IndexedDB), porque o armazenamento atual (localStorage) não aguenta um Vade Mecum inteiro. O acervo continua guardando nome, tamanho e um trecho para a IA.
- Na tela de inclusão, mostrar quantos caracteres e quantas páginas foram lidos de verdade.

**2. Separar os artigos do PDF**
- Um parser local (sem IA) quebra o texto em dispositivos: `Art. 1º`, parágrafos (`§`), incisos (`I, II, III`) e alíneas (`a)`), preservando a redação literal.
- O mesmo parser reconhece a hierarquia quando ela aparece no PDF (`TÍTULO`, `CAPÍTULO`, `SEÇÃO`) e também o nome da lei/código a que os artigos pertencem, alimentando o sumário em árvore que já existe.

**3. Leitura por capítulo do edital**
- No painel "Texto integral", passa a haver duas fontes: **PDF anexado** (padrão quando existe PDF de lei) e **IA** (o comportamento atual, como reserva).
- Escolhendo o PDF: seleciona-se a lei/código e o capítulo, e os artigos correspondentes são exibidos direto do arquivo — sem invenção de texto.
- Se o capítulo do edital não for localizado por título, aparece a busca por palavra-chave/faixa de artigos (ex.: `312-327`) para chegar ao trecho certo.
- Marcação de artigos, filtro com realce e geração de questões a partir dos artigos marcados continuam funcionando igual, agora sobre o texto real.

## Detalhes técnicos

- `src/lib/pdf.ts`: remove `LIMITE_TEXTO_ARQUIVO` do laço de páginas, retorna `{ texto, paginas }`.
- Novo `src/lib/anexos-store.ts`: IndexedDB (`get/put/remove`) chaveado por nome do anexo para textos grandes.
- `src/lib/acervo.ts`: `ArquivoAnexo` passa a guardar `chars`, `paginas` e um `trecho` (o que vai no contexto da IA); o texto integral sai do localStorage e vai para o IndexedDB, com migração silenciosa dos anexos já existentes.
- Novo `src/lib/vademecum.ts`: parser puro (regex) → `{ leis: [{ nome, titulos, capitulos, secoes, artigos: ArtigoIntegral[] }] }`, reaproveitando o tipo `ArtigoIntegral` já usado pelo sumário.
- `src/components/LeiIntegral.tsx`: seletor de fonte (PDF/IA), seletor de lei e capítulo, busca por palavra-chave e faixa de artigos; `Sumario`, `Realce` e as checkboxes de marcação permanecem.
- `src/routes/_authenticated/inclusao.tsx`: status de leitura com páginas e caracteres reais.
- Nenhuma mudança de banco de dados; nada é enviado à IA para exibir o texto integral vindo do PDF.
