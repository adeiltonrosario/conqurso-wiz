# Extrair também as questões do acervo por matéria e assunto

Hoje a aba **Questões** só usa as questões extraídas dos PDFs das provas. As questões que você cadastra à mão em **Incluir → Questões** ficam de fora da lista e dos filtros (elas só são usadas na Prova interativa, onde a matéria vira o texto do campo "assunto", sem casar com o edital).

## Como vai funcionar

1. As questões do acervo passam a entrar no mesmo banco da fonte "Das minhas provas", com selo de origem "Cadastrada no acervo".
2. Cada uma é classificada automaticamente (sem IA, sem créditos) pela matéria e pelo assunto do edital ativo, usando o mesmo reconhecedor por palavras-chave dos PDFs: o campo "assunto" digitado, o enunciado e as alternativas são analisados.
3. Elas respeitam os mesmos filtros: grupo, matéria, chips de assunto do edital e banca/cargo do concurso ativo.
4. O que não casar com nenhuma matéria do edital cai em **Pendentes de classificação**, com o seletor de matéria/assunto já existente para corrigir.
5. O contador do botão "Das minhas provas" passa a somar PDFs + acervo.
6. A edição de enunciado, alternativas e gabarito continua funcionando para as do acervo, salvando na sua conta como as demais.

## Detalhes técnicos

- `src/lib/questoes-pdf.ts`: expor o classificador já existente (`classificadorDoEdital` + `classificar`) numa função pública `classificarQuestao(edital, texto)`.
- `src/lib/prova-local.ts`: `daCadastrada` passa a usar essa classificação em vez de `q.assunto` como matéria — define `materia`, `assunto`, `grupo` (via `grupoDaMateria`), `titulo` (via `tituloDaQuestao`) e cai em `NAO_CLASSIFICADA` quando nada casa. `bancoLocal` fica inalterado.
- `src/routes/_authenticated/questoes.tsx`: trocar `const extraidas = acervo.extraidas` por um memo que junta `acervo.extraidas` com `acervo.questoes.map(q => daCadastrada(edital, q))` (dedupe por `id`, prefixo `acervo:`). Todo o resto (filtro estrito, chips de assunto, pendentes, edição) passa a operar sobre essa lista sem outras mudanças.
- Ao editar/salvar uma questão vinda do acervo, ela é gravada em `questoes_extraidas` pelo mesmo caminho já usado (upsert por `id`), com `origem` "Cadastrada no acervo".
- Sem migração de banco, sem novas dependências e sem chamadas de IA.
