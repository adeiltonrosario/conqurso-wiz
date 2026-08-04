# Matérias vindas do edital

Hoje as matérias são listas fixas no código (Língua Portuguesa, Direito Penal etc.). O objetivo é que o edital do seu concurso alimente essas listas, somando-se às matérias padrão em todas as telas.

## O que será criado

### 1. Cadastro do edital (aba Incluir)
Nova seção "Matérias do edital":
- Campo para colar o conteúdo programático do edital.
- Botão "Extrair matérias com a IA": a IA lê o texto e devolve cada matéria com grupo (Conhecimento Geral ou Específico) e a lista de tópicos/capítulos cobrados.
- Lista editável do resultado: renomear matéria, trocar o grupo, adicionar/remover matérias e tópicos manualmente (sem precisar colar edital).
- Tudo salvo na sua conta (sincroniza junto com o resto do acervo).

### 2. Matérias do edital em todo o app
As matérias cadastradas passam a aparecer junto com as padrão, marcadas com um selo "Edital":
- **Questões**: nas abas Conhecimento Geral / Específico, respeitando o grupo definido.
- **Leis**: matérias do edital na lista e os tópicos do edital como sugestões de capítulo (em vez de sugestões genéricas).
- **Prova interativa**: seleção de matéria passa a incluir as do edital.
- **Análise de padrões**: filtro de matéria inclui as do edital.
- **Trilha**: o seletor de matéria usa as do edital e o campo de tópico oferece os tópicos daquela matéria.

### 3. Uso na geração
Ao gerar questões, resumos e reforços de uma matéria do edital, o contexto enviado à IA inclui os tópicos daquela matéria, para as questões ficarem dentro do recorte cobrado.

## Detalhes técnicos

- `src/lib/edital.ts`: tipo `MateriaEdital { id, nome, grupo, topicos[] }`, persistência em `localStorage` (chave nova incluída na sincronização em `src/lib/sync.ts`) e helpers `materiasPorGrupo()`, `todasAsMaterias()` (padrão + edital, sem duplicar nomes) e `topicosDaMateria()`.
- `src/lib/ai.functions.ts`: nova server fn `extrairMateriasEdital` (Zod + JSON) que recebe o texto colado e retorna `{ materias: [{ nome, grupo, topicos[] }] }`.
- Telas atualizadas para consumir os helpers em vez de `MATERIAS_GERAL` / `MATERIAS_ESPECIFICO` diretamente: `inclusao.tsx`, `questoes.tsx`, `leis.tsx`, `prova-interativa.tsx`, `analise-padroes.tsx`, `trilha.tsx`.
- Nenhuma mudança de banco: o estado continua salvo em `estado_estudo` via a sincronização existente.
