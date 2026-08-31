# Assunto como lista do detalhamento da matéria

Hoje, ao incluir uma questão em **Incluir → Questões**, o campo "Assunto" é um texto livre: dá para digitar algo que não existe no edital e só na hora de salvar aparece o erro "Este assunto não consta no edital".

## Como vai funcionar

1. O campo "Assunto" vira uma lista suspensa com os assuntos do **Detalhamento do edital** da matéria selecionada (os mesmos tópicos, na ordem de relevância).
2. Ao trocar a matéria, a lista de assuntos é recarregada e a seleção anterior é limpa.
3. Cada opção mostra a relevância quando houver (ex.: "Crimes contra a Administração Pública — 18%"), ajudando a priorizar.
4. Se a matéria escolhida não tiver assuntos detalhados, aparece um aviso curto ("Nenhum assunto detalhado para esta matéria") e o campo continua aceitando texto livre, como hoje.
5. Existe a opção "Sem assunto específico" para gravar a questão apenas na matéria.
6. Como o assunto agora vem do edital, a validação de assunto ao salvar deixa de barrar o usuário.

## Detalhes técnicos

- `src/routes/_authenticated/inclusao.tsx`: substituir o `<Input id="assunto">` por um `<select>` alimentado por `topicosPorRelevancia` (ou `topicosDaMateria`) de `src/lib/edital.ts` para a matéria ativa; `useEffect` limpa `assunto` quando `materia` muda e o tópico não pertence mais à lista.
- Fallback para `<Input>` quando a lista vier vazia, preservando o comportamento atual.
- Nenhuma mudança no formato salvo: `assunto` continua gravado como `"Matéria — Assunto"` em `QuestaoCadastrada`, mantendo a classificação já implementada na aba Questões.
- Sem migração de banco, sem novas dependências e sem IA.
