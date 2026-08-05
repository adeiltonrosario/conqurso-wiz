# Questões na banca certa, usando o conteúdo dos PDFs de provas

## Problema encontrado

Hoje, quando você anexa um PDF em "Provas anteriores" na aba Incluir, o app guarda **apenas o nome do arquivo** — o texto do PDF nunca é lido. Ou seja, a IA nunca viu as questões das suas provas; ela apenas sabia que existe um arquivo chamado, por exemplo, "prova-2023.pdf".

Além disso, a geração de questões na aba Incluir usa um seletor de banca próprio (lista fixa), em vez da banca prevista da Trilha usada nas outras telas.

## O que será feito

1. **Ler o texto dos PDFs anexados**
   - Ao selecionar um PDF (provas, leis, gramática, edital), o app extrai o texto no próprio navegador e guarda junto com o nome do arquivo.
   - Cada arquivo passa a mostrar quantos caracteres foram lidos. Se for um PDF escaneado (imagem, sem texto), aviso claro: "não foi possível ler o texto deste PDF — cole o conteúdo manualmente".
   - Arquivos já anexados antes (só nome, sem texto) continuam listados, com aviso de "sem texto lido" e opção de reanexar.

2. **Usar as provas como banco de questões da IA**
   - O texto das provas anexadas entra no contexto enviado à IA em Questões, Prova interativa, Revisão e no simulado da aba Incluir.
   - A instrução ao modelo passa a ser: priorizar as questões e o estilo das provas anexadas — reaproveitar assuntos, enunciados e distratores reais dessas provas, adaptando quando necessário, antes de inventar conteúdo novo.
   - Cada questão gerada indica a origem ("baseada na prova X" ou "inédita"), exibida como selo no cartão da questão.

3. **Banca sempre a que você está estudando**
   - A banca prevista da Trilha passa a comandar também o gerador da aba Incluir (com o selo "Banca atual" e link para trocar na Trilha), eliminando o seletor solto.
   - No filtro de contexto, provas anexadas cuja banca você identificou como diferente da banca prevista são usadas apenas como reforço de conteúdo, nunca como modelo de formato.

## Detalhes técnicos

- Extração de PDF no cliente com `pdfjs-dist` (worker via import ESM), em um helper `src/lib/pdf.ts`.
- `Acervo` (`src/lib/acervo.ts`): `provas`, `gramatica`, `edital` deixam de ser `string[]` e passam a `ArquivoAnexo[] = { nome, texto, chars }`, com migração automática de dados antigos na leitura do localStorage; `contextoDoAcervo` passa a incluir os trechos de texto (com limite de caracteres por arquivo para não estourar o prompt).
- `gerarQuestoes` em `src/lib/ai.functions.ts`: aumento do limite de `contexto`, prompt reescrito para priorizar as provas anexadas, e novo campo opcional `origem` no tipo `Questao`.
- `src/routes/_authenticated/inclusao.tsx`: `UploadCampo` com extração + estado de progresso; simulado passa a usar `useBancaPrevista` e `<BancaAtual />`.
- Telas de consumo (`questoes`, `prova-interativa`, `revisao`) apenas ganham o novo contexto e o selo de origem.
- Sincronização na nuvem (`sync.ts`) continua funcionando: como o texto dos PDFs pode ser grande, apenas os trechos truncados usados no contexto são sincronizados.
