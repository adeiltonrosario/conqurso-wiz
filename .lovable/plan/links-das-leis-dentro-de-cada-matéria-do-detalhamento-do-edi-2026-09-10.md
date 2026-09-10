# Links das leis dentro de cada matéria do Detalhamento do edital

Hoje o campo de link fica solto na tela **Incluir**, longe do edital. Ele passa a ficar **dentro de cada matéria** do Detalhamento do edital, para você cadastrar as leis conforme o seu edital.

## Como vai funcionar

1. Ao abrir uma matéria no **Detalhamento do edital**, aparece a seção **Leis desta matéria**.
2. Você digita um nome (ex.: "Lei de Abuso de Autoridade") e cola o endereço da lei, e toca em **Salvar link**.
3. Os links ficam guardados na matéria e voltam sempre que você abrir. Cada link tem:
   - **Buscar texto** — baixa o texto da lei e salva em Leis → Texto Integral (sem gastar IA), mostrando quantos artigos foram reconhecidos;
   - **Abrir** — abre a lei em outra aba;
   - **Editar** — permite corrigir o nome ou o endereço;
   - **Excluir** — remove o link.
4. Um selo indica quando a lei daquele link já está salva no sistema para leitura.
5. O campo de link solto da tela Incluir sai, junto com a lista automática de leis do edital, já que o cadastro passa a ser por matéria.

## Detalhes técnicos

- `src/lib/edital.ts`: novo campo opcional em `MateriaEdital` — `leis?: { id: string; titulo: string; url: string }[]`, persistido no mesmo `localStorage`/sync já existente. Helpers `adicionarLeiMateria`, `atualizarLeiMateria`, `removerLeiMateria` usando `atualizarMateria`.
- `src/components/EditalRelevancia.tsx`: dentro de `LinhaMateria` (área expandida), novo bloco `LeisDaMateria` com formulário (título + URL), validação simples `^https?://`, lista com editar em linha, excluir e botão de busca.
- A busca reaproveita `buscarLeiPorUrl` de `src/lib/leis-url.functions.ts` e, no cliente, `limparRuidoLei` + `lerVadeMecum` para contar artigos, salvando com `salvarTextoAnexo` e um item marcado como lei no acervo — a mesma lógica hoje usada em `/inclusao`, extraída para um helper reutilizável (`src/lib/leis-salvar.ts`) para não duplicar código.
- `src/routes/_authenticated/inclusao.tsx`: remover o bloco "Buscar lei por link" e a lista de normas do edital, mantendo o texto colado e o upload de PDF.
- Sem migração de banco, sem IA e sem novas dependências.
