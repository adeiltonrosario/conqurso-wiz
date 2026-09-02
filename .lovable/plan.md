# Incluir prova e gabarito no mesmo passo

## O que muda

Hoje você anexa a prova e só depois, no cartão criado, anexa o gabarito. Passa a existir um único bloco de inclusão com os dois campos lado a lado, enviados juntos:

```text
Incluir prova anterior
  Prova (PDF)      [ Selecionar PDF ]   Prova PC-BA 2023.pdf
  Gabarito (PDF)   [ Selecionar PDF ]   gabarito-pcba-2023.pdf   (opcional)
  [ Incluir prova e gabarito ]
```

1. O botão só fica ativo com a prova escolhida. O gabarito é opcional — quem não tem ainda inclui só a prova.
2. Ao confirmar, o sistema lê os dois PDFs de uma vez: extrai as questões da prova e aplica o gabarito **àquela prova**, sem chance de cair na prova errada.
3. Ao final aparece o resumo: quantas questões foram extraídas, quantas ficaram com resposta e, se houver, quantas respostas do gabarito não correspondem às questões (sinal de gabarito de outra prova) — com opção de remover o gabarito e anexar o correto.
4. Se o PDF escolhido no campo "Prova" for na verdade só um gabarito, o sistema avisa e pede para colocá-lo no campo correto, em vez de perguntar depois a qual prova pertence.
5. Os cartões das provas já incluídas continuam existindo, com o gabarito no mesmo bloco, permitindo anexar depois o gabarito que faltou e remover prova ou gabarito separadamente.

## Detalhes técnicos

- `src/routes/_authenticated/inclusao.tsx`: substitui o `UploadCampo` de provas por um novo bloco `IncluirProva` com dois `input[type=file]` controlados (prova e gabarito) e um botão de confirmação; a leitura usa as funções de PDF já existentes e depois `extrairDaProva` seguido de `aplicarGabaritoNaProva` com a prova alvo explícita.
- Remove-se a etapa `gabaritoPendente` (seleção posterior de prova) do fluxo de inclusão; o cartão da prova mantém o botão "Anexar gabarito desta prova" para casos de gabarito recebido depois.
- Sem alterações em `src/lib/acervo.ts`, `src/lib/questoes-pdf.ts` ou no banco: `gabaritoNome`, `aplicarGabaritoNaProva` e `limparGabarito` já suportam esse fluxo.
- Persistência na nuvem segue por `salvarBanco` / `removerBanco`, sem mudança de schema.
