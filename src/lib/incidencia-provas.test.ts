import { describe, expect, it } from "vitest";
import {
  calcularPesoPorMateria,
  EDITAIS_MATERIAS,
  assuntosDaMateria,
  pesoDentroDaMateria,
  escopoDoConcurso,
  escoposPeso,
  filtrarPesosPorEdital,
  pesoPorBanca,
  rankingCompleto,
  PROVAS_CONTADAS,
} from "./incidencia-provas";

describe("peso por matéria — provas contadas no Qconcursos", () => {
  it("tem as 22 provas contadas, com URL de origem em cada uma", () => {
    expect(PROVAS_CONTADAS).toHaveLength(22);
    for (const p of PROVAS_CONTADAS) {
      // Qconcursos (página pública da prova) ou PCI Concursos (página de
      // download) — as duas provas de 2025 vieram em PDF enviado pelo
      // usuário, com origem no PCI.
      expect(p.url).toMatch(
        /^https:\/\/(www\.qconcursos\.com\/questoes-de-concursos\/provas\/|www\.pciconcursos\.com\.br\/provas\/download\/)/,
      );
      expect(p.disciplinas.reduce((s, d) => s + d.questoes, 0)).toBeLessThanOrEqual(p.totalQuestoes);
    }
  });

  it("VUNESP Escrevente: Português 23,9% em 10 provas", () => {
    const escopo = escoposPeso().find(
      (e) => e.banca === "VUNESP" && e.cargo === "Escrevente Técnico Judiciário",
    )!;
    // 4 provas contadas antes + 5 provas em PDF enviadas em 23/11/2026
    // (2018, 2021, 2023-05-28, 2024-09-08 e 2024-11-24 reaplicação)
    // + Escrevente 2025 (07/12/2025, 70 questões, formato novo).
    expect(escopo.provas).toHaveLength(10);
    const portugues = escopo.pesos.find((p) => p.materia === "Língua Portuguesa")!;
    // 216 (9 provas antigas) + 16 (2025) = 232 em 970 questões (900 + 70)
    expect(portugues.peso).toBe(23.9);
    expect(portugues.questoes).toBe(232);
    expect(portugues.provas).toBe(10);
    const informatica = escopo.pesos.find((p) => p.materia === "Noções de Informática")!;
    // 14+14+16+16 (Qconcursos 2023-07-02, 2017, 2015, 2014) + 14+14+14+14
    // (PDFs 2018, 2021, 2024-09-08, 2024-11-24) + 9 (2025); 2023-05-28 só tem Português contado.
    expect(informatica.questoes).toBe(125);
    expect(informatica.provas).toBe(9);
  });

  it("AOCP Investigador: Penal e Processo Penal 21,7% cada, em 60 questões", () => {
    const escopo = escoposPeso().find((e) => e.banca === "Instituto AOCP")!;
    const penal = escopo.pesos.find((p) => p.materia === "Direito Penal")!;
    expect(penal.peso).toBe(21.7);
    expect(penal.questoes).toBe(13);
    expect(penal.totalContado).toBe(60);
  });

  it("o peso usa só as provas em que a matéria foi contada", () => {
    const pesos = calcularPesoPorMateria([
      {
        banca: "VUNESP",
        instituicao: "TJ-SP",
        cargo: "Oficial de Justiça",
        ano: 2024,
        aplicadaEm: "14/12/2024",
        totalQuestoes: 100,
        url: "https://www.qconcursos.com/questoes-de-concursos/provas/vunesp-2024-tj-sp-oficial-de-justica",
        disciplinas: [{ materia: "Direito Civil", questoes: 7 }],
        assuntosTopo: [],
      },
    ]);
    expect(pesos[0]!.peso).toBe(7);
    expect(pesos[0]!.provas).toBe(1);
  });

  it("encontra o escopo do concurso ativo por banca e cargo", () => {
    expect(escopoDoConcurso("VUNESP", "Escrevente Técnico Judiciário")?.banca).toBe("VUNESP");
    expect(escopoDoConcurso("Instituto AOCP", "Investigador de Polícia Civil")?.provas).toHaveLength(1);
    expect(escopoDoConcurso("FGV", "Delegado")).toBeNull();
  });

  it("peso por banca soma cargos diferentes da mesma banca", () => {
    const vunesp = pesoPorBanca("VUNESP")!;
    // Escrevente 10 + Oficial 2 + PC-SP Investigador 1 + PC-BA Investigador 1 + Analista 1
    // + Assistente Social 1 + Psicólogo 1 + Juiz 1 + Titular Provimento 1 + Titular Remoção 1 = 20 provas
    expect(vunesp.provas).toHaveLength(20);
    const portugues = vunesp.pesos.find((p) => p.materia === "Língua Portuguesa")!;
    // 232 (Escrevente) + 40 (Oficial) + 15 (PC-SP) + 10 (Analista 2025) + 12 (Assistente 2024) + 12 (Psicólogo 2024) = 321,
    // sem contagem completa em PC-BA 2018 e sem Português em Juiz/Titular
    expect(portugues.questoes).toBe(321);
    expect(portugues.provas).toBe(16);
  });

  it("Oficial 2024 soma 100 (Processo Civil 10, não 12) e as 5 provas novas de 2024 entram", () => {
    // Correção 26/11/2026: a lista por disciplina soma 100; o 12 era do
    // painel "mais cobradas" e faltavam 6 disciplinas de 1 questão.
    const oficial2024 = PROVAS_CONTADAS.find(
      (p) => p.cargo === "Oficial de Justiça" && p.ano === 2024,
    )!;
    expect(oficial2024.disciplinas.reduce((s, d) => s + d.questoes, 0)).toBe(100);
    expect(oficial2024.disciplinas.find((d) => d.materia === "Direito Processual Civil")!.questoes).toBe(10);
    expect(oficial2024.disciplinas.find((d) => d.materia === "Atualidades")!.questoes).toBe(1);
    // 5 entradas novas de 2024, todas somando o total da prova.
    for (const cargo of [
      "Assistente Social Judiciário",
      "Psicólogo Judiciário",
      "Juiz Substituto",
      "Titular de Serviços de Notas e de Registros — Provimento",
      "Titular de Serviços de Notas e de Registros — Remoção",
    ]) {
      const prova = PROVAS_CONTADAS.find((p) => p.cargo === cargo && p.ano === 2024)!;
      expect(prova).toBeDefined();
      expect(prova.disciplinas.reduce((s, d) => s + d.questoes, 0)).toBe(prova.totalQuestoes);
    }
    // O Simulado do Qconcursos (17/07/2024) NÃO entra — só provas oficiais.
    expect(PROVAS_CONTADAS.some((p) => p.cargo.includes("Simulado"))).toBe(false);
    // Escopos novos existem (1 prova cada).
    expect(escoposPeso().find((e) => e.cargo === "Assistente Social Judiciário")?.provas).toHaveLength(1);
    expect(escoposPeso().find((e) => e.cargo === "Psicólogo Judiciário")?.provas).toHaveLength(1);
  });

  it("só entra o que é do mesmo assunto cobrado no edital", () => {
    const vunesp = pesoPorBanca("VUNESP")!;
    // Edital do Escrevente TJ-SP 2027: Português, Direito (Penal, Proc.
    // Penal, Proc. Civil, Constitucional, Administrativo, Legislação),
    // Atualidades, Matemática, Informática, Raciocínio Lógico, Estatuto PcD.
    const editalEscrevente = [
      "Língua Portuguesa",
      "Direito Penal",
      "Direito Processual Penal",
      "Direito Processual Civil",
      "Direito Constitucional",
      "Direito Administrativo",
      "Legislação Interna",
      "Atualidades",
      "Matemática",
      "Informática",
      "Raciocínio Lógico",
      "Estatuto da Pessoa com Deficiência",
    ];
    const { dentro, fora } = filtrarPesosPorEdital(vunesp.pesos, editalEscrevente);
    expect(dentro.map((p) => p.materia)).toContain("Língua Portuguesa");
    expect(dentro.map((p) => p.materia)).toContain("Direito Penal");
    // Criminologia (PC-SP Investigador) e Direito Civil (Oficial) não
    // estão no edital do Escrevente, então ficam de fora.
    expect(fora.map((p) => p.materia)).toContain("Criminologia");
    expect(fora.map((p) => p.materia)).toContain("Direito Civil");
    expect(dentro.map((p) => p.materia)).not.toContain("Criminologia");
  });

  it("ranking é dentro da matéria: assuntos ordenados por contagem", () => {
    const dentro = assuntosDaMateria("Língua Portuguesa");
    expect(dentro.map((a) => a.assunto)).toEqual([
      "Interpretação de Textos",
      "Noções Gerais de Compreensão e Interpretação de Texto",
      "Sintaxe",
      "Significação Contextual de Palavras e Expressões",
      "Crase",
      "Morfologia",
    ]);
    // Crase: 17 em 306 questões de Português contadas (mesma banca:
    // 24×9 Escrevente + 20×2 Oficial + 16 Escrevente 2025 + 10 Analista
    // 2025 + 12 Assistente 2024 + 12 Psicólogo 2024) = 5,6% dentro da matéria.
    const crase = dentro.find((a) => a.assunto === "Crase")!;
    expect(pesoDentroDaMateria(crase, 306)).toBe(5.6);
    // Separado por comando: crase pedida (7) x regência mascarada (3)
    // x outro assunto com crase como distrator (1) x lacunas a/à (6,
    // incorporadas por decisão do usuário em 23/11/2026).
    expect(crase.separacaoCraseRegencia).toEqual({
      craseDireta: 7,
      regenciaMascarada: 3,
      outroAssuntoMascarada: 1,
      lacunas: 6,
    });
    expect(pesoDentroDaMateria(dentro[0]!, 306)).toBe(31.4);
    // Mas a contagem explícita subestima: Crase está mascarada pela
    // regência, então o app marca prioridade alta, não só o número.
    expect(crase.alertaMascarado).toMatch(/mascarad/i);
    expect(crase.alertaMascarado).toMatch(/regência/i);
  });

  it("ranking completo cobre todas as matérias do edital, com Crase", () => {
    const vunesp = pesoPorBanca("VUNESP")!;
    const ranking = rankingCompleto(vunesp.pesos, EDITAIS_MATERIAS["TJ-SP · Escrevente Técnico Judiciário"]!);
    // Todas as 12 matérias do edital, nenhuma fora do ranking.
    expect(ranking).toHaveLength(12);
    expect(ranking[0]!.materia).toBe("Língua Portuguesa");
    const portugues = ranking.find((r) => r.materia === "Língua Portuguesa")!;
    const crase = portugues.assuntos.find((a) => a.assunto === "Crase")!;
    expect(crase.questoes).toBe(17);
    expect(crase.provas).toBe(15);
    expect(crase.comoCobra).toMatch(/regência/i);
    // Matéria sem contagem nas provas verificadas continua no ranking,
    // marcada como não contada, para não sumir do treino: aqui, com só
    // Português contado, as outras 11 ficam no fim, com peso 0.
    const rankingParcial = rankingCompleto(
      [{ materia: "Língua Portuguesa", peso: 24, questoes: 96, totalContado: 400, provas: 4 }],
      EDITAIS_MATERIAS["TJ-SP · Escrevente Técnico Judiciário"]!,
    );
    expect(rankingParcial).toHaveLength(12);
    const semContagem = rankingParcial.filter((r) => !r.contada);
    expect(semContagem).toHaveLength(11);
    expect(semContagem.every((r) => r.peso === 0)).toBe(true);
  });
});
