# Ocultar trechos na leitura das leis

Sim, é possível. A ideia: na aba Leis → Texto Integral, você pode esconder o que não quer ler — um artigo inteiro, um inciso/parágrafo, ou só um pedaço que você selecionou com o dedo/mouse. O que fica oculto continua salvo, só sai da leitura, e pode voltar a qualquer momento.

## Como vai funcionar

1. **Ocultar artigo inteiro**
   - Cada artigo ganha um ícone de olho. Um toque e ele desaparece da leitura (fica só uma linha fininha "Art. 312 oculto — mostrar").
   - Um botão no topo: "Mostrar tudo oculto" / "Reexibir tudo".

2. **Ocultar um inciso, parágrafo ou alínea**
   - Mesmo ícone de olho ao lado de cada parágrafo/inciso listado abaixo do artigo.

3. **Ocultar um trecho selecionado**
   - Você seleciona o texto na tela e aparece um botãozinho flutuante "Ocultar".
   - O trecho é substituído por um marcador discreto (▪▪▪) que, tocado, revela o texto de novo.

4. **Limpeza automática do PDF**
   - Um interruptor "Esconder revogados e rodapés", ligado por padrão:
     - artigos e parágrafos marcados como **(Revogado)**, **(Vetado)** ou riscados;
     - lixo de rodapé/cabeçalho do PDF (números de página soltos, nome da editora, endereços de site, "Vade Mecum", numeração repetida).

5. **Fica salvo no aparelho**
   - Suas ocultações valem para aquela lei e continuam depois de fechar o app.
   - Contador na barra de filtros: "3 artigos e 5 trechos ocultos".
   - Artigos ocultos não entram na geração de questões nem na leitura dos favoritos.

## Detalhes técnicos

- Novo `src/lib/ocultos.ts`: store em `localStorage` (`concurseiro:ocultos`) com evento de sincronização, no mesmo padrão de `src/lib/favoritos.ts`. Chaves estáveis por `lei|referencia|hash(texto)` (reaproveitando o `hash` de favoritos) para artigo, e `…|p:{i}` para parágrafo/inciso. Trechos livres guardados como `{ chaveArtigo, texto }` normalizado por espaços.
  API: `ocultarArtigo`, `ocultarParagrafo`, `ocultarTrecho`, `reexibir`, `limparOcultos(lei)`, `useOcultos()`.
- Novo `src/lib/limpeza-lei.ts`: funções puras `ehRevogado(texto)` (regex `\(\s*(Revogado|Revogada|Vetado)\b`), `limparRuidoLei(texto)` (números de página soltos, `[[p:n]]` residual, URLs, CNPJ, "Vade Mecum"/editora) — reutilizando os padrões já existentes em `src/lib/padroes-local.ts` sem alterar aquele arquivo.
- `src/components/LeiIntegral.tsx`:
  - filtro adicional na lista `artigos` para remover ocultos e revogados (quando o interruptor estiver ligado); paragrafos filtrados na renderização;
  - botão olho (`Eye`/`EyeOff` de lucide) no cabeçalho do artigo e em cada parágrafo;
  - novo componente `TextoOcultavel` que envolve `Realce`, escuta `onMouseUp`/`onTouchEnd`, lê `window.getSelection()` e mostra o botão flutuante "Ocultar"; ao renderizar, corta os trechos ocultos daquele artigo e insere o marcador clicável;
  - linha de status com contadores e ações "Reexibir tudo" / "Mostrar ocultos".
- `src/components/Favoritos.tsx` e a montagem de trechos para questões passam a ignorar artigos ocultos.
- Sem IA, sem créditos, sem mudança de banco de dados.
