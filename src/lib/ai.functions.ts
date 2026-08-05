import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runAIJson, runAI } from "./ai-gateway.server";

/**
 * Marcação de cores usada em todos os textos gerados:
 *   {{azul|texto}} {{vermelho|texto}} {{amarelo|texto}}
 */
const COR_INSTRUCOES = `Destaque termos usando exatamente a marcação {{azul|texto}}, {{vermelho|texto}} ou {{amarelo|texto}}.
Use azul para conectivos de adição/conclusão e construções corretas, vermelho para oposição/ressalva e erros, amarelo para termos idênticos ao gabarito ou palavras-chave.`;

export type Redacao = {
  titulo: string;
  introducao: string;
  desenvolvimento: string[];
  conclusao: string;
  linhas: number;
};

export const gerarRedacao = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        tema: z.string().trim().min(5).max(2000),
        modelo: z.string().trim().max(120),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return await runAIJson<Redacao>(
      `Você é um corretor e redator de bancas de concurso público no Brasil.
Escreva uma redação dissertativa-argumentativa em português formal, com no máximo 35 linhas de ~90 caracteres (nunca ultrapasse).
Estrutura: 1 parágrafo de introdução, 2 ou 3 de desenvolvimento e 1 de conclusão com proposta de intervenção.
${COR_INSTRUCOES}
Formato JSON: {"titulo":string,"introducao":string,"desenvolvimento":string[],"conclusao":string,"linhas":number}`,
      `Modelo de redação escolhido: ${data.modelo || "padrão de banca"}.
Tema ou estudo de caso: ${data.tema}`,
    );
  });

export type Alternativa = {
  letra: string;
  texto: string;
  correta: boolean;
  explicacao: string;
};

export type Questao = {
  id: string;
  banca: string;
  grupo: "Conhecimento Geral" | "Conhecimento Específico";
  materia: string;
  assunto?: string;
  relevancia_materia?: number;
  relevancia_assunto?: number;
  /** "Baseada na prova X" quando vem de um PDF anexado, ou "Inédita". */
  origem?: string;
  enunciado: string;
  alternativas: Alternativa[];
  explicacao: string;
};

export const gerarQuestoes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        materia: z.string().trim().min(2).max(400),
        grupo: z.string().trim().max(60),
        banca: z.string().trim().max(30),
        quantidade: z.number().int().min(1).max(40),
        contexto: z
          .string()
          .trim()
          .nullable()
          .transform((v) => (v ? v.slice(0, 120000) : v)),
        formato: z.enum(["multipla", "certo-errado"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const result = await runAIJson<{ questoes: Questao[] }>(
      `Você é um elaborador de questões da banca ${data.banca}, especialista em concursos brasileiros.
Gere questões no padrão visual e de linguagem da banca ${data.banca}.
Regra obrigatória: enunciado, alternativas (quantidade, estilo, distratores típicos) e explicações devem seguir
estritamente o estilo da banca ${data.banca} — não misture o formato de outras bancas. No campo "banca" de cada questão
retorne exatamente "${data.banca}".
PRIORIDADE DE FONTE: se o contexto trouxer PROVAS ANTERIORES ANEXADAS, use-as como banco de questões principal —
reaproveite as questões reais dessas provas (enunciado, alternativas, distratores e gabarito) sobre a matéria pedida,
adaptando a redação ao formato da banca ${data.banca} quando a prova for de outra banca. Só crie questões inéditas
quando as provas anexadas não tiverem conteúdo suficiente sobre a matéria/assunto pedido.
No campo "origem" informe "Prova: <nome do arquivo/prova>" quando a questão vier de uma prova anexada, ou "Inédita".
Provas de banca diferente de ${data.banca} servem apenas como fonte de conteúdo, nunca como modelo de formato.
${data.formato === "multipla" ? "Cada questão tem 5 alternativas (A, B, C, D, E) e apenas uma correta." : "Cada questão tem 2 alternativas: Certo e Errado."}
Cada alternativa recebe uma explicação passo a passo dizendo por que está correta ou errada, citando lei/artigo ou regra gramatical quando cabível.
${COR_INSTRUCOES}
Informe também, para cada questão: "assunto" (o tópico específico do edital, ex.: "Crimes contra a Administração Pública"),
"relevancia_materia" (percentual estimado de incidência da MATÉRIA no total da prova da banca, número de 0 a 100)
e "relevancia_assunto" (percentual estimado de incidência do ASSUNTO dentro da matéria, número de 0 a 100).
Baseie os percentuais no histórico real de provas da banca; use uma casa decimal.
Formato JSON: {"questoes":[{"id":string,"banca":string,"grupo":string,"materia":string,"assunto":string,"origem":string,"relevancia_materia":number,"relevancia_assunto":number,"enunciado":string,"explicacao":string,"alternativas":[{"letra":string,"texto":string,"correta":boolean,"explicacao":string}]}]}`,
      `Matéria: ${data.materia}. Grupo do edital: ${data.grupo}. Quantidade: ${data.quantidade} questões.
${data.contexto ? `Conteúdo cadastrado pelo candidato (provas anteriores, leis, edital, questões):\n${data.contexto.slice(0, 100000)}` : ""}`,
    );
    return result.questoes ?? [];
  });


export type PadraoAnalise = {
  resumo: string[];
  questoes: {
    numero: number;
    materia: string;
    enunciado: string;
    frases: { texto: string; sentido: "correta" | "invertida" }[];
    alternativas: {
      letra: string;
      texto: string;
      correta: boolean;
      padrao: string;
    }[];
  }[];
};

export const analisarPadroes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        conteudo: z.string().trim().min(10).max(40000),
        materia: z.string().trim().max(400),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return await runAIJson<PadraoAnalise>(
      `Você é um analista de padrões de provas de concurso. Resolva a prova e identifique padrões visuais e linguísticos recorrentes
(início e término típicos da alternativa correta, uso de vírgulas, conectivos, vogais/consoantes, pontuação, extensão da alternativa).
Nas alternativas, marque com {{amarelo|...}} palavras idênticas ao gabarito, {{azul|...}} palavras corretas e {{vermelho|...}} palavras erradas.
Em itens de certo/errado, classifique cada frase como "correta" (construção direta) ou "invertida".
Formato JSON: {"resumo":string[],"questoes":[{"numero":number,"materia":string,"enunciado":string,"frases":[{"texto":string,"sentido":"correta"|"invertida"}],"alternativas":[{"letra":string,"texto":string,"correta":boolean,"padrao":string}]}]}`,
      `Matéria em foco: ${data.materia || "todas"}.
Conteúdo da prova/gabarito enviado pelo candidato:\n${data.conteudo.slice(0, 30000)}`,
    );
  });

export const conversarPadroes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        pergunta: z.string().trim().min(1).max(4000),
        contexto: z.string().trim().max(20000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return await runAI(
      `Você é um tutor de concursos especializado em padrões de provas. Responda em português, de forma direta e prática,
dizendo se a hipótese do candidato é válida, com que frequência o padrão aparece e como aplicá-lo na prova. Máximo de 180 palavras.`,
      `Contexto da análise:\n${data.contexto.slice(0, 15000)}\n\nHipótese/pergunta do candidato: ${data.pergunta}`,
    );
  });

export type LeiResumida = {
  materia: string;
  capitulo: string;
  base_legal: string;
  sintese: string[];
  artigos: { referencia: string; texto: string; comentario: string }[];
  pegadinhas: string[];
  memorizar: string[];
};

export const resumirLei = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        materia: z.string().trim().min(2).max(400),
        capitulo: z.string().trim().min(2).max(400),
        banca: z.string().trim().max(30),
        // O acervo pode trazer PDFs longos; cortamos em vez de rejeitar.
        contexto: z
          .string()
          .trim()
          .nullable()
          .transform((v) => (v ? v.slice(0, 60000) : v)),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return await runAIJson<LeiResumida>(
      `Você é professor de legislação para concursos públicos brasileiros.
Resuma APENAS o capítulo/tópico pedido do edital — não trate de outros capítulos da matéria.
Traga a base legal exata (lei, artigos), uma síntese em tópicos curtos de leitura rápida,
os artigos essenciais com texto enxuto e comentário do que a banca cobra, pegadinhas típicas e mnemônicos/pontos para memorizar.
${COR_INSTRUCOES}
Formato JSON: {"materia":string,"capitulo":string,"base_legal":string,"sintese":string[],"artigos":[{"referencia":string,"texto":string,"comentario":string}],"pegadinhas":string[],"memorizar":string[]}`,
      `Matéria: ${data.materia}. Capítulo cobrado no edital: ${data.capitulo}. Banca: ${data.banca || "geral"}.
${data.contexto ? `Conteúdo cadastrado pelo candidato (edital/leis):\n${data.contexto.slice(0, 12000)}` : ""}`,
    );
  });

export type MateriaExtraida = {
  nome: string;
  grupo: "Conhecimento Geral" | "Conhecimento Específico";
  topicos: string[];
};

export const extrairMateriasEdital = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        texto: z.string().trim().min(20).max(40000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const result = await runAIJson<{
      materias: MateriaExtraida[];
      cargos?: string[];
      bancas?: string[];
    }>(
      `Você organiza o conteúdo programático de editais de concursos públicos brasileiros.
Leia o texto e liste as MATÉRIAS cobradas, classificando cada uma como "Conhecimento Geral"
(português, matemática/raciocínio lógico, informática, atualidades, legislação básica de cidadania)
ou "Conhecimento Específico" (matérias técnicas do cargo).
Para cada matéria, liste os tópicos/capítulos exatamente como cobrados no edital, em itens curtos.
Liste também os CARGOS previstos no edital, com o nome exato (ex.: "Escrivão de Polícia Civil").
Liste ainda as BANCAS organizadoras citadas no edital, com a sigla usual (ex.: "Cebraspe", "FGV", "FCC", "Vunesp").
Não invente matérias, cargos nem bancas que não estejam no texto.
Formato JSON: {"cargos":string[],"bancas":string[],"materias":[{"nome":string,"grupo":"Conhecimento Geral"|"Conhecimento Específico","topicos":string[]}]}`,
      `Texto do edital:\n${data.texto.slice(0, 30000)}`,
    );
    return {
      materias: result.materias ?? [],
      cargos: result.cargos ?? [],
      bancas: result.bancas ?? [],
    };
  });


export type RelevanciaMateriaEdital = {
  nome: string;
  relevancia: number;
  topicos: { nome: string; relevancia_disciplina: number }[];
};

/** Estima, com base no histórico da banca/cargo, a relevância das matérias e tópicos do edital. */
export const estimarRelevanciaEdital = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        banca: z.string().trim().max(120).optional(),
        cargo: z.string().trim().max(160).optional(),
        materias: z
          .array(
            z.object({
              nome: z.string().trim().min(1).max(160),
              topicos: z.array(z.string().trim().max(300)).max(120),
            }),
          )
          .min(1)
          .max(40),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const lista = data.materias
      .map((m) => `- ${m.nome}: ${m.topicos.join("; ") || "sem tópicos informados"}`)
      .join("\n");

    const result = await runAIJson<{ materias: RelevanciaMateriaEdital[] }>(
      `Você analisa a incidência histórica de assuntos em provas de concurso público no Brasil.
Para cada matéria informada, estime "relevancia": o percentual do TOTAL de questões da prova
que costuma cair naquela matéria (a soma das matérias deve ficar próxima de 100).
Para cada tópico, estime "relevancia_disciplina": o percentual das questões DAQUELA matéria
que costuma cair no tópico (a soma dos tópicos de uma matéria deve ficar próxima de 100).
Use até duas casas decimais. Não crie matérias nem tópicos que não estejam na lista.
Formato JSON: {"materias":[{"nome":string,"relevancia":number,"topicos":[{"nome":string,"relevancia_disciplina":number}]}]}`,
      `Banca: ${data.banca || "não informada"}. Cargo: ${data.cargo || "não informado"}.
Matérias e tópicos do edital:
${lista}`,
    );
    return result.materias ?? [];
  });
