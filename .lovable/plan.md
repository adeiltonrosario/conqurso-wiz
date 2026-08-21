# Questões das provas filtradas pelo edital e salvas como banco de dados

## Problemas hoje

- Na aba Questões, quando nenhuma questão extraída casa com a matéria escolhida, o app mostra **todas** as questões da prova (há um "se não achar nada, mostra tudo"). Por isso aparecem questões de outras matérias.
- Questões que o extrator não conseguiu classificar ("Não classificada") passam pelo filtro sempre, mesmo fora da matéria.
- Não existe filtro por assunto do edital dentro da matéria.
- As questões extraídas ficam só no aparelho (dentro do bloco "acervo" espelhado na nuvem). Não formam um banco consultável, e um acervo grande de provas pode estourar o limite de armazenamento local.

## O que passa a funcionar

1. **Filtro estrito por matéria**
   - A lista mostra somente questões cuja matéria pertence ao grupo/matéria selecionada e ao edital/banca/cargo ativos.
   - Sem "cai para tudo": se não houver questão daquela matéria, aparece um aviso claro ("Nenhuma questão das suas provas em Direito Penal — anexe outra prova ou classifique as questões pendentes"), com atalho para as não classificadas.

2. **Filtro por assunto do edital**
   - Dentro da matéria, uma linha de chips com os assuntos do edital que têm questões (com contagem). Selecionar um assunto restringe a lista.
   - Quando a aba é aberta com foco em um assunto (vindo da Trilha/Relevância), o chip já vem marcado.

3. **Não classificadas em separado**
   - Passam a viver em uma seção própria "Pendentes de classificação (N)", fora da lista da matéria.
   - No cartão, um seletor de matéria/assunto do edital salva a classificação; a questão migra para a matéria certa.

4. **Banco de questões salvo no sistema**
   - As questões extraídas passam a ser gravadas na sua conta na nuvem, em tabela própria, com matéria, assunto, prova de origem, número, alternativas, gabarito e explicação.
   - Ficam disponíveis em qualquer aparelho e reutilizáveis pelas outras telas: Revisão espaçada, Prova interativa e como fonte prioritária para a IA.
   - Reanexar a mesma prova atualiza as questões existentes em vez de duplicar.

## Detalhes técnicos

- Migração: nova tabela `public.questoes_extraidas` (`id text`, `user_id uuid`, `prova`, `numero`, `banca`, `grupo`, `materia`, `assunto`, `enunciado`, `alternativas jsonb`, `explicacao`, `origem`, `criado_em`), chave primária `(user_id, id)`, GRANTs para `authenticated`/`service_role`, RLS com políticas `auth.uid() = user_id` (sem acesso `anon`).
- Novo `src/lib/questoes-banco.functions.ts` com server fns autenticadas (`requireSupabaseAuth`): `listarQuestoesExtraidas`, `salvarQuestoesExtraidas` (upsert em lote por `id`), `atualizarQuestaoExtraida`, `removerQuestoesDaProva`. Chamadas via `useQuery`/`useMutation` no componente (nunca em loader de rota pública).
- `src/routes/_authenticated/inclusao.tsx`: após a extração local, faz upsert no banco; `acervo.extraidas` continua como cache local (fonte de leitura offline), sincronizado com o retorno do servidor.
- `src/routes/_authenticated/questoes.tsx`: remove os fallbacks `doPdfNaMateria.length ? … : doPdf` e `visiveis.length ? … : permitidas`; adiciona chips de assunto, seção de pendentes com seletor de matéria/assunto e estado vazio explicativo.
- `src/lib/questoes-pdf.ts`: helpers de agrupamento por assunto e de reclassificação manual; `NAO_CLASSIFICADA` deixa de ser tratada como "sempre visível".
- Revisão e Prova interativa passam a ler o banco extraído filtrado pela matéria ativa.
- Sem novas dependências e sem uso de IA no fluxo de extração/filtro.
