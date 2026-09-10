# Buscar a lei por link (URL) e deixar salva no sistema

Sim, dá. Hoje você precisa colar o texto da lei ou anexar o PDF do Vade Mecum. Vai passar a existir um campo onde você cola o **endereço da lei** (por exemplo o link da lei no site do Planalto) e o sistema busca o texto, limpa e guarda para leitura.

## O que será feito

### 1. Campo "Buscar lei por link" em Inclusão
- Você cola o link e toca em **Buscar e salvar lei**.
- O sistema baixa a página, remove menus, propaganda e rodapés, e reconhece "LEI Nº …", títulos, capítulos e artigos (Art. 1º, incisos, parágrafos) — o mesmo reconhecimento que já usamos no texto colado.
- A lei fica salva na sua conta e aparece na aba **Leis → Texto Integral**, com árvore por título/capítulo, busca, favoritos e a opção de ocultar trechos.
- Mostra na hora quantos artigos foram reconhecidos. Se o link não trouxer artigos, avisa e sugere colar o texto.

### 2. Leis do edital, com um toque
Abaixo do campo aparece a lista das **leis citadas no seu edital** (as que já vêm do Detalhamento). Para cada uma:
- Um botão **Buscar** que já tenta o texto oficial no site do Planalto.
- Um selo indicando se ela já está salva no sistema ou ainda falta.

Assim você vai marcando as leis do edital até completar todas, sem precisar procurar PDF.

### 3. Sem gastar IA
Tudo é feito por leitura direta do texto da página, sem crédito de IA.

## Observações
- Funciona com páginas de texto público (Planalto, sites de legislação, diários oficiais). Páginas que exigem login ou que são só imagem não podem ser lidas — nesses casos continua valendo colar o texto ou anexar o PDF.
- Leis muito grandes (códigos inteiros) podem levar alguns segundos.

## Detalhes técnicos

- Novo `src/lib/leis-url.functions.ts`: server function `buscarLeiPorUrl` com `inputValidator` Zod (URL http/https, sem endereços internos/localhost/IP privado), `fetch` da página com timeout e limite de tamanho (~5 MB), conversão HTML→texto (remoção de `script`/`style`/`nav`/`footer`, decodificação de entidades, normalização de espaços e quebras) e retorno `{ titulo, texto, chars }`. Sem AI gateway.
- Reaproveita `lerVadeMecum` (`src/lib/vademecum.ts`) e `limparRuidoLei` (`src/lib/limpeza-lei.ts`) no cliente para contar artigos e limpar rodapés antes de salvar.
- Persistência idêntica ao fluxo atual de `extrairLeiColada` em `src/routes/_authenticated/inclusao.tsx`: `salvarTextoAnexo(nome, texto)` + novo item em `acervo.provas` com `marcarComoLei(nome)` e `texto.slice(0, LIMITE_TRECHO_IA)`.
- Novo bloco de UI em `/inclusao` (Input de URL + botão com estado de carregamento) e lista das normas do edital reaproveitando `normasDoEdital`/o mapeamento de `src/lib/mapa-vademecum.ts`, com link sugerido `planalto.gov.br` por número/ano quando disponível.
- Sem mudança de banco e sem novas dependências.
