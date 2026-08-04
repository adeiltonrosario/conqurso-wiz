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
  enunciado: string;
  alternativas: Alternativa[];
  explicacao: string;
};

export const gerarQuestoes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        materia: z.string().trim().min(2).max(80),
        grupo: z.string().trim().max(60),
        banca: z.string().trim().max(30),
        quantidade: z.number().int().min(1).max(40),
        contexto: z.string().trim().max(20000).nullable(),
        formato: z.enum(["multipla", "certo-errado"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const result = await runAIJson<{ questoes: Questao[] }>(
      `Você é um elaborador de questões da banca ${data.banca}, especialista em concursos brasileiros.
Gere questões inéditas no padrão visual e de linguagem da banca.
${data.formato === "multipla" ? "Cada questão tem 5 alternativas (A, B, C, D, E) e apenas uma correta." : "Cada questão tem 2 alternativas: Certo e Errado."}
Cada alternativa recebe uma explicação passo a passo dizendo por que está correta ou errada, citando lei/artigo ou regra gramatical quando cabível.
${COR_INSTRUCOES}
Formato JSON: {"questoes":[{"id":string,"banca":string,"grupo":string,"materia":string,"enunciado":string,"explicacao":string,"alternativas":[{"letra":string,"texto":string,"correta":boolean,"explicacao":string}]}]}`,
      `Matéria: ${data.materia}. Grupo do edital: ${data.grupo}. Quantidade: ${data.quantidade} questões.
${data.contexto ? `Baseie-se também neste conteúdo cadastrado pelo candidato (leis, edital, provas anteriores, questões):\n${data.contexto.slice(0, 15000)}` : ""}`,
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
        materia: z.string().trim().max(80),
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
        materia: z.string().trim().min(2).max(80),
        capitulo: z.string().trim().min(2).max(200),
        banca: z.string().trim().max(30),
        contexto: z.string().trim().max(20000).nullable(),
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
