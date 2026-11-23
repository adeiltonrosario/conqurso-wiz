# Remix of Smart Study AI

# Concurseiro Inteligente

## Objetivo

Aplicativo para resolução de questões de concurso com agente IA que explica passo a passo, grifa erros e permite incluir leis e editais para gerar simulados idênticos às provas, focado em aprendizado vertical para celular/tablet.

## Telas

### Criação de Redação

**Rota:** `/redacao

`

**Objetivo:** Permitir que o usuário insira um tema ou estudo de caso e gere uma redação dissertativa-argumentativa de até 35 linhas, dividida em introdução, desenvolvimento e conclusão, com conectivos destacados por cores.

**Componentes:**

- **Campo de tema ou estudo de caso**: Usuário digita o tema ou caso para a redação.

- **Seletor de modelo de redação**: Exibe modelos prontos de redação para o usuário escolher como base.

- **Botão Gerar Redação**: Aciona a criação da redação com base no tema e modelo selecionados.

- **Área de introdução**: Exibe o parágrafo introdutório da redação gerada, com conectivos destacados em azul, vermelho, amarelo e em negrito para realce.

- **Área de desenvolvimento**: Exibe os parágrafos de desenvolvimento da redação gerada, com conectivos destacados em azul, vermelho, amarelo e em negrito para realce.

- **Área de conclusão**: Exibe o parágrafo de conclusão da redação gerada, com conectivos destacados em azul, vermelho, amarelo e em negrito para realce.

- **Contador de linhas**: Exibe a quantidade de linhas da redação gerada, limitada a 35.

### Inclusão de Conteúdo

**Rota:** `/inclusao

`

**Objetivo:** Permitir ao usuário cadastrar questões, assuntos, gramática, leis (Vade Mecum), provas anteriores e edital para geração de simulados e provas interativas.

**Componentes:**

- **Input de Questão**: Permite digitar o enunciado da questão.

- **Campo de Assunto**: Permite selecionar ou digitar o assunto da questão.

- **Seletor de Banca**: Permite selecionar a banca organizadora (ex: FGV, CESPE, FCC, VUNESP, etc.).

- **Alternativas (A a E ou Certo/Errado)**: Permite digitar alternativas no formato A a E para múltipla escolha, ou no formato Certo/Errado para questões verdadeiro/falso.

- **Upload de PDF para Leis**: Abre seletor de arquivos para upload de PDF com leis.

- **Área de Texto para Leis**: Permite digitar ou colar o texto de leis manualmente.

- **Upload de Gramática (PDF)**: Abre seletor de arquivos para upload de PDF com gramática; o agente consulta o conteúdo gramatical para buscar explicações e referenciar páginas nas respostas, ex: 'conforme a Gramática de Cintra, o verbo concorda com o sujeito em número e pessoa, pág. 123'.

- **Upload de Provas Anteriores por Banca**: Abre seletor de arquivos para upload de PDFs com provas anteriores organizadas por banca; o agente de IA consulta as provas para buscar questões e gerar PDF interativo.

- **Upload de Edital**: Abre seletor de arquivos para upload de PDF do edital.

- **Botão Gerar Simulado**: Processa os dados e gera simulado com explicações na tela de questões.

- **Botão Gerar Prova Interativa**: Processa as provas anteriores e questões cadastradas para criar uma prova interativa em PDF com questões, respostas corretas e explicações detalhadas.

### Análise de Padrões de Provas

**Rota:** `/analise-padroes

`

**Objetivo:** Permitir que o usuário anexe provas, gabaritos e imagens para que a IA identifique padrões visuais de acertos e erros questão por questão, responda a prova automaticamente e gere um PDF da própria prova respondida com os padrões visualizados destacados, pronto para impressão.

**Componentes:**

- **Área de Upload de Arquivos**: Usuário arrasta ou seleciona arquivos de prova, gabarito e imagens; a IA processa e extrai os dados automaticamente.

- **Seleção de Matéria**: Usuário filtra a análise por matéria do edital para visualizar padrões específicos daquela disciplina.

- **Navegador de Questões**: Usuário avança ou retrocede entre as questões da prova; cada questão exibe suas alternativas com destaques coloridos.

- **Painel de Alternativas**: Exibe cada alternativa com destaque: palavras idênticas ao gabarito em amarelo, palavras corretas em azul e palavras erradas em vermelho; padrões de vogais, consoantes e pontuação são realçados.

- **Indicador de Padrões por Frase**: Mostra setas azuis e vermelhas ao lado de cada frase em provas de certo/errado, indicando a localização da construção correta e da invertida.

- **Resumo de Padrões Descobertos**: Exibe lista dos padrões recorrentes identificados pela IA, como início e término típicos da alternativa correta, uso de vírgulas e conectivos.

- **Chat com IA para Análise de Padrões**: Usuário envia mensagens de texto e imagens com suas hipóteses; a IA responde se o padrão sugerido é válido e como aplicá-lo na prova.

- **Botão Gerar PDF**: Usuário clica para gerar um PDF completo da prova respondida pela IA, com os padrões visualizados destacados; o arquivo é baixado para impressão.

### Questões e Explicações

**Rota:** `/questoes

`

**Objetivo:** Simular questões de prova real no padrão FCC com 5 alternativas, organizadas por Conhecimento Geral e Conhecimento Específico conforme edital, com filtro por matéria e explicação passo a passo do agente IA.

**Componentes:**

- **Filtro por Conhecimento (Geral / Específico)**: Filtra as questões entre os dois grandes grupos do edital.

- **Filtro por Matéria**: Filtra as questões por matéria/disciplina dentro do grupo selecionado.

- **Lista de Questões**: Exibe questões no formato de prova real com 5 alternativas (A a E).

- **Questão no Padrão FCC**: Exibe o enunciado da questão simulando o formato da banca FCC.

- **Alternativas (A a E)**: Exibe 5 alternativas de múltipla escolha para simular prova real e permitir seleção.

- **Gabarito com Explicação da IA**: Exibe a resposta correta e explicação passo a passo do agente IA.

- **Trechos Grifados de Erros**: Destaca visualmente os erros cometidos pelo usuário na resolução da questão.

### Prova Interativa em PDF

**Rota:** `/prova-interativa

`

**Objetivo:** Visualizar e interagir com uma prova simulada idêntica ao formato da banca, com questões organizadas por matéria do edital e explicações detalhadas de cada alternativa.

**Componentes:**

- **Seletor de Matéria do Edital**: Seleciona a matéria desejada (Português com mínimo de 35 questões; Direito Penal com mínimo de 35 questões); filtra as questões exibidas de acordo com a matéria escolhida.

- **Painel de Questões em Scroll Vertical**: Exibe todas as questões em scroll contínuo vertical, formato idêntico ao da prova real; cada questão da banca FCC com 5 alternativas; garante no mínimo 35 questões para Português e 35 para Direito Penal.

- **Indicador de Progresso por Matéria**: Mostra quantas questões foram respondidas e quantas faltam por matéria, respeitando os mínimos de 35 questões.

- **Botão de Correção Automática**: Ao clicar, revela o gabarito oficial e exibe as explicações detalhadas de cada alternativa logo abaixo da questão.

- **Bloco de Explicação por Alternativa**: Exibe explicação passo a passo de cada alternativa; destaca a correta em azul e as incorretas em vermelho; formatação idêntica ao gabarito comentado da banca.

- **Barra de Rolagem Vertical**: Permite navegar livremente por todas as questões da prova em um único fluxo vertical, simulando a experiência de uma prova impressa física.

- **Opção de Download do PDF**: Faz o download da prova gerada em formato PDF para visualização offline.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://conqurso-wiz.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e40365f8-b121-4d9d-a8cd-e1b6acc69bd8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
