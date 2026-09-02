# Provas e gabaritos pareados, sem risco de troca

## Problema atual

Hoje existe um único campo "Provas anteriores por banca (PDF)". Quando você anexa um PDF que é só gabarito, o sistema aplica as respostas à **última prova anexada** por adivinhação — se você anexar duas provas seguidas, ou o gabarito antes da prova, o gabarito pode cair na prova errada.

## O que passa a existir

Uma seção "Provas anteriores e gabaritos", com uma lista de provas em que cada prova é um cartão próprio:

```text
Prova PC-BA 2023.pdf            60 questões · 0 com gabarito
  [ Anexar gabarito desta prova ]
  gabarito-pcba-2023.pdf  -> 60 respostas aplicadas   [remover]
```

1. **Anexar prova** — igual a hoje: o texto é lido, as questões são extraídas e salvas no seu banco, sem gastar IA.
2. **Anexar gabarito dentro do cartão da prova** — o gabarito é aplicado **somente** às questões daquela prova, por número. Não há mais adivinhação.
3. **Feedback claro** — cada cartão mostra quantas questões foram extraídas, quantas já têm gabarito e quantas ficaram sem. Se o gabarito trouxer números que não existem na prova (ex.: gabarito de outra prova), aparece o aviso "X respostas não correspondem às questões desta prova" e você pode remover o gabarito e anexar o correto.
4. **Gabarito no mesmo PDF da prova** continua sendo casado automaticamente na extração — nada muda nesse caso.
5. **Remover a prova** remove suas questões e o vínculo do gabarito; remover só o gabarito zera as respostas daquela prova, mantendo as questões.
6. **PDF só de gabarito solto** (arrastado no campo de provas) deixa de aplicar às cegas: o sistema pergunta a qual prova pertence, com um seletor das provas já anexadas.

## Detalhes técnicos

- `src/lib/acervo.ts`: `ArquivoAnexo` da prova ganha `gabaritoNome?: string` (nome do PDF de gabarito vinculado); migração transparente na leitura do localStorage.
- `src/lib/questoes-pdf.ts`: `aplicarGabarito` passa a receber a prova alvo obrigatoriamente e a retornar também `aplicadas` e `naoCasadas` (números do gabarito sem questão correspondente); nova função `limparGabarito(questoes, prova)`.
- `src/routes/_authenticated/inclusao.tsx`: novo componente `CartaoProva` (prova + botão de gabarito + contadores) substituindo a listagem simples do `UploadCampo` para provas; `extrairDaProva` deixa de usar a heurística "última prova" e passa a receber a prova alvo; caso de gabarito solto abre um `Select` das provas anexadas.
- Persistência na nuvem continua via `salvarBanco` / `removerBanco` em `src/lib/questoes-banco.functions.ts`, sem mudança de schema.
- Sem novas dependências, sem migração de banco.
