import { MODELOS_REDACAO } from "./acervo";

export type ModeloRedacao = (typeof MODELOS_REDACAO)[number];

export type RedacaoLocal = {
  titulo: string;
  introducao: string;
  desenvolvimento: string[];
  conclusao: string;
};

function primeiraMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function limparTema(tema: string): string {
  return tema
    .replace(/\s+/g, " ")
    .replace(/[.:;!?]+$/, "")
    .trim();
}

export function gerarTitulo(tema: string): string {
  const limpo = limparTema(tema);
  if (!limpo) return "Redação dissertativa-argumentativa";
  const conectores = ["Reflexões sobre", "A importância de", "Desafios de", "Perspectivas sobre"];
  const base = conectores[limpo.length % conectores.length];
  return `${base} ${primeiraMaiuscula(limpo)}`;
}

function marcarConectivo(texto: string, palavra: string, cor: "azul" | "vermelho" | "amarelo"): string {
  const regex = new RegExp(`\\b(${palavra})\\b`, "gi");
  return texto.replace(regex, `{{${cor}|$1}}`);
}

/**
 * Marca conectivos e termos-chave com as cores do sistema.
 * Azul: adição/conclusão. Vermelho: oposição/ressalva. Amarelo: ênfase/termos-chave.
 */
export function marcarConectivos(texto: string): string {
  let resultado = texto;

  const azul = ["além disso", "ademais", "portanto", "assim", "logo", "desse modo", "por conseguinte", "dessa forma", "também", "e", "enfim"];
  const vermelho = ["porém", "contudo", "todavia", "entretanto", "apesar de", "embora", "ainda que", "mesmo que", "no entanto"];
  const amarelo = ["fundamental", "essencial", "importante", "necessário", "urgente", "imprescindível", "relevante", "preocupante"];

  // Ordenar por tamanho decrescente para não quebrar expressões compostas.
  for (const palavra of azul.sort((a, b) => b.length - a.length)) {
    resultado = marcarConectivo(resultado, palavra, "azul");
  }
  for (const palavra of vermelho.sort((a, b) => b.length - a.length)) {
    resultado = marcarConectivo(resultado, palavra, "vermelho");
  }
  for (const palavra of amarelo.sort((a, b) => b.length - a.length)) {
    resultado = marcarConectivo(resultado, palavra, "amarelo");
  }

  return resultado;
}

function contextualizacao(tema: string): string {
  return `No cenário contemporâneo, o tema ${tema} tornou-se alvo de intensos debates na sociedade brasileira.`;
}

function tese(tema: string): string {
  return `Diante disso, é ${marcarConectivos("fundamental")} compreender que ${tema} exige uma abordagem integrada e efetiva.`;
}

function encaminhamento(): string {
  return `Nesse sentido, o presente texto analisará as principais questões envolvidas, apresentando argumentos que justifiquem essa posição.`;
}

export function gerarIntroducao(tema: string, _modelo: string): string {
  const limpo = limparTema(tema);
  return marcarConectivos(`${contextualizacao(limpo)} ${tese(limpo)} ${encaminhamento()}`);
}

export function gerarDesenvolvimento(tema: string, modelo: string): string[] {
  const limpo = limparTema(tema);

  if (modelo.includes("comparativa")) {
    return [
      marcarConectivos(`Em primeiro lugar, é preciso observar as causas que levam ${limpo} a configurar-se como problema social relevante. Fatores históricos, econômicos e culturais contribuem para essa realidade, exigindo uma análise cuidadosa.`),
      marcarConectivos(`Por outro lado, as consequências de ${limpo} são igualmente preocupantes. A inação ou a adoção de medidas insuficientes pode agravar desigualdades, comprometer direitos e afetar a qualidade de vida da população.`),
      marcarConectivos(`Assim, a comparação entre causas e consequências demonstra que a questão não admite soluções simplistas, mas sim ações coordenadas entre os diversos setores da sociedade.`),
    ];
  }

  if (modelo.includes("jurídico")) {
    return [
      marcarConectivos(`Primeiramente, a análise de ${limpo} deve considerar a legislação vigente e os princípios que norteiam o ordenamento jurídico brasileiro. A Constituição Federal de 1988 estabelece diretrizes fundamentais que se aplicam ao tema.`),
      marcarConectivos(`Ademais, a jurisprudência dos tribunais superiores tem reconhecido a relevância do assunto, consolidando entendimentos que devem ser observados na aplicação concreta da norma.`),
      marcarConectivos(`Portanto, a fundamentação legal oferece subsídios robustos para a compreensão do problema e para a proposição de soluções compatíveis com o sistema de direito nacional.`),
    ];
  }

  if (modelo.includes("dados")) {
    return [
      marcarConectivos(`Inicialmente, dados recentes indicam que ${limpo} afeta parcela significativa da população, configurando-se como desafio prioritário para as políticas públicas.`),
      marcarConectivos(`Além disso, especialistas da área têm alertado para os riscos da manutenção do status quo, destacando a necessidade de intervenção coordenada entre Estado e sociedade.`),
      marcarConectivos(`Dessa forma, a convergência entre evidências empíricas e análises técnicas reforça a urgência de medidas estruturantes.`),
    ];
  }

  // Padrão: tese + 2 argumentos
  return [
    marcarConectivos(`Em primeiro plano, ${limpo} representa um desafio que demanda atenção imediata, uma vez que seus efeitos se estendem por diferentes camadas da sociedade. A omissão do Estado e a desinformação da população agravam ainda mais o cenário.`),
    marcarConectivos(`Por conseguinte, é necessário investir em ações preventivas e corretivas que promovam a conscientização e garantam o acesso a direitos fundamentais. A educação e a fiscalização aparecem como instrumentos centrais nesse processo.`),
  ];
}

export function gerarConclusao(tema: string, _modelo: string): string {
  const limpo = limparTema(tema);
  return marcarConectivos(`Diante do exposto, fica evidente que ${limpo} constitui questão de ${marcarConectivos("relevante")} importância para o desenvolvimento social. Assim, torna-se urgente a adoção de políticas públicas integradas, além do engajamento da sociedade civil, a fim de superar os obstáculos identificados e construir uma realidade mais justa e efetiva.`);
}

export function gerarRedacaoLocal(tema: string, modelo: string): RedacaoLocal {
  return {
    titulo: gerarTitulo(tema),
    introducao: gerarIntroducao(tema, modelo),
    desenvolvimento: gerarDesenvolvimento(tema, modelo),
    conclusao: gerarConclusao(tema, modelo),
  };
}
