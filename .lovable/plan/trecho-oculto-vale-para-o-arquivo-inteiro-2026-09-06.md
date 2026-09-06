# Trecho oculto vale para o arquivo inteiro

Hoje, quando você seleciona um texto e toca em "Ocultar", ele some só naquele ponto. Rodapés repetidos do PDF — como "O conteúdo deste livro eletrônico é licenciado para Adeilton Rosario de Oliveira...", "gran.com.br", "Última Atualização: agosto/2026" e o número da página — aparecem em todas as páginas e teriam que ser ocultados um por um.

## Como vai funcionar

1. **Ocultar em todo o arquivo**
   - Ao selecionar um trecho e tocar em **Ocultar**, o trecho fica escondido em **todas as ocorrências** daquele texto na lei inteira (não só no artigo onde você selecionou).
   - O contador passa a mostrar quantas ocorrências foram escondidas: "trecho oculto em 14 pontos".

2. **Limpeza automática reforçada**
   - O interruptor "Esconder revogados e rodapés do PDF" passa a remover também, sem você precisar selecionar nada:
     - a frase de licença "O conteúdo deste livro eletrônico é licenciado para ... responsabilização civil e criminal";
     - endereços de sites soltos no meio do texto (ex.: `gran.com.br`);
     - "Última Atualização: mês/ano";
     - números de página soltos no meio do texto.
   - Com isso, esse rodapé do seu exemplo some sozinho assim que o interruptor estiver ligado (padrão).

3. **Nada muda no resto**
   - Reexibir continua com um toque no marcador ▪▪▪ (reexibe todas as ocorrências daquele trecho) ou em "Reexibir tudo".
   - Tudo continua salvo só no aparelho, sem IA e sem banco de dados.

## Detalhes técnicos

- `src/lib/ocultos.ts`: trechos deixam de ser por artigo (`chave` do artigo) e passam a ser por **lei** (`trechosLei: { lei, texto }[]`), com migração silenciosa dos trechos já salvos. `ocultarTrecho` grava com a chave da lei; `reexibirTrecho` remove por lei+texto.
- `src/lib/limpeza-lei.ts`: novas regras em `RUIDO`:
  - `/o\s+conte[úu]do\s+deste\s+livro\s+eletr[ôo]nico.{0,400}?responsabiliza[çc][ãa]o\s+civil\s+e\s+criminal/gi` (frase de licença inteira);
  - `/\b[\w-]+\.(com|com\.br|net|org)\b/gi` (sites soltos, ex.: gran.com.br);
  - `/[úu]ltima\s+atualiza[çc][ãa]o\s*:?\s*\w+\/\d{4}/gi`;
  - ajuste da regra de número de página solto para não depender de letra maiúscula seguinte.
- `src/components/LeiIntegral.tsx`: `TextoOcultavel` recebe os trechos da **lei inteira** (não só do artigo), aplica `partirOcultos` com todas as ocorrências (o laço `indexOf` já pega repetições dentro do mesmo texto) e o botão flutuante chama `ocultarTrecho(chaveLei, selecao)`; contador conta ocorrências somando os pedaços ocultos renderizados.
- Sem mudança de banco, sem IA, sem créditos.
