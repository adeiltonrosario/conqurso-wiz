# Análise de padrões com Word, PDF e imagens de verdade

## O que está acontecendo hoje

Na aba **Análise de padrões**, o campo de arquivos guarda **apenas o nome** do arquivo: o texto do PDF/Word nunca é lido e a imagem nunca é enviada. A IA recebe só uma linha do tipo "Arquivos enviados: prova.pdf" mais o que você colar na caixa de texto. Se você anexa a prova e não cola nada, o botão fica bloqueado (exige 10 caracteres colados) — por isso parece que "parou de funcionar".

## O que será feito

1. **PDF** — o texto é extraído no próprio navegador (mesmo leitor já usado na aba Inclusão) e entra no conteúdo enviado à IA. Cada arquivo mostra "X caracteres lidos".
2. **Word (.docx)** — o texto é extraído no navegador e tratado igual ao PDF.
3. **Imagens (foto da prova, print, gabarito digitalizado)** — a imagem é enviada à IA em modo visual: ela lê o enunciado e as alternativas direto da foto. Vale também para PDFs escaneados (sem texto), que passam a ser convertidos em página-imagem e enviados do mesmo jeito.
4. **Colar texto passa a ser opcional** — o botão "Analisar padrões" libera quando houver qualquer fonte: texto colado, PDF/Word lido ou imagem anexada.
5. **Lista de arquivos com status** — cada anexo mostra tipo, status ("texto lido", "será lido pela IA como imagem", "não foi possível ler") e botão para remover.
6. **Mensagens de erro claras** — se os créditos de IA estiverem esgotados, aparece um aviso explícito em vez de falha silenciosa (esta tela depende de IA; não há modo local para ela).

## Detalhes técnicos

- Reaproveitar `src/lib/pdf.ts` (`extrairTextoPdf`) para PDFs; adicionar `mammoth` para `.docx` num helper novo `src/lib/documentos.ts` que normaliza qualquer arquivo em `{ nome, tipo, texto, dataUrl }`.
- PDF sem texto extraível: renderizar as primeiras páginas em canvas via pdfjs e virar `dataUrl` de imagem.
- `analisarPadroes` em `src/lib/ai.functions.ts`: novo campo opcional `imagens: string[]` (data URLs, limite de quantidade/tamanho), enviadas como blocos `image_url` no corpo do chat do gateway; `conteudo` passa a aceitar mínimo 0 quando houver imagem, com `.transform` de corte em vez de erro de validação.
- `src/lib/ai-gateway.server.ts`: suportar mensagem de usuário multimodal (texto + `image_url`) mantendo a resposta JSON atual, e propagar 402 com mensagem em português.
- `src/routes/_authenticated/analise-padroes.tsx`: input aceita `.pdf,.doc,.docx,image/*`; estado de arquivos passa a guardar o resultado da extração e progresso; regra do botão e chat de padrões usam o novo conteúdo consolidado.
