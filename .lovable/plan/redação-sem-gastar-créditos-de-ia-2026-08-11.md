# Redação sem gastar créditos de IA

## Objetivo

Fazer a aba **/redacao** funcionar sem chamar a IA do Lovable AI Gateway, eliminando o erro 402 por falta de crédito. A redação passa a ser montada localmente no navegador a partir do tema/estudo de caso que o usuário digita.

## Como vai funcionar

1. **Modelos de estrutura pré-definidos**
   - O app já tem `MODELOS_REDACAO` (ex.: "padrão de banca", "tese-antítese-síntese" etc.).
   - Cada modelo vira um "esqueleto" com placeholders para o tema.

2. **Geração local do texto**
   - A partir do tema, o app cria:
     - Título: reformulação do tema.
     - Introdução: contextualização + tese + breve encaminhamento.
     - Desenvolvimento: 2 ou 3 parágrafos com argumentos genéricos e exemplos vazios que o usuário preenche.
     - Conclusão: reafirmação da tese + proposta de intervenção.
   - Os conectivos são marcados automaticamente com as cores do sistema (`{{azul|...}}`, `{{vermelho|...}}`, `{{amarelo|...}}`).

3. **Edição após geração**
   - O texto gerado aparece em campos editáveis (introdução, cada parágrafo do desenvolvimento, conclusão).
   - O usuário pode substituir os trechos genéricos pelos próprios argumentos.
   - Contador de linhas atualiza em tempo real.

4. **Fallback caso o usuário prefira IA**
   - Mantém o botão "Gerar com IA" desabilitado quando os créditos acabam, com aviso explicativo.
   - O botão principal passa a ser "Montar redação local".

## Detalhes técnicos

- Criar `src/lib/redacao-local.ts` com funções puras para:
  - `gerarTitulo(tema: string): string`
  - `gerarIntroducao(tema: string, modelo: string): string`
  - `gerarDesenvolvimento(tema: string, modelo: string): string[]`
  - `gerarConclusao(tema: string): string`
  - `marcarConectivos(texto: string): string`
- Alterar `src/routes/_authenticated/redacao.tsx`:
  - Adicionar estado `modo` ("local" | "ia").
  - Usar geração local no `mutation.mutate` quando modo = local.
  - Renderizar campos editáveis para cada bloco da redação gerada.
  - Atualizar o contador de linhas conforme o usuário edita.
- Remover a dependência obrigatória de `gerarRedacao` (server function) para o fluxo principal.
- Manter `gerarRedacao` disponível para quem tiver créditos.

## Limitações

- O texto local será mais genérico do que o da IA. Ele serve como ponto de partida editável, não como redação final pronta.
- Não haverá personalização profunda por banca (a menos que o usuário edite).

## Resultado esperado

O usuário digita um tema, clica em "Montar redação local" e recebe imediatamente uma estrutura dissertativa-argumentativa com conectivos grifados, sem nenhuma chamada de IA.
