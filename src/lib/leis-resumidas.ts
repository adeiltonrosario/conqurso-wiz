/**
 * Leitura resumida por matéria — Escrevente Técnico Judiciário, TJ-SP
 * (VUNESP, Edital nº 02/2026, prova 14/03/2027, 70 questões).
 *
 * REGRA: só entra aqui o que foi verificado em prova real contada
 * questão por questão. Nada de estimativa de IA, nada de artigo ou
 * tópico que está no edital mas nunca foi identificado numa prova.
 * O que está no edital e nunca foi identificado com certeza vai para
 * NUNCA_COBRADOS, por matéria, para estudar do zero.
 *
 * Base da contagem: 5 provas de Escrevente (VUNESP) analisadas questão
 * por questão — 2018 (25/03/2018), 2021 (30/10/2021), 2023-05-28,
 * 2024-09-08 e 2024-11-24 (reaplicação) — mais a contagem por
 * disciplina de 2014, 2015, 2017 e 2023-07-02 no Qconcursos
 * (ver src/lib/incidencia-provas.ts), mais a Escrevente 2025
 * (07/12/2025, 70 questões, formato novo) e as 17 questões
 * aproveitáveis da Analista de Sistemas 2025 (11/05/2025), contadas
 * em 24/11/2026. `provas` = em quantas dessas provas o item foi
 * identificado (mínimo verificado, com a questão citada em `exemplo`);
 * `questoes` = total verificado no conjunto das provas, quando contado.
 * Itens de Direito usam artigo/inciso; nas demais matérias, o "artigo"
 * é o assunto/tópico cobrado.
 *
 * Atualização 26/11/2026: entraram as 8 provas oficiais VUNESP de
 * 2024 (Escrevente 08/09, reaplicação, Oficial 14/12, Assistente
 * Social 03/02 e Psicólogo 03/02 — Juiz e Titular contam só nos
 * escopos próprios e na banca, não nestes itens). O Simulado do
 * Qconcursos (17/07/2024) NÃO entra, por decisão do usuário.
 * Decisões da aplicação: Assistente Q12 conta em Sintaxe (não em
 * Morfologia); voz passiva conta como Concordância (Assistente Q07,
 * Psicólogo Q06); Assistente Q04 ("Ortografia/Pontuação") não entra
 * em Pontuação — enunciado não verificado no mapeamento; Assistente
 * Q67 e Psicólogo Q68 contam como Porcentagem e Oficial Q85 como
 * médias. A versão 08/09 do Qconcursos é DIFERENTE da versão do PDF
 * — só entram as identificações verificadas no PDF (Q28 art. 311-A
 * e Q29 peculato, art. 312, §3º); a reaplicação confere nas duas
 * versões e entra normalmente.
 *
 * Crase: total 17 em 15 provas (direta 7, regência mascarada 3, outro
 * assunto 1, lacunas a/à 6), como em ASSUNTOS_CONTADOS. As 6 lacunas
 * (2018 Q19, 2021 Q06 e Q23, 2024-09-08 Q18, 2024-11-24 Q20, 2025 Q02)
 * foram INCORPORADAS por decisão do usuário em 23/11/2026. As 2 novas
 * são Assistente 2024 Q12 e Psicólogo 2024 Q12 (regência mascarada).
 */

export type BlocoEdital = "BLOCO I" | "BLOCO II" | "BLOCO III";

/**
 * Um item da leitura resumida: artigo de lei (Direito) ou assunto/
 * tópico cobrado (demais matérias), com resumo de uma linha.
 */
export type ItemLeitura = {
  materia: string;
  bloco: BlocoEdital;
  /** Lei (Direito) ou referência do tópico (demais matérias). */
  lei: string;
  /** Artigo/inciso (Direito) ou assunto/tópico cobrado (demais matérias). */
  artigo: string;
  /** Resumo de UMA linha: o que o artigo/tópico diz, em linguagem direta. */
  resumo: string;
  /** Em quantas provas contadas o item foi identificado. */
  provas: number;
  /** Total de questões verificado no conjunto das provas contadas, quando contado. */
  questoes?: number | undefined;
  /** Como a banca cobrou, com prova e número da questão, quando verificado. */
  exemplo?: string | undefined;
  /** Separação por comando (só Crase): direta x mascarada x lacunas. */
  separacaoCraseRegencia?: {
    craseDireta: number;
    regenciaMascarada: number;
    outroAssuntoMascarada?: number | undefined;
    /** Lacunas "a" x "à", incorporadas por decisão do usuário (23/11/2026). */
    lacunas?: number | undefined;
  } | undefined;
};

/** Item do edital que nunca foi identificado com certeza nas provas contadas. */
export type ItemNuncaCobrado = {
  materia: string;
  bloco: BlocoEdital;
  lei: string;
  /** Artigo ou tópico do edital sem contagem verificada. */
  artigo: string;
  /** Por que estudar do zero. */
  motivo: string;
};

export const LEITURA_RESUMIDA: ItemLeitura[] = [
  /* ------------------------------------------------ BLOCO I — Língua Portuguesa */
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, itens 1 e 2",
    artigo: "Interpretação de Textos",
    resumo: "Texto longo (jornal, literatura) + alternativa que resume ou conclui o que o texto diz; a pegadinha troca o sentido ou generaliza.",
    provas: 10,
    questoes: 69,
    exemplo: "12 questões em 2018 (Q01–Q03, Q06, Q09–Q13, Q18, Q20, Q23) e 12 em 2021 (Q01, Q02, Q07, Q08, Q11, Q13, Q14, Q17–Q20). Escrevente 2025: +4 (Q01, Q06, Q10, Q11) = 39 em 6 provas Escrevente; Analista 2025: +6 (Q01, Q02, Q03, Q06, Q07, Q08) = 45 em 7 provas. Oficial 2024: +12 (Q01, Q02, Q03, Q06, Q07, Q08, Q09, Q10, Q13, Q14, Q17, Q18); Assistente 2024: +6 (Q01, Q02, Q03, Q05, Q09, Q10); Psicólogo 2024: +6 (Q01, Q02, Q04, Q09, Q10, Q11) = 69 em 10 provas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, itens 9, 10 e 11",
    artigo: "Sintaxe (concordância, regência e colocação)",
    resumo: "Concordância, regência e colocação cobradas juntas, quase sempre dentro de reescrita: julgar a frase certa pela norma-padrão.",
    provas: 10,
    questoes: 50,
    exemplo: "7 em 2018 (Q05, Q07, Q08, Q14, Q15, Q17, Q24) e 5 em 2021 (Q03, Q09, Q15, Q21, Q24). Escrevente 2025: +3 (Q04, Q14, Q16) = 37 em 6 provas Escrevente; Analista 2025: +2 (Q04 reescrita, Q09 concordância) = 39 em 7 provas. Oficial 2024: +5 (Q05, Q06, Q10, Q11, Q16); Assistente 2024: +4 (Q05, Q07, Q11, Q12 — Q12 é crase/regência); Psicólogo 2024: +2 (Q06, Q08) = 50 em 10 provas. No Qconcursos, a mesma contagem aparece separada como Sintaxe (29 em 8 provas) — aqui é a soma questão por questão nas provas contadas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, itens 5, 6 e 7",
    artigo: "Significação Contextual de Palavras e Expressões",
    resumo: "Sentido da palavra no contexto: o sinônimo, o antônimo ou o sentido figurado certo — a pegadinha troca por outro parecido.",
    provas: 9,
    questoes: 29,
    exemplo: "2018 Q16 (substituir sem prejuízo de sentido), Q18 (sentido figurado), Q21 (antônimos); 2021 Q10 (sinônimos), Q14 (sentido figurado). Escrevente 2025: +4 (Q03, Q08, Q12, Q13) = 21 em 6 provas Escrevente; Analista 2025: +1 (Q05, antonímia) = 22 em 7 provas. Oficial 2024: +6 (Q03, Q06, Q09, Q10, Q14 — denotação/conotação — Q18); Psicólogo 2024: +1 (Q10, sentido figurado) = 29 em 9 provas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 8",
    artigo: "Morfologia (classes de palavras)",
    resumo: "Classes de palavras — pronome, advérbio, numeral, substantivo: o sentido que a palavra imprime na frase.",
    provas: 9,
    questoes: 26,
    exemplo: "2018 Q04 (pronomes), Q16 (advérbios), Q21 (antônimos), Q22 (numeral); 2021 Q10 (sinônimos), Q12 (pronome), Q22 (substantivos). Escrevente 2025: +2 (Q07, Q09) = 18 em 6 provas. Oficial 2024: +4 (Q12, Q15, Q19, Q20); Assistente 2024: +2 (Q06, Q08); Psicólogo 2024: +2 (Q05, Q07) = 26 em 9 provas. As Q12 de crase/regência (Assistente e Psicólogo) não contam aqui.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 12",
    artigo: "Crase",
    resumo: "Sempre dentro de um texto: julgar se a crase está certa, se ela se mantém ao trocar o verbo, ou onde ela caberia — é regência disfarçada.",
    provas: 15,
    questoes: 17,
    exemplo: "Direta: 2023-05-28 Q10 (as 5 alternativas testam 'à'); 2021 Q04 (substituição); Analista 2025 Q10, gabarito E (crase e pronome certos juntos). Regência mascarada: 2024-11-24 Q24; Assistente 2024 Q12 (Q3543227) e Psicólogo 2024 Q12 (Q3543297), crase/regência. Lacunas a/à (incorporadas por decisão do usuário, 23/11/2026): 2018 Q19, 2021 Q06 e Q23, 2024-09-08 Q18, 2024-11-24 Q20, 2025 Q02, gabarito B. Total 17 em 15 provas (direta 7, regência 3, outro assunto 1, lacunas 6).",
    separacaoCraseRegencia: { craseDireta: 7, regenciaMascarada: 3, outroAssuntoMascarada: 1, lacunas: 6 },
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, itens 1 e 2",
    artigo: "Noções Gerais de Compreensão e Interpretação de Texto",
    resumo: "Ideia geral do texto: o que o texto afirma como um todo, sem se prender a um detalhe.",
    provas: 6,
    questoes: 12,
    exemplo: "No Qconcursos, 38 questões em 8 provas com esse rótulo; nos 5 PDFs contados questão por questão, 7 — o resto foi classificado como Interpretação. Oficial 2024: +5 (Q01, Q07, Q08, Q13, Q17) = 12 em 6 provas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 13",
    artigo: "Pontuação",
    resumo: "Pontuação da norma-padrão — quase nunca perguntada sozinha: vem mascarada dentro de reescrita ou de título.",
    provas: 8,
    questoes: 9,
    exemplo: "1 por prova nos 5 PDFs, sempre mascarada; explícita só em 2021 Q16 ('atende à norma-padrão de pontuação'). Escrevente 2025: +2 (Q05, Q15) = 7 em 6 provas. Oficial 2024 Q04 (vírgula) e Psicólogo 2024 Q03 (pontuação) = 9 em 8 provas. Assistente 2024 Q04 ('Ortografia/Pontuação') não entra — enunciado não verificado no mapeamento e Ortografia não é item do edital de 2027.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 9",
    artigo: "Concordância verbal e nominal",
    resumo: "Verbo concorda com o sujeito e nome concorda com o termo a que se refere — a pegadinha muda o sujeito de lugar.",
    provas: 6,
    questoes: 12,
    exemplo: "Faz parte das 50 de Sintaxe; contada à parte aqui para a leitura. 2018 Q07, Q17 e Q24; 2021 Q03 e Q09. Escrevente 2025: +3 (Q04, Q14, Q16); Analista 2025: +1 (Q09, concordância) = 9 questões em 4 provas. Oficial 2024 Q05 + Assistente 2024 Q07 (voz passiva) + Psicólogo 2024 Q06 (voz passiva) = 12 questões em 6 provas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 11",
    artigo: "Colocação pronominal",
    resumo: "Próclise, ênclise e mesóclise: onde o pronome vai na frase, pela norma-padrão.",
    provas: 5,
    questoes: 7,
    exemplo: "Faz parte das 50 de Sintaxe; contada à parte aqui para a leitura. 2018 Q08; 2021 Q15 e Q24. Escrevente 2025: +1 (Q04); Analista 2025: +1 (Q04, colocação — 'agradecia-o', 'lastimá-lo') = 5 questões em 4 provas. Oficial 2024 Q11 e Q20 = 7 questões em 5 provas.",
  },
  {
    materia: "Língua Portuguesa",
    bloco: "BLOCO I",
    lei: "Edital 2027, Anexo VIII — Bloco I, item 10",
    artigo: "Regência verbal e nominal",
    resumo: "O verbo (ou o nome) pede preposição ou não — e é aqui que a crase se mascara: 'à' contra 'a'.",
    provas: 7,
    questoes: 7,
    exemplo: "Faz parte das 50 de Sintaxe; contada à parte aqui para a leitura. 2018 Q15; 2021 Q06 (secundário, junto com a lacuna de crase). Escrevente 2025: +1 (Q04); Analista 2025: +1 (Q04, regência — 'preterir os interesses') = 4 questões em 4 provas. Oficial 2024 Q16 + Assistente 2024 Q12 + Psicólogo 2024 Q12 (as duas de crase/regência) = 7 questões em 7 provas.",
  },

  /* ------------------------------------------------ BLOCO II — Direito Penal */
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 293 a 305 (fé pública)",
    resumo: "Falsidade de documento e de moeda: falsificar, usar documento falso ou afirmar falsidade ideológica é crime.",
    provas: 5,
    exemplo: "2018 Q25 (comando cita os arts. 293–305); 2021 Q25 (falsidade ideológica, art. 299 — indicar outra pessoa como condutora), Q26 (petrechos de falsificação, art. 294) e Q27 (falsidade de atestado médico, art. 302). Escrevente 2025 Q17, gabarito D (art. 293, IV — falsificar cautela de penhor). Reaplicação 2024-11-24 Q25 (art. 296 — falsificação de moeda, citado no enunciado, Q3252493).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 312 a 317 (funcionário contra a Administração)",
    resumo: "Crimes de funcionário contra a Administração: peculato, concussão, corrupção passiva e prevaricação.",
    provas: 5,
    exemplo: "Corrupção passiva é crime formal — 2023-05-28 Q26. Peculato: reparar o dano antes da sentença irrecorrível extingue a punibilidade (art. 312, §3º) — 2018 Q27 e 2024-09-08 Q29 (PDF). Reaplicação 2024-11-24 Q28 (art. 316 — concussão, citado no enunciado). Escrevente 2025 Q19, gabarito C (art. 313-A — inserção de dados falsos; basta o fim de obter vantagem indevida).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 339 a 347 (contra a Administração da Justiça)",
    resumo: "Crimes contra a Administração da Justiça: denunciação caluniosa, falso testemunho, fraude processual e os demais do capítulo.",
    provas: 3,
    exemplo: "2018 Q29 (comando cita os arts. 339–347); 2021 Q30 ('Sobre os crimes contra a Administração da Justiça'). Analista 2025 Q67, gabarito C (art. 344 — coação no curso do processo, pena aumentada).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 311-A (fraude em certames)",
    resumo: "Fraude em concurso: copiar ou divulgar prova sigilosa — não precisa haver dano patrimonial; se o autor é funcionário, a pena dobra.",
    provas: 4,
    exemplo: "2018 Q26; 2021 Q29 (cópia e divulgação de versão sigilosa de prova de concurso). PDF 2024-09-08 Q28 (fraude em certames); reaplicação 2024-11-24 Q27 (art. 311-A, citado no enunciado, Q3252495).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 307 e 308 (falsa identidade)",
    resumo: "Falsa identidade (art. 307) e usar documento de identificação alheio como próprio (art. 308).",
    provas: 4,
    exemplo: "2018 Q26; 2021 Q28 (art. 308 e art. 307 no comando). Escrevente 2025 Q18, gabarito A (art. 307 — falsa identidade só punível se não constitui elemento de crime mais grave). Oficial 2024 Q29 (art. 308 — uso de documento falso alheio, citado no enunciado, Q3253557).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 357 (exploração de prestígio)",
    resumo: "Explorar prestígio: pedir ou receber vantagem a pretexto de influir em funcionário público.",
    provas: 1,
    exemplo: "2018 Q30 ('crime de exploração de prestígio, art. 357 do CP').",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 328 a 333 e 335 a 337 (particular contra a Administração)",
    resumo: "Crimes de particular contra a Administração: usurpação de função, resistência, desobediência, desacato, tráfico de influência e os demais.",
    provas: 1,
    exemplo: "2018 Q28 (comando cita os arts. 328–333 e 335–337).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 320 (condescendência criminosa)",
    resumo: "Condescendência criminosa: deixar de punir subordinado por indulgência — o elemento é a indulgência.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q20, gabarito E.",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 319 (prevaricação)",
    resumo: "Prevaricação: retardar ou deixar de praticar ato de ofício, ou praticá-lo contra a lei, para satisfazer interesse ou sentimento pessoal.",
    provas: 1,
    questoes: 1,
    exemplo: "Analista 2025 Q66, gabarito D (funcionário posterga alvará de soltura por 5 dias contra inimigo).",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 344 (coação no curso do processo)",
    resumo: "Coação no curso do processo: usar violência ou grave ameaça para favorecer interesse próprio ou alheio em processo — a pena é aumentada em alguns casos.",
    provas: 1,
    questoes: 1,
    exemplo: "Analista 2025 Q67, gabarito C (pena aumentada; processo por crime contra a dignidade sexual).",
  },

  /* ------------------------------------------------ BLOCO II — Direito Processual Penal */
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 251 a 258 (impedimento e suspeição do juiz)",
    resumo: "Juiz impedido ou suspeito não pode julgar: as hipóteses são taxativas e a suspeição precisa ser arguida.",
    provas: 6,
    exemplo: "1 por prova, sempre. 2018 Q31 e 2021 Q31 ('a respeito do impedimento e da suspeição do Juiz'). Escrevente 2025 Q21, gabarito A (art. 254, I — juiz suspeito, aconselhou qualquer das partes).",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Art. 274 (suspeição estendida aos serventuários)",
    resumo: "A suspeição do juiz se estende aos serventuários: o escrivão suspeito também não pode atuar no processo.",
    provas: 1,
    questoes: 1,
    exemplo: "Reaplicação 2024-11-24 Q33, Q3252501 (art. 274 — 'Tício, diretor do cartório... amigo íntimo de Caio'). Saiu da lista de nunca cobrados.",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Lei nº 9.099/1995 (JECrim)",
    artigo: "Arts. 60 a 83, 88 e 89",
    resumo: "Juizado Especial Criminal: crimes de menor potencial ofensivo, pena máxima até 2 anos; transação penal (art. 76).",
    provas: 4,
    exemplo: "2018 Q37; 2021 Q37 (transação penal, art. 76); 2023-05-28 Q34 — réu não localizado vai para o Juízo Comum, rito sumário. Escrevente 2025 Q25, gabarito D (art. 82, §2º — recurso de apelação, resposta escrita em 10 dias).",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 351 a 372 (citação e intimação)",
    resumo: "Citação e intimação do acusado: como e onde ele é chamado ao processo.",
    provas: 3,
    exemplo: "2018 Q33 ('Com relação à citação do acusado'); 2021 Q32 ('a respeito da citação e intimação do acusado'). Escrevente 2025 Q23, gabarito B (art. 358 — militar citado por intermédio do chefe do respectivo serviço).",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 394 a 497 (procedimento comum e júri)",
    resumo: "Procedimento comum e do júri: rejeição da denúncia (art. 395) não é absolvição sumária (art. 397) — a banca cobra o par.",
    provas: 3,
    exemplo: "2021 Q33 cita os arts. 395 e 397 juntos; 2018 Q35 e 2021 Q36 cobram o júri; 2021 Q35, ordinário e sumário. Escrevente 2025 Q24, gabarito B (art. 396 — recebimento da denúncia; resposta à acusação em 10 dias).",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 574 a 667 (recursos e revisão criminal)",
    resumo: "Recursos e revisão criminal: a revisão cabe a qualquer tempo e nunca pode agravar a pena.",
    provas: 2,
    exemplo: "2018 Q36 ('Com relação aos recursos e revisão'); 2021 Q34 ('A respeito dos recursos e das ações constitucionais').",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 261 a 267 (acusado e defensor)",
    resumo: "Defensor é obrigatório: acusado sem defensor tem um nomeado, e a falta de defesa gera nulidade.",
    provas: 2,
    exemplo: "2018 Q32 ('a respeito do acusado e do defensor'). Escrevente 2025 Q22, gabarito E (art. 266 — constituição de defensor independe de mandato se indicado no interrogatório).",
  },

  /* ------------------------------------------------ BLOCO II — Direito Processual Civil */
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Arts. 294 a 311 (tutela provisória)",
    resumo: "Tutela provisória (urgência e evidência): a caução para garantir o ressarcimento tem de ser real ou fidejussória idônea.",
    provas: 4,
    exemplo: "2018 Q40 (tutela antecipada antecedente, arts. 303–304); 2021 Q40 (tutela cautelar antecedente); 2023-05-28 Q40, gabarito B. Reaplicação 2024-11-24 Q40 (art. 311 — tutela da evidência, Q3252508). Zero na Escrevente 2025 — era o assunto mais cobrado do Processo Civil.",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Arts. 318 a 538 (procedimento comum)",
    resumo: "Procedimento comum: petição, citação, pedido e julgamento — a banca cobra o artigo exato.",
    provas: 4,
    exemplo: "2018 Q41 (art. 220, férias forenses) e Q44 (art. 332, improcedência liminar); 2021 Q41 (obrigação de fazer). Escrevente 2025 Q27, gabarito A (arts. 528–529 — cumprimento de sentença de alimentos; parcela + mensal ≤ 50% da renda líquida, art. 529, §3º). Reaplicação 2024-11-24 Q41 (art. 356 — julgamento antecipado parcial do mérito, Q3252509).",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Arts. 994 a 1026 (recursos)",
    resumo: "Recursos: embargos de declaração cabem contra omissão, obscuridade, contradição ou erro material.",
    provas: 4,
    exemplo: "2018 Q42 ('Com relação ao direito de recorrer'); 2021 Q42 (embargos de declaração). Escrevente 2025 Q28, gabarito D (art. 1.004 — morte do advogado no prazo de apelação; prazo restituído). Reaplicação 2024-11-24 Q42 (art. 1.021 — agravo interno; multa e depósito, Q3252510).",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Arts. 144 a 155 (impedimento e suspeição)",
    resumo: "Impedimento e suspeição no processo civil — valem também para o escrivão e o chefe de secretaria (art. 152).",
    provas: 2,
    exemplo: "2018 Q38 (art. 152); 2021 Q38 (chefe de secretaria amigo íntimo; assistente técnico). Zero na Escrevente 2025.",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Arts. 188 a 275 (atos processuais)",
    resumo: "Atos processuais: a citação pode ser feita em qualquer lugar em que se encontre o réu.",
    provas: 3,
    exemplo: "2018 Q41; 2021 Q39 ('A citação poderá ser feita em qualquer lugar em que se encontre o réu…'). Escrevente 2025 Q26, gabarito C (art. 212, §2º — penhora fora do horário, válida sem autorização judicial).",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Lei nº 9.099/1995 (JEC)",
    artigo: "Arts. 3º a 19",
    resumo: "Juizado Especial Cível: causas de menor complexidade; despejo só para uso próprio é a hipótese admitida.",
    provas: 5,
    exemplo: "2018 Q39; 2021 Q43 ('É permitido nos Juizados Especiais Cíveis'); 2023-05-28 Q43, gabarito D (despejo para uso próprio). Escrevente 2025 Q29, gabarito B (art. 16 — sessão de conciliação designada em 15 dias). Oficial 2024 Q46 (art. 19 — comunicação dos atos nos Juizados Especiais, Q3253574).",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Lei nº 12.153/2009 (JEFP)",
    artigo: "Lei nº 12.153/2009",
    resumo: "Juizado Especial da Fazenda Pública: ações contra a Fazenda até 60 salários mínimos.",
    provas: 3,
    exemplo: "2018 Q43; 2021 Q44 (ação demarcatória no JEFP; 60 salários mínimos; tutela de urgência). Escrevente 2025 Q30, gabarito C (art. 7º — sem prazo em dobro para a Fazenda; recurso em 10 dias úteis).",
  },
  {
    materia: "Direito Processual Civil",
    bloco: "BLOCO II",
    lei: "Código de Processo Civil (Lei 13.105/2015)",
    artigo: "Art. 382, §2º (produção antecipada de provas)",
    resumo: "Na produção antecipada de provas o juiz não decide sobre o fato — só colhe a prova.",
    provas: 1,
    exemplo: "2023-05-28 Q41, gabarito D. Zero na Escrevente 2025.",
  },

  /* ------------------------------------------------ BLOCO II — Direito Constitucional */
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 5º (direitos e garantias individuais)",
    resumo: "Direitos individuais e as ações constitucionais (MS, ação popular, HC, HD, MI) — a pegadinha troca uma palavra ou um prazo.",
    provas: 6,
    questoes: 18,
    exemplo: "LXXIII ação popular (2018 Q51, 2024-11-24 Q46); LXX MS coletivo, 1 ano (2023-05-28 Q45, 2024-11-24 Q47); XLVII penas vedadas (2018 Q46, 2021 Q45, 2024-11-24 Q45); LXXVII gratuidade de HC/HD (2018 Q50); XLIV, XXXVIII (júri), XLVI, LXIV, XLIII (fiança, 2021 Q45). Escrevente 2025 Q31, gabarito E (XI — casa, asilo inviolável) e Q32, gabarito A (LXXIII e LXXVII gratuitos).",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Arts. 37 a 41 (Administração Pública e servidores)",
    resumo: "Servidores: improbidade (§4º do art. 37), responsabilidade civil (§6º), aposentadoria (art. 40) e estabilidade (art. 41).",
    provas: 6,
    questoes: 11,
    exemplo: "Art. 37, §4º improbidade (2024-11-24 Q49); §6º responsabilidade (Q50); §13 readaptação (2021 Q50); art. 40 aposentadoria (2023-05-28 Q49, 2024-09-08 Q51, 2024-11-24 Q51); art. 41 estabilidade (2023-05-28 Q48); art. 38 mandato (2024-09-08 Q50). Escrevente 2025 Q34, gabarito B (art. 37, XI — teto remuneratório estadual, subsídio do Governador).",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 12 (nacionalidade)",
    resumo: "Nacionalidade: quem é brasileiro nato ou naturalizado e quais cargos são privativos de brasileiro nato (§3º).",
    provas: 4,
    questoes: 5,
    exemplo: "2018 Q47 (naturalizado e extradição); 2021 Q48 (naturalização) e Q49 (§3º, cargos privativos de nato); 2024-09-08 Q47. Escrevente 2025 Q33, gabarito D (art. 12, I, 'c' — nascida no estrangeiro de mãe brasileira; opção após a maioridade).",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 7º (direitos dos trabalhadores)",
    resumo: "Trabalhadores: irredutibilidade do salário (VI), adicional de insalubridade (XXIII) e proibição de trabalho noturno ou insalubre a menor de 18 (XXXIII).",
    provas: 4,
    questoes: 5,
    exemplo: "2018 Q49 (parágrafo único, domésticos); 2021 Q47; 2024-11-24 Q48 (VI, XXIII e XXXIII na mesma questão). Escrevente 2025 Q35, gabarito E (VI, XIII e XXIX — redução salarial e jornada por negociação coletiva; prescrição 2 anos).",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 8º (sindicatos)",
    resumo: "Sindicatos: liberdade sindical e organização dos trabalhadores.",
    provas: 1,
    exemplo: "2024-09-08 Q48.",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 92 (órgãos do Poder Judiciário)",
    resumo: "Órgãos do Judiciário: a lista do art. 92 — a pegadinha inclui órgão extinto (Tribunal Federal de Recursos) ou que não é órgão do Judiciário (Justiça Desportiva). Raro: 1 questão em 6 provas.",
    provas: 1,
    exemplo: "2023-05-28 Q50, gabarito B. Zero em 2018 e 2021. Zero na Escrevente 2025.",
  },

  /* ------------------------------------------------ BLOCO II — Direito Administrativo */
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Penas disciplinares (demissão; suspensão de até 90 dias)",
    resumo: "Penas disciplinares: demissão a bem do serviço público nas faltas graves; suspensão de até 90 dias — 120 dias é a pegadinha.",
    provas: 3,
    exemplo: "2018 Q52 e Q53; 2021 Q52 e Q53; 2023-05-28 Q55 (gabarito E) e Q56 (gabarito C).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Representação, indisponibilidade de bens e acordo de não persecução",
    resumo: "Representação ao MP, indisponibilidade de bens (o recurso é agravo de instrumento) e acordo de não persecução civil, que é possível.",
    provas: 3,
    exemplo: "2018 Q59; 2021 Q57 (representação ao MP; indisponibilidade); 2024-11-24 Q58, gabarito A (art. 16 — indisponibilidade de bens → agravo de instrumento).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Processo disciplinar (procedimento, testemunhas, recursos e revisão)",
    resumo: "Processo disciplinar: até 5 testemunhas por lado; a revisão não pode agravar a pena; o inativo responde disciplinarmente.",
    provas: 2,
    exemplo: "2018 Q54 e Q55; 2021 Q54, Q55 (testemunhas) e Q56 (recursos e revisão).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Arts. 9º e 11 (atos de improbidade)",
    resumo: "Improbidade: enriquecimento ilícito (art. 9º) e ato contra os princípios (art. 11) — e só há improbidade com dolo, nunca com culpa.",
    provas: 5,
    exemplo: "2018 Q57 (art. 9º) e Q58 (art. 11); 2021 Q59 (art. 11, omissão de ato de ofício). Escrevente 2025 Q41, gabarito A (art. 9º — enriquecimento ilícito; perda dos bens, da função, suspensão dos direitos políticos até 14 anos). Reaplicação 2024-11-24 Q57 (art. 11 — violação de princípios, Q3252525); Oficial 2024 Q61 (art. 9º — enriquecimento ilícito, Q3253589).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Art. 13 (declaração de bens)",
    resumo: "Na posse, o agente entrega a declaração de bens e renda — ou autoriza o acesso à declaração do IR.",
    provas: 1,
    questoes: 1,
    exemplo: "Oficial 2024 Q62, Q3253590 (art. 13 — declaração de bens/IR na posse).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Art. 16 (indisponibilidade de bens)",
    resumo: "Indisponibilidade de bens na improbidade: contra a decisão que a decreta cabe agravo de instrumento.",
    provas: 1,
    questoes: 1,
    exemplo: "Reaplicação 2024-11-24 Q58, Q3252526, gabarito A (art. 16 — indisponibilidade de bens → agravo de instrumento). A questão também é citada no item 'Representação, indisponibilidade de bens e acordo de não persecução' — referência temática, não dupla contagem.",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Art. 3º (conceito de funcionário público)",
    resumo: "Funcionário público: quem ocupa cargo público, de provimento efetivo ou em comissão.",
    provas: 1,
    questoes: 1,
    exemplo: "Oficial 2024 Q55, Q3253583 (art. 3º — conceito de funcionário público).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Art. 10 (lesão ao erário)",
    resumo: "Lesão ao erário: na responsabilização da pessoa jurídica, considerar os efeitos econômicos e sociais das sanções.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q39, gabarito D (superfaturamento; arts. 10 e 12, §3º).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Reintegração (absolvição criminal por negativa de autoria)",
    resumo: "Absolvido no crime por negativa de autoria, o servidor demitido é reintegrado.",
    provas: 3,
    exemplo: "2018 Q52 e 2021 Q52 — mesmo caso nas duas provas (servidor demitido, depois absolvido por negativa de autoria); Escrevente 2025 Q38, gabarito A (art. 30: reingresso por decisão judicial transitada em julgado, com ressarcimento).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Arts. 60 e 75 (exercício e afastamento)",
    resumo: "Exercício em 30 dias da posse, prorrogável por 30 dias; afastamento para competição desportiva com autorização do Governador.",
    provas: 1,
    questoes: 2,
    exemplo: "Escrevente 2025 Q36, gabarito C (art. 75, §2º, I e II) e Q37, gabarito C (art. 60, §1º e §4º).",
  },
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 8.429/1992 (Improbidade Administrativa)",
    artigo: "Art. 23 (prescrição — 8 anos)",
    resumo: "Improbidade prescreve em 8 anos (art. 23); interrompida, o prazo recomeça pela metade.",
    provas: 1,
    exemplo: "2023-05-28 Q54, gabarito D.",
  },

  /* ------------------------------------------------ BLOCO II — Legislação Interna */
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Res. TJSP nº 963/2025",
    artigo: "Res. TJSP 963/2025 (eproc)",
    resumo: "Processos anteriores continuam no sistema legado até o encerramento, salvo migração para o eproc.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q42, gabarito E — primeira cobrança verificada; antes estava na lista de nunca cobrados.",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Res. TJSP nº 850/2021",
    artigo: "Res. TJSP 850/2021 (teletrabalho)",
    resumo: "Servidor em estágio probatório não pode ser enquadrado no teletrabalho.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q43, gabarito B — primeira cobrança verificada; antes estava na lista de nunca cobrados.",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Lei Complementar nº 1.111/2010",
    artigo: "LC 1.111/2010 (Plano de Cargos e Carreiras)",
    resumo: "Chefe de seção judiciária: ter exercido cargos dessa natureza ou comprovar experiência adequada, por critérios do Comitê de RH.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q44, gabarito E — primeira cobrança verificada; antes estava na lista de nunca cobrados.",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Regimento Interno do TJSP",
    artigo: "Regimento Interno do TJSP",
    resumo: "Nenhum feito será julgado na ausência do relator, ainda que já tenha proferido voto.",
    provas: 1,
    questoes: 1,
    exemplo: "Escrevente 2025 Q45, gabarito A — primeira cobrança verificada; antes estava na lista de nunca cobrados.",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Sistema Informatizado Oficial e processo eletrônico",
    resumo: "Normas da Corregedoria, 100% literais: sistema informatizado oficial e processo eletrônico — decore o texto da norma.",
    provas: 2,
    exemplo: "2018 Q60 (Sistema Informatizado Oficial) e Q64 (Processo Eletrônico); 2021 Q64 (consulta de movimentações e processo eletrônico).",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Consulta e carga dos autos; movimentação e conclusão",
    resumo: "Consulta e carga dos autos e movimentação com conclusão no prazo — tudo literal da norma.",
    provas: 2,
    exemplo: "2018 Q63 (consulta e carga dos autos); 2021 Q62 (movimentação dos autos; conclusão no prazo).",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Correição ordinária (1 vez por ano)",
    resumo: "Correição ordinária é feita 1 vez por ano — o número é a pegadinha.",
    provas: 1,
    exemplo: "2021 Q60 ('no tocante às correições').",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Escrituração e ordem dos serviços",
    resumo: "Escrituração dos atos e ordem dos serviços dos processos em geral — literal da norma.",
    provas: 1,
    exemplo: "2018 Q61 (escrituração) e Q62 (Ordem dos Serviços dos Processos em Geral).",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Mandados judiciais",
    resumo: "Mandados judiciais: cumprimento, prazos e devolução, como diz a norma.",
    provas: 1,
    exemplo: "2021 Q63 ('A respeito dos mandados judiciais').",
  },
  {
    materia: "Legislação Interna",
    bloco: "BLOCO II",
    lei: "Normas da Corregedoria Geral da Justiça (TJSP)",
    artigo: "Apuração preliminar e sindicância",
    resumo: "Apuração preliminar e sindicância: quando abre, quem apura e quais penas podem resultar.",
    provas: 1,
    exemplo: "2021 Q61 (apuração preliminar; penas de suspensão e demissão; aposentadoria).",
  },

  /* ------------------------------------------------ BLOCO III — Estatuto da Pessoa com Deficiência */
  {
    materia: "Estatuto da Pessoa com Deficiência",
    bloco: "BLOCO III",
    lei: "Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência)",
    artigo: "Arts. 1º a 13 (atendimento prioritário)",
    resumo: "Atendimento prioritário: o direito se estende ao acompanhante da pessoa com deficiência.",
    provas: 5,
    exemplo: "2021 Q69 (a lei em geral); 2023-05-28 Q69, gabarito D — o atendimento prioritário vale para João e para Maria, a acompanhante. Escrevente 2025 Q50, gabarito C (arts. 2º, 6º e 9º — o inciso VII do art. 9º, tramitação processual, NÃO se estende ao acompanhante). Reaplicação 2024-11-24 Q69 (art. 9º — atendimento prioritário, Q3252537) e Q70 (art. 11 — consentimento prévio livre e esclarecido, Q3252538); Oficial 2024 Q81 (art. 2º — avaliação biopsicossocial; deficiência oculta, Q3253609).",
  },
  {
    materia: "Estatuto da Pessoa com Deficiência",
    bloco: "BLOCO III",
    lei: "Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência)",
    artigo: "Arts. 34 a 38 (direito ao trabalho)",
    resumo: "Trabalho: colocação competitiva e trabalho com apoio, respeitando o perfil vocacional da pessoa.",
    provas: 2,
    exemplo: "2021 Q70 ('No tocante ao direito ao trabalho da pessoa com deficiência'); 2023-05-28 Q70, gabarito C.",
  },

  /* ------------------------------------------------ BLOCO III — Matemática */
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, itens 4 e 7",
    artigo: "Porcentagem e juros simples",
    resumo: "Porcentagem do todo e juros simples — e cuidado: 'X% menor' significa dividir por (1 − X), não subtrair X%.",
    provas: 8,
    questoes: 11,
    exemplo: "2018 Q73 (lucro de 20% sobre a venda); 2021 Q71 (PIX: 0,1% de R$ 1,8 trilhão) e Q73 (juros simples diários de 0,03%); 2023-05-28 Q72, gabarito C (330 ÷ 0,9 = 367). Escrevente 2025 Q52, gabarito E (porcentagem). Reaplicação 2024-11-24 Q71 e Q74 (porcentagem); Assistente 2024 Q67 (porcentagem, Q3543282); Psicólogo 2024 Q68 (porcentagem, Q3543353).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 9",
    artigo: "Sistema de equações do 1º grau",
    resumo: "Duas incógnitas, duas equações: monte o sistema com os dados do enunciado e resolva.",
    provas: 1,
    questoes: 6,
    exemplo: "2018 Q74 (balizadores por km); 6 questões no conjunto dos 5 PDFs — as demais não tiveram prova e número identificados.",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 6",
    artigo: "Média aritmética simples e ponderada",
    resumo: "Média: some tudo e divida pela quantidade — com peso, multiplique cada valor pelo seu peso antes.",
    provas: 4,
    questoes: 9,
    exemplo: "2018 Q75 (média dos volumes de 4 reservatórios); Escrevente 2025 Q54, gabarito A (média aritmética). Total 9 em 4 provas — as demais não tiveram prova e número identificados. Reaplicação 2024-11-24 Q76 (médias); Oficial 2024 Q85 (médias, Q3253613).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 12",
    artigo: "Geometria (Pitágoras, área e volume)",
    resumo: "Geometria: decore os ternos pitagóricos 3-4-5, 5-12-13 e 8-15-17 — a banca usa sempre um deles.",
    provas: 5,
    questoes: 7,
    exemplo: "2018 Q76 (torre Atto: 75-100-125); 2021 Q75 (área e ocupação máxima); 2023-05-28 Q76, gabarito E. Escrevente 2025 Q53, gabarito B (geometria). Oficial 2024 Q86 (geometria plana; áreas e perímetros, Q3253614).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 3",
    artigo: "Razão e proporção",
    resumo: "Razão e proporção: compare as grandezas e monte a proporção antes de calcular.",
    provas: 4,
    questoes: 8,
    exemplo: "2018 Q71 (ciclistas, ritmos constantes) e Q72 (mistura gasolina/etanol, 40 litros). Escrevente 2025 Q51, gabarito B (razão e proporção — usa um sistema de equações como meio). Escrevente 08/09 Q75 (razão e proporção; regra de três); reaplicação 2024-11-24 Q72 (razões e proporções) e Q73 (razão e proporção; regra de três).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 10",
    artigo: "Tabelas e gráficos",
    resumo: "Tabela e gráfico: leia o dado certo na fonte antes de calcular — a pegadinha está na leitura, não na conta.",
    provas: 3,
    questoes: 4,
    exemplo: "2021 Q74 (gráfico de produção de energia solar) e Q76 (gráficos de TV a cabo, satélite e streaming). Reaplicação 2024-11-24 Q75 (análise de tabelas e gráficos); Oficial 2024 Q84 (análise de tabelas e gráficos, Q3253612).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, itens 1 e 8",
    artigo: "Operações com números reais e equação do 1º grau",
    resumo: "Conta direta com números reais e equação do 1º grau: isole a incógnita e confira o sinal.",
    provas: 1,
    exemplo: "2021 Q72 (nota de prova prática: NOTA = 10 − D × 0,05…).",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 2",
    artigo: "Regra de três simples e composta",
    resumo: "Regra de três: monte a proporção com as grandezas e resolva — direta ou inversa, simples ou composta.",
    provas: 2,
    questoes: 3,
    exemplo: "Escrevente 08/09 Q75 (razão e proporção; regra de três) e Q78 (regra de três; equações do 1º grau); reaplicação 2024-11-24 Q73 (razão e proporção; regra de três). Saiu da lista de nunca cobrados.",
  },

  /* ------------------------------------------------ BLOCO III — Informática */
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "MS-Windows 10 ou superior",
    artigo: "Windows e Explorador de Arquivos",
    resumo: "Windows na configuração padrão: pastas, área de trabalho, barra de tarefas, menu Iniciar e pesquisa de programas.",
    provas: 5,
    questoes: 19,
    exemplo: "2018 Q77–Q81 (extensões de arquivo, barra de tarefas, Explorador, menu Iniciar, pesquisa); 2021 Q77–Q80 (área de transferência, atalho, pastas, propriedades). Escrevente 2025 Q63, gabarito A (Windows/Explorador). Oficial 2024 Q93 (Windows; Windows Explorer, Q3253621); Psicólogo 2024 Q58 (Windows, Q3543343).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — MS-Excel",
    artigo: "Excel (fórmulas, funções e planilhas)",
    resumo: "Excel: fórmulas avaliadas de dentro para fora — leia a função interna primeiro (ex.: =SE(E(...))).",
    provas: 7,
    questoes: 18,
    exemplo: "2018 Q85–Q87 (=SE(MENOR…;MAIOR…), impressão, Soma em A1:C3); 2021 Q83–Q85 (planilha, inserir colunas, guias); 2023-05-28 Q81, gabarito B. Escrevente 2025 Q58, gabarito B (PROCV) e Q59, gabarito D (MAIOR/MENOR/SE). Oficial 2024 Q94 (Q3253622) e Q98 (Q3253626); Assistente 2024 Q59 (MAIOR, Q3543274); Psicólogo 2024 Q59 (CONT.SE, Q3543344).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — MS-Word",
    artigo: "Word (edição e formatação de textos)",
    resumo: "Word: parágrafos, fontes, tabelas, impressão e caixas de texto — a questão mostra a tela e pergunta o botão.",
    provas: 5,
    questoes: 15,
    exemplo: "2018 Q82–Q84 (parágrafo, guia Página Inicial, caixa de texto); 2021 Q81 (efeito de fonte) e Q82 (impressão personalizada). Escrevente 2025 Q56 e Q57, gabarito C (Word). Oficial 2024 Q95 (Q3253623); Assistente 2024 Q58 (tabela, Q3543273).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Internet",
    artigo: "Internet e URL",
    resumo: "Internet: decomponha a URL (protocolo, domínio, caminho) e saiba buscar com frase exata.",
    provas: 7,
    questoes: 15,
    exemplo: "2018 Q89 (endereço no navegador) e Q90 (busca de frase exata no Google); 2021 Q88 (modo anônimo) e Q89 (estrutura da URL); 2024-11-24 Q85, gabarito D. Escrevente 2025 Q61, gabarito B (Internet/busca). Oficial 2024 Q97 (nuvem/OneDrive, Q3253625) e Q100 (protocolo e serviço/URL, Q3253628); Assistente 2024 Q60 (Chrome/atalhos, Q3543275); Psicólogo 2024 Q60 (busca no Google, Q3543345).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Correio Eletrônico",
    artigo: "Correio eletrônico (envio, anexos, Cc/Cco, spam)",
    resumo: "E-mail: quem vê Cc e quem vê Cco, anexar e retransmitir — e o que vai para o spam.",
    provas: 5,
    questoes: 11,
    exemplo: "2018 Q88 (encaminhar com anexos); 2021 Q86 (retransmitir anexos) e Q87 (spam); 2023-05-28 Q83, gabarito C (Cc/Cco). Escrevente 2025 Q60, gabarito E (Gmail). Oficial 2024 Q99 (correio eletrônico/Outlook, Q3253627).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — MS Teams",
    artigo: "MS Teams (chats, reuniões e equipes)",
    resumo: "Teams: canais, equipes, chats e reuniões — e os números da versão gratuita (100 participantes).",
    provas: 4,
    questoes: 10,
    exemplo: "2021 Q90 (canais/equipes); 2023-05-28 Q87, gabarito E (100 participantes no plano gratuito). Teams não existia em 2018 e chega a 3 questões em 2023–2024. Escrevente 2025 Q62, gabarito D (Teams, @fulano). Oficial 2024 Q96 (Teams, Q3253624).",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — OneDrive",
    artigo: "OneDrive (armazenamento e compartilhamento)",
    resumo: "OneDrive: armazenamento e compartilhamento de arquivos na nuvem — a banca cobra o uso prático.",
    provas: 3,
    questoes: 3,
    exemplo: "Escrevente 2025 Q55, gabarito D — primeira questão identificada com número; antes estava na lista de nunca cobrados. Reaplicação 2024-11-24 Q87 (OneDrive, Q3252555); Oficial 2024 Q97 (Internet/nuvem — OneDrive, Q3253625; conta também em Internet).",
  },

  /* ------------------------------------------------ BLOCO III — Raciocínio Lógico */
  {
    materia: "Raciocínio Lógico",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III (estruturas lógicas)",
    artigo: "Dedução e estruturas lógicas",
    resumo: "Dedução: das premissas dadas, só vale o que segue com certeza — a pegadinha conclui o que não foi dito.",
    provas: 10,
    questoes: 33,
    exemplo: "2018 Q94–Q100 (irmãs, 'Se Maria é bonita…', quatro amigos); 2021 Q91, Q92, Q99 e Q100 (gaveta de camisetas — contagem). Escrevente 2025: +3 (Q66, Q67, Q68) = 21 em 6 provas Escrevente; Analista 2025: +2 (Q61, Q63) = 23 em 7 provas. Oficial 2024: +3 (Q87, Q89, Q91 — fundamentos/proposições); Assistente 2024: +4 (Q63, Q64, Q65, Q66 — fundamentos; problemas lógicos); Psicólogo 2024: +3 (Q62, Q64, Q66 — fundamentos; problemas lógicos) = 33 em 10 provas.",
  },
  {
    materia: "Raciocínio Lógico",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III (sequências)",
    artigo: "Sequências numéricas e figurais",
    resumo: "Sequência: procure o padrão em blocos — a Vunesp repete blocos de 3 (1,2,3 / 6,7,8 / 21,22,23 / 66,67,68…).",
    provas: 10,
    questoes: 18,
    exemplo: "2018 Q91 (figuras) e Q92 (14º termo = 202); 2021 Q96 (45, 41, 42, 38…), Q97 (figuras) e Q98 (1A2E3I4O5U…). Escrevente 2025: +2 (Q65, Q69) = 14 em 6 provas Escrevente; Analista 2025: +1 (Q65) = 15 em 7 provas. Oficial 2024 Q92 (sequências); Assistente 2024 Q61 (sequências); Psicólogo 2024 Q65 (sequências) = 18 em 10 provas.",
  },
  {
    materia: "Raciocínio Lógico",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III (lógica de argumentação)",
    artigo: "Negação e equivalência",
    resumo: "Negação de 'Se A, então B' é 'A e não B'; equivalência é a contrapositiva ('Se não B, então não A').",
    provas: 8,
    questoes: 15,
    exemplo: "2018 Q97 e Q98 (negação); 2021 Q94 (negação) e Q95, gabarito E (equivalência = contrapositiva). Escrevente 2025: +2 (Q64, Q70) = 13 em 6 provas Escrevente; Analista 2025: +1 (Q62, negação da bicondicional) = 14 em 7 provas. Oficial 2024 Q88 (equivalência/negação) = 15 em 8 provas. Psicólogo 2024 Q63 é anulada — excluída.",
  },
  {
    materia: "Raciocínio Lógico",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III (diagramas lógicos)",
    artigo: "Diagramas lógicos e conjuntos",
    resumo: "Diagramas e conjuntos: desenhe os grupos e use inclusão-exclusão (some, tire a interseção).",
    provas: 7,
    questoes: 10,
    exemplo: "2018 Q93 (100 esportistas, esportes A, B ou C); 2021 Q93 (pianistas, dançarinos, cantores); 2024-11-24 Q99, gabarito C (enquete). Zero na Escrevente 2025; Analista 2025: +1 (Q64, inclusão-exclusão) = 9 em 6 provas. Oficial 2024 Q90 (diagramas de Venn) = 10 em 7 provas.",
  },
  {
    materia: "Raciocínio Lógico",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III (estruturas lógicas)",
    artigo: "Orientação Espacial e Temporal",
    resumo: "Orientação no espaço e no tempo: posições relativas, datas e sequências de eventos.",
    provas: 2,
    questoes: 2,
    exemplo: "Assistente 2024 Q62; Psicólogo 2024 Q61.",
  },

  /* ------------------------------------------------ BLOCO III — Atualidades */
  {
    materia: "Atualidades",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 1",
    artigo: "Política nacional e Judiciário",
    resumo: "Política e Judiciário: a resposta está no próprio texto da questão — a alternativa errada troca um detalhe (lugar, data, número, órgão).",
    provas: 4,
    questoes: 11,
    exemplo: "2018 Q65 (posse de ministra suspensa pelo STF) e Q68 (ação civil pública); 2024-11-24 Q66, gabarito B (Tema 1072 do STF, licença da mãe não gestante). Escrevente 2025 Q48, gabarito E (IR, política nacional). Assistente 2024 Q54 (política 2023 — Conselho de Segurança da ONU, Q3543269).",
  },
  {
    materia: "Atualidades",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 1",
    artigo: "Internacional",
    resumo: "Fatos internacionais: leia o enunciado com atenção — 'segundo a OMS/Anvisa/STF' cobra a tese do órgão, não a manchete.",
    provas: 4,
    questoes: 11,
    exemplo: "2018 Q67 (Banco Mundial) e Q70 (conflito na Síria); 2021 Q65 (papa Francisco no Iraque) e Q66 (Cúpula do Clima). Escrevente 2025 Q47, gabarito D (Israel/Irã) e Q49, gabarito A (BRICS). Oficial 2024 Q80 (acordo UE–Mercosul, Q3253608).",
  },
  {
    materia: "Atualidades",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 1",
    artigo: "Saúde",
    resumo: "Saúde: campanhas, epidemias e decisões de órgãos de saúde — o detalhe (doença, data, órgão) decide a certa.",
    provas: 2,
    questoes: 3,
    exemplo: "2018 Q66 (campanha de emergência contra a febre amarela); 2024-11-24 Q67, gabarito D (Anvisa e fenol).",
  },
  {
    materia: "Atualidades",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 1",
    artigo: "Ciência e tecnologia",
    resumo: "Ciência e tecnologia: o fato novo do ano (satélite, descoberta, lançamento) com o dado exato.",
    provas: 1,
    questoes: 2,
    exemplo: "2021 Q68 (lançamento do satélite Amazônia 1).",
  },
];

/** Matérias na ordem dos blocos da prova (Bloco I → II → III). */
export const MATERIAS_POR_BLOCO: { bloco: BlocoEdital; materias: string[] }[] = [
  { bloco: "BLOCO I", materias: ["Língua Portuguesa"] },
  {
    bloco: "BLOCO II",
    materias: [
      "Direito Penal",
      "Direito Processual Penal",
      "Direito Processual Civil",
      "Direito Constitucional",
      "Direito Administrativo",
      "Legislação Interna",
    ],
  },
  {
    bloco: "BLOCO III",
    materias: [
      "Estatuto da Pessoa com Deficiência",
      "Matemática",
      "Noções de Informática",
      "Raciocínio Lógico",
      "Atualidades",
    ],
  },
];

/** Todas as matérias com leitura resumida, na ordem dos blocos. */
export const MATERIAS_LEITURA_RESUMIDA: string[] = MATERIAS_POR_BLOCO.flatMap((b) => b.materias);

/** Quantos itens formam o Top 5 de cada matéria na leitura resumida. */
export const TOP5_LEITURA = 5;

/**
 * Ordena do mais para o menos cobrado: primeiro por nº de questões,
 * depois por nº de provas. Mantém TODOS os cobrados — o Top 5 é só
 * um destaque, nunca um corte.
 */
export function ordenarPorCobranca(itens: ItemLeitura[]): ItemLeitura[] {
  return [...itens].sort(
    (a, b) => (b.questoes ?? 0) - (a.questoes ?? 0) || b.provas - a.provas,
  );
}

/** Itens da leitura resumida de uma matéria, na ordem do mais para o menos cobrado. */
export function itensDaMateria(materia: string): ItemLeitura[] {
  return ordenarPorCobranca(LEITURA_RESUMIDA.filter((i) => i.materia === materia));
}

/** Os 5 mais cobrados de uma matéria — destaque, sem cortar o resto. */
export function top5DaMateria(materia: string): ItemLeitura[] {
  return itensDaMateria(materia).slice(0, TOP5_LEITURA);
}

/** Se um item está no Top 5 da sua matéria. */
export function ehTop5(item: ItemLeitura): boolean {
  return top5DaMateria(item.materia).some((t) => t.artigo === item.artigo);
}

/* ------------------------------------------------------------------ */
/* Números de artigos cobrados — para marcar o sumário do Vade Mecum  */
/* ------------------------------------------------------------------ */

/**
 * Números dos artigos cobertos pelo texto de um item da leitura resumida.
 * Formatos reais no arquivo: "Art. 320", "Art. 311-A", "Art. 382, §2º",
 * "Arts. 293 a 305", "Arts. 307 e 308", "Arts. 328 a 333 e 335 a 337",
 * "Arts. 60 a 83, 88 e 89", "Arts. 1º a 13". Textos sem "Art." (tópicos
 * de Português, leis inteiras, "Res. TJSP 963/2025" etc.) devolvem vazio.
 * O número devolvido é o mesmo de `numeroArtigo` (vademecum.ts): só os
 * dígitos iniciais — "311-A" vira 311 e o "§2º" de "382, §2º" é ignorado.
 */
export function numerosDoArtigo(texto: string): Set<number> {
  const numeros = new Set<number>();
  const m = /^\s*Arts?\.\s*(.+)$/.exec(texto);
  if (!m) return numeros;
  let corpo = m[1] ?? "";
  const paren = corpo.indexOf(" (");
  if (paren >= 0) corpo = corpo.slice(0, paren);
  corpo = corpo.replace(/º/g, "");
  for (const segmento of corpo.split(/,|\s+e\s+/)) {
    const seg = segmento.trim();
    if (!seg || seg.startsWith("§")) continue;
    const faixa = /^(\d+)\s*(?:a|-|–)\s*(\d+)/.exec(seg);
    if (faixa) {
      const de = Number(faixa[1]);
      const ate = Number(faixa[2]);
      for (let n = Math.min(de, ate); n <= Math.max(de, ate); n++) numeros.add(n);
      continue;
    }
    const unico = /^(\d+)/.exec(seg);
    if (unico) numeros.add(Number(unico[1]));
  }
  return numeros;
}

/**
 * Artigos cobrados de uma matéria, como conjuntos de números — para marcar
 * os chips do sumário do Vade Mecum. `top5` são os 5 primeiros de
 * `itensDaMateria` (o Top 5); `cobrados` são todos os itens da matéria.
 */
export function artigosCobradosDaMateria(materia: string): {
  top5: Set<number>;
  cobrados: Set<number>;
} {
  const cobrados = new Set<number>();
  for (const item of itensDaMateria(materia)) {
    for (const n of numerosDoArtigo(item.artigo)) cobrados.add(n);
  }
  const top5 = new Set<number>();
  for (const item of top5DaMateria(materia)) {
    for (const n of numerosDoArtigo(item.artigo)) top5.add(n);
  }
  return { top5, cobrados };
}

/** Bloco de uma matéria da leitura resumida. */
export function blocoDaMateria(materia: string): BlocoEdital | null {
  return itensDaMateria(materia)[0]?.bloco ?? null;
}

/* ------------------------------------------------------------------ */
/* Nunca cobrados — no edital, sem contagem verificada                 */
/* ------------------------------------------------------------------ */

export const NUNCA_COBRADOS: ItemNuncaCobrado[] = [
  /* Direito Penal */
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Art. 359",
    motivo: "Nenhuma questão nas provas contadas tocou o art. 359.",
  },
  {
    materia: "Direito Penal",
    bloco: "BLOCO II",
    lei: "Código Penal (DL 2.848/1940)",
    artigo: "Arts. 322 a 327",
    motivo: "Arts. 319 e 320 saíram da lista: 319 cobrado na Analista 2025 Q66 (prevaricação); 320 cobrado na Escrevente 2025 Q20 (condescendência criminosa). O art. 321 só apareceu numa alternativa da 2018 Q27, sem questão própria.",
  },
  /* Direito Processual Penal — o art. 274 saiu em 26/11/2026: cobrado na
     reaplicação 2024-11-24 Q33 (Q3252501). */
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 531 a 538",
    motivo: "Procedimento sumário não aparece separado nas provas contadas.",
  },
  {
    materia: "Direito Processual Penal",
    bloco: "BLOCO II",
    lei: "Código de Processo Penal (DL 3.689/1941)",
    artigo: "Arts. 541 a 548",
    motivo: "Processo de competência originária: 0 questões nas provas contadas.",
  },
  /* Direito Constitucional */
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Art. 13 (língua e símbolos nacionais)",
    motivo: "Nunca cobrado nas provas contadas.",
  },
  {
    materia: "Direito Constitucional",
    bloco: "BLOCO II",
    lei: "Constituição Federal de 1988",
    artigo: "Arts. 6º, 9º, 10 e 11",
    motivo: "Não identificados como questão própria nas provas contadas.",
  },
  /* Direito Administrativo */
  {
    materia: "Direito Administrativo",
    bloco: "BLOCO II",
    lei: "Lei nº 10.261/1968 (Estatuto dos Funcionários Públicos Civis de SP)",
    artigo: "Arts. 171 a 175",
    motivo: "A faixa 1–86 saiu da lista: arts. 30, 60 e 75 cobrados na Escrevente 2025 (Q36–Q38). Fica só 171–175 sem comando identificado nas provas contadas.",
  },
  /* Matemática */
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 2",
    artigo: "MMC e MDC",
    motivo: "0 questões em 2018 e 2021; 1 questão como tema principal no conjunto dos 5 PDFs, sem prova identificada — sem contagem verificada.",
  },
  /* Matemática — Regra de três saiu em 26/11/2026: cobrada na Escrevente
     08/09 Q75 e Q78 e na reaplicação 2024-11-24 Q73. */
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 8",
    artigo: "Equação do 2º grau",
    motivo: "Nenhuma questão identificada com certeza nas provas contadas.",
  },
  {
    materia: "Matemática",
    bloco: "BLOCO III",
    lei: "Edital 2027, Anexo VIII — Bloco III, item 11",
    artigo: "Sistemas de medidas usuais",
    motivo: "Medidas aparecem só como contexto nas questões; nenhuma questão centrada em conversão de medidas.",
  },
  /* Informática */
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — PowerPoint",
    artigo: "PowerPoint",
    motivo: "Nunca identificado nas provas contadas.",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — SharePoint",
    artigo: "SharePoint",
    motivo: "Nunca identificado nas provas contadas.",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — OneNote",
    artigo: "OneNote",
    motivo: "Nunca identificado nas provas contadas.",
  },
  {
    materia: "Noções de Informática",
    bloco: "BLOCO III",
    lei: "Microsoft 365 — MS-Excel",
    artigo: "Macros do Excel",
    motivo: "Não identificadas separadamente nas provas contadas.",
  },
];

/** Itens do edital sem contagem verificada, de uma matéria. */
export function nuncaCobradosDaMateria(materia: string): ItemNuncaCobrado[] {
  return NUNCA_COBRADOS.filter((i) => i.materia === materia);
}

/** Matérias que têm lista de nunca cobrados. */
export function materiasComNuncaCobrados(): string[] {
  return [...new Set(NUNCA_COBRADOS.map((i) => i.materia))];
}
