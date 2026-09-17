# Filtrar questões a partir de um link na aba Questões

Novo bloco **"Buscar questões por link"** dentro de `/questoes`: você cola o endereço de uma página com questões, o app lê o conteúdo, separa as questões, aplica os filtros de matéria, banca e assunto e mostra só o que passou — salvando no acervo apenas essas questões.

## Como vai funcionar

1. Você cola o link e escolhe:
   - **Matéria** (lista do edital ativo, respeitando o filtro de concurso/banca/cargo);
   - **Assunto**: tópico do Detalhamento do Edital da matéria escolhida e/ou palavra-chave livre;
   - **Banca**: já vem preenchida com a banca em estudo, com opção de aceitar qualquer banca.
2. O app baixa a página no servidor, transforma em texto limpo (sem menus, rodapés e propaganda) e reconhece enunciado, alternativas A–E e gabarito quando a página traz.
3. Cada questão é classificada por matéria e assunto pelo mesmo mecanismo já usado nos PDFs; o que não casar com os filtros fica de fora da prévia.
4. A prévia mostra as questões aprovadas com título "matéria · assunto · banca · ano". Você confere, pode desmarcar alguma e clica em **Salvar no acervo**.
5. As salvas passam a aparecer normalmente nos filtros da aba Questões, na prova interativa e podem ser editadas, favoritadas ou excluídas como as outras.

Tudo isso roda sem IA e **sem gastar crédito**.

## Sites que pedem login

Páginas públicas de provas (sites de bancas, portais abertos) funcionam. Sites de questões como o QConcursos exigem login e normalmente bloqueiam leitura automática: nesses casos o app avisa com uma mensagem clara ("esta página exige login") e oferece o caminho alternativo já existente — copiar as questões e colar no campo de inclusão, que separa enunciado e alternativas automaticamente. Não vou tentar contornar o login desses sites.

## Duplicadas e segurança

- Questões repetidas (mesmo enunciado já no acervo) são marcadas na prévia e não entram duas vezes.
- Só endereços públicos http/https são aceitos; a página é lida no servidor com limite de tamanho, e cada usuário só vê as próprias questões.

## Detalhes técnicos

- Novo `src/lib/questoes-url.functions.ts`: server function autenticada (`requireSupabaseAuth`) que reaproveita o validador de URL, o conversor HTML→texto e a limpeza de ruído de `src/lib/leis-url.functions.ts` (extraídos para um módulo compartilhado `src/lib/html-texto.ts` para evitar duplicação); limite de 5 MB e retorno `{ texto, titulo, origem }`.
- Extração no cliente: reaproveitar `extrairQuestoesDePdf`/`classificarQuestao`/`anoDaProva`/`tituloDaQuestao` de `src/lib/questoes-pdf.ts`, alimentando o texto vindo da URL; fallback por questão para `separarQuestaoColada` (`src/lib/questao-colada.ts`) quando o bloco não seguir o padrão de prova.
- Filtro: matéria/assunto via `classificadorDoEdital` + tópicos do Detalhamento (`topicosDaMateria`), banca comparada com a banca ativa, palavra-chave por `includes` normalizado no enunciado e alternativas.
- Persistência: `salvarQuestoesExtraidas` de `src/lib/questoes-banco.functions.ts`, com `origem` = URL e `prova` = título da página; modo local (sem login) continua salvando no estado local.
- Novo componente `src/components/QuestoesPorLink.tsx` renderizado em `src/routes/_authenticated/questoes.tsx` junto às fontes atuais (IA / PDF), sem alterar os fluxos existentes.
