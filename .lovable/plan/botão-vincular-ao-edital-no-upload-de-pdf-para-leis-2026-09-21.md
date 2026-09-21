# Botão "Vincular ao edital" no Upload de PDF para leis

## O que você vai ver

Na tela **Incluir**, na área "Upload de PDF para leis", cada lei anexada ganha um botão **"Vincular ao edital"**:

- Ao tocar no botão, abre uma janela com as **matérias do concurso em estudo** (as mesmas do filtro de banca/cargo).
- Você escolhe a matéria e pronto: a lei passa a constar no **Detalhamento do edital**, dentro daquela matéria, já marcada como "texto salvo" — e aparece na tela **Leis** na lista recolhível daquela matéria, pronta para leitura.
- Abaixo do nome de cada lei anexada, aparece em quais matérias ela já está vinculada (ex.: "vinculada a: Direito Penal").
- Se a lei já estiver vinculada àquela matéria, nada duplica: o vínculo existente é mantido.
- Trocar o filtro de banca/cargo muda as matérias oferecidas na janela, como no resto do app.

## Como vai funcionar

1. **Novo vínculo a partir do acervo** (`src/lib/edital.ts`): função `vincularAnexoAMateria(materia, titulo, anexo)` que cria o link da lei na matéria já com o campo `anexo` preenchido (o nome do PDF salvo), sem repetir vínculo existente. O endereço do link fica como referência interna do acervo (`acervo:nome-do-arquivo`), já que o PDF veio do aparelho e não de um site.
2. **Botão por item** (`src/routes/_authenticated/inclusao.tsx`): o componente `UploadCampo` recebe uma ação extra opcional por arquivo; só o campo de leis a usa. Ao tocar, abre um diálogo (componente `Dialog` do projeto) listando `materiasAtivas(edital)`; ao escolher, chama `atualizarMateria` com o novo vínculo e avisa com toast ("Lei vinculada a Direito Penal").
3. **Selo de vínculo**: em cada item da lista de leis, mostra as matérias ativas que já têm essa lei vinculada (buscando `leisDaMateria` com `anexo` igual ao nome do arquivo).
4. **Renomear continua valendo**: ao renomear a lei, o vínculo acompanha — a função `renomearAnexoNasLeis` já existente cuida disso.

## O que NÃO muda

- Nada é apagado nem movido: o PDF continua no acervo e na nuvem como hoje.
- O cadastro de leis por link (dentro do Detalhamento) e o botão "Buscar texto da lei" continuam iguais.
- Sem banco de dados novo, sem IA, sem custo — só vínculo e visualização.

## Verificação

- `bunx tsgo --noEmit` e checagem do `/tmp/observability/build-errors.log`.
- Teste no navegador: anexar um PDF de lei, tocar em "Vincular ao edital", escolher uma matéria e conferir que ela aparece no Detalhamento e na tela Leis com "texto salvo".

## Detalhes técnicos

- Arquivos: `src/lib/edital.ts` (nova função `vincularAnexoAMateria`), `src/routes/_authenticated/inclusao.tsx` (prop de ação extra no `UploadCampo`, diálogo de escolha de matéria, selo de matérias vinculadas por item).
- Reaproveita: `materiasAtivas`, `leisDaMateria`, `comLeiAdicionada`, `atualizarMateria`, `renomearAnexoNasLeis` e o `Dialog` já usados no projeto.
- O selo "texto salvo" na tela Leis funciona automaticamente, pois ele já verifica o campo `anexo` do link.
