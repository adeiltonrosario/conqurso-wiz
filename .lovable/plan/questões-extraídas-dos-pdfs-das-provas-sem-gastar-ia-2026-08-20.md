# Questões extraídas dos PDFs das provas, sem gastar IA

## O que muda

Hoje as questões da aba "Questões e explicações" só existem quando a IA as gera. O texto integral dos PDFs de provas que você anexa já é lido e guardado, mas nunca é transformado em questões.

Passa a existir um extrator local (roda no seu aparelho, zero crédito):

1. **Extração automática ao anexar**
   - Ao anexar um PDF em "Provas anteriores" (aba Incluir), o app separa automaticamente as questões: número, enunciado e alternativas A–E (ou Certo/Errado).
   - Mostra o resultado na hora: "Prova X — 60 questões encontradas".
   - Cada questão guarda a origem: "Prova: nome-do-arquivo, questão 12".

2. **Gabarito**
   - Se a lista de gabarito estiver no mesmo PDF (1-A, 2) C, 03 D…), ela é casada por número automaticamente.
   - Se o gabarito vier em PDF separado, basta anexá-lo como prova: o app detecta que o arquivo é só gabarito (quase nenhum enunciado) e aplica aos números da prova mais recente, com opção de escolher a qual prova ele pertence.
   - Sem gabarito: a questão aparece marcada como "sem gabarito"; você pode informar a letra correta manualmente em um seletor no cartão.

3. **Explicações sem IA**
   - Cada cartão passa a ter dois caminhos: um campo "minha explicação" (salva no aparelho, por alternativa ou geral) e um botão "Explicar com IA" que só gasta crédito quando você clicar.
   - Se a prova tiver comentários no próprio PDF, o texto após o gabarito é anexado como explicação da banca.

4. **Aba Questões usando esse banco**
   - Filtro de origem: "Das minhas provas" (padrão quando houver questões extraídas) ou "Geradas por IA".
   - Continuam valendo os filtros de matéria/grupo do edital: a matéria de cada questão extraída é inferida por palavras-chave das matérias e tópicos do seu edital ativo; o que não casar entra como "Não classificada" e pode ser corrigido no cartão.
   - Rolagem vertical, marcação de acerto/erro e envio ao modo de Revisão espaçada funcionam igual às questões de IA.

## Detalhes técnicos

- Novo `src/lib/questoes-pdf.ts`: reaproveita `separarQuestoes` e `extrairGabarito` de `src/lib/padroes-local.ts`, detecta PDF-só-gabarito, extrai bloco de comentários e converte para o tipo `Questao` (com `origem`, `gabaritoAusente`, `explicacao` vazia permitida).
- Classificação de matéria por palavras-chave derivadas de `useEdital()` (matérias + tópicos), em `src/lib/questoes-pdf.ts`; sem IA.
- `src/lib/acervo.ts`: novo campo `extraidas: Questao[]` (com migração transparente na leitura do localStorage) + explicações do usuário em `explicacoesManuais: Record<string, string>`; texto integral continua no IndexedDB (`anexos-store.ts`).
- `src/routes/_authenticated/inclusao.tsx`: após `lerArquivoRef`/`salvarTextoAnexo`, roda a extração e grava `extraidas`; mostra contagem e aviso quando 0 questões (PDF escaneado → sugerir Análise de padrões/imagem).
- `src/routes/_authenticated/questoes.tsx`: seletor de fonte, cartão com seletor de gabarito manual, campo de explicação própria e botão "Explicar com IA" chamando `gerarQuestoes`/explicação sob demanda apenas no clique.
- Sem novas dependências e sem mudanças no backend.
