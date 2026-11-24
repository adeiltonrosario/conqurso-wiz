/**
 * Treino de Crase — cada questão com o "inside" para descobrir a certa.
 *
 * Regra pedida em 23/11/2026: cada questão deve trazer o insight de como
 * descobrir a alternativa correta pelo comando, e a repetição deve
 * embaralhar as alternativas de lugar, para fixar o conteúdo em vez de
 * decorar a letra.
 *
 * Só entram aqui questões com alternativas e gabarito verificados nos
 * PDFs das provas enviadas. O gabarito é identificado pelo TEXTO da
 * alternativa, não pela letra — as versões da prova embaralham as letras.
 * As demais questões de crase contadas (2023-07-02, 2017, Oficial 2023)
 * estão catalogadas em `ASSUNTOS_CONTADOS` com a separação por comando;
 * entram aqui quando as alternativas forem verificadas.
 */

export type ModeloCrase = "crase-direta" | "regencia" | "outro-assunto" | "lacuna";

export type AlternativaTreino = {
  /** Texto da alternativa, como está na prova. */
  texto: string;
  /** É a alternativa correta (gabarito oficial da versão indicada). */
  correta: boolean;
  /** Por que essa alternativa está certa ou errada — o inside. */
  porQue: string;
};

export type QuestaoTreinoCrase = {
  id: string;
  prova: string;
  ano: number;
  numero: number;
  modelo: ModeloCrase;
  /** O comando da questão, como está na prova. */
  comando: string;
  /** Como descobrir a certa por esse comando — o método, não a resposta. */
  insight: string;
  alternativas: AlternativaTreino[];
  /** Versão do gabarito consultado (as letras mudam por versão). */
  gabaritoVersao: string;
};

export const QUESTOES_CRASE_TREINO: QuestaoTreinoCrase[] = [
  {
    id: "escrevente-2023-05-28-q10",
    prova: "VUNESP — TJ-SP Escrevente",
    ano: 2023,
    numero: 10,
    modelo: "crase-direta",
    comando: "Assinale a alternativa em que o sinal indicativo da crase está empregado em conformidade com a norma-padrão.",
    insight:
      "Modelo direto: todas as 5 alternativas têm 'à'. Não procure o 'à' — classifique cada um: é obrigatório (preposição 'a' + artigo feminino), proibido (antes de masculino, de artigo indefinido, de pronome, de numeral) ou facultativo? Risque as proibidas primeiro; sobra 1.",
    gabaritoVersao: "Versão 3",
    alternativas: [
      {
        texto: "Devido à economia em crescimento no ano de 2022, chegou-se à uma melhora mais longa e aguda.",
        correta: false,
        porQue: "Crase proibida: 'à uma' — não há crase antes de artigo indefinido ('uma').",
      },
      {
        texto: "Jovens saem de casa à procura de emprego, muitos não o encontram, o que é um ônus à Nação.",
        correta: true,
        porQue: "Crase obrigatória: 'à procura' é locução feminina (a + a procura). 'À Nação' também está certa (a + a Nação), e é a única alternativa sem crase proibida.",
      },
      {
        texto: "Quando se referem à pandemia, é preciso lembrar que coube à ela a deterioração dos empregos.",
        correta: false,
        porQue: "Crase proibida: 'à ela' — não há crase antes de pronome pessoal ('ela'). 'À pandemia' está certa, mas a alternativa inteira tem que estar certa.",
      },
      {
        texto: "O desemprego, embora atinja à todos os segmentos sociais, agride mais às classes mais pobres.",
        correta: false,
        porQue: "Crase proibida: 'à todos' — 'todos' é masculino, não há artigo feminino para fundir com a preposição.",
      },
      {
        texto: "De ano à ano, calcula-se a taxa de desocupação e, em 2022, ela foi à 7,9% no quarto trimestre.",
        correta: false,
        porQue: "Crase proibida duas vezes: 'de ano à ano' (palavras repetidas, sem artigo) e 'à 7,9%' (antes de numeral).",
      },
    ],
  },
  {
    id: "escrevente-2021-q04",
    prova: "VUNESP — TJ-SP Escrevente",
    ano: 2021,
    numero: 4,
    modelo: "crase-direta",
    comando: "No trecho 'Guardar “eu te amo” é prejudicial à saúde', a crase mantém-se se a expressão destacada for substituída por:",
    insight:
      "Modelo substituição: troque 'saúde' pela alternativa e pergunte se a crase sobrevive. 'Prejudicial a' pede a preposição 'a'; a crase só fica se a palavra nova for feminina COM artigo definido. Sem artigo, ou com palavra masculina ou pronome indefinido, a crase cai.",
    gabaritoVersao: "Versão 2",
    alternativas: [
      {
        texto: "pessoa que o esconde.",
        correta: true,
        porQue: "Crase mantém-se: 'prejudicial à pessoa que o esconde' — 'pessoa' é feminina e vem com artigo definido ('a pessoa que…'), então 'a' (preposição) + 'a' (artigo) = crase.",
      },
      {
        texto: "pessoas que o escondem.",
        correta: false,
        porQue: "Crase cai: 'a' no singular seguida de palavra no plural, sem artigo definido — 'prejudicial a pessoas', sem crase.",
      },
      {
        texto: "qualquer pessoa que o esconda.",
        correta: false,
        porQue: "Crase cai: 'qualquer' impede o artigo definido — não há 'a' + 'a' para fundir.",
      },
      {
        texto: "quem o esconde.",
        correta: false,
        porQue: "Crase cai: não há crase antes de pronome indefinido ('quem').",
      },
      {
        texto: "todos que o escondem.",
        correta: false,
        porQue: "Crase cai: não há crase diante de pronome indefinido ('todos').",
      },
    ],
  },
  {
    id: "escrevente-2024-11-24-q24",
    prova: "VUNESP — TJ-SP Escrevente (reaplicação)",
    ano: 2024,
    numero: 24,
    modelo: "regencia",
    comando: "A regência nominal atende à norma-padrão em:",
    insight:
      "Modelo regência mascarada: o comando não fala em crase, mas a crase decide. Julgue primeiro a regência do nome ('necessidade de', 'apta a', 'proficiência em', 'aspiração a'): se o nome pede 'a' e a palavra seguinte é feminina com artigo, a crase tem que estar lá; se a regência está errada, a alternativa inteira cai, mesmo com a crase certa.",
    gabaritoVersao: "Versão 4",
    alternativas: [
      {
        texto: "A necessidade em uma atuação nas redes sociais fez o chefe prontamente pedir ajuda à dona Tetê.",
        correta: false,
        porQue: "Regência errada: 'necessidade em' — o certo é 'necessidade de'. A crase em 'ajuda à dona Tetê' está certa, mas a alternativa inteira cai pela regência.",
      },
      {
        texto: "demonstrar proficiência em relação às redes sociais.",
        correta: true,
        porQue: "Regência certa e crase certa: 'proficiência em' + 'em relação a' + 'às redes sociais' (a + as).",
      },
      {
        texto: "Com seu pedido, o chefe considerou que dona Tetê estaria apta de ajudá-lo com as redes sociais.",
        correta: false,
        porQue: "Regência errada: 'apta de' — o certo é 'apta a'.",
      },
      {
        texto: "Ao ser alertado que deveria atuar nas redes sociais, o chefe decidiu recorrer à ajuda de dona Tetê.",
        correta: false,
        porQue: "Regência errada: 'alertado que' — o certo é 'alertado de que'. A crase em 'recorrer à ajuda' está certa, mas a alternativa cai pela regência.",
      },
      {
        texto: "O chefe decerto não tinha aspiração com uma grande atuação nas redes sociais, mas acatou o conselho.",
        correta: false,
        porQue: "Regência errada: 'aspiração com' — o certo é 'aspiração a'.",
      },
    ],
  },
  {
    id: "escrevente-2025-q02",
    prova: "VUNESP — TJ-SP Escrevente",
    ano: 2025,
    numero: 2,
    modelo: "lacuna",
    comando:
      "A Universidade de Cambridge, ______ Stephen Hawking dedicou boa parte de suas contribuições, considera o renomado professor como uma inspiração ______ , ______ quais deixa um legado indelével. De acordo com a norma-padrão, as lacunas da frase devem ser preenchidas, respectivamente, com:",
    insight:
      "Modelo lacuna: julgue lacuna por lacuna, sem pular nenhuma. 1ª: o verbo 'dedicar' pede a preposição 'a' + o relativo 'qual' com artigo → 'à qual'. 2ª: 'inspiração a' — 'milhões' é masculino, não há artigo para fundir → sem crase. 3ª: 'deixa um legado a + as quais' → 'às'. A alternativa que errar qualquer uma das três cai.",
    gabaritoVersao: "Versão 1",
    alternativas: [
      {
        texto: "a qual … à pessoas em geral … as",
        correta: false,
        porQue: "1ª lacuna errada: falta a crase — o certo é 'à qual'. 2ª lacuna errada: crase proibida em 'à pessoas' (sem artigo definido). 3ª lacuna errada: falta a crase — o certo é 'às quais'.",
      },
      {
        texto: "à qual … a milhões de pessoas … às",
        correta: true,
        porQue: "1ª lacuna certa: 'à qual' — preposição 'a' (dedicar a) + artigo 'a' (a qual). 2ª lacuna certa: 'a milhões de pessoas' — só a preposição, 'milhões' é masculino e não há artigo para fundir. 3ª lacuna certa: 'às' — 'a' + 'as quais'.",
      },
      {
        texto: "à que … às pessoas do mundo … as",
        correta: false,
        porQue: "1ª lacuna errada: o relativo é 'à qual', não 'à que'. 3ª lacuna errada: falta a crase — o certo é 'às quais'.",
      },
      {
        texto: "à qual … à muitas pessoas … às",
        correta: false,
        porQue: "2ª lacuna errada: crase proibida em 'à muitas pessoas' — não há crase antes de pronome indefinido ('muitas'). A 1ª e a 3ª estão certas, mas a alternativa inteira tem que estar certa.",
      },
      {
        texto: "a qual … as muitas pessoas … às",
        correta: false,
        porQue: "1ª lacuna errada: falta a crase — o certo é 'à qual'. 2ª lacuna errada: falta a preposição 'a' — o certo é 'a milhões de pessoas'.",
      },
    ],
  },
  {
    id: "analista-2025-q10",
    prova: "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    ano: 2025,
    numero: 10,
    modelo: "crase-direta",
    comando: "O uso do acento indicativo da crase e o emprego de pronome estão em conformidade com a norma-padrão em:",
    insight:
      "Modelo direto com dois julgamentos: a crase E o pronome têm que estar certos na mesma alternativa. Primeiro julgue a crase ('à' só quando há preposição 'a' + artigo feminino); depois o pronome ('queriam ele' é errado — objeto direto é 'o'; 'tornando-lhe' é errado — 'tornar' pede objeto direto). A certa é a única sem erro nos dois.",
    gabaritoVersao: "Versão 1",
    alternativas: [
      {
        texto: "De uma parte à outra do Brasil, Ainda Estou Aqui foi conquistando as pessoas, que torciam por ele como se fosse Copa do Mundo e queriam ele como vencedor do Oscar.",
        correta: false,
        porQue: "Crase certa ('à outra'), pronome errado: 'queriam ele' — objeto direto de 'querer' é 'o' ('queriam-no'), não 'ele'.",
      },
      {
        texto: "À críticas positivas e prêmios no exterior, seguiu-se um sentimento que as pessoas costumavam ver em época de Copas do Mundo e isso lhes empolgou.",
        correta: false,
        porQue: "Crase proibida: 'À críticas' — não há preposição 'a' nem artigo definido justificando a crase no início da frase.",
      },
      {
        texto: "Ao decidir dar vida à história dos Paiva na atual conjuntura, Walter Salles provocou uma transformação do tema local, tornando-lhe em algo universal.",
        correta: false,
        porQue: "Crase certa ('à história'), pronome errado: 'tornando-lhe em algo universal' — 'tornar' pede objeto direto ('tornando-o'), não 'lhe'.",
      },
      {
        texto: "Já conquistamos cinco Copas do Mundo, mas nunca chegamos à ter um Prêmio Nobel e até anteontem jamais havíamos levado um Oscar. Agora, porém, temos esse.",
        correta: false,
        porQue: "Crase proibida: 'chegamos à ter' — não há crase antes de verbo no infinitivo.",
      },
      {
        texto: "O mundo rendeu-se à atuação impecável de Fernanda Torres, cujo talento fê-la internacionalmente reconhecida, garantindo-lhe prêmios e celebrações.",
        correta: true,
        porQue: "Crase certa ('à atuação': render-se a + a atuação) e pronomes certos ('fê-la' — objeto direto; 'garantindo-lhe' — objeto indireto de 'garantir a alguém').",
      },
    ],
  },
];

/**
 * Embaralha as alternativas de lugar e reatribui as letras, mantendo o
 * `correta` em cada alternativa. Repetir a mesma questão com outra ordem
 * impede decorar a letra e obriga a julgar o conteúdo de novo.
 * Usa Fisher-Yates com `Math.random`; o embaralhamento é só de ordem,
 * nunca muda o texto nem o gabarito.
 */
export function embaralharAlternativas(
  questao: QuestaoTreinoCrase,
): { letra: string; texto: string; correta: boolean; porQue: string }[] {
  const letras = ["A", "B", "C", "D", "E"];
  const copia = [...questao.alternativas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia.map((a, i) => ({
    letra: letras[i]!,
    texto: a.texto,
    correta: a.correta,
    porQue: a.porQue,
  }));
}

/** Uma repetição da questão: mesmas alternativas, outra ordem. */
export function repetirQuestao(questao: QuestaoTreinoCrase): {
  questao: QuestaoTreinoCrase;
  alternativasEmbaralhadas: ReturnType<typeof embaralharAlternativas>;
} {
  return { questao, alternativasEmbaralhadas: embaralharAlternativas(questao) };
}
