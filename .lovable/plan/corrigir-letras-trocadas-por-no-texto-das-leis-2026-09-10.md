# Corrigir letras trocadas por "?" no texto das leis

As leis buscadas por link (Planalto e sites oficiais antigos) vêm com acentuação em uma
codificação antiga (latin‑1). O servidor que baixa a página só sabe converter a codificação
moderna (UTF‑8): quando tenta a antiga, a conversão falha e cada letra acentuada vira um
caractere de erro — é isso que aparece na leitura como "?" ou losango.

## O que vai mudar

1. A conversão da página baixada passa a tratar corretamente o texto antigo (latin‑1 /
   windows‑1252), com uma tabela própria de caracteres — nada de conversão que falha em silêncio.
2. Depois de converter, o sistema confere se sobrou algum caractere de erro; se sobrou, tenta a
   outra codificação e mantém a versão sem erros.
3. Limpeza final: qualquer caractere de erro restante é corrigido nos casos conhecidos
   (Ã§ → ç, Ãº → º e afins) e, no que não for reconhecível, removido, para não poluir a leitura.
4. Leis já salvas com esse defeito: ao abrir a lei, o texto passa pela mesma correção, então a
   leitura fica limpa sem precisar baixar de novo. Se a lei estiver muito danificada, aparece um
   aviso sugerindo buscar o link novamente.

## Detalhes técnicos

- `src/lib/leis-url.functions.ts` (`baixar`): substituir `new TextDecoder(enc)` por um decodificador
  latin‑1/cp1252 implementado em JS (mapa dos bytes 0x80–0x9F + `String.fromCharCode` no restante),
  porque o runtime de borda só oferece `TextDecoder("utf-8")` e hoje o `catch` cai num decode UTF‑8
  dos bytes latin‑1, gerando U+FFFD. Escolher a saída comparando contagem de U+FFFD entre UTF‑8 e
  latin‑1 quando o charset declarado for ausente ou duvidoso.
- Nova função exportada `corrigirCodificacao(texto)` em `src/lib/limpeza-lei.ts`: repara mojibake
  comum (`Ã¡Ã©Ã­Ã³Ãº`, `Âº`, `Â§`, `â€“`, `â€œ`) e descarta U+FFFD residual; chamada por
  `limparRuidoLei`, que já é usada em `src/lib/leis-salvar.ts` e na leitura.
- `src/components/LeiIntegral.tsx`: aplicar `corrigirCodificacao` no texto lido de
  `lerTextoAnexo` antes do parser, cobrindo as leis já guardadas.
- Sem mudança de banco de dados, sem IA, sem novas dependências.
