/**
 * Treino Caderno Muse — as 111 questões confirmadas do caderno, cada uma
 * com o "inside" para descobrir a certa.
 *
 * Regra pedida: cada questão traz o insight de como descobrir a alternativa
 * correta, e a repetição embaralha as alternativas de lugar, para fixar o
 * conteúdo em vez de decorar a letra (mesmo modelo do Treino de Crase).
 *
 * Fonte: provas oficiais da VUNESP 2025, lidas só por extração de texto,
 * sem downloads (arquivos em `workspace/cadernos-vunesp/vunesp-oficiais/`).
 * Só entram as 111 confirmadas do caderno criado no Qconcursos em 24/11/2026
 * (código 0EZ-J41); os 20 códigos extras marcados "pertinência a confirmar"
 * NÃO entram. O gabarito é identificado pelo TEXTO da alternativa, não pela
 * letra — as versões da prova embaralham as letras.
 *
 * Status: "treinavel" = enunciado + 5 alternativas + gabarito oficial
 * verificados. "pendente" = falta um elemento (texto parcial por imagem ou
 * outro motivo anotado em `motivoPendente`) — nunca entra no treino até
 * ser resolvido. Nada aqui foi inventado: porQue é null quando o motivo de
 * a alternativa estar certa/errada não é determinável pelos dados.
 *
 * Gerado em 24/11/2026 a partir dos JSONs extraídos por prova em
 * `workspace/cadernos-vunesp/vunesp-oficiais/extracao/`.
 */

export type AlternativaCadernoMuse = {
  /** Texto da alternativa, como está na prova. */
  texto: string;
  /** É a alternativa correta (gabarito oficial, casado pelo texto). */
  correta: boolean;
  /**
   * Por que essa alternativa está certa ou errada — o inside.
   * null quando não determinável pelos dados coletados (nunca inventado).
   */
  porQue: string | null;
};

export type StatusQuestaoCadernoMuse = "treinavel" | "pendente";

export type QuestaoCadernoMuse = {
  /** Código Qconcursos da questão. */
  id: string;
  prova: string;
  ano: number;
  /** Número dentro da prova; null quando não informado nos arquivos. */
  numero: number | null;
  materia: string;
  assunto: string | null;
  /** Artigo/dispositivo cobrado, quando determinado. */
  artigo: string | null;
  /** Enunciado completo; "" quando pendente sem texto. */
  enunciado: string;
  alternativas: AlternativaCadernoMuse[];
  /** Como descobrir a certa — o método, não a resposta. */
  insight: string;
  status: StatusQuestaoCadernoMuse;
  /** Por que está pendente; null quando treinável. */
  motivoPendente: string | null;
  /** Fonte do gabarito oficial usado. */
  gabaritoFonte: string;
};

/** Total de questões confirmadas do caderno (treináveis + pendentes). */
export const TOTAL_CADERNO_MUSE = 111;

export const QUESTOES_CADERNO_MUSE: QuestaoCadernoMuse[] = [
  {
    "id": "Q3777318",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 1,
    "materia": "Língua Portuguesa",
    "assunto": "Interpretação de Textos",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nEm relação às manobras da Rússia no espaço aéreo polonês, o editorial posiciona-se de forma",
    "alternativas": [
      {
        "texto": "defensora delas, pois entende os espaços aéreos como domínios sem restrição de circulação.",
        "correta": false,
        "porQue": "O editorial defende reagir com firmeza e dissuadir, não as manobras russas."
      },
      {
        "texto": "contrária a elas, já que podem comprometer a segurança dos países-membros da Otan.",
        "correta": true,
        "porQue": "O texto diz que a resposta não pode ser tímida e que a investida é um desafio à segurança europeia; a posição é contrária às manobras."
      },
      {
        "texto": "ambígua quanto a elas, ora sugerindo que se contemporize o fato, ora defendendo a reação.",
        "correta": false,
        "porQue": "O editorial não contemporiza: defende defesa ativa, apoio à Ucrânia e clareza estratégica."
      },
      {
        "texto": "desfavorável a elas, uma vez que os países-membros da Otan estão escalando a violência.",
        "correta": false,
        "porQue": "Quem o texto aponta como escalando é a Rússia ('A guerra da Rússia está escalando'), não os países-membros da Otan."
      },
      {
        "texto": "indiferente a elas, ainda que entenda que a rotina de acusações entre os países é constante.",
        "correta": false,
        "porQue": "O editorial toma posição clara e defende reação firme; não é indiferente."
      }
    ],
    "insight": "Leia primeiro o que o editorial defende nos parágrafos 3 e 5 (reagir com firmeza, dissuadir) e quem ele aponta como autor da escalada; elimine as teses que invertem a posição do autor ou trocam o agente da violência.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777319",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 2,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nConsidere as passagens:\n\n- A madrugada de 10 de setembro passado foi um divisor de águas...\" (1o parágrafo)\n- Moscou acusou Varsóvia de disseminar \"mitos\". (2o parágrafo)\n\nAs informações destacadas significam, correta e respectivamente:",
    "alternativas": [
      {
        "texto": "um evento de transformação; sofismar.",
        "correta": true,
        "porQue": "'Divisor de águas' marca uma virada, um evento de transformação; 'disseminar mitos' é espalhar falsidades, sofismar."
      },
      {
        "texto": "um momento de tranquilidade; ofender.",
        "correta": false,
        "porQue": "'Divisor de águas' não indica tranquilidade, e 'disseminar mitos' não é ofender."
      },
      {
        "texto": "uma mudança já aguardada; recuar.",
        "correta": false,
        "porQue": "O texto não diz que a mudança era aguardada, e 'disseminar mitos' não é recuar."
      },
      {
        "texto": "uma situação sem êxito; fabular.",
        "correta": false,
        "porQue": "'Divisor de águas' não indica falta de êxito; 'fabular' não corresponde a disseminar mitos no contexto."
      },
      {
        "texto": "uma alteração desejada; provocar.",
        "correta": false,
        "porQue": "'Divisor de águas' não indica algo desejado, e 'disseminar mitos' não é provocar."
      }
    ],
    "insight": "Traduza cada expressão destacada pelo sentido no contexto antes de olhar as alternativas; elimine os pares em que um dos dois sinônimos não cabe no trecho.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777320",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 3,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nO termo destacado está empregado em sentido figurado em:",
    "alternativas": [
      {
        "texto": "A madrugada de 10 de setembro passado foi um divisor de águas… (1o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… reforçar o policiamento aéreo e deslocar barreiras… (3o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… ao contrário da Polônia, que leva a ameaça russa a sério. (4o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… a fim de expor velhas fissuras e, sobretudo, abrir novas. (2o parágrafo)",
        "correta": true,
        "porQue": "'Fissuras' aqui não são rachaduras físicas, e sim divisões políticas na aliança — sentido figurado."
      },
      {
        "texto": "Armar a Ucrânia e fortalecer a integridade da Otan… (5o parágrafo)",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada termo destacado: sentido figurado é o que não pode ser lido ao pé da letra no contexto; elimine os usos literais e compare os dois usos figurados pelo que o termo representa no trecho.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777321",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 4,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nConsidere a passagem do 4o parágrafo do texto:\n\n\"O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam…\"\n\nOs termos destacados significam, correta e respectivamente:\n\n[Nota: os grifos não foram preservados na extração; os termos destacados são \"alerta\", \"tibieza\" e \"se esquivam\", identificados por correspondência com as alternativas.]",
    "alternativas": [
      {
        "texto": "coação; arrogância; depreciam.",
        "correta": false,
        "porQue": "'Alerta' não é coação, 'tibieza' não é arrogância e 'se esquivam' não é depreciar."
      },
      {
        "texto": "aviso; frouxidão; eximem.",
        "correta": true,
        "porQue": "'Alerta' = aviso; 'tibieza' = frouxidão, falta de firmeza; 'se esquivam' = eximem-se, fogem."
      },
      {
        "texto": "ameaça; rigor; orgulham.",
        "correta": false,
        "porQue": "'Alerta' não é ameaça, 'tibieza' é o oposto de rigor e 'se esquivam' não é orgulhar-se."
      },
      {
        "texto": "sinal; desinteresse; honram.",
        "correta": false,
        "porQue": "'Tibieza' não é desinteresse e 'se esquivam' não é honrar."
      },
      {
        "texto": "atenção; zelo; afastam.",
        "correta": false,
        "porQue": "'Tibieza' é o oposto de zelo e 'se esquivam' não é apenas afastar-se."
      }
    ],
    "insight": "Associe cada termo destacado ao seu sinônimo pelo contexto do parágrafo, um de cada vez, na ordem; a alternativa certa acerta os três — um elemento trocado derruba o trio inteiro.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777322",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 5,
    "materia": "Língua Portuguesa",
    "assunto": "Pontuação",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nNo 3o parágrafo do texto, o sinal de dois-pontos é empregado três vezes para introduzir",
    "alternativas": [
      {
        "texto": "síntese baseada nas informações anteriores.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "retificação das informações anteriores.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "citação, com alusão a informações anteriores.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "detalhamento das informações anteriores.",
        "correta": true,
        "porQue": "Depois dos dois-pontos vêm as três dimensões (defesa ativa, apoio à Ucrânia, clareza estratégica) e o conteúdo de cada uma: detalhamento do que foi anunciado."
      },
      {
        "texto": "ênfase a informações opostas às anteriores.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Pergunte o que vem depois dos dois-pontos: se é explicação e detalhamento do que foi anunciado antes, não é síntese, retificação nem citação.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777323",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 6,
    "materia": "Língua Portuguesa",
    "assunto": "Sintaxe",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nDe acordo com a norma-padrão e sem prejuízo ao sentido original da conjunção e do advérbio, o trecho destacado em \"Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas.\" (2o parágrafo) admite a reescrita:\n\n[Nota: os termos destacados são \"a fim de\" e \"sobretudo\", identificados por correspondência com as alternativas.]",
    "alternativas": [
      {
        "texto": "… à medida que se expunha velhas fissuras e, além disso, abrisse novas.",
        "correta": false,
        "porQue": "'À medida que' indica proporção, não finalidade; 'além disso' não equivale a 'sobretudo'."
      },
      {
        "texto": "… uma vez que se exporia velhas fissuras e, eventualmente, abriria novas.",
        "correta": false,
        "porQue": "'Uma vez que' indica causa, não finalidade; 'eventualmente' não equivale a 'sobretudo'."
      },
      {
        "texto": "… conforme se expôs velhas fissuras e, porventura, pôde abrir novas.",
        "correta": false,
        "porQue": "'Conforme' indica conformidade, não finalidade; 'porventura' não equivale a 'sobretudo'."
      },
      {
        "texto": "… enquanto se expuseram velhas fissuras e, ocasionalmente, abrirão novas.",
        "correta": false,
        "porQue": "'Enquanto' indica tempo, não finalidade; 'ocasionalmente' não equivale a 'sobretudo'."
      },
      {
        "texto": "… para que se expusessem velhas fissuras e, principalmente, novas se abrissem.",
        "correta": true,
        "porQue": "'Para que' preserva a finalidade de 'a fim de' e 'principalmente' preserva o sentido de destaque de 'sobretudo'."
      }
    ],
    "insight": "Identifique a função de cada termo destacado ('a fim de' = finalidade; 'sobretudo' = destaque, principalmente) e só aceite a reescrita que preserva as duas funções e a norma-padrão.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777324",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 7,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nAssinale a alternativa em que o sentido do termo destacado remete à ideia de \"flagrante\".\n\n[Nota: os grifos não foram preservados na extração; o termo destacado de cada alternativa é o da passagem citada.]",
    "alternativas": [
      {
        "texto": "O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica. (1o parágrafo)",
        "correta": true,
        "porQue": "'Deixou claro' remete a evidente, às claras, flagrante."
      },
      {
        "texto": "A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade… (2o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. (1o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. (4o parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. (4o parágrafo)",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Procure no texto o termo cujo sentido equivale a 'evidente, às claras, flagrante'; elimine os termos usados com outro valor no contexto.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777325",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 8,
    "materia": "Língua Portuguesa",
    "assunto": "Crase",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 01 a 08.\n\nChoque de realidade na Polônia\n\nA madrugada de 10 de setembro passado foi um divisor de águas: 19 drones russos penetraram o espaço aéreo da Polônia, membro da Otan, obrigando caças poloneses e holandeses a abatê-los. Foi a primeira vez desde 1949 que aeronaves da aliança confrontaram armamentos russos em território aliado. O premiê polonês, Donald Tusk, alertou: \"Foi o momento mais próximo de um conflito aberto desde a 2a Guerra Mundial\". O gesto deixou claro o que está em jogo: a credibilidade da defesa coletiva no coração da ordem euro-atlântica.\n\nMoscou acusou Varsóvia de disseminar \"mitos\". Mas a escala, a origem e o momento – às vésperas do exercício Zapad, na Bielorrússia, que tradicionalmente ensaia cenários de guerra contra a Otan – não deixam dúvidas: foi uma operação de sondagem. Vladimir Putin buscou testar tempo de resposta, interoperabilidade e nervos políticos da aliança, a fim de expor velhas fissuras e, sobretudo, abrir novas. A estratégia é antiga, mas eficaz: avançar por meio de provocações ambíguas, negar responsabilidade e colher inteligência e dividendos psicológicos.\n\nA resposta não pode ser tímida nem só verbal. É preciso combinar três dimensões. Primeiro, defesa ativa: interceptar sistematicamente qualquer incursão, reforçar o policiamento aéreo e deslocar barreiras antiaéreas para o leste. Segundo, apoio ampliado à Ucrânia: negar à Rússia os \"santuários\" de onde partem ataques implica fornecer a Kiev arsenais de longo alcance, inteligência e meios industriais para atingir fábricas de drones e mísseis no território russo. Terceiro, clareza estratégica: a Otan precisa provar que não tolerará a criação de uma nova \"zona cinzenta\" em seu firmamento, riscando linhas vermelhas – ao invés de diluí-las.\n\nA investida na Polônia foi o ensaio de um desafio maior à segurança europeia e ao sistema internacional. O episódio serve de alerta a líderes europeus que continuam a tratar suas obrigações de defesa com tibieza, ao contrário da Polônia, que leva a ameaça russa a sério. A diretora de Relações Exteriores da União Europeia enunciou a verdade da qual muitos se esquivam: \"A guerra da Rússia está escalando, não acabando\".\n\nA lição é tão antiga quanto a guerra: fraqueza é um convite à agressão. Reagir com firmeza já não é escalar, é dissuadir. Armar a Ucrânia e fortalecer a integridade da Otan são a única forma de evitar que a Rússia transforme provocações em rotina, e rotinas, em guerra aberta. O teste foi feito. A hora da verdade chegou.\n\n(Editorial. https://www.estadao.com.br/opiniao, 12.09.2025. Adaptado)\n\nConsidere as frases:\n\n- A estratégia é antiga, mas eficaz: avançar recorrendo [lacuna] provocações ambíguas.\n- A Otan precisa provar que não se curvará [lacuna] criação de uma nova \"zona cinzenta\" em seu firmamento.\n- O episódio serve de alerta [lacuna] líderes europeus que continuam a tratar suas obrigações de defesa com tibieza.\n- Reagir com firmeza já não é escalar, é opor-se [lacuna] agressões.\n\nDe acordo com a norma-padrão, as lacunas devem ser preenchidas, correta e respectivamente, com:",
    "alternativas": [
      {
        "texto": "as … à … aqueles … as",
        "correta": false,
        "porQue": "'Recorrendo às provocações' erra a 1ª lacuna: 'recorrer a' + 'provocações' sem artigo definido pede 'a', sem crase."
      },
      {
        "texto": "às … à … aqueles … à",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "à … a … aqueles … a",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a … à … àqueles … às",
        "correta": true,
        "porQue": "'Recorrer a provocações' (a, sem crase); 'curvar-se à criação' (a + a feminina = à); 'alerta àqueles líderes' (a + aqueles = àqueles); 'opor-se às agressões' (a + as = às)."
      },
      {
        "texto": "à … a … àqueles … à",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Resolva lacuna por lacuna pela regência de cada verbo ou nome (recorrer a, curvar-se a, alerta a, opor-se a) e pelo gênero e número do termo seguinte; 'à' só cabe antes de palavra feminina quando o 'a' é exigido pela regência e há artigo definido.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777326",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 9,
    "materia": "Língua Portuguesa",
    "assunto": "Interpretação de Textos",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 09 a 12.\n\nNa conversa de anteontem com Rita esqueceu-me dizer a parte relativa a minha mulher, que lá está enterrada em Viena. Pela segunda vez falou-me em transportá-la para o nosso jazigo. Novamente lhe disse que estimaria muito estar perto dela, mas que, em minha opinião, os mortos ficam bem onde caem; redarguiu-me que estão muito melhor com os seus.\n\n– Quando eu morrer, irei para onde ela estiver, no outro mundo, e ela virá ao meu encontro – disse eu.\n\nSorriu, e citou o exemplo da viúva Noronha, que fez transportar o marido de Lisboa, onde faleceu, para o Rio de Janeiro, onde ela conta acabar. Não disse mais sobre este assunto, mas provavelmente tornará a ele, até alcançar o que lhe parece. Já meu cunhado dizia que era seu costume dela, quando queria alguma cousa.\n\nOutra cousa que não escrevi foi a alusão que ela fez à gente Aguiar, um casal que conheci a última vez que vim, com licença, ao Rio de Janeiro, e agora encontrei. São amigos dela e da viúva, e celebram daqui a dez ou quinze dias as suas bodas de prata. Já os visitei duas vezes e o marido, a mim.\n\nRita falou-me deles com simpatia e aconselhou-me a ir cumprimentá-los por ocasião das festas aniversárias.\n\n(Machado de Assis. Memorial de Aires. https://machadodeassis.net/texto/memorial-de-aires)\n\nEm relação ao local onde as pessoas devem ficar depois de mortas, é correto afirmar que o narrador e Rita",
    "alternativas": [
      {
        "texto": "defendem a ideia de que fiquem próximas dos familiares, seguindo o pensamento da viúva Noronha.",
        "correta": false,
        "porQue": "Só Rita defende a proximidade dos familiares; o narrador defende que os mortos ficam bem onde caem."
      },
      {
        "texto": "expõem uma ruptura sobre a questão, uma vez que ele prefere seguir as orientações de seu cunhado.",
        "correta": false,
        "porQue": "O narrador não segue orientação do cunhado sobre o assunto; o cunhado só comenta o costume de Rita insistir."
      },
      {
        "texto": "expressam diferentes opiniões, e ela acredita que os mortos devem estar próximos dos familiares.",
        "correta": true,
        "porQue": "O narrador diz que os mortos ficam bem onde caem; Rita defende transportá-los para junto dos seus, como fez a viúva Noronha."
      },
      {
        "texto": "dispensam um posicionamento definitivo sobre a questão, embora ela sugira deixá-las onde faleceram.",
        "correta": false,
        "porQue": "Os dois se posicionam: ele, por deixar onde caíram; ela, por trazê-los para perto dos familiares."
      },
      {
        "texto": "demonstram discordância do procedimento da viúva Noronha, que optou por trazer o marido de Lisboa.",
        "correta": false,
        "porQue": "Rita concorda com o procedimento da viúva Noronha e o cita como exemplo; o narrador é quem discorda."
      }
    ],
    "insight": "Compare as duas posições no texto: o que o narrador defende e o que Rita defende (e o exemplo da viúva Noronha); elimine as alternativas que atribuem a um deles a opinião do outro.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777327",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 10,
    "materia": "Língua Portuguesa",
    "assunto": "Regência",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 09 a 12.\n\nNa conversa de anteontem com Rita esqueceu-me dizer a parte relativa a minha mulher, que lá está enterrada em Viena. Pela segunda vez falou-me em transportá-la para o nosso jazigo. Novamente lhe disse que estimaria muito estar perto dela, mas que, em minha opinião, os mortos ficam bem onde caem; redarguiu-me que estão muito melhor com os seus.\n\n– Quando eu morrer, irei para onde ela estiver, no outro mundo, e ela virá ao meu encontro – disse eu.\n\nSorriu, e citou o exemplo da viúva Noronha, que fez transportar o marido de Lisboa, onde faleceu, para o Rio de Janeiro, onde ela conta acabar. Não disse mais sobre este assunto, mas provavelmente tornará a ele, até alcançar o que lhe parece. Já meu cunhado dizia que era seu costume dela, quando queria alguma cousa.\n\nOutra cousa que não escrevi foi a alusão que ela fez à gente Aguiar, um casal que conheci a última vez que vim, com licença, ao Rio de Janeiro, e agora encontrei. São amigos dela e da viúva, e celebram daqui a dez ou quinze dias as suas bodas de prata. Já os visitei duas vezes e o marido, a mim.\n\nRita falou-me deles com simpatia e aconselhou-me a ir cumprimentá-los por ocasião das festas aniversárias.\n\n(Machado de Assis. Memorial de Aires. https://machadodeassis.net/texto/memorial-de-aires)\n\nConsidere a passagem do 3o parágrafo:\n\n\"Não disse mais sobre este assunto, mas provavelmente tornará a ele, até alcançar o que lhe parece. Já meu cunhado dizia que era seu costume dela, quando queria alguma cousa.\"\n\nTendo por base a coesão, a coerência e a regência nominal, uma frase que traduz corretamente o ponto de vista expresso no texto é:",
    "alternativas": [
      {
        "texto": "Rita é uma mulher admirável. Quanto anseia a algo, persegue seu objetivo até fazer ele tornar-se realidade.",
        "correta": false,
        "porQue": "'Anseia a algo' quebra a regência de 'anseiar' (anseia-se por algo) e 'fazer ele' está errado."
      },
      {
        "texto": "Rita é uma mulher perseverante. Quanto anseia por algo, persegue seu objetivo até fazê-lo tornar-se realidade.",
        "correta": true,
        "porQue": "'Anseia por algo' respeita a regência; 'fazê-lo tornar-se' usa o pronome corretamente; 'perseverante' traduz o 'tornará a ele até alcançar'."
      },
      {
        "texto": "Rita é uma mulher resiliente. Quanto anseia algo, persegue seu objetivo até fazer ele tornar-se realidade.",
        "correta": false,
        "porQue": "'Anseia algo' (sem preposição) quebra a regência e 'fazer ele' está errado."
      },
      {
        "texto": "Rita é uma mulher insistente. Quanto anseia com algo, persegue seu objetivo até fazer torná-lo realidade.",
        "correta": false,
        "porQue": "'Anseia com algo' quebra a regência e 'fazer torná-lo' está errado."
      },
      {
        "texto": "Rita é uma mulher inspiradora. Quanto anseia em algo, persegue seu objetivo até fazê-lo torná-lo realidade.",
        "correta": false,
        "porQue": "'Anseia em algo' quebra a regência e 'fazê-lo torná-lo' duplica o pronome."
      }
    ],
    "insight": "Teste a regência de 'anseia' (anseia-se por algo) e a colocação do pronome ('fazê-lo tornar-se'); elimine as frases que quebram uma só dessas regras.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777328",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 11,
    "materia": "Língua Portuguesa",
    "assunto": "Regência",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 09 a 12.\n\nNa conversa de anteontem com Rita esqueceu-me dizer a parte relativa a minha mulher, que lá está enterrada em Viena. Pela segunda vez falou-me em transportá-la para o nosso jazigo. Novamente lhe disse que estimaria muito estar perto dela, mas que, em minha opinião, os mortos ficam bem onde caem; redarguiu-me que estão muito melhor com os seus.\n\n– Quando eu morrer, irei para onde ela estiver, no outro mundo, e ela virá ao meu encontro – disse eu.\n\nSorriu, e citou o exemplo da viúva Noronha, que fez transportar o marido de Lisboa, onde faleceu, para o Rio de Janeiro, onde ela conta acabar. Não disse mais sobre este assunto, mas provavelmente tornará a ele, até alcançar o que lhe parece. Já meu cunhado dizia que era seu costume dela, quando queria alguma cousa.\n\nOutra cousa que não escrevi foi a alusão que ela fez à gente Aguiar, um casal que conheci a última vez que vim, com licença, ao Rio de Janeiro, e agora encontrei. São amigos dela e da viúva, e celebram daqui a dez ou quinze dias as suas bodas de prata. Já os visitei duas vezes e o marido, a mim.\n\nRita falou-me deles com simpatia e aconselhou-me a ir cumprimentá-los por ocasião das festas aniversárias.\n\n(Machado de Assis. Memorial de Aires. https://machadodeassis.net/texto/memorial-de-aires)\n\nConsidere as passagens:\n\n- Na conversa de anteontem com Rita esqueceu-me dizer a parte relativa a minha mulher… (1o parágrafo)\n- … os mortos ficam bem onde caem… (1o parágrafo)\n- Outra cousa que não escrevi foi a alusão que ela fez à gente Aguiar, um casal que conheci a última vez que vim… (4o parágrafo)\n\nDe acordo com a norma-padrão de regência, as passagens destacadas podem ser substituídas, respectivamente, por:\n\n[Nota: os grifos não foram preservados na extração; os termos destacados são \"esqueceu-me\", \"onde caem\" e \"que conheci\", identificados por correspondência com as alternativas.]",
    "alternativas": [
      {
        "texto": "esqueci de; onde se dirigiram; que fui apresentado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "esqueci; onde chegam; o qual fui apresentado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "esqueci-me; onde estão; no qual fui apresentado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "esqueci-me de; aonde vão; a que fui apresentado.",
        "correta": true,
        "porQue": "'Esqueceu-me dizer' = 'esqueci-me de dizer'; 'onde caem' (lugar de destino final) = 'aonde vão'; 'que conheci' = 'a que fui apresentado' (apresentado a alguém)."
      },
      {
        "texto": "esqueci de; aonde morrem; para o qual fui apresentado.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Substitua cada passagem destacada testando a regência exigida ('esquecer-se de', 'aonde' para destino, 'a que' para 'apresentado a'); elimine as que trocam uma preposição.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777329",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 12,
    "materia": "Língua Portuguesa",
    "assunto": "Colocação Pronominal",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 09 a 12.\n\nNa conversa de anteontem com Rita esqueceu-me dizer a parte relativa a minha mulher, que lá está enterrada em Viena. Pela segunda vez falou-me em transportá-la para o nosso jazigo. Novamente lhe disse que estimaria muito estar perto dela, mas que, em minha opinião, os mortos ficam bem onde caem; redarguiu-me que estão muito melhor com os seus.\n\n– Quando eu morrer, irei para onde ela estiver, no outro mundo, e ela virá ao meu encontro – disse eu.\n\nSorriu, e citou o exemplo da viúva Noronha, que fez transportar o marido de Lisboa, onde faleceu, para o Rio de Janeiro, onde ela conta acabar. Não disse mais sobre este assunto, mas provavelmente tornará a ele, até alcançar o que lhe parece. Já meu cunhado dizia que era seu costume dela, quando queria alguma cousa.\n\nOutra cousa que não escrevi foi a alusão que ela fez à gente Aguiar, um casal que conheci a última vez que vim, com licença, ao Rio de Janeiro, e agora encontrei. São amigos dela e da viúva, e celebram daqui a dez ou quinze dias as suas bodas de prata. Já os visitei duas vezes e o marido, a mim.\n\nRita falou-me deles com simpatia e aconselhou-me a ir cumprimentá-los por ocasião das festas aniversárias.\n\n(Machado de Assis. Memorial de Aires. https://machadodeassis.net/texto/memorial-de-aires)\n\nA colocação pronominal está de acordo com a norma-padrão em:",
    "alternativas": [
      {
        "texto": "Rita não disse mais sobre aquele assunto, mas provavelmente o retomará em outras conversas.",
        "correta": true,
        "porQue": "'O retomará' usa a mesóclise corretamente com o futuro do presente."
      },
      {
        "texto": "Celebrarão-se daqui a dez ou quinze dias as bodas de prata do casal Aguiar, conhecido de Rita.",
        "correta": false,
        "porQue": "No futuro do presente o pronome vai no meio do verbo (mesóclise): 'celebrar-se-ão', não 'celebrarão-se'."
      },
      {
        "texto": "Minha mulher está enterrada em Viena, e Rita sugeriu que transportasse-a para o nosso jazigo.",
        "correta": false,
        "porQue": "Com 'que' (conjunção subordinativa), o pronome deve vir antes do verbo: 'que a transportasse', não 'transportasse-a'."
      },
      {
        "texto": "Me esqueceu dizer a parte relativa a minha mulher, na conversa de anteontem que tive com Rita.",
        "correta": false,
        "porQue": "Não se inicia frase com pronome oblíquo átono: 'Me esqueceu' está errado."
      },
      {
        "texto": "O marido da viúva Noronha estava em Lisboa, onde falecera, e ela não deixou-o enterrado lá.",
        "correta": false,
        "porQue": "Com a negação ('não'), o pronome deve vir antes do verbo: 'não o deixou', não 'deixou-o'."
      }
    ],
    "insight": "Teste cada frase por uma regra de cada vez (próclise após 'que' e após negação, mesóclise no futuro, nunca iniciar frase com pronome átono); a certa não quebra nenhuma — um pronome mal colocado derruba a alternativa.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777330",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 13,
    "materia": "Raciocínio Lógico",
    "assunto": "Sequências",
    "artigo": null,
    "enunciado": "A sequência: 0, 1, 3, 8, 8, 27, 15, 64, 24, 125, …, é formada com um padrão lógico aritmético, e que, desde o início, cada par de termos sucessivos é gerado a partir de um mesmo valor. Sendo assim, a diferença entre o 20o e o 19o termo é igual a",
    "alternativas": [
      {
        "texto": "801.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "999.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "809.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "891.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "901.",
        "correta": true,
        "porQue": "Os pares são (n²−1, n³): (0,1), (3,8), (8,27), (15,64), (24,125). O 19º termo é o 1º do 10º par: 10²−1 = 99; o 20º é 10³ = 1000; 1000 − 99 = 901."
      }
    ],
    "insight": "Separe a sequência em pares gerados pelo mesmo valor e descubra a lei de cada posição do par; só então calcule os termos 19 e 20 e a diferença.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777331",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 14,
    "materia": "Raciocínio Lógico",
    "assunto": "Negação Lógica",
    "artigo": null,
    "enunciado": "Considere a seguinte afirmação:\n\nTodas as empresas têm filiais ou no Brasil ou no exterior.\n\nAssinale a alternativa que contém uma negação lógica para a afirmação apresentada.",
    "alternativas": [
      {
        "texto": "Existe empresa que, se tem filial no Brasil, então tem filial no exterior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Nenhuma empresa tem filial no Brasil e no exterior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Existe empresa que tem filial no exterior se, e somente se, tem filial no Brasil.",
        "correta": true,
        "porQue": "'Ou no Brasil ou no exterior' é disjunção exclusiva (ou… ou…): ter filial num lugar exclui o outro. Negar a afirmação universal é afirmar que existe empresa em que a exclusiva falha, isto é, em que vale a equivalência (tem no exterior se, e somente se, tem no Brasil)."
      },
      {
        "texto": "Nenhuma empresa tem filial no Brasil ou no exterior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Todas as empresas têm filial no Brasil se, e somente se, tem filial no exterior.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Identifique o conectivo: 'ou... ou...' é disjunção exclusiva; a negação de uma afirmação universal troca o quantificador (todas → existe) e nega o conectivo — teste cada alternativa contra essa negação.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777332",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 15,
    "materia": "Raciocínio Lógico",
    "assunto": "Diagramas de Venn",
    "artigo": null,
    "enunciado": "Um setor de finanças tem um lote com 40 impostos de renda com problemas que são do tipo: valores incorretos, rendimentos omitidos ou informações cadastrais ausentes. Nesse lote de impostos de renda, 28 têm valores incorretos, 17 têm rendimentos omitidos, 13 têm informações cadastrais ausentes, 6 têm valores incorretos e rendimentos omitidos, 7 têm rendimentos omitidos e informações cadastrais ausentes, e 10 têm valores incorretos e informações cadastrais ausentes.\n\nO número de impostos de renda, desse lote, com pelo menos dois tipos de problemas é igual a",
    "alternativas": [
      {
        "texto": "13.",
        "correta": true,
        "porQue": "Por inclusão-exclusão, 40 = 28+17+13 − (6+7+10) + tripla, logo a tripla é 5. Com pelo menos dois problemas: (6−5)+(7−5)+(10−5)+5 = 13."
      },
      {
        "texto": "18.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "14.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "23.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "10.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Use inclusão-exclusão para achar quantos têm os três problemas e depois some só quem tem pelo menos dois; não some as interseções duas a duas sem descontar a tripla.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777333",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 16,
    "materia": "Matemática",
    "assunto": "Média Aritmética",
    "artigo": null,
    "enunciado": "Em uma empresa, o salário de cinco funcionários é de R$ 10.000,00, sete funcionários recebem R$ 8.000,00, e, dos demais funcionários, metade recebe R$ 6.000,00, dois sétimos recebem R$ 7.000,00 e três quatorze avos recebem R$ 4.000,00, o que faz com que a média aritmética simples dos salários dos funcionários dessa empresa seja igual a R$ 6.750,00. A quantidade de funcionários dessa empresa é igual a",
    "alternativas": [
      {
        "texto": "40.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "24.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "28.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "54.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "68.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Chame de x o número dos demais funcionários (metade, dois sétimos e três quatorze avos dele somam x) e monte a equação da média igual a R$ 6.750,00; resolva para o total 12 + x.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777334",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 17,
    "materia": "Matemática",
    "assunto": "Séries Temporais",
    "artigo": null,
    "enunciado": "Um algoritmo está sendo desenvolvido para modelagem de séries temporais e encontra-se em fase de testes. Nessa etapa, o algoritmo funciona para séries com média 75 e variância 180. Uma dada série selecionada para o teste não atende às especificações mencionadas, pois possui média 84 e variância 245. Para alterar linearmente a referida série, tornando apta a testar o algoritmo, é necessário que cada observação seja",
    "alternativas": [
      {
        "texto": "multiplicada por [fração — não extraída] e diminuída de 3.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "multiplicada por [fração — não extraída] e adicionada de 3.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "multiplicada por [fração — não extraída] e adicionada de 6.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "multiplicada por [fração — não extraída] e diminuída de 5.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "multiplicada por [fração — não extraída] e adicionada de 9.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "As frações (multiplicadores) das alternativas são imagens no PDF e não foram extraídas da camada de texto; sem elas a questão não é resolvível pelo texto extraído.",
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777336",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 19,
    "materia": "Matemática",
    "assunto": "Aumentos Percentuais Consecutivos",
    "artigo": null,
    "enunciado": "Sejam x, y e i números reais e positivos, então dois aumentos consecutivos, um de xi% e outro de yi%, correspondem a um aumento percentual igual a:",
    "alternativas": [
      {
        "texto": "[fórmula — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fórmula — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fórmula — não extraída]",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "[fórmula — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fórmula — não extraída]",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "As fórmulas das alternativas são imagens no PDF e não foram extraídas da camada de texto; sem elas a questão não é resolvível pelo texto extraído.",
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777337",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 20,
    "materia": "Matemática",
    "assunto": "Matemática Financeira",
    "artigo": null,
    "enunciado": "Uma empresa tem títulos mensais a receber, um a cada mês, no valor unitário de R$ 8.000,00, com o primeiro vencendo em 30 dias, e o último em 780 dias. Ela negociará todos esses títulos em um banco, mediante desconto comercial (desconto simples), com taxa mensal de desconto de 2,5%. O valor líquido que ela receberá na negociação será de",
    "alternativas": [
      {
        "texto": "R$ 137.200,00.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 137.400,00.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 137.600,00.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 138.000,00.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 137.800,00.",
        "correta": true,
        "porQue": null
      }
    ],
    "insight": "Conte os títulos (de 30 a 780 dias, um por mês, são 26 títulos) e aplique o desconto simples a cada prazo; o valor líquido é a soma dos valores descontados, não o desconto sobre o total.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777340",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 23,
    "materia": "Noções de Informática",
    "assunto": "MS-Office 365",
    "artigo": null,
    "enunciado": "No MS-Office 365, os menus são elementos que possibilitam o acesso às funcionalidades de uso mais comum, por meio de acesso a diversas guias, como a",
    "alternativas": [
      {
        "texto": "Exibir, destinada a apresentar as principais informações do arquivo, como datas de criação e alteração, proprietário, permissões, dentre outras.",
        "correta": false,
        "porQue": "Apresentar informações do arquivo (datas, proprietário, permissões) é função da guia Arquivo, não de Exibir."
      },
      {
        "texto": "Inserir, que permite incorporar usuários com os quais o arquivo poderá ser compartilhado.",
        "correta": false,
        "porQue": "Compartilhar o arquivo com usuários não é função da guia Inserir."
      },
      {
        "texto": "Ajuda, que ativa automaticamente a ferramenta de inteligência artificial Copilot para auxiliar o usuário na elaboração de alguma atividade no seu arquivo.",
        "correta": false,
        "porQue": "A guia Ajuda não ativa automaticamente o Copilot."
      },
      {
        "texto": "Arquivo, que permite salvar, abrir, imprimir documentos, bem como a exibição de suas informações relacionadas ao arquivo.",
        "correta": true,
        "porQue": "A guia Arquivo concentra salvar, abrir, imprimir e as informações do arquivo."
      },
      {
        "texto": "Página Inicial, que posiciona o cursor na primeira página de um arquivo, planilha ou slide do arquivo que será editado.",
        "correta": false,
        "porQue": "A guia Página Inicial reúne formatação e edição, não posiciona o cursor na primeira página."
      }
    ],
    "insight": "Associe cada guia à sua função real no Office (Arquivo = gerenciar o arquivo; Exibir, Inserir, Ajuda e Página Inicial têm outras funções); elimine as que trocam a função pelo nome.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777341",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 24,
    "materia": "Noções de Informática",
    "assunto": "Word",
    "artigo": null,
    "enunciado": "No aplicativo Word do MS-Office 365 (tendo como base a versão 2016, em português e em sua configuração padrão), um usuário digitou a seguinte frase em um documento:\n\nGrupo de participantes atuantes.\n\nPosteriormente, selecionou, na palavra \"atuantes\", somente as letras \"atu\", aplicando o efeito de fonte de texto oculto. Caso o recurso Mostrar Tudo esteja desativado, o que pode ser feito desativando-o por meio do botão (¶ – símbolo de parágrafo) da guia Página Inicial, ou por meio do atalho de teclado Ctrl + Shift + 8, essa frase ficará com a aparência:",
    "alternativas": [
      {
        "texto": "Grupo de participantes atuantes.",
        "correta": false,
        "porQue": "Com 'Mostrar Tudo' desativado, o texto oculto some, mas esta alternativa mantém 'atu' visível."
      },
      {
        "texto": "Grupo de participantes antes.",
        "correta": true,
        "porQue": "Ocultadas as letras 'atu' de 'atuantes', resta 'antes': 'Grupo de participantes antes.'."
      },
      {
        "texto": "Grupo de participantesantes.",
        "correta": false,
        "porQue": "Sem as letras ocultas não há junção das palavras; 'participantes' e 'antes' continuam separadas por espaço."
      },
      {
        "texto": "Grupo de participantes     antes.",
        "correta": false,
        "porQue": "Não há espaços extras no lugar das letras ocultas."
      },
      {
        "texto": "Grupo de participantes.",
        "correta": false,
        "porQue": "Só 'atu' foi ocultado, não a palavra inteira 'atuantes'."
      }
    ],
    "insight": "Simule a ação: texto oculto com 'Mostrar Tudo' desativado some da exibição — o que resta visível é o texto sem as letras ocultadas, mantendo o restante da palavra e os espaços.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777342",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 25,
    "materia": "Noções de Informática",
    "assunto": "Excel",
    "artigo": null,
    "enunciado": "No aplicativo Excel do MS-Office 365 (tendo como base a versão 2016, em português e em sua configuração padrão), digitou-se a seguinte planilha, referentes à avaliação de alunos em uma disciplina:\n\n[Nota: os valores da planilha são uma imagem no PDF e não foram extraídos da camada de texto — sem eles a fórmula não pode ser avaliada a partir do texto.]\n\nCada aluno realizou três atividades de avaliação, sendo duas provas (P1 e P2) e um trabalho (T). Na coluna E, tem-se a média ponderada das provas (MP), sendo os pesos de P1 e P2 iguais a 1 e 2, respectivamente. A média final é composta pela média ponderada de MP e T, com pesos 2 e 1, respectivamente. Suponha que a seguinte fórmula tenha sido inserida na célula G2 (apresentada aqui em 2 linhas por questão de espaço): =SE(E((E2>=5);(D2>=5));\"Aprovado\";SE(F2>=3;\"Recuperação\";\"Reprovado\")) e que, ainda, essa fórmula tenha sido arrastada até a célula G7 pelo quadradinho inferior direito da célula G2 previamente selecionada.\n\nÉ correto afirmar que os números de alunos com as Situações \"Aprovado\", \"Reprovado\" e \"Recuperação\" serão, respectivamente:",
    "alternativas": [
      {
        "texto": "2, 3 e 1.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "2, 2 e 2.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "3, 1 e 2.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "2, 1 e 3.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "3, 2 e 1.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "Os valores da planilha do Excel são uma imagem no PDF e não foram extraídos da camada de texto; sem eles a fórmula não pode ser avaliada a partir do texto extraído.",
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777343",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 26,
    "materia": "Noções de Informática",
    "assunto": "OneDrive",
    "artigo": null,
    "enunciado": "Um Contador Judiciário utilizou o MS-Office 365, e alterou uma planilha elaborada no Excel em seu computador. Posteriormente, tentou acessar o mesmo arquivo no seu smartphone por meio do OneDrive, constatando que as alterações realizadas no computador no arquivo não estavam presentes na versão do smartphone. Uma possível explicação para o ocorrido é:",
    "alternativas": [
      {
        "texto": "a sincronização de arquivos por meio do OneDrive não foi assinada pelo usuário ou empresa, pois se trata de um recurso opcional, que deve ser assinado separadamente.",
        "correta": false,
        "porQue": "A sincronização do OneDrive não exige assinatura separada."
      },
      {
        "texto": "o arquivo que foi alterado não se encontrava em uma pasta sincronizada do OneDrive.",
        "correta": true,
        "porQue": "Se o arquivo não está numa pasta sincronizada do OneDrive, as alterações não sobem para a nuvem nem chegam ao smartphone."
      },
      {
        "texto": "a sincronização permitida pelo OneDrive contempla microcomputadores e notebooks, não contemplando smartphones e tablets.",
        "correta": false,
        "porQue": "O OneDrive sincroniza também com smartphones e tablets."
      },
      {
        "texto": "como a sincronização por meio do OneDrive não é automática, provavelmente o usuário se esqueceu de selecionar a opção \"Sincronizar\" após concluir as alterações.",
        "correta": false,
        "porQue": "A sincronização do OneDrive é automática; não há opção 'Sincronizar' a selecionar após cada alteração."
      },
      {
        "texto": "o OneDrive permite a sincronização de arquivos do Word, não sendo possível sincronizar arquivos do Excel e do PowerPoint.",
        "correta": false,
        "porQue": "O OneDrive sincroniza arquivos do Excel e do PowerPoint, não só do Word."
      }
    ],
    "insight": "Pense no requisito da sincronização: o arquivo precisa estar numa pasta sincronizada; elimine as explicações que inventam limites do OneDrive (aparelhos, tipos de arquivo, assinatura).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777344",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 27,
    "materia": "Noções de Informática",
    "assunto": "Correio Eletrônico",
    "artigo": null,
    "enunciado": "O correio eletrônico possui diversas opções e recursos para o preparo e o envio de e-mails, como o",
    "alternativas": [
      {
        "texto": "campo CCS, que permite o envio de uma mensagem com segurança, podendo ser lida por quem possui uma senha.",
        "correta": false,
        "porQue": "Não existe campo 'CCS' com essa função de segurança por senha."
      },
      {
        "texto": "anexo estendido, que permite o envio de arquivos com tamanho de até 1 GB.",
        "correta": false,
        "porQue": "Não existe 'anexo estendido' de 1 GB como recurso do correio eletrônico."
      },
      {
        "texto": "campo CCO (ou BCC), que torna oculto os anexos que estejam presentes no e-mail.",
        "correta": false,
        "porQue": "O CCO oculta os endereços em cópia, não os anexos."
      },
      {
        "texto": "campo Assunto, que é obrigatório, e se ele não for preenchido, será colocado automaticamente o texto \"sem informação\".",
        "correta": false,
        "porQue": "O campo Assunto não é obrigatório nem recebe 'sem informação' automaticamente."
      },
      {
        "texto": "campo CCO (ou BCC), que não permite aos destinatários do e-mail ver quais outros endereços estão em cópia.",
        "correta": true,
        "porQue": "O CCO (cópia oculta) impede que os destinatários vejam os demais endereços em cópia."
      }
    ],
    "insight": "Lembre o que CCO/BCC esconde: os endereços em cópia oculta, não os anexos; elimine as alternativas que inventam campos (CCS) ou regras (assunto obrigatório, anexo de 1 GB).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777345",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 28,
    "materia": "Noções de Informática",
    "assunto": "Microsoft Teams",
    "artigo": null,
    "enunciado": "Um usuário da denominada plataforma Microsoft Teams deseja reunir um grupo de pessoas para, por exemplo, trocar mensagens, fazer chamadas ou ainda registrar eventos. Dessa forma, considerando a utilização dessa plataforma, esse usuário deve criar um grupo de pessoas, utilizando, para tal finalidade, um botão com um ícone designado especificamente para esse objetivo, localizado no menu lateral, situado na parte esquerda dessa plataforma. O botão em questão possui a nomenclatura de",
    "alternativas": [
      {
        "texto": "Chat.",
        "correta": false,
        "porQue": "'Chat' é para conversas, não para criar o grupo/equipe."
      },
      {
        "texto": "Calendário.",
        "correta": false,
        "porQue": "'Calendário' é para agenda e reuniões, não para criar o grupo."
      },
      {
        "texto": "Atividade.",
        "correta": false,
        "porQue": "'Atividade' mostra notificações, não cria o grupo."
      },
      {
        "texto": "Equipes.",
        "correta": true,
        "porQue": "No Teams, o grupo de pessoas (equipe) é criado pelo botão 'Equipes' do menu lateral."
      },
      {
        "texto": "Chamadas.",
        "correta": false,
        "porQue": "'Chamadas' é para ligações, não para criar o grupo."
      }
    ],
    "insight": "No Teams, reunir pessoas para mensagens, chamadas e eventos é função de 'Equipes'; elimine os botões do menu lateral que têm outra função (Chat, Calendário, Atividade, Chamadas).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777347",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 30,
    "materia": "Noções de Informática",
    "assunto": "Inteligência Artificial Generativa",
    "artigo": null,
    "enunciado": "A Inteligência Artificial Generativa utiliza modelos de linguagem (LLMs – Large Language Models) para processamento de prompts em linguagem natural. Um fenômeno que pode ocorrer durante o uso dos LLMs é a alucinação. Assinale a alternativa que explica corretamente o fenômeno da alucinação.",
    "alternativas": [
      {
        "texto": "É um processo no qual o LLM gera informações plausíveis, porém incorretas.",
        "correta": true,
        "porQue": "Alucinação é gerar informação plausível, mas incorreta."
      },
      {
        "texto": "É o mecanismo em que o LLM necessita extrair dados da rede.",
        "correta": false,
        "porQue": "Extrair dados da rede não é alucinação."
      },
      {
        "texto": "É um bloqueio de segurança contra conteúdo ofensivo durante uso do LLM.",
        "correta": false,
        "porQue": "Bloqueio de segurança contra conteúdo ofensivo não é alucinação."
      },
      {
        "texto": "É um recurso dos LLMs para criar respostas mais adequadas ao interlocutor humano.",
        "correta": false,
        "porQue": "Adequar a resposta ao interlocutor não é alucinação."
      },
      {
        "texto": "É uma situação em que o LLM não apresenta nenhuma resposta ao prompt fornecido.",
        "correta": false,
        "porQue": "Não apresentar resposta não é alucinação."
      }
    ],
    "insight": "Alucinação é gerar informação plausível mas incorreta; elimine as definições que descrevem outros fenômenos (buscar dados, bloqueio de segurança, ausência de resposta).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777375",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 58,
    "materia": "Direito Administrativo",
    "assunto": "Continuidade do Serviço Público",
    "artigo": "CF, art. 37, VII",
    "enunciado": "O princípio da continuidade do serviço público é fundamental para a justificação da opção legislativa pela",
    "alternativas": [
      {
        "texto": "exigência de licitação para a contratação de obras, bens e serviços.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "impenhorabilidade dos bens públicos de uso especial.",
        "correta": true,
        "porQue": "Os bens públicos de uso especial servem diretamente à prestação do serviço público; sua impenhorabilidade protege a continuidade do serviço."
      },
      {
        "texto": "impossibilidade de caducidade de concessão pública sem prévia indenização.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "proibição de realização de greve no serviço público.",
        "correta": false,
        "porQue": "ARMADILHA: o tema 'greve' (CF, art. 37, VII) aparece nesta alternativa, mas não é a resposta — a greve no serviço público não é proibida em termos absolutos, e o princípio da continuidade justifica aqui a impenhorabilidade dos bens de uso especial."
      },
      {
        "texto": "possibilidade de desapropriação de bens privados sem prévia indenização.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Pergunte o que a continuidade do serviço público justifica no caso concreto: a proteção dos bens que servem ao serviço; desconfie da alternativa que traz o tema mais chamativo (greve) sem ligá-lo ao princípio — o tema anotado no caderno pode ser a armadilha, não o gabarito.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777379",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 62,
    "materia": "Direito Administrativo",
    "assunto": "Responsabilidade Civil do Estado",
    "artigo": "CF, art. 37, §6º",
    "enunciado": "Um guarda civil municipal, durante a fiscalização de rotina, abordou um veículo estacionado em local proibido. Ao solicitar os documentos do motorista do carro parado, o agente público percebeu que ele estava visivelmente alterado e com sinais de embriaguez. O agente, seguindo o protocolo, o impediu de continuar dirigindo, solicitando o apoio de um guincho para a remoção do veículo do local proibido onde se encontrava. Enquanto aguardavam a chegada do guincho, que estava atrasado em relação ao tempo máximo previsto em lei municipal para a remoção de veículos, o agente e o motorista possivelmente embriagado presenciaram outro carro ultrapassar o sinal vermelho e cruzar a esquina em alta velocidade, perdendo o controle e batendo na lateral do carro que estava estacionado em local proibido. O motorista abordado pelo guarda civil alega que o dano que foi causado ao seu carro, que estava estacionado, deve ser imputado à ação do guarda, que o impediu de sair dirigindo.\n\nSobre essa situação hipotética é correto afirmar, com base na legislação nacional, que",
    "alternativas": [
      {
        "texto": "a responsabilidade civil do município depende da comprovação de elemento subjetivo, dolo ou culpa, do agente público, por se tratar de hipótese de responsabilidade civil subjetiva.",
        "correta": false,
        "porQue": "A responsabilidade do Estado (CF, art. 37, §6º) é objetiva: não depende de dolo ou culpa do agente."
      },
      {
        "texto": "eventual nexo causal entre a ação do agente público e o dano causado não é adequado para se falar em responsabilização do município, por ter sofrido interferência de ação ilícita de terceiro.",
        "correta": true,
        "porQue": "O dano foi causado pelo terceiro que furou o sinal vermelho em alta velocidade; essa ação ilícita rompe o nexo causal entre a conduta do guarda e o dano."
      },
      {
        "texto": "a responsabilidade civil do município depende da comprovação de elemento subjetivo, dolo ou culpa, do agente público, por se tratar de hipótese de responsabilidade civil objetiva.",
        "correta": false,
        "porQue": "Responsabilidade objetiva dispensa dolo ou culpa — a alternativa se contradiz ao exigir elemento subjetivo numa hipótese objetiva."
      },
      {
        "texto": "a causa original da cadeia de eventos que levou aos danos sofridos pelo motorista abordado realmente foi a ação do agente público, o que leva inexoravelmente à responsabilidade do município.",
        "correta": false,
        "porQue": "A causa do dano foi a colisão provocada pelo terceiro, não a ação do guarda de impedir o motorista embriagado de dirigir."
      },
      {
        "texto": "a responsabilidade civil do município no caso não decorre da ação do guarda civil, mas, sim, da demora do guincho em atender ao chamado dentro do tempo máximo previsto na legislação municipal para remoção.",
        "correta": false,
        "porQue": "A demora do guincho não causou a batida; o dano decorreu da ação do terceiro."
      }
    ],
    "insight": "Teste o nexo causal: o dano foi causado por quem? Se um terceiro cometeu o ato ilícito que causou o dano, o nexo com a conduta do agente se rompe; lembre que a responsabilidade objetiva (art. 37, §6º) dispensa dolo ou culpa, mas não dispensa o nexo.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777382",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 65,
    "materia": "Direito Constitucional",
    "assunto": "Direitos Sociais — Greve e Lock-out",
    "artigo": "CF, arts. 7º e 9º",
    "enunciado": "É denominada de lock-out a greve dos empregadores, isto é, a situação em que as empresas empregadoras fecham as portas de seus estabelecimentos, impedindo a realização de qualquer trabalho, com o objetivo de obter concessões dos próprios trabalhadores ou do poder público.\n\nSobre esse tema, com base na Constituição Federal, é correto afirmar:",
    "alternativas": [
      {
        "texto": "o lock-out é permitido pela ordem constitucional brasileira apenas como meio de obter concessões dos trabalhadores, mas não do poder público.",
        "correta": false,
        "porQue": "O lock-out não é permitido pela ordem constitucional em nenhuma das finalidades indicadas."
      },
      {
        "texto": "o direito de lock-out se aplica igualmente às empresas estatais, uma vez que a Constituição impõe a elas o mesmo regime jurídico aplicável às empresas privadas.",
        "correta": false,
        "porQue": "Não há direito de lock-out a ser aplicado às estatais ou a quem quer que seja."
      },
      {
        "texto": "enquanto o direito de greve dos trabalhadores aparece no capítulo constitucional relativo aos direitos coletivos, o lock-out aparece no relativo à ordem econômica e financeira.",
        "correta": false,
        "porQue": "O lock-out não aparece como direito no capítulo da ordem econômica e financeira."
      },
      {
        "texto": "trata-se de um corolário do direito de greve dos trabalhadores, o qual se estende igualmente aos empregadores, por simetria.",
        "correta": false,
        "porQue": "Não há simetria: o direito de greve é dos trabalhadores e não se estende aos empregadores."
      },
      {
        "texto": "não existe no direito constitucional brasileiro um direito de greve dos empregadores (lock-out), mas apenas dos empregados, tanto no setor privado quanto no público.",
        "correta": true,
        "porQue": "A CF assegura o direito de greve aos empregados (arts. 7º e 9º); não existe direito de greve dos empregadores (lock-out)."
      }
    ],
    "insight": "Pergunte o que a CF garante: o direito de greve é dos empregados (arts. 7º e 9º); não há direito simétrico dos empregadores — elimine as teses que permitem o lock-out, o estendem ou o colocam noutro capítulo como direito.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777383",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 66,
    "materia": "Direito Constitucional",
    "assunto": "Poder Judiciário — Publicidade e Fundamentação das Decisões",
    "artigo": "CF, art. 93, IX",
    "enunciado": "Em um processo judicial, o juiz profere a sentença em sessão privada, na qual apenas os advogados das partes estão presentes. A decisão posteriormente publicada é sucinta e não traz de forma clara a conexão entre os fundamentos jurídicos apresentados pelo juiz e as conclusões da sentença.\n\nCom base na Constituição Federal, é correto afirmar que",
    "alternativas": [
      {
        "texto": "não há compatibilidade entre a prolação de sentença na própria sessão de julgamento e posterior publicação da decisão.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "não há necessariamente invalidade na realização de sessão privada, limitada à participação dos advogados.",
        "correta": true,
        "porQue": "A sessão privada limitada aos advogados não gera, por si só, invalidade; o problema do caso é a falta de fundamentação clara."
      },
      {
        "texto": "o princípio da publicidade envolve apenas a ampla transparência da decisão e dos seus fundamentos, e não a conexão lógica entre estes.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "é possível a realização de sessão privada, sendo, porém, necessária a participação em todos os atos das partes do processo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a sentença não segue forma estrita, podendo trazer apenas os dispositivos da decisão, com sucinta referência à legislação que os fundamenta.",
        "correta": false,
        "porQue": "O art. 93, IX exige que as decisões sejam fundamentadas, com a conexão entre fundamentos e conclusões — não basta trazer só os dispositivos."
      }
    ],
    "insight": "Separe os dois problemas do caso: a sessão privada com os advogados e a decisão sem fundamentação clara; o art. 93, IX exige publicidade e fundamentação — teste qual dos dois vícios cada alternativa aponta.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777384",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 67,
    "materia": "Direito Constitucional",
    "assunto": "Processo Legislativo — Orçamento",
    "artigo": "CF, art. 166, §5º",
    "enunciado": "A Secretaria da Fazenda de um determinado estado da Federação identificou erro na proposta orçamentária encaminhada à Assembleia Legislativa em relação às despesas previstas com o pagamento da dívida pública. O erro consistiu no acréscimo de um zero ao final do valor da dotação para pagamento da dívida externa, aumentando, portanto, a previsão do valor necessário para fazer frente aos compromissos financeiros do estado no ano seguinte. O secretário da Casa Civil, nesse cenário, sugere ao governador encaminhar mensagem à Assembleia Legislativa, com as necessárias correções do projeto.\n\nNesse contexto, com base na Constituição Federal, é correto afirmar:",
    "alternativas": [
      {
        "texto": "por se tratar de simples erro material, o ajuste pode ser realizado pela própria assessoria parlamentar do Poder Legislativo, mediante solicitação justificada da Secretaria da Fazenda encaminhada por ofício.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o governador poderá alterar posteriormente o conteúdo da lei orçamentária aprovada, mediante decreto, por tratar a temática orçamentária de assunto inserido na competência regulamentar do Poder Executivo.",
        "correta": false,
        "porQue": "O governador não pode alterar lei orçamentária aprovada por decreto."
      },
      {
        "texto": "a Assembleia Legislativa pode modificar diretamente, independentemente de solicitação do Poder Executivo, as dotações destinadas ao pagamento da dívida pública, destinando a sobra a outras despesas previstas no projeto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o governador poderá enviar mensagem à Assembleia Legislativa para propor modificação no projeto de lei orçamentária, desde que ainda não iniciada a votação, na comissão própria da assembleia para análise da proposta orçamentária, da parte cuja alteração é proposta.",
        "correta": true,
        "porQue": "O art. 166, §5º, permite ao chefe do Executivo enviar mensagem propondo modificação no projeto, desde que ainda não iniciada a votação, na comissão, da parte cuja alteração é proposta."
      },
      {
        "texto": "após o encaminhamento da proposta orçamentária, o Poder Executivo cessa a sua competência em relação ao tema até a aprovação ou rejeição final do projeto, não podendo fazer propostas de modificação mediante mensagem do chefe do Poder Executivo.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Pergunte quem pode propor a correção, quando e como: mensagem do governador à Assembleia antes de iniciada a votação da parte na comissão; elimine decreto, ajuste pela assessoria e modificação unilateral da Assembleia.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3777385",
    "prova": "VUNESP — TJ-SP Contador Judiciário",
    "ano": 2025,
    "numero": 68,
    "materia": "Direito Constitucional",
    "assunto": "Processo Legislativo — Emenda Constitucional",
    "artigo": "CF, art. 60",
    "enunciado": "A forma federativa de Estado implica o direito de participação das unidades federativas na formação da vontade política da União e da República Federativa do Brasil. Nesse sentido, se um conjunto de governadores decidir propor emenda constitucional para criação de novas vagas no Senado Federal, sendo uma para cada estado da Federação, a serem ocupadas, apenas essas novas vagas, mediante periódica escolha do governador do respectivo estado, homologada pela respectiva Assembleia Legislativa, é correto afirmar, com base na Constituição Federal, que tal proposta",
    "alternativas": [
      {
        "texto": "seria inconstitucional, pois é vedada a emenda à Constituição com a finalidade de aumentar o número de parlamentares.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "seria inconstitucional, por veicular a abolição do voto direto no Brasil e a sua substituição pelo voto indireto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderia ser proposta por mais da metade das Assembleias Legislativas das unidades da Federação, manifestando-se, cada uma, pela maioria relativa de seus membros.",
        "correta": true,
        "porQue": "O art. 60, III, prevê a iniciativa de emenda por mais da metade das Assembleias Legislativas das unidades da Federação, manifestando-se, cada uma, pela maioria relativa de seus membros."
      },
      {
        "texto": "teria de receber o apoio de, no mínimo, 1/3 (um terço) da Câmara de Deputados e do Senado Federal para início de sua tramitação.",
        "correta": false,
        "porQue": "O apoio de 1/3 dos membros da Câmara e do Senado é outra via de iniciativa (art. 60, I), não a das Assembleias Legislativas."
      },
      {
        "texto": "poderia ser proposta diretamente por qualquer governador da Federação, na forma de proposta de emenda à Constituição.",
        "correta": false,
        "porQue": "Governadores não têm iniciativa direta de proposta de emenda à Constituição."
      }
    ],
    "insight": "Identifique a via de iniciativa em jogo: mais da metade das Assembleias Legislativas, cada uma pela maioria relativa; não confunda com a iniciativa de 1/3 dos parlamentares nem com iniciativa de governador.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (Edital DEJESP 17/12/2025)"
  },
  {
    "id": "Q3787229",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 1,
    "materia": "Língua Portuguesa",
    "assunto": "Pontuação — Emprego da Vírgula",
    "artigo": null,
    "enunciado": "Leia a tira a seguir:\n\n(André Dahmer. Malvados #846. Disponível em: www.malvados.com.br)\n\nA vírgula no 1º quadro foi empregada pelo mesmo motivo que em:",
    "alternativas": [
      {
        "texto": "Sem estar preparado para o pior, não se pode desejar o calor impossível.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A ausência de uma figura materna gera uma busca, pois fica um espaço vazio.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Há quem prefira buscar para si mesmo as coisas celestiais; outros, as infernais.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "Em situações de desespero, as pessoas podem tomar medidas extremas.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "O diabo é conhecido como aquele que garante a dor, o sofrimento e a tentação.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "A tira (André Dahmer, Malvados #846) é uma imagem e não foi reproduzida na extração de texto do PDF-fonte: o desenho e o diálogo do 1º quadro, onde está a vírgula cobrada, não constam do arquivo-fonte, de modo que não é possível identificar o motivo do emprego da vírgula nem resolver a questão pelo texto extraído.",
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787230",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 2,
    "materia": "Língua Portuguesa",
    "assunto": "Crase e Regência Verbal e Nominal",
    "artigo": null,
    "enunciado": "Está em conformidade com a norma-padrão de emprego do acento indicativo de crase e de regência verbal e nominal a frase:",
    "alternativas": [
      {
        "texto": "Os que teimam sonhar conferem para a dor uma selvageria indômita e não veem justificativa à amar.",
        "correta": false,
        "porQue": "Crase proibida antes de verbo no infinitivo ('à amar')."
      },
      {
        "texto": "Com um projétil na pistola, a personagem reitera de sua capacidade em descer às profundezas terrestres.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Estar no inferno foi algo que não agradou à personagem que necessitava de um calor impossível.",
        "correta": true,
        "porQue": "O verbo 'agradar' (no sentido de causar agrado) é transitivo indireto e exige a preposição 'a'; 'personagem' é palavra feminina determinada, formando 'à' (a + a)."
      },
      {
        "texto": "Segundo o diabo, viver feliz é algo em que todos anseiam, mesmo quando se aspirou à algo oposto.",
        "correta": false,
        "porQue": "Crase proibida antes de pronome indefinido ('à algo')."
      },
      {
        "texto": "A personagem acha que o risco envolvido no ato de amar é algo à que se pode prescindir.",
        "correta": false,
        "porQue": "O verbo 'prescindir' rege a preposição 'de', não 'a', de modo que não há crase."
      }
    ],
    "insight": "Comando de conformidade com a norma-padrão: teste cada frase por uma única regra de cada vez — primeiro a regência do verbo (qual preposição ele exige), depois se há 'a' + artigo feminino para formar a crase; elimine primeiro as frases com crase proibida (antes de verbo, de pronome indefinido ou de pronome pessoal). A armadilha da banca é a frase quase certa com um único elemento de regência ou de crase trocado.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787231",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 3,
    "materia": "Direito Digital / LGPD",
    "assunto": "Inteligência Artificial Generativa e Direitos Autorais",
    "artigo": null,
    "enunciado": "Leia o texto a seguir para responder às questões de 03 a 06:\n\nO desenvolvimento da Inteligência Artificial Generativa (IAG) depende do treinamento de vastos conjuntos de informações para que o modelo aprenda sobre linguagem, padrões e conhecimento geral. Esses dados podem incluir textos, imagens ou vídeos, os quais frequentemente são protegidos por direitos autorais.\n\nSe, por um lado, a criatividade e o conteúdo humano precisam ser preservados e recompensados, por outro, regras rígidas de direitos autorais para o treinamento da IAG podem trazer efeitos colaterais preocupantes, tais como: custos proibitivos para empresas de pequeno porte, aumentando a vantagem competitiva das grandes empresas; fuga de centros de IA para países mais permissivos; menor precisão diante da menor quantidade de dados; e repressão da pesquisa aberta e concentração de inovação em ambientes fechados.\n\nO conteúdo, enquanto obra passível de proteção, é utilizado somente como insumo técnico para ensinar o modelo sobre as relações estatísticas entre os seus elementos. Embora esses vetores não reproduzam diretamente a obra original e os modelos não armazenem os dados como um banco de referência consultável, eles podem carregar sua estrutura em forma matemática, o que poderia levar à conclusão de que, a partir disso, seria possível reconstruir o conteúdo protegido.\n\nDiferentemente de um livro digital ou de uma música arquivada, esses sistemas não guardam cada obra de forma individual, mas extraem padrões estatísticos gerais a partir do conjunto de uma grande massa toda. A memorização de trechos específicos pode ocorrer, mas em pequena escala.\n\nEm geral, o modelo generaliza e o impacto de cada obra isolada se dilui dentro da massa de dados, não havendo como rastrear a contribuição unitária. Isso torna inadequado tratar o treinamento desses modelos como se fosse equivalente ao uso individualizado de uma obra musical, jornalística ou literária.\n\nNo Brasil, há fundamentos jurídicos que permitem a aplicação do \"uso justo\", conforme entendimentos do Superior Tribunal de Justiça (STJ) sobre a Lei de Direitos Autorais, quando: se tratar de situação especial; não prejudicar a exploração normal da obra; e não causar dano injustificado aos interesses do autor.\n\nEm geral, no caso do \"treinamento justo\", os argumentos são: os dados são utilizados apenas como insumos técnicos, para ensinar padrões estatísticos, e não para copiar as obras originais; o aprendizado de máquina é comparável ao processo humano de indução e generalização; e a responsabilização deve ser aplicada em relação aos resultados produzidos que violem direitos autorais.\n\nOu seja, o tema é desafiador e de alta complexidade, sob a perspectiva técnica e jurídica. A tensão entre garantir a remuneração e o reconhecimento dos criadores, por um lado, e não inviabilizar a inovação tecnológica, por outro, exige abordagem regulatória cuidadosa, proporcional e tecnologicamente embasada.\n\n(Rony Vainzof. Treinamento da IA, direitos autorais e regulação. www.estadao.com.br, 21.10.2025. Adaptado)\n\nCom base nas informações presentes no texto sobre o treinamento e o uso da Inteligência Artificial Generativa (IAG), defende-se que:",
    "alternativas": [
      {
        "texto": "o treinamento da IAG deve se dar de maneira regulada, o que gera equilíbrio entre empresas de diferentes portes.",
        "correta": false,
        "porQue": "O texto defende abordagem regulatória cuidadosa e proporcional, mas não afirma que a regulação gera equilíbrio entre empresas de diferentes portes."
      },
      {
        "texto": "a probabilidade de uma IAG reproduzir conteúdo idêntico ao usado para seu treinamento é tão remota que não se justifica criar uma legislação a respeito.",
        "correta": false,
        "porQue": "O texto admite a memorização de trechos específicos (ainda que em pequena escala) e a possibilidade de reconstrução do conteúdo protegido, e não dispensa a legislação."
      },
      {
        "texto": "a IAG pode beneficiar uma obra autoral, na medida em que, ao reproduzir seu conteúdo, explora-o, fazendo sua divulgação indireta.",
        "correta": false,
        "porQue": "O texto afirma que os dados são usados como insumo técnico para ensinar padrões, não para copiar ou divulgar as obras."
      },
      {
        "texto": "a opção por um modelo estatístico de treinamento da IAG garante a possibilidade de ligar o produto gerado por eles ao autor original.",
        "correta": false,
        "porQue": "O texto afirma o contrário: o impacto de cada obra se dilui na massa de dados, não havendo como rastrear a contribuição unitária."
      },
      {
        "texto": "o uso de obras autorais para o treinamento da IAG deve garantir tanto a proteção autoral quanto o incentivo ao progresso digital.",
        "correta": true,
        "porQue": "É a tese final do texto: a tensão entre garantir a remuneração e o reconhecimento dos criadores e não inviabilizar a inovação tecnológica exige abordagem regulatória cuidadosa e proporcional."
      }
    ],
    "insight": "Questão de interpretação com teses longas: localize no texto a tese do autor (aqui, no último parágrafo) e compare cada alternativa com ela, palavra por palavra; elimine primeiro as alternativas que invertem a posição do autor ou afirmam o contrário do que o texto diz (por exemplo, que seria possível rastrear a contribuição de cada obra). A armadilha da banca é a tese quase certa com a causa ou a posição do autor invertida.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787232",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 4,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras (Sinônimos)",
    "artigo": null,
    "enunciado": "[Texto-base: o mesmo texto sobre Inteligência Artificial Generativa (IAG), reproduzido integralmente na questão 03 acima.]\n\nO desenvolvimento da Inteligência Artificial Generativa (IAG) depende do treinamento de vastos conjuntos de informações para que o modelo aprenda sobre linguagem, padrões e conhecimento geral. Esses dados podem incluir textos, imagens ou vídeos, os quais frequentemente são protegidos por direitos autorais.\n\nSe, por um lado, a criatividade e o conteúdo humano precisam ser preservados e recompensados, por outro, regras rígidas de direitos autorais para o treinamento da IAG podem trazer efeitos colaterais preocupantes, tais como: custos proibitivos para empresas de pequeno porte, aumentando a vantagem competitiva das grandes empresas; fuga de centros de IA para países mais permissivos; menor precisão diante da menor quantidade de dados; e repressão da pesquisa aberta e concentração de inovação em ambientes fechados.\n\nO conteúdo, enquanto obra passível de proteção, é utilizado somente como insumo técnico para ensinar o modelo sobre as relações estatísticas entre os seus elementos. Embora esses vetores não reproduzam diretamente a obra original e os modelos não armazenem os dados como um banco de referência consultável, eles podem carregar sua estrutura em forma matemática, o que poderia levar à conclusão de que, a partir disso, seria possível reconstruir o conteúdo protegido.\n\nDiferentemente de um livro digital ou de uma música arquivada, esses sistemas não guardam cada obra de forma individual, mas extraem padrões estatísticos gerais a partir do conjunto de uma grande massa toda. A memorização de trechos específicos pode ocorrer, mas em pequena escala.\n\nEm geral, o modelo generaliza e o impacto de cada obra isolada se dilui dentro da massa de dados, não havendo como rastrear a contribuição unitária. Isso torna inadequado tratar o treinamento desses modelos como se fosse equivalente ao uso individualizado de uma obra musical, jornalística ou literária.\n\nNo Brasil, há fundamentos jurídicos que permitem a aplicação do \"uso justo\", conforme entendimentos do Superior Tribunal de Justiça (STJ) sobre a Lei de Direitos Autorais, quando: se tratar de situação especial; não prejudicar a exploração normal da obra; e não causar dano injustificado aos interesses do autor.\n\nEm geral, no caso do \"treinamento justo\", os argumentos são: os dados são utilizados apenas como insumos técnicos, para ensinar padrões estatísticos, e não para copiar as obras originais; o aprendizado de máquina é comparável ao processo humano de indução e generalização; e a responsabilização deve ser aplicada em relação aos resultados produzidos que violem direitos autorais.\n\nOu seja, o tema é desafiador e de alta complexidade, sob a perspectiva técnica e jurídica. A tensão entre garantir a remuneração e o reconhecimento dos criadores, por um lado, e não inviabilizar a inovação tecnológica, por outro, exige abordagem regulatória cuidadosa, proporcional e tecnologicamente embasada.\n\n(Rony Vainzof. Treinamento da IA, direitos autorais e regulação. www.estadao.com.br, 21.10.2025. Adaptado)\n\nAssinale a alternativa em que o vocábulo destacado pode ser substituído, mantendo-se o sentido do trecho, pelo que está entre colchetes, empregado em sentido figurado.",
    "alternativas": [
      {
        "texto": "Esses dados podem incluir [abarcar] textos, imagens ou vídeos, os quais frequentemente são protegidos por direitos autorais. (1º parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… esses sistemas não guardam cada obra [trabalho] de forma individual, mas extraem padrões estatísticos gerais… (4º parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "… regras rígidas [intrépidas] de direitos autorais para o treinamento da IAG podem trazer efeitos colaterais preocupantes… (2º parágrafo)",
        "correta": false,
        "porQue": "'Intrépidas' (corajosas, destemidas) não mantém o sentido de 'rígidas' (severas, inflexíveis)."
      },
      {
        "texto": "No Brasil, há fundamentos jurídicos que permitem a aplicação [dedicação] do \"uso justo\", conforme entendimentos do Superior Tribunal de Justiça (STJ)… (5º parágrafo)",
        "correta": false,
        "porQue": "'Dedicação' não mantém o sentido de 'aplicação' (emprego, utilização) neste contexto."
      },
      {
        "texto": "… e repressão [sufocação] da pesquisa aberta e concentração de inovação em ambientes fechados. (2º parágrafo)",
        "correta": true,
        "porQue": "Em sentido figurado, 'sufocação' mantém o sentido de 'repressão' (impedimento, abafamento) da pesquisa aberta."
      }
    ],
    "insight": "Questão de sinônimos em trio/sequência com um elemento trocado: volte ao parágrafo indicado, leia o vocábulo destacado no contexto e teste o substituto entre colchetes pelo sentido no trecho (inclusive o sentido figurado pedido no comando); elimine primeiro os substitutos que mudam o sentido ou pertencem a outro campo semântico. A armadilha da banca é o sinônimo quase certo que troca um único elemento da sequência.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787233",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 5,
    "materia": "Língua Portuguesa",
    "assunto": "Concordância Verbal e Nominal",
    "artigo": null,
    "enunciado": "[Texto-base: o mesmo texto sobre Inteligência Artificial Generativa (IAG), reproduzido integralmente na questão 03 acima.]\n\nO desenvolvimento da Inteligência Artificial Generativa (IAG) depende do treinamento de vastos conjuntos de informações para que o modelo aprenda sobre linguagem, padrões e conhecimento geral. Esses dados podem incluir textos, imagens ou vídeos, os quais frequentemente são protegidos por direitos autorais.\n\nSe, por um lado, a criatividade e o conteúdo humano precisam ser preservados e recompensados, por outro, regras rígidas de direitos autorais para o treinamento da IAG podem trazer efeitos colaterais preocupantes, tais como: custos proibitivos para empresas de pequeno porte, aumentando a vantagem competitiva das grandes empresas; fuga de centros de IA para países mais permissivos; menor precisão diante da menor quantidade de dados; e repressão da pesquisa aberta e concentração de inovação em ambientes fechados.\n\nO conteúdo, enquanto obra passível de proteção, é utilizado somente como insumo técnico para ensinar o modelo sobre as relações estatísticas entre os seus elementos. Embora esses vetores não reproduzam diretamente a obra original e os modelos não armazenem os dados como um banco de referência consultável, eles podem carregar sua estrutura em forma matemática, o que poderia levar à conclusão de que, a partir disso, seria possível reconstruir o conteúdo protegido.\n\nDiferentemente de um livro digital ou de uma música arquivada, esses sistemas não guardam cada obra de forma individual, mas extraem padrões estatísticos gerais a partir do conjunto de uma grande massa toda. A memorização de trechos específicos pode ocorrer, mas em pequena escala.\n\nEm geral, o modelo generaliza e o impacto de cada obra isolada se dilui dentro da massa de dados, não havendo como rastrear a contribuição unitária. Isso torna inadequado tratar o treinamento desses modelos como se fosse equivalente ao uso individualizado de uma obra musical, jornalística ou literária.\n\nNo Brasil, há fundamentos jurídicos que permitem a aplicação do \"uso justo\", conforme entendimentos do Superior Tribunal de Justiça (STJ) sobre a Lei de Direitos Autorais, quando: se tratar de situação especial; não prejudicar a exploração normal da obra; e não causar dano injustificado aos interesses do autor.\n\nEm geral, no caso do \"treinamento justo\", os argumentos são: os dados são utilizados apenas como insumos técnicos, para ensinar padrões estatísticos, e não para copiar as obras originais; o aprendizado de máquina é comparável ao processo humano de indução e generalização; e a responsabilização deve ser aplicada em relação aos resultados produzidos que violem direitos autorais.\n\nOu seja, o tema é desafiador e de alta complexidade, sob a perspectiva técnica e jurídica. A tensão entre garantir a remuneração e o reconhecimento dos criadores, por um lado, e não inviabilizar a inovação tecnológica, por outro, exige abordagem regulatória cuidadosa, proporcional e tecnologicamente embasada.\n\n(Rony Vainzof. Treinamento da IA, direitos autorais e regulação. www.estadao.com.br, 21.10.2025. Adaptado)\n\nEstá em conformidade com o que se afirma no texto e com a norma-padrão de concordância verbal e nominal a frase:",
    "alternativas": [
      {
        "texto": "Busca-se no Brasil meios para se chegar a uma legislação que contemple, além do \"uso justo\", o \"treinamento justo\" dos sistemas de IA.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A vastidão dos conjuntos de informações que alimentam a IA é o que garante o funcionamento desses sistemas conforme o que se espera deles.",
        "correta": true,
        "porQue": "A frase está de acordo com o texto (os vastos conjuntos de informações alimentam o treinamento da IAG) e a concordância está correta: o sujeito 'a vastidão' (singular) concorda com 'é' e 'garante'."
      },
      {
        "texto": "Não está descartado a possibilidade de que uma IA guarde excertos particulares de uma obra, mas isso ocorre numa proporção ínfima.",
        "correta": false,
        "porQue": "Falta concordância nominal: o correto seria 'Não está descartada a possibilidade' ('descartada' concorda com 'possibilidade', feminina)."
      },
      {
        "texto": "Uma legislação mais rigorosa aplicada sobre empresas desenvolvedoras de IA as forçariam a mudar para um país onde as condições fossem mais favoráveis.",
        "correta": false,
        "porQue": "Falta concordância verbal: o sujeito é 'uma legislação' (singular), de modo que o correto seria 'a forçaria', não 'as forçariam'."
      },
      {
        "texto": "Um autor cujas obras foram utilizadas para treinar sistemas de IA não deverão receber compensações, a menos que consigam provar o uso.",
        "correta": false,
        "porQue": "Falta concordância verbal: o sujeito é 'um autor' (singular), de modo que o correto seria 'não deverá receber', não 'não deverão receber'."
      }
    ],
    "insight": "Comando duplo — conformidade com o texto E com a concordância: primeiro confira se a frase diz o que o texto afirma; depois, em cada frase, identifique o sujeito e teste a concordância do verbo e dos adjetivos com ele, um de cada vez. Elimine primeiro as frases com um único erro de concordância (singular/plural ou masculino/feminino trocado). A armadilha da banca é a frase que parece correta no conteúdo mas quebra uma única regra de concordância.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787234",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 6,
    "materia": "Língua Portuguesa",
    "assunto": "Conectivos — Significação das Palavras",
    "artigo": null,
    "enunciado": "[Texto-base: o mesmo texto sobre Inteligência Artificial Generativa (IAG), reproduzido integralmente na questão 03 acima.]\n\nO desenvolvimento da Inteligência Artificial Generativa (IAG) depende do treinamento de vastos conjuntos de informações para que o modelo aprenda sobre linguagem, padrões e conhecimento geral. Esses dados podem incluir textos, imagens ou vídeos, os quais frequentemente são protegidos por direitos autorais.\n\nSe, por um lado, a criatividade e o conteúdo humano precisam ser preservados e recompensados, por outro, regras rígidas de direitos autorais para o treinamento da IAG podem trazer efeitos colaterais preocupantes, tais como: custos proibitivos para empresas de pequeno porte, aumentando a vantagem competitiva das grandes empresas; fuga de centros de IA para países mais permissivos; menor precisão diante da menor quantidade de dados; e repressão da pesquisa aberta e concentração de inovação em ambientes fechados.\n\nO conteúdo, enquanto obra passível de proteção, é utilizado somente como insumo técnico para ensinar o modelo sobre as relações estatísticas entre os seus elementos. Embora esses vetores não reproduzam diretamente a obra original e os modelos não armazenem os dados como um banco de referência consultável, eles podem carregar sua estrutura em forma matemática, o que poderia levar à conclusão de que, a partir disso, seria possível reconstruir o conteúdo protegido.\n\nDiferentemente de um livro digital ou de uma música arquivada, esses sistemas não guardam cada obra de forma individual, mas extraem padrões estatísticos gerais a partir do conjunto de uma grande massa toda. A memorização de trechos específicos pode ocorrer, mas em pequena escala.\n\nEm geral, o modelo generaliza e o impacto de cada obra isolada se dilui dentro da massa de dados, não havendo como rastrear a contribuição unitária. Isso torna inadequado tratar o treinamento desses modelos como se fosse equivalente ao uso individualizado de uma obra musical, jornalística ou literária.\n\nNo Brasil, há fundamentos jurídicos que permitem a aplicação do \"uso justo\", conforme entendimentos do Superior Tribunal de Justiça (STJ) sobre a Lei de Direitos Autorais, quando: se tratar de situação especial; não prejudicar a exploração normal da obra; e não causar dano injustificado aos interesses do autor.\n\nEm geral, no caso do \"treinamento justo\", os argumentos são: os dados são utilizados apenas como insumos técnicos, para ensinar padrões estatísticos, e não para copiar as obras originais; o aprendizado de máquina é comparável ao processo humano de indução e generalização; e a responsabilização deve ser aplicada em relação aos resultados produzidos que violem direitos autorais.\n\nOu seja, o tema é desafiador e de alta complexidade, sob a perspectiva técnica e jurídica. A tensão entre garantir a remuneração e o reconhecimento dos criadores, por um lado, e não inviabilizar a inovação tecnológica, por outro, exige abordagem regulatória cuidadosa, proporcional e tecnologicamente embasada.\n\n(Rony Vainzof. Treinamento da IA, direitos autorais e regulação. www.estadao.com.br, 21.10.2025. Adaptado)\n\nConsidere o 3º parágrafo do texto:\n\nO conteúdo, enquanto obra passível de proteção, é utilizado somente como insumo técnico para ensinar o modelo sobre as relações estatísticas entre os seus elementos. Embora esses vetores não reproduzam diretamente a obra original e os modelos não armazenem os dados como um banco de referência consultável, eles podem carregar sua estrutura em forma matemática, o que poderia levar à conclusão de que, a partir disso, seria possível reconstruir o conteúdo protegido.\n\nOs vocábulos destacados podem ser substituídos, respectivamente, mantendo-se o sentido e a norma-padrão do trecho, por:",
    "alternativas": [
      {
        "texto": "na qualidade de … Ainda que",
        "correta": true,
        "porQue": "'Enquanto' aqui tem valor de 'na qualidade de' (o conteúdo, enquanto obra passível de proteção) e 'Embora' é conjunção concessiva, equivalente a 'Ainda que'."
      },
      {
        "texto": "no momento de uma … Mesmo que",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "conforme … Enquanto",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "entendido como … Entretanto",
        "correta": false,
        "porQue": "'Entretanto' é adversativo, não concessivo, e não mantém o sentido de 'Embora'."
      },
      {
        "texto": "à medida que … Posto que",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de substituição em par ('respectivamente'): identifique a função de cada vocábulo destacado no parágrafo indicado — o primeiro marca uma condição/qualidade, o segundo introduz uma concessão — e teste os dois substitutos juntos, na ordem; se um dos dois falhar, a alternativa inteira cai. Elimine primeiro os pares em que o segundo termo troca concessão por adversidade ou por tempo. A armadilha da banca é o par quase certo com um único elemento trocado.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787235",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 7,
    "materia": "Língua Portuguesa",
    "assunto": "Colocação Pronominal",
    "artigo": null,
    "enunciado": "Está em conformidade com a norma-padrão de emprego e colocação pronominal a frase:",
    "alternativas": [
      {
        "texto": "A capacidade dos modelos de IA de gerar conteúdos novos é objeto de questionamento de quem cria-os de maneira autoral.",
        "correta": false,
        "porQue": "Com o pronome relativo 'quem' há atração para a próclise ('quem os cria'), não a ênclise."
      },
      {
        "texto": "Obras originais têm sido usadas para alimentar modelos de IA, mas estes não têm citado-as devidamente.",
        "correta": false,
        "porQue": "Com a locução verbal precedida de 'não', há atração para a próclise ('não as têm citado'), não a ênclise no verbo auxiliar."
      },
      {
        "texto": "O conteúdo está sujeito à proteção de direitos autorais e é utilizado pelo desenvolvedor do modelo para alimentá-lo.",
        "correta": true,
        "porQue": "A ênclise em 'alimentá-lo' está correta: não há palavra atrativa e o infinitivo admite o pronome enclítico, com a forma 'lo' após o 'r' final."
      },
      {
        "texto": "Os modelos, por fim, não reproduzem integralmente conteúdos protegidos por direito autoral, mas lhes imitam.",
        "correta": false,
        "porQue": "O verbo 'imitar' é transitivo direto e exige 'os', não 'lhes' (pronome de objeto indireto)."
      },
      {
        "texto": "Os dados das obras são acessíveis pelos modelos e estes armazenam-os com uma estrutura matemática.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Comando de conformidade com a norma-padrão em colocação pronominal: em cada frase, procure primeiro as palavras atrativas (negação, pronome relativo, conjunção subordinativa) — se houver, a próclise é obrigatória e a ênclise cai; depois confira se o pronome corresponde ao objeto exigido pelo verbo (direto ou indireto). Elimine primeiro as frases com ênclise após palavra atrativa. A armadilha da banca é a frase quase certa com um único elemento de colocação ou de regência trocado.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787236",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 8,
    "materia": "Matemática",
    "assunto": "Porcentagem — Reajustes Sucessivos",
    "artigo": null,
    "enunciado": "Curiosamente, a cotação anual de um ativo sofreu reajustes positivos e sucessivos de, respectivamente, 3%, 40%, 3%, 40%, 3%, 40% e 3%.\n\nValores que podem auxiliar a resolução:\n\n0,03⁴ = 0,00000081; 0,04³ = 0,000064; 0,3⁴ = 0,0081; 0,4³ = 0,064; 1,03⁴ = 1,12550881; 1,04³ = 1,124864; 1,3⁴ = 2,8561; 1,4³ = 2,744\n\nApós esses sete reajustes na cotação, é correto afirmar que o reajuste total que essa cotação sofreu foi um valor mais próximo de:",
    "alternativas": [
      {
        "texto": "300%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "209%",
        "correta": true,
        "porQue": "Os fatores se compõem por multiplicação: 1,03⁴ × 1,4³ = 1,12550881 × 2,744 ≈ 3,088, ou seja, aumento total de cerca de 208,8%, mais próximo de 209%."
      },
      {
        "texto": "132%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "401%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "600%",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Porcentagem sucessiva: nunca some os percentuais — componha os fatores por multiplicação (1,03 quatro vezes e 1,40 três vezes) e use os valores auxiliares da tabela para calcular o fator total; o reajuste total é o fator menos 1. A armadilha documentada da banca é a operação ingênua de somar as porcentagens, cujo resultado aparece entre os distratores.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787237",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 9,
    "materia": "Raciocínio Lógico",
    "assunto": "Probabilidade",
    "artigo": null,
    "enunciado": "Uma senha de acesso a um computador é composta de 7 caracteres distintos, que são, nesta ordem: 3 letras dentre as letras A, B, C, D e E e 4 algarismos dentre os algarismos 1, 2, 3, 4 e 5. A primeira letra utilizada na senha deve ser seguida de outras duas letras que sejam, em relação à ordem alfabética, posteriores à primeira letra, e essas outras duas letras devem estar em ordem alfabética. O primeiro algarismo utilizado na senha deve ser seguido de outros três algarismos que sejam menores do que esse primeiro algarismo.\n\nConsiderando todas as possibilidades de criação dessas senhas, a probabilidade de uma delas ser sorteada e ser uma senha que inicie com a letra B e termine com o algarismo 2 é:",
    "alternativas": [
      {
        "texto": "7%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "6%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "5%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "8%",
        "correta": true,
        "porQue": "Letras: a 1ª letra admite 10 sequências (A: 6, B: 3, C: 1). Algarismos: o 1º algarismo admite 30 sequências (1º = 5: 24; 1º = 4: 6). Total = 10 × 30 = 300 senhas. Favoráveis: início em B (3 sequências de letras) e fim em 2 (8 sequências de algarismos: 1º = 5 com os dois do meio em {1,3,4} em qualquer ordem: 6; 1º = 4 com os dois do meio {1,3} em qualquer ordem: 2), totalizando 3 × 8 = 24. Probabilidade = 24/300 = 8%."
      },
      {
        "texto": "4%",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Probabilidade com contagem: primeiro conte o total de senhas possíveis respeitando as regras de ordem (letras em ordem alfabética crescente e algarismos em ordem decrescente, o que fixa a ordem dentro de cada escolha), depois conte só as favoráveis (início em B e fim em 2) com o mesmo raciocínio de escolha, e divida favoráveis pelo total. A armadilha é contar permutações que as regras de ordem já excluem.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787238",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 10,
    "materia": "Matemática",
    "assunto": "Medidas de Tendência Central (Média, Mediana e Moda)",
    "artigo": null,
    "enunciado": "Para realçar um discurso de sucesso, o diretor de uma empresa quer expor os resultados positivos dos últimos 6 meses por meio de uma análise das medidas de tendência central que são: média, mediana e moda. Os resultados a serem considerados são os totais de vendas de cada mês, que são, respectivamente e em milhões de reais: 23, 16, 17, 20, 8 e 16.\n\nO diretor calculou essas três medidas que, em ordem crescente de valor, são:",
    "alternativas": [
      {
        "texto": "moda, mediana, média.",
        "correta": true,
        "porQue": "Moda = 16 (valor que mais se repete); dados ordenados 8, 16, 16, 17, 20, 23, mediana = (16 + 17)/2 = 16,5; média = 100/6 ≈ 16,67. Em ordem crescente: moda (16), mediana (16,5), média (≈16,67)."
      },
      {
        "texto": "média, moda, mediana.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "média, mediana, moda.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "mediana, média, moda.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "moda, média, mediana.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Medidas de tendência central: calcule as três separadamente — ordene os dados antes de achar a mediana (com número par de dados, é a média dos dois centrais) e identifique a moda pelo valor que mais se repete — e só depois ordene as três medidas. As alternativas são as permutações das três medidas, então um único erro de cálculo troca a ordem inteira.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787239",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 11,
    "materia": "Matemática",
    "assunto": "Geometria Espacial — Volume",
    "artigo": null,
    "enunciado": "Um artesão tinha à sua disposição um bloco compacto de madeira, com formato cúbico, cujo volume era de 4.096 cm³. Ele dividiu esse cubo, sem perda de material, em oito cubos iguais. Quatro desses cubos o artesão desbastou até que ficassem, cada um, com o formato de um cilindro, cuja base circular tinha diâmetro de medida igual à aresta do cubo e cuja altura era a mesma altura do cubo; outros três desses cubos ele desbastou até que ficassem cada um com o formato de uma pirâmide cuja base era uma das faces do cubo e cuja altura era igual à altura do cubo; um desses oito cubos o artesão não alterou.\n\nAo realizar esse trabalho de criação dessas oito peças, o volume de madeira que o artesão desbastou correspondia, em relação ao bloco de madeira inicial, a:\n\nAdote: π = 3",
    "alternativas": [
      {
        "texto": "32,5%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "40%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "25%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "45%",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "37,5%",
        "correta": true,
        "porQue": "Cada cubo menor tem aresta 8 cm (volume 512 cm³). Cada cilindro tem volume π·4²·8 = 384 cm³ (desbaste de 128 cm³ por cilindro, 512 cm³ nos 4); cada pirâmide tem volume (1/3)·8²·8 = 512/3 cm³ (desbaste de 1.024/3 cm³ por pirâmide, 1.024 cm³ nas 3). Desbaste total = 1.536 cm³, ou seja, 1.536/4.096 = 37,5% do bloco inicial."
      }
    ],
    "insight": "Geometria com volumes: primeiro ache a aresta do cubo menor a partir do volume do bloco (4.096/8 = 512 cm³ por cubo, aresta 8 cm); calcule o volume que sobra em cada peça (cilindro com π = 3 e pirâmide com 1/3 da base × altura) e some o que foi desbastado nas 4 + 3 peças, sem esquecer o cubo não alterado; só no fim divida pelo volume inicial. A armadilha é usar a base errada na razão ou esquecer o fator 1/3 da pirâmide.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787240",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 12,
    "materia": "Raciocínio Lógico",
    "assunto": "Associação / Dedução Lógica",
    "artigo": null,
    "enunciado": "Adriana, Bruna e Carla são amigas e suas idades são 35, 42 e 48 anos, não necessariamente nessa ordem. Elas têm profissões diferentes, sendo uma delas médica, outra advogada e outra professora. Também é conhecido o fato de que Adriana não tem 48 anos e é prima da médica. Já a professora mora bem perto da Adriana, e Carla já passava dos 10 anos de idade quando a futura professora nasceu.\n\nCom essas informações, é correto afirmar que a diferença entre a soma das idades da médica e da advogada e a soma das idades de Adriana e de Bruna é igual a:",
    "alternativas": [
      {
        "texto": "7.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "9.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "13.",
        "correta": true,
        "porQue": "Carla já tinha mais de 10 anos quando a professora nasceu, logo a professora é a mais nova (35 anos) e Carla é a mais velha (48 anos). Assim, Adriana e Bruna têm 35 e 42 anos (soma 77), e médica e advogada têm 48 e 42 anos (soma 90). A diferença é 90 − 77 = 13."
      },
      {
        "texto": "15.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "6.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de associação/dedução com nomes, idades e profissões: monte uma tabela e use cada pista para eliminar uma combinação (quem não pode ser quem), começando pela pista mais forte — a diferença de idade de mais de 10 anos entre Carla e a professora — e só calcule a diferença pedida depois de fixar todas as associações. A armadilha é confundir o sujeito com o conjunto, isto é, atribuir a idade ou a profissão à pessoa errada.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787241",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 13,
    "materia": "Raciocínio Lógico",
    "assunto": "Sequências Lógico-Matemáticas",
    "artigo": null,
    "enunciado": "A sequência a seguir foi criada com um padrão lógico-matemático: 1, 2, 3, 4, 5, 6, 7, 2, 4, 6, 8, 10, 12, 14, 3, 6, 9, 12, 15, 18, 21, 4, 8, 12, 16, 20, 24, 28, 5, …\n\nConsiderando esse padrão, é possível determinar os elementos em qualquer posição da sequência. Sejam F o 125º e G o 165º elementos dessa sequência, a razão F/G em seu formato irredutível é:",
    "alternativas": [
      {
        "texto": "9/8",
        "correta": true,
        "porQue": "A sequência é formada por blocos de 7 termos: o bloco k é k, 2k, 3k, 4k, 5k, 6k, 7k. A posição 125 cai no bloco 18 (posições 120–126), 6º termo: F = 6 × 18 = 108. A posição 165 cai no bloco 24 (posições 162–168), 4º termo: G = 4 × 24 = 96. F/G = 108/96 = 9/8."
      },
      {
        "texto": "2/3",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "3/4",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "10/9",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "8/7",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Sequência em blocos: identifique primeiro a estrutura dos blocos (cada bloco é a tabuada de um número, com 7 termos) e em que bloco cai cada posição pedida, contando os termos acumulados; só depois calcule o termo dentro do bloco (posição no bloco × número do bloco) e simplifique a razão. A armadilha é tratar a sequência como uma única progressão em vez de blocos.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787242",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 14,
    "materia": "Direito Administrativo",
    "assunto": "Autarquias Especiais / Agências Reguladoras",
    "artigo": null,
    "enunciado": "Assinale a alternativa correta a respeito das autarquias especiais.",
    "alternativas": [
      {
        "texto": "Seus dirigentes não possuem mandato fixo, podendo ser exonerados a qualquer tempo pelo chefe do Poder Executivo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A indicação dos seus dirigentes é feita diretamente pelo Presidente da República com aprovação do Senado no caso das agências federais.",
        "correta": true,
        "porQue": "As agências reguladoras federais são autarquias especiais cujos dirigentes são indicados pelo Presidente da República e aprovados pelo Senado Federal, com mandato fixo."
      },
      {
        "texto": "Possuem personalidade jurídica de direito privado e desempenham atividades de natureza privada delegadas pelo Estado.",
        "correta": false,
        "porQue": "As autarquias especiais têm personalidade jurídica de direito público."
      },
      {
        "texto": "São subordinadas diretamente a um ministério, secretaria ou ao chefe do respectivo Poder Executivo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "São dotadas de autonomia e estão sujeitas à fiscalização e ao controle externo apenas por parte do Poder Judiciário.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de instituto ('a respeito das autarquias especiais'): teste cada alternativa por um único elemento da regra — mandato fixo ou exonerável, quem indica e quem aprova, personalidade de direito público ou privado, subordinação ou autonomia. Elimine primeiro as alternativas que invertem um único elemento (por exemplo, mandato fixo trocado por exoneração a qualquer tempo). A armadilha da banca é trocar o sujeito ou a condição da regra mantendo o vocabulário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787243",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 15,
    "materia": "Direito Administrativo",
    "assunto": "Concessão de Serviço Público — Responsabilidade",
    "artigo": "Lei nº 8.987/1995, art. 25",
    "enunciado": "Na hipótese de concessão de um serviço público em que a concessionária, na execução do serviço concedido, venha a causar um prejuízo ao usuário, é correto afirmar que:",
    "alternativas": [
      {
        "texto": "o responsável pelo ressarcimento dos danos será o poder concedente, em razão da aplicação da teoria da responsabilidade objetiva do Estado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a concessionária deverá responder pelos danos ao usuário, cabendo a este o ônus probatório de comprovar que houve culpa ou dolo da concessionária.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a concessionária e o poder concedente deverão responder de forma solidária pelos danos causados ao usuário, para que este tenha maior possibilidade de ressarcimento.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "quem deverá responder pelos danos causados ao usuário é a concessionária, solidariamente, com o funcionário que foi o culpado pela causação dos danos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a concessionária deverá responder pelos danos, sem que a fiscalização exercida pelo órgão competente exclua ou atenue essa responsabilidade.",
        "correta": true,
        "porQue": "É o que dispõe o art. 25 da Lei nº 8.987/1995: a concessionária responde pelos danos causados ao usuário, sem que a fiscalização do órgão competente exclua ou atenue essa responsabilidade."
      }
    ],
    "insight": "Questão de responsabilidade na concessão: identifique primeiro quem responde pelo dano (concessionária, poder concedente ou ambos) e depois o que acontece com a fiscalização; elimine as alternativas que trocam o responsável ou que condicionam a resposta a culpa/dolo do usuário. A armadilha da banca é trocar o sujeito da responsabilidade mantendo o vocabulário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787244",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 16,
    "materia": "Direito Digital / LGPD",
    "assunto": "Sanções Administrativas da LGPD",
    "artigo": null,
    "enunciado": "Assinale a alternativa que está em conformidade com a Lei Geral de Proteção de Dados Pessoais – LGPD (Lei nº 13.709/2018 e suas alterações) no tocante às suas sanções administrativas.",
    "alternativas": [
      {
        "texto": "É vedada a aplicação de multa, como sanção administrativa, a ser imposta sobre o faturamento de pessoa jurídica de direito privado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "O produto da arrecadação das multas aplicadas em decorrência de infrações cometidas, nos termos da LGPD, inscritas ou não em dívida ativa, será destinado ao fundo de despesas ordinárias do Poder Judiciário.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Aplicadas sanções administrativas previstas na LGPD, fica vedada a aplicação de sanções administrativas, civis ou penais definidas em outras legislações.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A LGPD prevê, como sanção, a suspensão do exercício da atividade de tratamento dos dados pessoais a que se refere a infração pelo período máximo de 6 (seis) meses, prorrogável por igual período.",
        "correta": true,
        "porQue": "A suspensão do exercício da atividade de tratamento dos dados pessoais a que se refere a infração, pelo período máximo de 6 meses, prorrogável por igual período, é uma das sanções administrativas previstas na LGPD."
      },
      {
        "texto": "Uma das sanções aplicáveis aos agentes de tratamento de dados, em razão das infrações cometidas às normas previstas na LGPD, é a prisão administrativa por até 30 (trinta) dias.",
        "correta": false,
        "porQue": "A LGPD não prevê prisão administrativa como sanção."
      }
    ],
    "insight": "Questão de sanções da LGPD: teste cada alternativa por um único elemento — qual é a sanção, qual é o prazo, qual é o destino da multa; elimine primeiro as alternativas que inventam uma sanção que a lei não prevê (como prisão administrativa) ou que trocam um prazo ou um destinatário. A armadilha da banca é a tese quase certa com um único elemento invertido.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787245",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 17,
    "materia": "Direito Constitucional",
    "assunto": "Repartição Constitucional de Competências",
    "artigo": null,
    "enunciado": "Considerando a repartição constitucional de competências dos entes federados, no tocante à competência para legislar sobre florestas, caça, pesca, fauna, conservação da natureza, defesa do solo e dos recursos naturais, proteção do meio ambiente e controle da poluição, a Constituição Federal estabelece, nessas matérias, que:",
    "alternativas": [
      {
        "texto": "é competência comum da União, dos Estados, do Distrito Federal e dos Municípios.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "compete à União legislar privativamente.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "é competência legislativa concorrente entre Estados, DF e Municípios.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a competência da União limitar-se-á a estabelecer normas gerais.",
        "correta": true,
        "porQue": "Nas matérias de competência legislativa concorrente, a competência da União limita-se a estabelecer normas gerais, cabendo aos Estados e ao Distrito Federal a legislação suplementar."
      },
      {
        "texto": "compete, privativamente, aos Estados e ao Distrito Federal.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de repartição de competências: primeiro classifique a matéria (competência comum, privativa ou concorrente) e só depois confira o que a Constituição diz sobre o papel da União nessa espécie de competência; elimine as alternativas que trocam a espécie de competência ou o ente competente. A armadilha da banca é trocar o ator ou a espécie de competência mantendo a lista de matérias.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787247",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 19,
    "materia": "Direito Administrativo",
    "assunto": "LINDB — Responsabilidade do Agente Público",
    "artigo": "LINDB, art. 28",
    "enunciado": "Segundo o que dispõe a Lei de Introdução às Normas do Direito Brasileiro, na hipótese de decisões ou opiniões técnicas prolatadas por um agente público, este:",
    "alternativas": [
      {
        "texto": "não responderá pessoalmente por elas, uma vez que deve ter independência em suas funções.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "não responderá pessoalmente, salvo se agiu com a intenção de prejudicar a imagem da Administração.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "responderá pessoalmente em caso de dolo ou erro grosseiro.",
        "correta": true,
        "porQue": "É o que dispõe o art. 28 da LINDB: o agente público responderá pessoalmente por suas decisões ou opiniões técnicas em caso de dolo ou erro grosseiro."
      },
      {
        "texto": "responderá pessoalmente apenas se estiver exercendo cargo de direção, chefia ou assessoramento.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "não responderá pessoalmente, salvo se a opinião ou decisão não for acatada pelo seu superior imediato.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de LINDB: localize o gatilho da responsabilidade pessoal — a lei exige dolo ou erro grosseiro; elimine as alternativas que trocam esse gatilho por outra condição (intenção de prejudicar a imagem, cargo de direção, decisão não acatada). A armadilha da banca é trocar a condição que dispara a responsabilidade mantendo o vocabulário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787248",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 20,
    "materia": "Direito Administrativo",
    "assunto": "ARSESP — Objetivos e Princípios (LC 1.025/2007)",
    "artigo": null,
    "enunciado": "Com base na legislação aplicável e nas boas práticas regulatórias, assinale a alternativa correta quanto aos objetivos e princípios que regem a atuação da Agência Reguladora de Serviços Públicos do Estado de São Paulo (ARSESP).",
    "alternativas": [
      {
        "texto": "Conforme o art. 9º da Lei Complementar nº 1.025/2007, compete à ARSESP fixar as tarifas de energia elétrica no Estado de São Paulo, independentemente das diretrizes da Agência Nacional de Energia Elétrica (ANEEL).",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A modicidade tarifária, a transparência decisória e a proteção dos direitos dos usuários integram os objetivos da ARSESP, orientando tanto a regulação quanto a fiscalização dos serviços públicos.",
        "correta": true,
        "porQue": "Modicidade tarifária, transparência decisória e proteção dos direitos dos usuários são objetivos que regem a atuação da ARSESP na regulação e na fiscalização dos serviços públicos."
      },
      {
        "texto": "O regime especial da ARSESP visa garantir subordinação técnica ao Poder Executivo, preservando a uniformidade das decisões administrativas estaduais.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A atuação da ARSESP deve pautar-se pela intervenção direta nas políticas de investimento das concessionárias, assegurando controle público sobre sua execução.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A Lei Complementar nº 1.025/2007 limita a competência da ARSESP aos serviços de energia elétrica e gás canalizado, vedando-lhe atuar em matéria de saneamento básico.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão sobre os objetivos da ARSESP: teste cada alternativa por um único elemento — qual é a competência da agência, qual é o seu regime (autonomia ou subordinação) e quais são os seus objetivos; elimine as alternativas que trocam a competência, o regime ou o objeto da atuação. A armadilha da banca é trocar o sujeito da competência ou a condição da atuação mantendo o vocabulário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787254",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 26,
    "materia": "Direito Constitucional",
    "assunto": "Direitos Sociais dos Trabalhadores",
    "artigo": "CF, art. 7º",
    "enunciado": "Tendo em vista o disposto na Carta Magna brasileira, assinale a alternativa que contempla corretamente um dos direitos constitucionais dos trabalhadores urbanos e rurais.",
    "alternativas": [
      {
        "texto": "remuneração do serviço extraordinário superior, no mínimo, em quarenta por cento à do trabalho normal.",
        "correta": false,
        "porQue": "A CF prevê remuneração do serviço extraordinário superior, no mínimo, em 50% à do normal, não em 40%."
      },
      {
        "texto": "Relação de emprego protegida contra despedida com ou sem justa causa, nos termos de lei complementar, que preverá verba indenizatória.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Recebimento de verba de seguro-desemprego pelo trabalhador, em caso de desemprego voluntário ou involuntário.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Irredutibilidade do salário-base do trabalhador, garantia que não poderá ser alterada por disposto em convenção ou acordo coletivo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "duração do trabalho normal não superior a 8 horas diárias e 44 semanais, facultada a compensação de horários e a redução da jornada, por acordo ou convenção coletiva.",
        "correta": true,
        "porQue": "É o direito previsto no art. 7º, XIII, da CF: duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho."
      }
    ],
    "insight": "Questão de direitos sociais (art. 7º): leia cada alternativa como uma tese completa sobre a regra e compare número por número com o texto constitucional — percentual, jornada, condição; elimine primeiro as alternativas que trocam um único número ou uma única condição (por exemplo, 40% no lugar de 50%). A armadilha da banca é a tese quase certa com um único elemento invertido.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787268",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 40,
    "materia": "Direito Constitucional",
    "assunto": "Concurso Público — Investidura",
    "artigo": "CF, art. 37, II",
    "enunciado": "O ingresso na Administração Pública pode ocorrer pelo regime celetista ou estatutário. Nas duas situações, a investidura em cargo ou emprego público depende de aprovação prévia em concurso público de provas ou de provas e títulos. Suponha que Geraldo pretende ingressar na carreira pública; assim, ele deve ter o conhecimento de que:",
    "alternativas": [
      {
        "texto": "os direitos e deveres do empregado público celetista estão estabelecidos na Consolidação das Leis Trabalhistas, legislação esparsa e lei do órgão contratante.",
        "correta": true,
        "porQue": "O empregado público celetista é regido pela CLT, pela legislação esparsa e pela lei do órgão contratante, diferentemente do servidor estatutário, regido pelo estatuto próprio."
      },
      {
        "texto": "a demissão no regime celetista e no estatutário requer que seja instaurado um Processo Administrativo Disciplinar (PAD).",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "tanto o celetista como o estatutário adquirem estabilidade após um período de estágio probatório, que dura três anos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o servidor estatutário é convocado mediante ato de nomeação, a tomar posse, assumindo consequentemente as suas atividades como empregado público.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "no regime celetista há benefícios como a aposentadoria com regras específicas e a vinculação a um regime próprio de previdência social.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de investidura (art. 37, II): separe os dois regimes — celetista e estatutário — e teste cada alternativa por um único elemento (qual lei rege, qual é o ato de ingresso, quem tem estabilidade, qual é o regime de previdência); elimine as alternativas que misturam um elemento de um regime no outro. A armadilha da banca é trocar o ator ou o regime mantendo o vocabulário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3787272",
    "prova": "VUNESP — ARSESP Analista de Suporte à Regulação",
    "ano": 2025,
    "numero": 44,
    "materia": "Direito Constitucional",
    "assunto": "Reintegração do Servidor Estável",
    "artigo": "CF, art. 41, §2º",
    "enunciado": "Jeremias, funcionário estável de uma instituição pública civil do Estado de São Paulo, será reintegrado ao serviço público após ser absolvido em decisão judicial transitada em julgado. Ao pedir orientação a um analista de suporte de regulação sobre reintegração, ele foi corretamente informado de que:",
    "alternativas": [
      {
        "texto": "será reintegrado ao serviço público, por meio de decreto, considerado o prazo máximo de 30 (trinta) dias após a sentença transitada em julgado.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "será reintegrado em outro cargo de vencimentos equivalentes, respeitada a habilitação, mesmo que o cargo anterior não tenha sido extinto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá pedir sua transferência para um outro cargo de mesmo padrão de vencimento ou com remuneração inferior, que requeira os mesmos requisitos do cargo anterior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a sua reintegração ao serviço garante o direito de ressarcimento de prejuízos resultantes do afastamento, que deve ser paga no prazo de 20 (vinte) dias.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o funcionário ocupante da vaga será aproveitado em outro cargo ou reconduzido ao cargo de origem, sendo indenizado pelo referido período trabalhado.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Questão de reintegração do estável (art. 41, §2º): teste cada alternativa por um único elemento — o cargo de retorno, o prazo, o ressarcimento e o destino do ocupante da vaga; elimine as alternativas que trocam um único prazo ou um único ator (por exemplo, o ocupante da vaga aproveitado em outro cargo sem indenização). A armadilha da banca é a tese quase certa com um único elemento invertido.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (DOE 23/12/2025; mantido após recursos)"
  },
  {
    "id": "Q3350287",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 61,
    "materia": "Raciocínio Lógico",
    "assunto": "Implicação e contrapositiva",
    "artigo": null,
    "enunciado": "Sabe-se que é verdade que todos os irmãos de Karina são humoristas.\nLogo, é também, necessariamente, verdadeiro que",
    "alternativas": [
      {
        "texto": "Karina não é humorista.",
        "correta": false,
        "porQue": "A premissa fala somente dos irmãos de Karina; nada diz sobre Karina ser ou não humorista."
      },
      {
        "texto": "se Carlos não é irmão de Karina, então ele é humorista.",
        "correta": false,
        "porQue": "Não ser irmão de Karina não permite concluir nada sobre ser humorista: a implicação dada só vale para quem é irmão."
      },
      {
        "texto": "se Carlos não é irmão de Karina, então ele não é humorista.",
        "correta": false,
        "porQue": "Não ser irmão de Karina não permite concluir nada sobre ser humorista: a implicação dada só vale para quem é irmão."
      },
      {
        "texto": "Karina é humorista.",
        "correta": false,
        "porQue": "A premissa fala somente dos irmãos de Karina; nada diz sobre Karina ser ou não humorista."
      },
      {
        "texto": "se Carlos não é humorista, então ele não é irmão de Karina.",
        "correta": true,
        "porQue": "É a contrapositiva de \"se é irmão de Karina, então é humorista\": quem não é humorista não pode ser irmão de Karina."
      }
    ],
    "insight": "Leia o comando \"necessariamente verdadeiro\": só vale o que decorre da premissa para todos os irmãos. Teste cada alternativa perguntando se ela fala dos irmãos (o conjunto dado) ou de Karina/Carlos fora dele; elimine primeiro as que afirmam algo sobre quem não está no conjunto ou invertem a implicação, e só aceite a que preserva a direção \"se é irmão, então é humorista\" na forma contrapositiva.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350288",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 62,
    "materia": "Raciocínio Lógico",
    "assunto": "Negação de proposição",
    "artigo": null,
    "enunciado": "Considere a seguinte afirmação:\nEm determinada autarquia, existe servidor que estudou na instituição M se, e somente se, estudou na instituição N.\nUma negação lógica para a afirmação apresentada é:\nEm determinada autarquia,",
    "alternativas": [
      {
        "texto": "todos os servidores ou estudaram na instituição M ou estudaram na instituição N.",
        "correta": true,
        "porQue": "Negar \"existe ... se e somente se\" exige trocar quantificador e conectivo ao mesmo tempo: todos os servidores estudaram em exatamente uma das instituições (só M ou só N)."
      },
      {
        "texto": "existe servidor que não estudou na instituição M ou não estudou na instituição N.",
        "correta": false,
        "porQue": "Mantém \"existe\" e admite o caso em que o servidor não estudou em nenhuma das duas, no qual a equivalência original seria verdadeira."
      },
      {
        "texto": "todos os servidores não estudaram na instituição M e não estudaram na instituição N.",
        "correta": false,
        "porQue": "Se nenhum servidor estudou em nenhuma das duas, a equivalência original seria verdadeira (falso se e somente se falso), não negada."
      },
      {
        "texto": "existe servidor que estudou na instituição M e não estudou na instituição N.",
        "correta": false,
        "porQue": "É só metade da negação (só M e não N): a negação da equivalência exige também o caso inverso, e para todos os servidores."
      },
      {
        "texto": "todos os servidores estudaram na instituição M e estudaram na instituição N.",
        "correta": false,
        "porQue": "Se todos estudaram nas duas instituições, a equivalência original seria verdadeira, não negada."
      }
    ],
    "insight": "Identifique o quantificador (existe) e o conectivo (se e somente se) antes de ler as alternativas; a negação troca os dois ao mesmo tempo — o \"existe\" vira \"todos\" e a equivalência vira a disjunção exclusiva. Elimine primeiro as alternativas que mantêm \"existe\" ou que trocam só um dos dois elementos.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350289",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 63,
    "materia": "Raciocínio Lógico",
    "assunto": "Dedução / associação",
    "artigo": null,
    "enunciado": "As 4 afirmações apresentadas a seguir são todas verdadeiras:\nI. Valéria não é advogada.\nII. Se Eduardo é promotor de justiça, então Olavo não é juiz.\nIII. Se Olavo não é juiz ou Rosana não é médica, então Valéria é advogada.\nIV. Se Rosana não é médica, então Amanda não é engenheira e Marcela é enfermeira.\nAssinale a alternativa que apresenta uma conclusão, verdadeira, que decorre das 4 afirmações apresentadas:",
    "alternativas": [
      {
        "texto": "Eduardo é promotor de justiça.",
        "correta": false,
        "porQue": "A cadeia deduz o contrário: de I e III segue que Olavo é juiz, e de II segue que Eduardo não é promotor de justiça."
      },
      {
        "texto": "Amanda é engenheira.",
        "correta": false,
        "porQue": "Nada na cadeia permite concluir sobre Amanda: a afirmação IV tem o antecedente falso (Rosana é médica), logo não diz nada sobre ela."
      },
      {
        "texto": "Eduardo não é promotor de justiça.",
        "correta": true,
        "porQue": "De I e III segue que Olavo é juiz (se Olavo não fosse juiz ou Rosana não fosse médica, Valéria seria advogada); de II, se Eduardo fosse promotor, Olavo não seria juiz — logo, Eduardo não é promotor de justiça."
      },
      {
        "texto": "Marcela não é enfermeira.",
        "correta": false,
        "porQue": "Nada na cadeia permite concluir sobre Marcela: a afirmação IV tem o antecedente falso (Rosana é médica), logo não diz nada sobre ela."
      },
      {
        "texto": "Amanda não é engenheira.",
        "correta": false,
        "porQue": "Nada na cadeia permite concluir sobre Amanda: a afirmação IV tem o antecedente falso (Rosana é médica), logo não diz nada sobre ela."
      }
    ],
    "insight": "Encadeie a partir da afirmação I (fato dado, não condicional): ela nega o consequente de III, o que nega o antecedente de III; use essa negação para resolver II e IV por eliminação, descartando primeiro as alternativas que afirmam o que a cadeia negou ou que tratam de pessoas sobre as quais a cadeia nada conclui.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350290",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 64,
    "materia": "Raciocínio Lógico",
    "assunto": "Diagramas de Venn / conjuntos",
    "artigo": null,
    "enunciado": "Em um grupo de 990 internautas, sabe-se que 150 já utilizaram três redes sociais, P, Q e R. Sobre os que já utilizaram somente duas dessas redes sociais, sabe-se que 200 utilizaram as redes P e Q, 270, as redes P e R, e 250 utilizaram as redes sociais Q e R. Sabe-se, também, sobre esse grupo, que o número de internautas que já utilizaram somente a rede social P excede em 20 o número de internautas que já utilizaram somente a rede Q, e que o número de internautas que já utilizaram somente a rede R é menor em 40 do que o número de internautas que já utilizaram somente a rede social P.\n\n[Diagrama de Venn com os conjuntos P, Q e R — presente no PDF oficial; os rótulos saíram embaralhados na extração de texto.]\n\nSe nesse grupo de internautas não há rede social já utilizada, além das três citadas, e que cada um deles já utilizou, pelo menos, uma das redes citadas, então é verdade que o número de internautas que já utilizaram somente a rede social",
    "alternativas": [
      {
        "texto": "P corresponde ao dobro do número de internautas que já utilizaram somente a rede social Q.",
        "correta": false,
        "porQue": "Somente P é 60 e somente Q é 40; o dobro de 40 seria 80, não 60."
      },
      {
        "texto": "P corresponde ao triplo do número de internautas que já utilizaram somente a rede social R.",
        "correta": true,
        "porQue": "Somente P é 60 e somente R é 20: 60 é o triplo de 20. (150 + 200 + 270 + 250 = 870; restam 120 para só uma rede, logo x + (x − 20) + (x − 40) = 120, x = 60.)"
      },
      {
        "texto": "Q corresponde à quinta parte do número de internautas que já utilizaram somente a rede social P.",
        "correta": false,
        "porQue": "Somente Q é 40; a quinta parte de somente P (60) seria 12, não 40."
      },
      {
        "texto": "R corresponde à terça parte do número de internautas que já utilizaram somente a rede social Q.",
        "correta": false,
        "porQue": "Somente R é 20; a terça parte de somente Q (40) seria cerca de 13,3, não 20."
      },
      {
        "texto": "R corresponde à metade do número de internautas que já utilizaram somente a rede social P.",
        "correta": false,
        "porQue": "Somente R é 20; a metade de somente P (60) seria 30, não 20."
      }
    ],
    "insight": "Monte a equação do total antes de testar as razões: some os que usaram três redes e os que usaram somente duas, chame de x os que usaram somente P e escreva somente Q e somente R em função de x (x − 20 e x − 40); só depois de achar x, Q e R compare cada razão proposta com os valores calculados, eliminando as que trocam o conjunto-base. O diagrama não é necessário: todos os dados numéricos estão no enunciado.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350291",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 65,
    "materia": "Raciocínio Lógico",
    "assunto": "Sequências numéricas",
    "artigo": null,
    "enunciado": "Considere a seguinte sequência numérica α:\n\nα: 8, 18, 32, 50, 72, 98, 128, 162, …\nTomados os algarismos que compõem os elementos da sequência α, na ordem em que aparecem, forma-se a sequência numérica β, identificada a seguir, em que as três primeiras posições múltiplas de cinco têm seus elementos sublinhados:\n\nβ: 8, 1, 8, 3, 2, 5, 0, 7, 2, 9, 8, 1, 2, 8, 1, 6, 2, …\nEsses elementos sublinhados, na ordem em que aparecem em β, formam o número 291.\nMantidas essas regularidades, o número formado pelos algarismos dos elementos que ocupam as posições 25a, 30a e 35a da sequência β é",
    "alternativas": [
      {
        "texto": "456.",
        "correta": false,
        "porQue": "As posições 25, 30 e 35 de β são 8, 3 e 0, não 4, 5 e 6."
      },
      {
        "texto": "687.",
        "correta": false,
        "porQue": "As posições 25, 30 e 35 de β são 8, 3 e 0, não 6, 8 e 7."
      },
      {
        "texto": "904.",
        "correta": false,
        "porQue": "As posições 25, 30 e 35 de β são 8, 3 e 0, não 9, 0 e 4."
      },
      {
        "texto": "830.",
        "correta": true,
        "porQue": "A posição 25 de β é 8, a 30 é 3 e a 35 é 0, formando o número 830."
      },
      {
        "texto": "123.",
        "correta": false,
        "porQue": "As posições 25, 30 e 35 de β são 8, 3 e 0, não 1, 2 e 3."
      }
    ],
    "insight": "Descubra primeiro a lei de α pelas diferenças entre os termos e reescreva β como os algarismos de α em ordem, contando as posições com cuidado; use os três sublinhados conhecidos (posições 5, 10 e 15 = 2, 9, 1, formando 291) para conferir a contagem antes de ler as posições 25, 30 e 35.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350292",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 66,
    "materia": "Direito Penal",
    "assunto": "Prevaricação",
    "artigo": "CP, art. 319",
    "enunciado": "Imagine que determinado funcionário público, que tem o dever legal de expedir alvarás de soltura, ao perceber que a pessoa a ser solta é seu inimigo, posterga indevidamente a emissão do documento, prolongando a prisão por 5 dias.\n\nDiante desse fato, é correto afirmar que",
    "alternativas": [
      {
        "texto": "se caracterizou crime de advocacia administrativa.",
        "correta": false,
        "porQue": "A advocacia administrativa exige patrocinar interesse privado perante a Administração; aqui o servidor apenas retarda ato de ofício por sentimento pessoal."
      },
      {
        "texto": "se caracterizou crime de abandono de função.",
        "correta": false,
        "porQue": "O abandono de função exige abandonar o cargo ou a função; aqui o servidor permanece no cargo e apenas posterga o ato."
      },
      {
        "texto": "não se caracterizou qualquer crime, pois a conduta foi omissiva.",
        "correta": false,
        "porQue": "A conduta omissiva — retardar indevidamente ato de ofício — é justamente o núcleo da prevaricação; a omissão não exclui o crime."
      },
      {
        "texto": "se caracterizou crime de prevaricação.",
        "correta": true,
        "porQue": "Retardar indevidamente ato de ofício (expedir o alvará de soltura) para satisfazer sentimento pessoal (a pessoa é seu inimigo) é o tipo do art. 319 do Código Penal."
      },
      {
        "texto": "não se caracterizou qualquer crime, podendo ser apurado eventual desvio funcional.",
        "correta": false,
        "porQue": "Há crime caracterizado (prevaricação, art. 319 do Código Penal); não é mero desvio funcional."
      }
    ],
    "insight": "No minicaso, identifique o dever do servidor e o motivo pessoal (inimigo) antes de olhar os nomes dos crimes; elimine os crimes do mesmo capítulo que exigem outro elemento (patrocinar interesse privado; abandonar o cargo) e as alternativas que negam o crime pela omissão — o retardamento indevido do ato de ofício por sentimento pessoal é o núcleo do tipo cobrado.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3350293",
    "prova": "VUNESP — TJ-SP Analista de Sistemas Judiciário",
    "ano": 2025,
    "numero": 67,
    "materia": "Direito Penal",
    "assunto": "Coação no curso do processo",
    "artigo": "CP, art. 344",
    "enunciado": "O tipo penal do art. 344, do Código Penal, crime de coação no curso do processo, tem pena aumentada se a coação",
    "alternativas": [
      {
        "texto": "causa prejuízo à Administração Pública.",
        "correta": false,
        "porQue": "Não é a hipótese de aumento de pena prevista no art. 344 do Código Penal."
      },
      {
        "texto": "é acompanhada de violência.",
        "correta": false,
        "porQue": "A violência (ou grave ameaça) é o meio de execução do próprio tipo do art. 344, não a causa de aumento da pena."
      },
      {
        "texto": "ocorre no curso de processo que envolva crime contra a dignidade sexual.",
        "correta": true,
        "porQue": "É a hipótese de aumento de pena prevista no art. 344 do Código Penal."
      },
      {
        "texto": "ocorre no curso de processo penal.",
        "correta": false,
        "porQue": "O processo penal é apenas um dos processos em que a coação pode ocorrer; não é, por si só, a causa de aumento prevista no art. 344."
      },
      {
        "texto": "causa dano patrimonial.",
        "correta": false,
        "porQue": "Não é a hipótese de aumento de pena prevista no art. 344 do Código Penal."
      }
    ],
    "insight": "Quando o comando cita o artigo direto, leia as alternativas como uma lista de condições e pergunte qual delas o próprio artigo prevê como aumento de pena; elimine primeiro as condições que são o meio de execução do tipo ou que descrevem apenas o processo em que a coação ocorre, sem ser causa de aumento.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1"
  },
  {
    "id": "Q3289422",
    "prova": "VUNESP — TJ-SP Assistente Social Judiciário",
    "ano": 2025,
    "numero": 44,
    "materia": "Direito Processual Penal",
    "assunto": "Lei Maria da Penha — fora do edital do Escrevente",
    "artigo": "Lei 11.340/2006, art. 16",
    "enunciado": "44. Historicamente, a ausência de uma política pública e a escassez dos serviços para o atendimento de mulheres em situação de violência, provocavam uma dinâmica tal que, em busca de ajuda, a mulher vítima registrava a denúncia, seguida de desistência e retornos, num movimento contínuo definido como \"ciclo da violência doméstica\".\n\nA Lei Maria da Penha criminalizou essa violência, responsabilizou e regulamentou a presença do Estado no espaço privado. A referida lei obstaculiza a \"retirada da queixa\" na medida em que determina (art. 16) que, nas ações penais públicas condicionadas à representação da ofendida, só será admitida a renúncia à representação perante o juiz, em audiência especialmente designada com tal finalidade, antes do recebimento da denúncia e ouvido o",
    "alternativas": [
      {
        "texto": "ministério público.",
        "correta": true,
        "porQue": "É o ator nomeado no art. 16, citado no próprio enunciado: a renúncia à representação só é admitida perante o juiz, em audiência especialmente designada, antes do recebimento da denúncia e ouvido o Ministério Público."
      },
      {
        "texto": "assistente social judiciário.",
        "correta": false,
        "porQue": "O art. 16, citado no enunciado, prevê apenas a oitiva do Ministério Público; não há previsão de oitiva do assistente social judiciário."
      },
      {
        "texto": "agressor.",
        "correta": false,
        "porQue": "O art. 16, citado no enunciado, prevê apenas a oitiva do Ministério Público; o agressor não é o ator ouvido na audiência de renúncia."
      },
      {
        "texto": "juiz.",
        "correta": false,
        "porQue": "Pelo texto do art. 16 citado no enunciado, a renúncia é admitida perante o juiz — ele preside a audiência, não é quem é ouvido nela."
      },
      {
        "texto": "conselho da mulher.",
        "correta": false,
        "porQue": "O art. 16, citado no enunciado, prevê apenas a oitiva do Ministério Público; não há previsão de oitiva do conselho da mulher."
      }
    ],
    "insight": "O enunciado cita o artigo da lei (art. 16) e pergunta quem é ouvido: localize no texto do artigo o ator nomeado. As 5 alternativas são atores da mesma classe — a armadilha da banca é trocar o ator competente. Elimine quem não tem papel previsto no artigo (o juiz preside a audiência, não é ouvido; agressor e demais atores não são ouvidos) e fique com o único ator que o artigo nomeia.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3289424",
    "prova": "VUNESP — TJ-SP Assistente Social Judiciário",
    "ano": 2025,
    "numero": 46,
    "materia": "Direito Processual Penal",
    "assunto": "Lei Maria da Penha — fora do edital do Escrevente",
    "artigo": "Lei 11.340/2006, art. 7º, V",
    "enunciado": "46. A violência contra as mulheres constitui uma expressão da relação de desigualdade entre homens e mulheres.\n\nÉ uma violência baseada na afirmação da superioridade de um sexo sobre o outro, nomeadamente, dos homens sobre as mulheres. Trata-se de um fenômeno que afeta toda a sociedade, devendo ser considerado o contexto social em que esses atos de violência ocorrem. A Lei nº 11.340/2006 (Lei Maria da Penha) define como formas de violência doméstica e familiar contra a mulher: a física, a psicológica, a sexual, a patrimonial e a moral.\n\nDe acordo com o artigo art. 7º (V) da referida lei, a violência moral é entendida como qualquer conduta que configure calúnia, difamação ou",
    "alternativas": [
      {
        "texto": "desrespeito.",
        "correta": false,
        "porQue": "Não consta do rol do art. 7º, V, citado no enunciado (calúnia, difamação ou injúria); é um quase-sinônimo, não o termo da lei."
      },
      {
        "texto": "humilhação.",
        "correta": false,
        "porQue": "Não consta do rol do art. 7º, V, citado no enunciado (calúnia, difamação ou injúria); é um quase-sinônimo, não o termo da lei."
      },
      {
        "texto": "discriminação.",
        "correta": false,
        "porQue": "Não consta do rol do art. 7º, V, citado no enunciado (calúnia, difamação ou injúria); é um quase-sinônimo, não o termo da lei."
      },
      {
        "texto": "ameaça.",
        "correta": false,
        "porQue": "Não consta do rol do art. 7º, V, citado no enunciado (calúnia, difamação ou injúria); é um quase-sinônimo, não o termo da lei."
      },
      {
        "texto": "injúria.",
        "correta": true,
        "porQue": "Completa a tríade literal do art. 7º, V, citado no enunciado: a violência moral é qualquer conduta que configure calúnia, difamação ou injúria."
      }
    ],
    "insight": "O comando transcreve o art. 7º, V até o 'ou' e pede o termo que falta: complete a tríade com o termo exato da lei. As 5 alternativas são palavras da mesma classe e a armadilha é o quase-sinônimo — desrespeito, humilhação, discriminação e ameaça parecem plausíveis, mas a banca cobra o termo literal do artigo, não um sinônimo.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3289425",
    "prova": "VUNESP — TJ-SP Assistente Social Judiciário",
    "ano": 2025,
    "numero": 47,
    "materia": "Direito Processual Penal",
    "assunto": "Lei Maria da Penha — fora do edital do Escrevente — medidas protetivas de urgência",
    "artigo": null,
    "enunciado": "47. As medidas protetivas de urgência previstas na Lei Maria da Penha podem ser deferidas de forma autônoma, apenas com base na palavra da vítima. Por isso, ao versar sobre a violência de gênero e as questões de direito processual, o Protocolo para julgamento com perspectiva de gênero, do Conselho Nacional de Justiça (CNJ), qualifica como de inquestionável importância as declarações da mulher vítima como meio de prova. O peso probatório diferenciado legitima-se pela vulnerabilidade e hipossuficiência da ofendida na relação jurídica processual, qualificando-se a atividade jurisdicional, desenvolvida nesses moldes, como imparcial e de acordo com o aspecto material do princípio da",
    "alternativas": [
      {
        "texto": "civilidade.",
        "correta": false,
        "porQue": "Não é o princípio a que o enunciado se refere: nada no texto (vulnerabilidade, hipossuficiência, tratamento diferenciado, aspecto material) remete à civilidade."
      },
      {
        "texto": "oportunidade.",
        "correta": false,
        "porQue": "Não é o princípio a que o enunciado se refere: nada no texto (vulnerabilidade, hipossuficiência, tratamento diferenciado, aspecto material) remete à oportunidade."
      },
      {
        "texto": "seletividade.",
        "correta": false,
        "porQue": "Não é o princípio a que o enunciado se refere: nada no texto (vulnerabilidade, hipossuficiência, tratamento diferenciado, aspecto material) remete à seletividade."
      },
      {
        "texto": "igualdade.",
        "correta": true,
        "porQue": "O enunciado fundamenta o peso probatório diferenciado na vulnerabilidade e na hipossuficiência da ofendida e fala no aspecto material do princípio — o tratamento diferenciado em razão da desigualdade concreta é a igualdade material."
      },
      {
        "texto": "idoneidade.",
        "correta": false,
        "porQue": "Não é o princípio a que o enunciado se refere: nada no texto (vulnerabilidade, hipossuficiência, tratamento diferenciado, aspecto material) remete à idoneidade."
      }
    ],
    "insight": "Identifique no enunciado o fundamento (vulnerabilidade e hipossuficiência da ofendida justificando um peso probatório diferenciado) e o qualificativo do comando ('aspecto material do princípio da'): pergunte qual princípio tem um aspecto material que justifica tratar desigualmente quem está em situação desigual. Elimine os substantivos abstratos que não nomeiam um princípio com esse aspecto.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3289437",
    "prova": "VUNESP — TJ-SP Assistente Social Judiciário",
    "ano": 2025,
    "numero": 59,
    "materia": "Atualidades",
    "assunto": "Reforma psiquiátrica",
    "artigo": "Res. CNJ 487/2023; Lei 10.216/2001",
    "enunciado": "59. Vários movimentos sociais e instituições ligadas à reforma psiquiátrica se manifestaram contra o Projeto de Lei nº 551/2024 que foi pautado, em regime de urgência, no Congresso Nacional, no dia 10 de dezembro de 2024.\n\n(gov.br. Disponível em: https://shre.ink/bXh5. Acesso em 12.01.2024 [sic]. Adaptado)\n\nEntre outras causas, é correto afirmar que as entidades condenam",
    "alternativas": [
      {
        "texto": "a prática garantida pela Resolução nº 487/2023 do Conselho Nacional de Justiça (CNJ), que determina que pessoas em sofrimento psíquico em conflito com a lei devem ser tratadas no âmbito da Rede de Atenção Psicossocial (Raps).",
        "correta": false,
        "porQue": "É uma medida que as entidades ligadas à reforma psiquiátrica defendem (tratamento na Raps, e não em manicômio), apresentada como se fosse condenada — a armadilha documentada no relatório de padrões: medidas defendidas apresentadas como condenadas."
      },
      {
        "texto": "as propostas que determinam que a assistência psicológica, médica e social dos pacientes se faça em centros de acolhimento para tratamento não hospitalar.",
        "correta": false,
        "porQue": "É uma medida que as entidades ligadas à reforma psiquiátrica defendem (tratamento não hospitalar), apresentada como se fosse condenada — a armadilha documentada no relatório de padrões: medidas defendidas apresentadas como condenadas."
      },
      {
        "texto": "a obrigatoriedade de internação compulsória de pessoas que estiverem cumprindo pena ou medida de segurança e deixam a cargo exclusivo do médico a avaliação da periculosidade do sujeito.",
        "correta": true,
        "porQue": "É a única alternativa que descreve uma medida contrária à reforma psiquiátrica — internação compulsória obrigatória, com a avaliação da periculosidade a cargo exclusivo do médico — coerente com o que as entidades condenam no PL 551/2024."
      },
      {
        "texto": "o fechamento gradual de manicômios e hospícios, sendo substituídos por Centros de Atenção Psicossocial, espaços de acolhimento que farão assistência psicológica, médica e social.",
        "correta": false,
        "porQue": "É uma medida que as entidades ligadas à reforma psiquiátrica defendem (fechamento dos manicômios e substituição pelos Caps), apresentada como se fosse condenada — a armadilha documentada no relatório de padrões: medidas defendidas apresentadas como condenadas."
      },
      {
        "texto": "a supressão do artigo 9º, da Lei nº 10.216/2001, que prevê dois tipos de internação psiquiátrica: a voluntária, a pedido do paciente, e a compulsória determinada por uma junta médica.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "O comando é 'é correto afirmar que as entidades condenam': primeiro identifique de que lado estão as entidades (movimentos da reforma psiquiátrica) e separe as alternativas em dois grupos — medidas que a reforma defende (tratamento na Raps, acolhimento não hospitalar, fechamento dos manicômios) e medidas contrárias a ela. A armadilha da banca é apresentar uma medida defendida como se fosse condenada; elimine esse grupo primeiro e fique com a medida contrária à reforma.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3289438",
    "prova": "VUNESP — TJ-SP Assistente Social Judiciário",
    "ano": 2025,
    "numero": 60,
    "materia": "Atualidades",
    "assunto": "PEC 164/2012 — admissibilidade na CCJ (26/11/2024, 35 votos)",
    "artigo": null,
    "enunciado": "60. Em 26 de novembro de 2024, com 35 votos favoráveis, a Comissão de Constituição, Justiça e de Cidadania (CCJ) da Câmara dos Deputados aprovou a admissibilidade da Proposta de Emenda à Constituição 164/2012 (PEC 164/2012). A proposta \"Estabelece a inviolabilidade do direito à vida desde a concepção\", o que impossibilitaria o direito ao aborto nos três casos permitidos pela lei.\n\n(EBC. Disponível em: https://shre.ink/bXhH. Acesso em 123.01.2025 [sic]. Adaptado)\n\nOs casos permitidos atualmente são os seguintes:",
    "alternativas": [
      {
        "texto": "risco de morte materna; gestação decorrente de estupro; depois do período perinatal.",
        "correta": false,
        "porQue": "Trio com um elemento trocado: 'depois do período perinatal' não é um dos três casos permitidos — a armadilha documentada no relatório de padrões (lista 'quase certa' com um elemento trocado)."
      },
      {
        "texto": "depois do período perinatal; gestação decorrente de estupro; uso continuado de drogas pela gestante.",
        "correta": false,
        "porQue": "Trio com dois elementos trocados: 'depois do período perinatal' e 'uso continuado de drogas pela gestante' não são casos permitidos."
      },
      {
        "texto": "risco de morte materna; depois do período perinatal; anencefalia do feto.",
        "correta": false,
        "porQue": "Trio com um elemento trocado: 'depois do período perinatal' não é um dos três casos permitidos — a armadilha documentada no relatório de padrões (lista 'quase certa' com um elemento trocado)."
      },
      {
        "texto": "risco de morte materna; uso habitual de drogas pela gestante; anencefalia do feto.",
        "correta": false,
        "porQue": "Trio com um elemento trocado: 'uso habitual de drogas pela gestante' não é um dos três casos permitidos."
      },
      {
        "texto": "risco de morte materna; gestação decorrente de estupro; anencefalia do feto.",
        "correta": true,
        "porQue": "É o trio completo dos três casos em que o aborto é permitido: risco de morte materna, gestação decorrente de estupro e anencefalia do feto."
      }
    ],
    "insight": "O comando pede uma lista de três elementos: compare os trios elemento por elemento e elimine os que trazem um elemento estranho à lista ('depois do período perinatal' ou 'uso de drogas pela gestante'). A armadilha da banca é o trio 'quase certo' com um único elemento trocado — dois elementos certos não bastam, os três precisam estar certos.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3291607",
    "prova": "VUNESP — TJ-SP Psicólogo Judiciário",
    "ano": 2025,
    "numero": 59,
    "materia": "Atualidades",
    "assunto": "Desastre de Brumadinho — metais tóxicos em crianças",
    "artigo": null,
    "enunciado": "Seis anos após o desastre de Brumadinho (MG) causado pelo rompimento da barragem da mineradora Vale, a população ainda sofre seus reflexos. Um estudo da Fiocruz Minas e da Universidade Federal do Rio de Janeiro (UFRJ) revelou, no dia 24 de janeiro de 2025, que crianças de até seis anos tiveram um aumento na exposição a metais tóxicos no período de 2021 a 2023. As amostras de urina revelam que 100% das crianças apresentam resultado positivo em relação a presença de pelo menos um metal tóxico.\n\n(Exame. https://abrir.link/KlMSa. Adaptado)\n\nO metal que apresentou os níveis mais elevados nas amostras, com valores acima do limite de referência, passou de 42%, em 2021, para 57%, em 2023. Esses índices referem-se ao",
    "alternativas": [
      {
        "texto": "chumbo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "arsênio.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "manganês.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "mercúrio.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "cádmio.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Formato 'fonte citada + pergunta sobre o fato': o comando pede o dado exato da notícia citada (estudo Fiocruz Minas/UFRJ, divulgado em 24/01/2025). Localize no excerto os números concretos — 42% em 2021 para 57% em 2023, acima do limite de referência — e associe ao metal nomeado na fonte. Os 5 metais são tóxicos e plausíveis, e só a fonte distingue um do outro; não chute pelo metal mais conhecido ou mais associado a Brumadinho.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3291608",
    "prova": "VUNESP — TJ-SP Psicólogo Judiciário",
    "ano": 2025,
    "numero": 60,
    "materia": "Atualidades",
    "assunto": "Unicef 2024 — interrupção das rotinas escolares",
    "artigo": null,
    "enunciado": "Um estudo do Unicef revelou que, em 2024, mais de 242 milhões de crianças e adolescentes, de 85 países, tiveram suas rotinas escolares interrompidas. O relatório, divulgado nesta quinta-feira (23.01.2025), no Dia da Educação, afirma que o Brasil é um dos países mais afetados, com 1,17 milhão de estudantes prejudicados.\n\n(Exame. https:shre.ink/bLOS. Adaptado)\n\nSegundo o Unicef, o motivo determinante relacionado ao prejuízo das rotinas escolares foi",
    "alternativas": [
      {
        "texto": "a fome endêmica das populações carentes.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o aumento dos casos de dengue.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a ocorrência de eventos climáticos extremos.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "a falta de investimento na área educacional.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a pandemia de covid-19.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Formato 'fonte citada + pergunta sobre o fato': o comando pede o motivo determinante segundo o Unicef, não a causa mais plausível em geral. Localize no relatório citado (divulgado em 23/01/2025, Dia da Educação) o motivo que ele aponta para as 242 milhões de rotinas interrompidas. A armadilha da banca é a causa plausível que NÃO é a citada pela fonte (fome, dengue, covid, falta de investimento) — elimine as causas que o relatório não aponta.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (07/04/2025; definitivo de 13/05/2025 não conferido diretamente)"
  },
  {
    "id": "Q3775126",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 1,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia a tira. [Tira — imagem: Bob Thaves, \"Frank & Ernest\". Em: https://www.estadao.com.br/cultura/quadrinhos. 15.09.2025. O conteúdo da tira é uma imagem e não foi extraído da camada de texto do PDF.] Na fala do consultor financeiro, a expressão \"ir mais longe\" está empregada em sentido",
    "alternativas": [
      {
        "texto": "figurado, remetendo à ideia de local distante.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "próprio, remetendo à ideia de bom rendimento.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "figurado, remetendo à ideia de lucro maior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "próprio, remetendo à ideia de lugar seguro.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "figurado, remetendo à ideia de renda débil.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "A tira (imagem) não foi extraída da camada de texto do PDF — sem o conteúdo da tira não é possível saber o contexto da fala do consultor financeiro nem resolver a questão pelo texto extraído. Gabarito oficial conhecido (letra C), mas não aplicado como correta porque a questão não é treinável nestas condições.",
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775127",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 2,
    "materia": "Língua Portuguesa",
    "assunto": "Interpretação de Textos",
    "artigo": null,
    "enunciado": "Leia o texto para responder às questões de 02 a 10.\n\nA reprodução da desigualdade\n\nDe tão persistentes, nossos dilemas sociais, econômicos e políticos não mais enternecem parte dos brasileiros, conformada com situações que, embora anormais, passou a considerar naturais. Mas certas questões deveriam nos comover.\n\nCoautor, com Fillipi Nascimento, do livro A Loteria do Nascimento, o economista e pesquisador do Insper Michael França concluiu que, ao contrário da ideia predominante de que as desigualdades resultam basicamente de um sistema educacional de baixa qualidade, as condições de nascimento afetam mais a vida das pessoas.\n\nEducação de qualidade é essencial para melhorar a vida das pessoas e para o avanço de uma sociedade. E sua carência estimula a perpetuação de graves problemas. Mas a desigualdade social (e sua reprodução ao longo do tempo) decorre também de fatores como o apontado no estudo do pesquisador do Insper. Estrutura familiar, herança, rede de contatos e formação em instituições renomadas favorecem a carreira profissional de uma parte das pessoas. Já os filhos de famílias mais pobres enfrentam desvantagens na carreira, como falta de condições financeiras para recusar emprego ruim, escassez de contatos e referências no mercado de trabalho ou impossibilidade de investir em educação e treinamento adicionais.\n\nTão acostumados nos tornamos com a histórica concentração de renda que nem percebemos como esse processo se estendeu e se consolidou. Quanto mais rico, mais cresce a riqueza. Num país que detém alguns dos piores índices mundiais de distribuição de renda, talvez soe como irônica perversidade o fato de que também na exclusiva faixa do 1% mais rico a riqueza se concentra.\n\nHá uma característica da renda dos mais ricos que a torna menos sujeita à tributação que incide sobre o rendimento dos demais brasileiros, o que remete à injustiça tributária.\n\nA renda da maioria dos contribuintes é fruto do trabalho e tributada no momento do pagamento. Nas faixas de rendimento mais altas, há muitos profissionais liberais que recorrem à criação de empresas sobre as quais a tributação é menor.\n\nE boa parte dos rendimentos é decorrente de lucros e dividendos, igualmente sujeitos à tributação menos onerosa.\n\nEstatísticas recentes do Fundo Monetário Internacional (FMI) deixam uma advertência para os brasileiros: com a lenta evolução de sua renda per capita, o País está se aproximando da metade mais pobre do mundo. Estamos empobrecendo em relação ao resto do mundo e tendo a renda mais concentrada. É uma combinação inquietante.\n\n(Jorge J. Okubaro. Em: https://www.estadao.com.br/opiniao, 26.08.2025. Adaptado)\n\nTomando como referência a obra de Fillipi Nascimento e Michael França, o autor argumenta que",
    "alternativas": [
      {
        "texto": "as condições de vida dos filhos normalmente são favoráveis à ascensão social deles quando lhes são impostos desafios.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a aproximação do Brasil com a metade mais pobre do mundo é decorrência da falta de concentração de renda.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "as desigualdades, como sempre se teve conhecimento, resultam basicamente de um sistema educacional de baixa qualidade.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "as desigualdades sociais persistem no Brasil e decorrem, significativamente, das condições de nascimento das pessoas.",
        "correta": true,
        "porQue": "O texto afirma que, ao contrário da ideia predominante (educação de baixa qualidade), as condições de nascimento afetam mais a vida das pessoas, e que a desigualdade decorre também de fatores como estrutura familiar, herança e rede de contatos."
      },
      {
        "texto": "o descaso dos jovens pelo ensino impacta mais as desigualdades sociais do que o nascimento em uma família pobre.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Leia o comando primeiro e localize a tese do autor no texto; elimine as alternativas que invertem a causa (educação como causa principal) ou a posição do autor — a armadilha da VUNESP é a tese longa com um elemento invertido.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775128",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 3,
    "materia": "Língua Portuguesa",
    "assunto": "Interpretação de Textos",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Ao discutir a tributação de renda no Brasil, o texto deixa claro que",
    "alternativas": [
      {
        "texto": "aqueles que têm rendimentos mais altos recorrem a determinados expedientes que lhes permitem pagar menos impostos.",
        "correta": true,
        "porQue": "O texto diz que nas faixas mais altas há profissionais liberais que recorrem à criação de empresas sobre as quais a tributação é menor, e que lucros e dividendos estão sujeitos a tributação menos onerosa."
      },
      {
        "texto": "as pessoas que optam pelas profissões liberais, se pertencem às classes mais altas, sofrem com o pagamento de altos impostos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a legislação impede a injustiça tributária, uma vez que todos os profissionais têm sobre seus rendimentos o mesmo tipo de imposto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "as classes menos favorecidas acabam tendo vantagens, pois sobre seus rendimentos raramente incidem impostos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a justiça tributária vem sendo perseguida, já que os profissionais, de todas as classes sociais, estão pagando menos impostos.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Localize no texto o trecho sobre tributação antes de julgar as alternativas; elimine as que afirmam o contrário do texto (impostos altos para os mais ricos, justiça tributária já alcançada).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775129",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 4,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Sem prejuízo de sentido ao texto, os termos destacados em \"De tão persistentes, nossos dilemas sociais, econômicos e políticos não mais enternecem parte dos brasileiros, conformada com situações que, embora anormais, passou a considerar naturais. Mas certas questões deveriam nos comover.\" (1º parágrafo) podem ser substituídos, respectivamente, por:\n\n[Nota do arquivo-fonte: os grifos não foram preservados na extração de texto; os termos destacados são \"persistentes\", \"enternecem\", \"embora\" e \"Mas\", identificados por correspondência com as alternativas.]",
    "alternativas": [
      {
        "texto": "degradantes; tocam; enquanto; Conforme.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "relevantes; emocionam; sobretudo; Porque.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "insistentes; amparam; porquanto; Todavia.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "perseverantes; sensibilizam; mesmo; Entretanto.",
        "correta": true,
        "porQue": "\"persistentes\" = perseverantes; \"enternecem\" = sensibilizam; \"embora\" (concessivo) = mesmo; \"Mas\" (adversativo) = Entretanto — cada substituição preserva o sentido original."
      },
      {
        "texto": "frequentes; estimulam; portanto; Conquanto.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada trio palavra por palavra, na ordem: o distrator troca um só elemento do trio — um sinônimo que muda o sentido ou um conectivo de valor diferente (causa em vez de concessão, por exemplo).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775130",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 5,
    "materia": "Língua Portuguesa",
    "assunto": "Significação das Palavras",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Sem que haja prejuízo ao sentido original, na passagem \"Mas a desigualdade social (e sua reprodução ao longo do tempo) decorre também de fatores como o apontado no estudo do pesquisador do Insper.\" (3º parágrafo), o termo destacado pode ser substituído por:\n\n[Nota do arquivo-fonte: o grifo não foi preservado na extração de texto; o termo destacado é \"decorre\", identificado por correspondência com as alternativas.]",
    "alternativas": [
      {
        "texto": "aparta-se.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "sugere.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "esquiva-se.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "abdica.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "advém.",
        "correta": true,
        "porQue": "\"Decorre\" significa provém, origina-se — \"advém\" preserva esse sentido; as demais alternativas mudam o sentido (afastar-se, sugerir, esquivar-se, abdicar)."
      }
    ],
    "insight": "Identifique o termo destacado e o seu sentido no contexto antes de olhar as alternativas; elimine os verbos que mudam a relação (origem/proveniência) expressa pelo termo.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775131",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 6,
    "materia": "Língua Portuguesa",
    "assunto": "Relações de Sentido",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Considere as passagens:\n\n- Educação de qualidade é essencial para melhorar a vida das pessoas... (3º parágrafo)\n- ... talvez soe como irônica perversidade o fato de que também na exclusiva faixa do 1% mais rico a riqueza se concentra. (4º parágrafo)\n- E boa parte dos rendimentos é decorrente de lucros e dividendos, igualmente sujeitos à tributação menos onerosa. (5º parágrafo)\n- ... com a lenta evolução de sua renda per capita, o País está se aproximando da metade mais pobre do mundo. (6º parágrafo)\n\nNo contexto em que estão empregados, os termos destacados estabelecem, correta e respectivamente, relações de sentido de:\n\n[Nota do arquivo-fonte: os grifos dos termos destacados não foram preservados na extração de texto do PDF.]",
    "alternativas": [
      {
        "texto": "conformidade, modo, meio, afirmação, fim.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "finalidade, dúvida, inclusão, modo, causa.",
        "correta": true,
        "porQue": null
      },
      {
        "texto": "causa, conformidade, oposição, meio, modo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "finalidade, modo, inclusão, afirmação, causa.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "conformidade, dúvida, inclusão, modo, modo.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Identifique cada termo destacado no texto original e classifique a relação que ele estabelece (finalidade, dúvida, inclusão, modo, causa) antes de conferir as sequências; o distrator troca um só elemento da sequência.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775132",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 7,
    "materia": "Língua Portuguesa",
    "assunto": "Colocação Pronominal",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). A colocação pronominal está em conformidade com a norma-padrão em:",
    "alternativas": [
      {
        "texto": "Nossos dilemas sociais, econômicos e políticos são tão persistentes que parte dos brasileiros não mais enternecem-se com eles.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Com a lenta evolução de sua renda per capita, o País agora aproxima-se da metade mais pobre do mundo. É uma situação inquietante.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Uma característica da renda dos mais ricos torna-a menos sujeita à tributação que incide sobre o rendimento dos demais brasileiros.",
        "correta": true,
        "porQue": "A ênclise em \"torna-a\" está correta: não há fator de próclise e o pronome vem após o verbo."
      },
      {
        "texto": "Muitos profissionais liberais têm recorrido à criação de empresas por meio das quais esquivarão-se de uma tributação elevada.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Nos tornamos tão acostumados com a histórica concentração de renda que nem percebemos como esse processo foi estendido e consolidado.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada frase por uma só regra de colocação pronominal: procure o fator de próclise (negação, pronome relativo, conjunção subordinativa) — sem ele, a ênclise é a regra; cada distrator quebra uma única regra.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775133",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 8,
    "materia": "Língua Portuguesa",
    "assunto": "Concordância Nominal",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Assinale a alternativa em que o emprego do termo destacado no singular preservaria a conformidade com a norma-padrão.\n\n[Nota do arquivo-fonte: os grifos não foram preservados na extração de texto; o termo destacado em cada alternativa é a palavra no plural da passagem citada.]",
    "alternativas": [
      {
        "texto": "De tão persistentes, nossos dilemas sociais, econômicos e políticos... (1º parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "... ou impossibilidade de investir em educação e treinamento adicionais. (3º parágrafo)",
        "correta": true,
        "porQue": "\"Treinamento adicional\" (singular) preserva a concordância nominal: o adjetivo concorda com o substantivo no singular."
      },
      {
        "texto": "Num país que detém alguns dos piores índices mundiais de distribuição de renda... (4º parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Nas faixas de rendimento mais altas, há muitos profissionais liberais... (5º parágrafo)",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Estatísticas recentes do Fundo Monetário Internacional (FMI) deixam uma advertência... (6º parágrafo)",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Passe cada termo destacado para o singular e ajuste os termos que concordam com ele; elimine as passagens em que o singular quebraria a concordância com outro elemento da frase.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775134",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 9,
    "materia": "Língua Portuguesa",
    "assunto": "Concordância Verbal",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). A concordância verbal está em conformidade com a norma-padrão em:",
    "alternativas": [
      {
        "texto": "Os mais pobres têm desvantagens na carreira, pois lhes faltam condições financeiras para recusar emprego ruim.",
        "correta": true,
        "porQue": "\"Os mais pobres têm desvantagens\" e \"lhes faltam condições\" concordam corretamente com os sujeitos no plural."
      },
      {
        "texto": "Como são persistentes, os brasileiros considera os dilemas sociais, econômicos e políticos como naturais, embora anormais.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "É necessária a educação de qualidade para as pessoas, para que hajam menos desigualdades e para que a sociedade avance.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Perpetua-se graves problemas na sociedade com a carência de uma educação de qualidade para melhorar a vida das pessoas.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Uma das ideias corrente é que ocorre as desigualdades na sociedade por causa de um sistema educacional de baixa qualidade.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Em cada frase, localize o sujeito e confira o verbo com ele; cada distrator quebra uma só regra de concordância (\"considera\", \"hajam\", \"Perpetua-se\", \"ocorre\").",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775135",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 10,
    "materia": "Língua Portuguesa",
    "assunto": "Crase",
    "artigo": null,
    "enunciado": "Leia o texto \"A reprodução da desigualdade\" (texto base das questões 02 a 10, transcrito na questão 02). Considere as frases:\n\n- Há uma ideia predominante de que as desigualdades existem basicamente devido [lacuna] sistema educacional de baixa qualidade.\n- Educação de qualidade é essencial para proporcionar melhores condições de vida [lacuna] pessoas e para o avanço de uma sociedade.\n- Tão habituados nos tornamos [lacuna] histórica concentração de renda que nem percebemos como esse processo se estendeu e se consolidou.\n- Estatísticas recentes do Fundo Monetário Internacional deixam um aviso [lacuna] população: com a lenta evolução de sua renda per capita, o País está se aproximando da metade mais pobre do mundo.\n\nDe acordo com a norma-padrão, as lacunas devem ser preenchidas, respectivamente, com:",
    "alternativas": [
      {
        "texto": "a um ... as ... à ... à",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "um ... à ... com a ... a",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "à um ... às ... pela ... a",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "um ... as ... com a ... à",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a um ... às ... à ... à",
        "correta": true,
        "porQue": "\"devido a um sistema\" (sem crase antes de artigo indefinido); \"às pessoas\" (a + as); \"acostumados à histórica concentração\" (regência de acostumado + artigo); \"aviso à população\" (a + a)."
      }
    ],
    "insight": "Classifique cada lacuna antes de olhar as alternativas: crase é proibida antes de artigo indefinido (\"a um\"), obrigatória na fusão a + a(s) (\"às\", \"à\"); elimine primeiro as sequências com uma lacuna proibida.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775136",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 11,
    "materia": "Matemática",
    "assunto": "Frações",
    "artigo": null,
    "enunciado": "Três funcionários de uma empresa foram destacados para realizar parte de um trabalho. Eles realizaram, respectivamente, [fração 1], [fração 2] e [fração 3] do total do trabalho, e a parte restante foi dividida igualmente entre dois funcionários. Dessa forma, coube a cada um dos dois últimos funcionários realizar uma fração total do trabalho igual a:\n\n[Nota do arquivo-fonte: as frações do enunciado e as das alternativas são imagens no PDF e não foram extraídas pela camada de texto. Sem elas a questão não pode ser resolvida a partir do texto.]",
    "alternativas": [
      {
        "texto": "[fração — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fração — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fração — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fração — não extraída]",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "[fração — não extraída]",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "As frações do enunciado e das alternativas são imagens no PDF e não foram extraídas — sem os valores não é possível calcular a parte restante nem casar a correta pelo texto. Gabarito oficial conhecido (letra C), mas não aplicado como correta porque a questão não é treinável nestas condições.",
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775137",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 12,
    "materia": "Matemática",
    "assunto": "Divisibilidade",
    "artigo": null,
    "enunciado": "Uma metalúrgica produziu X peças de um determinado produto, que pode ser embalado em caixas com capacidade de 10 ou 12 ou 15 dessas peças. Todas essas X peças foram embaladas em caixas de mesma capacidade e totalmente preenchidas. Se tivessem sido utilizadas caixas com capacidade de 10 peças, teriam sobrado 8; se tivessem sido utilizadas caixas com 15 peças, teriam sobrado 3. Decidiu-se, portanto, utilizar as caixas com capacidade de 12 peças, e não sobrou peça alguma fora das caixas. Sabendo que X é um número maior do que 300 e menor do que 400, é correto afirmar que o número de caixas que foram utilizadas é",
    "alternativas": [
      {
        "texto": "32.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "31.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "30.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "29.",
        "correta": true,
        "porQue": "X é múltiplo de 12 entre 300 e 400, deixa resto 8 na divisão por 10 e resto 3 na divisão por 15: X = 348; 348 ÷ 12 = 29 caixas."
      },
      {
        "texto": "28.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Liste os múltiplos de 12 no intervalo e teste os restos nas divisões por 10 e por 15; só um valor satisfaz as três condições ao mesmo tempo.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775138",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 13,
    "materia": "Matemática",
    "assunto": "Porcentagem Sucessiva",
    "artigo": null,
    "enunciado": "Em certo período de volatilidade na bolsa de valores, o valor de venda inicial de uma ação caiu 60% em um determinado dia, e repetiu o mesmo percentual de queda no dia seguinte. No terceiro dia, o valor de venda dessa ação subiu 400%. Após essa subida, o valor de venda dessa ação, comparado ao valor de venda inicial, ficou",
    "alternativas": [
      {
        "texto": "64% menor.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "36% menor.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "20% menor.",
        "correta": true,
        "porQue": "Após duas quedas de 60%: 100 × 0,40 × 0,40 = 16. Após a alta de 400%: 16 × 5 = 80, ou seja, 20% menor que o valor inicial."
      },
      {
        "texto": "80% maior.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "280% maior.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Não some as porcentagens: componha os fatores sobre o valor corrente a cada dia (× 0,40, × 0,40 e × 5,00) e compare o resultado final com o valor inicial.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775139",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 14,
    "materia": "Matemática",
    "assunto": "Sistema Linear",
    "artigo": null,
    "enunciado": "Fernando, Ricardo, Leila e Denise foram ao supermercado, e todos eles compraram uma ou mais unidades dos produtos X, Y e Z, conforme segue:\n\n- Fernando comprou 1 unidade de X, 2 unidades de Y e 1 unidade de Z e pagou R$ 33,50.\n- Ricardo comprou 1 unidade de X, 2 unidades de Y e 3 unidades de Z e pagou R$ 50,90.\n- Leila comprou 1 unidade de X, 5 unidades de Y e 2 unidades de Z e pagou R$ 60,95.\n- Denise comprou 1 unidade de X, 3 unidades de Y e 2 unidades de Z.\n\nQuanto Denise pagou a menos do que o Ricardo?",
    "alternativas": [
      {
        "texto": "R$ 2,15.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 2,45.",
        "correta": true,
        "porQue": "Das compras de Fernando e Ricardo, 2 unidades de Z custam R$ 17,40, logo Z = R$ 8,70; com Leila e Fernando, Y = R$ 6,25 e X = R$ 12,30. Denise pagou 12,30 + 3 × 6,25 + 2 × 8,70 = R$ 48,45, ou seja, R$ 2,45 a menos que os R$ 50,90 de Ricardo."
      },
      {
        "texto": "R$ 2,75.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 3,05.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "R$ 3,25.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Subtraia as equações duas a duas para isolar um preço por vez (primeiro Z, depois Y, depois X) e só então calcule o total de Denise.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775140",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 15,
    "materia": "Matemática",
    "assunto": "Razão e Proporção",
    "artigo": null,
    "enunciado": "Um prêmio, em dinheiro, foi repartido desigualmente entre duas pessoas, de modo que, a razão entre o menor valor e o maior valor foi 2/3. A pessoa que recebeu o menor valor doou, desigualmente, sua parte para seus dois filhos, de modo que, a razão entre o menor valor e o maior valor foi 3/5. Em relação ao valor inicial do prêmio, a fração recebida pelo filho que menos recebeu foi",
    "alternativas": [
      {
        "texto": "4/15.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "6/25.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "3/20.",
        "correta": true,
        "porQue": "Na razão 2/3, o menor valor é 2/5 do prêmio. Na doação, em razão 3/5, o filho que menos recebeu ficou com 3/8 dessa parte: 3/8 × 2/5 = 3/20 do prêmio inicial."
      },
      {
        "texto": "1/12.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "4/9.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Converta cada razão em fração do todo antes de multiplicar: a razão 2/3 significa 2/5 do total, e a razão 3/5 significa 3/8 da parte doada.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775141",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 16,
    "materia": "Matemática",
    "assunto": "Regra de Três Composta",
    "artigo": null,
    "enunciado": "Uma fábrica de peças automotivas aceitou um pedido para produzir 8.280 unidades de uma determinada peça. Durante 4 dias, 3 máquinas iguais, todas com a mesma produção por hora, funcionando 6 horas por dia, produziram 3.240 dessas peças. Para os dias seguintes, apenas 2 dessas máquinas, com a mesma produção por hora dos dias anteriores, estariam disponíveis e poderiam funcionar 8 horas por dia. No total, o pedido foi produzido com um número de dias trabalhados igual a",
    "alternativas": [
      {
        "texto": "7.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "8.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "9.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "10.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "11.",
        "correta": true,
        "porQue": "3 máquinas × 6 h/dia × 4 dias produziram 3.240 peças, ou seja, 45 peças por máquina-hora. Restam 5.040 peças; 2 máquinas × 8 h/dia produzem 720 por dia, logo 7 dias. Total: 4 + 7 = 11 dias."
      }
    ],
    "insight": "Calcule primeiro a produção por máquina-hora, depois a produção diária na segunda etapa e divida o restante por ela; some os dias das duas etapas.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775142",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 17,
    "materia": "Matemática",
    "assunto": "MMC",
    "artigo": null,
    "enunciado": "Quatro atletas de corridas longas treinam na mesma pista. O tempo que cada um dos atletas gasta para dar uma volta é: Jane: 4 minutos; Luciana: 5 minutos; Marcos: 2 minutos e Nelson: 3 minutos. Em um certo dia, os quatro atletas partem ao mesmo tempo e do mesmo lugar e realizam um treinamento de 2 horas e 1 minuto. Após o início do treinamento, foram X vezes que apenas Jane e Luciana coincidiram e cruzaram a linha de partida ao mesmo tempo e foram Y vezes que apenas Marcos e Nelson coincidiram e cruzaram a linha de partida ao mesmo tempo. É correto afirmar que X + Y é igual a",
    "alternativas": [
      {
        "texto": "18.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "20.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "22.",
        "correta": true,
        "porQue": "Jane e Luciana coincidem a cada MMC(4,5) = 20 min (6 vezes em 121 min); Marcos e Nelson, a cada MMC(2,3) = 6 min (20 vezes). Excluindo as 2 vezes em que os quatro coincidem juntos (60 e 120 min), X = 4 e Y = 18; X + Y = 22."
      },
      {
        "texto": "24.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "26.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Use o MMC de cada par para contar as coincidências e subtraia as vezes em que os quatro coincidem ao mesmo tempo — o comando pede apenas os pares isolados.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775143",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 18,
    "materia": "Matemática",
    "assunto": "Gráfico de Setores",
    "artigo": null,
    "enunciado": "O gerente dos vendedores de uma loja quer construir um gráfico de setores circulares que represente a quantidade de vendas dos cinco vendedores da loja, no mês anterior. A quantidade de vendas de cada vendedor foi: 160, 163, 169, 188 e 220. Construído corretamente o gráfico, pode-se afirmar como verdadeiro que a medida do ângulo do setor que representa a maior quantidade de vendas supera a medida do ângulo do setor que representa a menor quantidade de vendas em",
    "alternativas": [
      {
        "texto": "60º.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "48º.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "36º.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "24º.",
        "correta": true,
        "porQue": "Total de vendas = 900; o maior (220) corresponde a 220/900 × 360º = 88º e o menor (160) a 160/900 × 360º = 64º; a diferença é 24º."
      },
      {
        "texto": "12º.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Converta cada quantidade em ângulo pela proporção sobre o total (quantidade ÷ total × 360º) e subtraia o menor ângulo do maior.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775144",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 19,
    "materia": "Matemática",
    "assunto": "Média Aritmética",
    "artigo": null,
    "enunciado": "O relatório das horas trabalhadas por um funcionário avulso, na semana passada, foi o seguinte: 2a feira: 4 horas e 25 minutos. 3a feira: 3 horas e 40 minutos. 4a feira: 5 horas e 20 minutos. 5a feira: 2 horas e 50 minutos. 6a feira: 7 horas e 35 minutos. Esse funcionário trabalhou mais um dia, o sábado, cumprindo seis dias trabalhados, com uma média diária de 5 horas trabalhadas. No referido sábado, o funcionário trabalhou, exatamente,",
    "alternativas": [
      {
        "texto": "5 horas e 55 minutos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "6 horas e 10 minutos.",
        "correta": true,
        "porQue": "A soma de 2ª a 6ª feira é 23 h 50 min; para a média de 6 dias ser 5 h, o total deve ser 30 h, logo o sábado teve 30 h − 23 h 50 min = 6 h 10 min."
      },
      {
        "texto": "6 horas e 25 minutos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "6 horas e 50 minutos.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "7 horas e 05 minutos.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Some as horas dos cinco dias, multiplique a média desejada pelo número de dias para obter o total e subtraia a soma — não calcule a média dos cinco dias isoladamente.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775145",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 20,
    "materia": "Matemática",
    "assunto": "Geometria — Área",
    "artigo": null,
    "enunciado": "A figura a seguir, construída fora de escala, representa um terreno por meio do polígono ABCDE. Algumas medidas são conhecidas: AE = 50 m; BC = 90 m; CD = 120 m; DE = 50 m. Com essas informações, é correto afirmar que a área representada pelo polígono CDEF é menor do que a área representada pelo polígono ABFE em\n\n[Nota do arquivo-fonte: a figura (com as demais medidas e a posição do ponto F) é uma imagem no PDF e não foi extraída pela camada de texto. Sem ela a questão não pode ser resolvida a partir do texto.]",
    "alternativas": [
      {
        "texto": "32%.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "30%.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "28%.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "26%.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "24%.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "A figura do polígono ABCDE (demais medidas e posição do ponto F) é uma imagem no PDF e não foi extraída — sem ela não é possível calcular as áreas de CDEF e ABFE. Gabarito oficial conhecido (letra C), mas não aplicado como correta porque a questão não é treinável nestas condições.",
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775146",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 21,
    "materia": "Noções de Informática",
    "assunto": "MS-Windows 11",
    "artigo": null,
    "enunciado": "Na Área de Trabalho do MS-Windows 11, em sua configuração padrão, um usuário possui o seguinte arquivo:\n\nfile.exe\n\nEntão, o usuário selecionou o arquivo file.exe e pressionou F2. A ação resultante é",
    "alternativas": [
      {
        "texto": "o arquivo ser apagado e enviado para a Lixeira.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o arquivo ser apagado definitivamente, sem ir para a Lixeira.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "abrir a janela de propriedades do arquivo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o arquivo estar pronto para ser renomeado.",
        "correta": true,
        "porQue": "No Windows, F2 sobre um arquivo selecionado inicia a renomeação do arquivo."
      },
      {
        "texto": "executar o arquivo file.exe como programa executável.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Associe a tecla à sua função padrão no Windows antes de julgar as alternativas; a armadilha é o nome real de outra função (excluir, propriedades, executar).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775147",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 22,
    "materia": "Noções de Informática",
    "assunto": "MS-Word 2016 — Impressão",
    "artigo": null,
    "enunciado": "Em um documento de texto do MS-Word 2016, em sua configuração padrão, contendo as páginas de 1 a 9, um usuário entrou nas opções de Impressão, escolheu imprimir apenas as páginas pares e, no campo páginas, preencheu o seguinte:\n\n1;1-3;7-9\n\nO número de páginas impressas será",
    "alternativas": [
      {
        "texto": "1.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "2.",
        "correta": true,
        "porQue": "O intervalo \"1;1-3;7-9\" reúne as páginas 1, 2, 3, 7, 8 e 9; filtrando apenas as pares, restam as páginas 2 e 8 — 2 páginas impressas."
      },
      {
        "texto": "3.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "4.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "5.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Expanda primeiro o intervalo digitado em páginas individuais e aplique o filtro de páginas pares sobre essa lista — não some os intervalos nem conte as ímpares.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775148",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 23,
    "materia": "Noções de Informática",
    "assunto": "MS-Excel 2016 — Fórmulas",
    "artigo": null,
    "enunciado": "A planilha a seguir foi elaborada por meio do MS-Excel 2016, em sua configuração padrão. Assinale a alternativa que apresenta o valor retornado pela fórmula a seguir, após esta ser inserida na célula A8:\n\n=SE(MÉDIA(A2:B4);B1-1;MENOR(A5:B7;3)+1)\n\n[Nota do arquivo-fonte: os valores das células da planilha são uma imagem no PDF e não foram extraídos pela camada de texto. Sem eles a fórmula não pode ser avaliada a partir do texto.]",
    "alternativas": [
      {
        "texto": "1",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "2",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "3",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "4",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "5",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "",
    "status": "pendente",
    "motivoPendente": "Os valores das células da planilha são uma imagem no PDF e não foram extraídos — sem eles a fórmula =SE(MÉDIA(A2:B4);B1-1;MENOR(A5:B7;3)+1) não pode ser avaliada. Gabarito oficial conhecido (letra C), mas não aplicado como correta porque a questão não é treinável nestas condições.",
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775149",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 24,
    "materia": "Noções de Informática",
    "assunto": "MS-PowerPoint 2016 — Animações",
    "artigo": null,
    "enunciado": "Um usuário iniciou uma nova apresentação por meio do MS-PowerPoint 2016, em sua configuração padrão, escolheu o layout em branco e executou as seguintes operações, nessa ordem: 1. Inseriu uma Forma, do tipo Retângulo, dentro do slide. 2. Inseriu mais uma forma, do tipo Círculo, dentro do slide, à direita do Retângulo. 3. Inseriu mais uma forma, do tipo Triângulo, também dentro do slide, à direita do Círculo. 4. Em cada uma das formas, adicionou uma animação. 5. Pressionou F5 para iniciar o Modo de Apresentação e apenas o Círculo e o Triângulo são visíveis. 6. Pressionou Enter: as 3 formas ficaram visíveis. 7. Pressionou Enter: apenas o Retângulo e o Triângulo são visíveis. 8. Pressionou Enter: apenas o Retângulo e o Triângulo são visíveis, mas agora o Triângulo mudou de cor no mesmo lugar. 9. Pressionou Enter: apresentação encerrada. Após todas as ações descritas serem executadas, pode-se afirmar, corretamente, que as animações das formas Retângulo, Círculo e Triângulo são, respectivamente,",
    "alternativas": [
      {
        "texto": "de entrada; ênfase; de entrada.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "de saída; de trajetória; de entrada.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "de saída; de entrada; ênfase.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "de entrada; de saída; de trajetória.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "de entrada; de saída; ênfase.",
        "correta": true,
        "porQue": "Ao iniciar a apresentação só Círculo e Triângulo estão visíveis, logo o Retângulo tem animação de entrada; no passo seguinte o Círculo some, logo tem animação de saída; o Triângulo muda de cor no mesmo lugar, logo tem animação de ênfase."
      }
    ],
    "insight": "Reconstrua a sequência passo a passo: forma invisível no início indica animação de entrada, forma que some indica animação de saída, forma que muda sem sair do lugar indica animação de ênfase.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775150",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 25,
    "materia": "Noções de Informática",
    "assunto": "Gmail — Agenda",
    "artigo": null,
    "enunciado": "Um usuário recebeu um e-mail por intermédio do Gmail, em sua configuração padrão, e aproveitando a integração com o serviço de Agenda, na própria tela do e-mail criou um evento acionando o botão [lacuna] e, em seguida, escolhendo a opção [lacuna]. Assinale a alternativa que preenche, correta e respectivamente, as lacunas do enunciado.\n\n[Nota do arquivo-fonte: no PDF, as lacunas são os nomes do botão e da opção (ícones/texto da interface do Gmail); a extração de texto as deixou em branco.]",
    "alternativas": [
      {
        "texto": "Mais … Criar evento",
        "correta": true,
        "porQue": "No Gmail, o botão \"Mais\" abre as opções da mensagem, entre elas \"Criar evento\", que cria um evento na Agenda a partir do e-mail."
      },
      {
        "texto": "Evento … Criar novo",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Mais … Novo evento",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Novo … Evento",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Novo … Agenda",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Siga o fluxo da interface na ordem: primeiro o botão que abre o menu da mensagem, depois a opção que cria o evento; a armadilha é o nome real com a função trocada.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775151",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 26,
    "materia": "Direito Constitucional",
    "assunto": "Controle Difuso de Constitucionalidade — Reserva de Plenário",
    "artigo": "CF, art. 97",
    "enunciado": "A respeito do controle difuso de constitucionalidade, assinale a alternativa correta.",
    "alternativas": [
      {
        "texto": "Em função da presunção de constitucionalidade das leis, o magistrado só pode reconhecer a invalidade de uma norma caso provocado pelas partes ou pelo Ministério Público.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A cláusula de reserva de plenário se aplica para a declaração da constitucionalidade ou inconstitucionalidade de norma quando a questão for suscitada perante Tribunal.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Viola a cláusula de reserva de plenário a decisão de órgão fracionário de tribunal que afaste a incidência de lei, no todo ou em parte, ainda que não declare expressamente a sua inconstitucionalidade.",
        "correta": true,
        "porQue": "Viola a cláusula de reserva de plenário (CF, art. 97) a decisão de órgão fracionário que afasta a incidência de lei, no todo ou em parte, ainda que não declare expressamente a sua inconstitucionalidade (Súmula Vinculante 10 do STF)."
      },
      {
        "texto": "A cláusula de reserva de plenário, por estar prevista na Constituição Federal, deve ser observada pelos Tribunais de segundo grau, ainda que haja decisão do Plenário do Supremo Tribunal Federal sobre a matéria.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A inconstitucionalidade de lei, segundo súmula do Supremo Tribunal Federal, pode ser reconhecida em sede de mandado de segurança, de forma difusa e concentrada.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada tese contra o art. 97 da CF: a armadilha é o distrator que troca um elemento — o ator, o instrumento ou a existência da declaração de inconstitucionalidade.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775152",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 27,
    "materia": "Direito Constitucional",
    "assunto": "Processo Legislativo — Vício de Iniciativa",
    "artigo": "CF, art. 61, §1º, II, \"a\"",
    "enunciado": "A Câmara Municipal concedeu, por lei de iniciativa parlamentar, gratificação a categoria específica de servidores públicos vinculados ao Poder Executivo. Após a sanção tácita da proposição legislativa, o prefeito avalia não cumprir a lei, por entender que há vício de iniciativa, bem como que os impactos financeiros não foram avaliados pelo Poder Legislativo. Para solucionar o problema, o chefe do Poder Executivo convoca procuradores e analistas jurídicos para reunião.\n\nCom base na situação hipotética e na jurisprudência do Supremo Tribunal Federal, os analistas jurídicos presentes no encontro poderão afirmar corretamente que o prefeito",
    "alternativas": [
      {
        "texto": "deve questionar a lei judicialmente e cumprir o seu conteúdo, enquanto não houver pronunciamento judicial.",
        "correta": true,
        "porQue": "O vício de iniciativa (CF, art. 61, §1º, II, \"a\") não é suprido pela sanção, ainda que tácita, e o prefeito não pode suspender a lei por decreto; deve questionar a lei judicialmente e cumpri-la enquanto não houver pronunciamento judicial."
      },
      {
        "texto": "pode editar decreto para suspender os efeitos financeiros da lei, por não ser obrigado a cumprir ato legislativo inconstitucional.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deve reconhecer a validade da lei, por não haver reserva de iniciativa do Poder Executivo para esse tipo de matéria.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deve reconhecer a validade da lei, pois o vício de iniciativa da lei foi suprido pela sanção, ainda que tácita.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "pode ajuizar Ação Direta de Inconstitucionalidade, perante o Supremo Tribunal Federal, para que seja reconhecida a invalidade da norma.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Identifique primeiro o vício (iniciativa reservada ao Executivo) e depois elimine as condutas que o STF rejeita: sanção não convalida o vício e decreto não suspende lei; o caminho é o questionamento judicial com cumprimento provisório.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775153",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 28,
    "materia": "Direito Constitucional",
    "assunto": "Mandado de Segurança — Recurso Ordinário",
    "artigo": "CF, art. 105, II, \"b\"",
    "enunciado": "Considere que, no estado X, os mandados de segurança impetrados em função da prática de atos coatores pelo prefeito sejam de competência originária do Tribunal de Justiça. Em um caso concreto, após o acórdão ter denegado a segurança, a parte impetrante interpôs recurso especial, direcionado ao Superior Tribunal de Justiça.\n\nAberto prazo para contrarrazões, o analista jurídico responsável pela elaboração da minuta poderá concluir corretamente, com base na Constituição Federal, que o recurso",
    "alternativas": [
      {
        "texto": "está correto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "cabível era o ordinário.",
        "correta": true,
        "porQue": "Denegada a segurança pelo Tribunal de Justiça em competência originária, o recurso cabível é o recurso ordinário para o STJ (CF, art. 105, II, \"b\"), e não o recurso especial."
      },
      {
        "texto": "cabível era a ação rescisória.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "especial deveria ter sido direcionado ao Supremo Tribunal Federal.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "cabível era o de apelação, direcionado ao Superior Tribunal de Justiça, por ter sido a ação julgada de maneira originária pelo Tribunal de Justiça.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Pergunte qual é o recurso previsto na CF para a denegação de mandado de segurança decidido em única instância pelo Tribunal de Justiça; o distrator troca o recurso (especial, apelação, rescisória) mantendo o destinatário.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775154",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 29,
    "materia": "Direito Administrativo",
    "assunto": "TCU — Homologação de Aposentadorias",
    "artigo": "CF, art. 71, III",
    "enunciado": "A respeito da homologação de aposentadorias, com base na jurisprudência do Supremo Tribunal Federal, é correto afirmar que o Tribunal de Contas",
    "alternativas": [
      {
        "texto": "possui o prazo de 05 (cinco) anos para apreciar a legalidade do ato, a contar da chegada do processo no Tribunal.",
        "correta": true,
        "porQue": "Segundo a jurisprudência do STF, o Tribunal de Contas possui o prazo de 5 anos para apreciar a legalidade do ato de aposentadoria, a contar da chegada do processo no Tribunal (CF, art. 71, III)."
      },
      {
        "texto": "não possui prazo para apreciar a legalidade do ato, pois o ato de homologação de aposentadoria é complexo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deve conceder, ao fazer o controle de legalidade sobre o ato, a oportunidade prévia para o interessado se manifestar, em respeito ao princípio do contraditório e da ampla defesa.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "não aprecia legalidade do ato de concessão do benefício, pois a competência homologatória foi suprimida das atribuições das Cortes de Contas.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deve apreciar a legalidade do ato, inicialmente, até 05 (cinco) anos, sendo que, caso passado esse prazo, decida de maneira desfavorável ao interessado, deve observar o contraditório e a ampla defesa.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Foque no elemento que a VUNESP troca: o prazo e o seu termo inicial — compare cada alternativa com a tese do STF sobre o prazo de apreciação do ato de aposentadoria.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775155",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 30,
    "materia": "Direito Administrativo",
    "assunto": "Administração Indireta — Empresa Pública",
    "artigo": "DL 200/1967, art. 5º, III",
    "enunciado": "Uma empresa estatal cujo acionista majoritário é o município e cujas demais ações estão na propriedade de uma empresa estatal integrante da administração indireta do estado, bem como de uma fundação instituída pela União, pode ser corretamente considerada",
    "alternativas": [
      {
        "texto": "sociedade de economia mista.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "empresa pública.",
        "correta": true,
        "porQue": "Empresa pública é a entidade de direito privado cujo capital é integralmente público (DL 200/1967, art. 5º, III): aqui todos os acionistas são entes públicos (município, estatal estadual e fundação federal), sem participação privada — o que afasta a sociedade de economia mista."
      },
      {
        "texto": "consórcio público.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "comandita por ações.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "consórcio intergovernamental.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Verifique a composição do capital: havendo apenas acionistas públicos, não há sociedade de economia mista; a armadilha é confundir a natureza da entidade com a origem dos sócios.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775156",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 31,
    "materia": "Direito Administrativo",
    "assunto": "Consórcio Público",
    "artigo": "Lei 11.107/2005, art. 5º",
    "enunciado": "O contrato de consórcio público",
    "alternativas": [
      {
        "texto": "será celebrado com a ratificação, mediante decreto do chefe do Poder Executivo, do protocolo de intenções.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá, salvo cláusula impeditiva, ser celebrado por apenas 01 (uma) parcela dos entes da Federação que subscreveram o protocolo de intenções.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá ser ratificado com reserva que, independentemente do aceite dos demais entes subscritores, implicará consorciamento parcial ou condicional.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "dependerá de homologação da assembleia geral do consórcio público se ratificado após 01 (um) ano da subscrição do protocolo de intenções.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "dispensará ratificação para o ente da Federação que, antes de subscrever o protocolo de intenções, disciplinou por lei a sua participação no consórcio público.",
        "correta": true,
        "porQue": "A Lei 11.107/2005, art. 5º, dispensa a ratificação para o ente da Federação que, antes de subscrever o protocolo de intenções, disciplinou por lei a sua participação no consórcio público."
      }
    ],
    "insight": "Leia cada tese confrontando-a com o texto da Lei 11.107/2005, art. 5º: a VUNESP troca um elemento por tese — o instrumento da ratificação, a condição ou o prazo.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775158",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 33,
    "materia": "Direito Administrativo",
    "assunto": "Concursos Públicos — Jurisprudência do STF",
    "artigo": null,
    "enunciado": "Tendo em vista a jurisprudência do Supremo Tribunal Federal sobre os concursos públicos, pode-se afirmar corretamente:",
    "alternativas": [
      {
        "texto": "editais de concurso público podem estabelecer restrição a pessoas com tatuagem em locais visíveis no corpo, independentemente da sua dimensão e do seu conteúdo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "o candidato aprovado em concurso público, mesmo dentro do número de vagas previstas no edital, não possui direito subjetivo à nomeação.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "é vedada a remarcação do teste de aptidão física de candidata aprovada nas provas escritas que esteja grávida à época de sua realização, salvo previsão expressa em edital do concurso público.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "é inconstitucional a regra inserida no edital de concurso público, denominada cláusula de barreira, com o intuito de selecionar apenas os candidatos mais bem classificados para prosseguir no certame.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "sem previsão constitucionalmente adequada e instituída por lei, não é legítima a cláusula de edital de concurso público que restrinja a participação de candidato pelo simples fato de responder a inquérito ou ação penal.",
        "correta": true,
        "porQue": "Segundo a jurisprudência do STF, sem previsão constitucionalmente adequada e instituída por lei, não é legítima a cláusula de edital que restrinja a participação de candidato pelo simples fato de responder a inquérito ou ação penal."
      }
    ],
    "insight": "Julga cada tese pela jurisprudência do STF, não pela plausibilidade: cada distrator inverte uma tese firmada (tatuagem, direito à nomeação, remarcação do teste físico, cláusula de barreira).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775159",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 34,
    "materia": "Direito Administrativo",
    "assunto": "Desapropriação — Bem Público Dominical",
    "artigo": "DL 3.365/1941, art. 2º, §2º",
    "enunciado": "O estado da Federação pretende realizar a construção de uma rodovia e, para tanto, necessita desapropriar uma grande área. Dentro desta, encontra-se um bem dominical de propriedade do município de Paulínia, que concorda com o uso da sua propriedade para a construção da rodovia.\n\nPode-se afirmar corretamente que o bem público dominical de propriedade do município de Paulínia",
    "alternativas": [
      {
        "texto": "não poderá ser desapropriado, tendo em vista a existência de vedação legal, cabendo ao estado obter a propriedade por meio de compra e venda.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá ser desapropriado, mediante acordo entre estado e município, no qual serão fixadas as respectivas responsabilidades financeiras quanto ao pagamento das indenizações correspondentes, dispensada autorização legislativa.",
        "correta": true,
        "porQue": "O DL 3.365/1941, art. 2º, §2º, admite a desapropriação de bem público de ente federativo por outro, mediante acordo que fixe as responsabilidades financeiras quanto às indenizações, dispensada autorização legislativa."
      },
      {
        "texto": "somente poderá ser desapropriado judicialmente desde que mediante autorização legislativa do Estado expropriante e do município expropriado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá ser desapropriado amigavelmente, desde que mediante autorização legislativa, devendo o acordo prever as respectivas responsabilidades financeiras quanto ao pagamento das indenizações correspondentes.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá ser utilizado para a construção da rodovia, sem necessidade de desapropriação ou pagamento de indenização, tendo em vista o princípio do federalismo cooperativo e a competência concorrente para a implantação de infraestrutura de transportes rodoviários.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Identifique o requisito que a lei exige e o que ela dispensa: o distrator troca \"mediante acordo\" por \"mediante autorização legislativa\" ou elimina a indenização.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775164",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 39,
    "materia": "Direito Processual Civil",
    "assunto": "Tutela da Evidência",
    "artigo": "CPC, art. 311, I",
    "enunciado": "Celso propôs ação de obrigação de fazer contra operadora de plano de saúde para custear seu tratamento médico. A ação foi julgada procedente em 1º grau e confirmada em 2º grau. A operadora de plano de saúde, buscando ganhar tempo, interpõe embargos de declaração repetindo teses rejeitadas apenas para atrasar o cumprimento da sentença.\n\nDiante da situação hipotética, considerando o disposto no Código de Processo Civil, é correto afirmar que Celso poderá se valer de tutela",
    "alternativas": [
      {
        "texto": "da evidência, sendo desnecessário demonstrar perigo de dano ou de risco ao resultado útil do processo.",
        "correta": true,
        "porQue": "A tutela da evidência (CPC, art. 311, I) é cabível quando caracterizado o abuso do direito de defesa ou o manifesto propósito protelatório da parte, sendo desnecessário demonstrar perigo de dano ou risco ao resultado útil do processo."
      },
      {
        "texto": "provisória, requerida em caráter incidental, mediante o pagamento das custas, caso não reste demonstrada a sua hipossuficiência.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "de urgência, sendo necessária a caução real ou fidejussória idônea para ressarcir eventuais danos da operadora de plano de saúde.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "cautelar, requerida em caráter incidental, sendo a operadora de plano de saúde citada para contestar o pedido e indicar provas que pretende produzir no prazo de 15 (quinze) dias.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "antecipada, requerida em caráter incidental, que, se for julgada procedente, fará coisa julgada.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Identifique o fato que dispara a tutela no caso (embargos repetindo teses rejeitadas só para atrasar = propósito protelatório) e pergunte qual tutela dispensa a demonstração de perigo de dano.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775165",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 40,
    "materia": "Direito Processual Civil",
    "assunto": "Petição Inicial — Advogado em Causa Própria",
    "artigo": "CPC, art. 106",
    "enunciado": "Miriam, advogando em causa própria, propõe ação de indenização por danos materiais contra Marcelo, que colidiu com o seu carro. Na petição inicial, ela indicou o juízo, os dados pessoais de Marcelo, fato e fundamento jurídico do pedido, o pedido com suas especificações, o valor da causa e as provas que pretende produzir.\n\nNo entanto, Miriam esqueceu-se de declarar na petição inicial o seu número de inscrição na OAB e o nome da sociedade de advogados da qual participa, para o recebimento de intimações.\n\nDiante da situação hipotética, considerando o disposto no Código de Processo Civil, assinale a alternativa correta.",
    "alternativas": [
      {
        "texto": "A petição inicial será indeferida de plano.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Miriam terá o prazo de 5 (cinco) dias para suprir a omissão das informações, sob pena de indeferimento da petição.",
        "correta": true,
        "porQue": "O CPC, art. 106, prevê que o advogado em causa própria deve indicar o número de inscrição na OAB e o nome da sociedade de advogados, e que, omitidas essas informações, terá o prazo de 5 dias para supri-las, sob pena de indeferimento da petição."
      },
      {
        "texto": "O juiz proferirá um despacho genérico requerendo que Miriam emende a inicial no prazo de 15 (quinze) dias.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A petição inicial será considerada inepta, podendo Miriam interpor apelação, sendo facultado ao juiz se retratar no prazo de 15 (quinze) dias.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Caso Miriam não supra a omissão no prazo legal, o juiz indeferirá a petição inicial, sendo cabível agravo de instrumento contra essa decisão.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Localize a omissão (número da OAB e sociedade de advogados) e pergunte qual é a consequência prevista no CPC: o distrator troca o prazo (5 por 15 dias) ou a consequência (indeferimento de plano, inépcia).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775166",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 41,
    "materia": "Direito Processual Civil",
    "assunto": "Prova Testemunhal",
    "artigo": "CPC, art. 447, §4º",
    "enunciado": "Natanael foi induzido por Ricardo a assinar um contrato de compra e venda de imóvel, após ser convencido de que se tratava apenas de autorização para avaliação da sua própria casa. Verificado o vício no contrato, Natanael propõe ação contra Ricardo, que, citado, oferece contestação e apresenta como testemunha seu primo, Roberto, de 15 anos de idade, sendo o depoimento deste necessário.\n\nDiante da situação hipotética, considerando o disposto no Código de Processo Civil, é correto afirmar que Roberto",
    "alternativas": [
      {
        "texto": "deverá prestar depoimento mediante compromisso e o juiz lhe atribuirá o valor que possa merecer.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deverá, em regra, por ser incapaz, ser ouvido em seu domicílio, se este for divergente da sede do juízo.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "poderá prestar depoimento mediante compromisso e na presença de um representante legal.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "deverá depor ainda que sobre fato que acarrete dano ao seu primo, Ricardo.",
        "correta": true,
        "porQue": "O CPC, art. 447, §4º (com o art. 448), prevê que a testemunha menor de 16 anos depõe sem compromisso, mas deve depor ainda que sobre fato que possa acarretar dano ao parente — a exceção afasta a escusa de depor."
      },
      {
        "texto": "não poderá depor, uma vez que não se admite prova testemunhal para os casos de vícios de consentimento nos contratos em geral.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Separe os elementos da testemunha (15 anos, primo da parte, depoimento necessário) e teste cada regra do CPC sobre ela: compromisso, local do depoimento e escusa de depor são elementos distintos — a armadilha troca um deles.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775167",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 42,
    "materia": "Direito Processual Civil",
    "assunto": "Coisa Julgada",
    "artigo": "CPC, arts. 502 e 505",
    "enunciado": "Cláudia ajuíza ação de alimentos em favor de seu filho, João, de cinco anos, pleiteando pensão de 05 (cinco) salários mínimos mensais. Na sentença, o juiz julga parcialmente procedente o pedido, fixando os alimentos definitivos em 03 (três) salários mínimos, mas deixa para fase de liquidação a definição sobre as despesas extraordinárias de saúde e educação, por dependerem de comprovação futura.\n\nDiante da situação hipotética, considerando o disposto no Código de Processo Civil, é correto afirmar que a sentença",
    "alternativas": [
      {
        "texto": "não faz coisa julgada, uma vez que se trata de relação jurídica de trato continuado.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "faz coisa julgada entre as partes, podendo, eventualmente, prejudicar terceiros.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "não faz coisa julgada, uma vez que a decisão do juiz julgou apenas parcialmente o mérito.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "faz coisa julgada, incluindo-se como coisa julgada a verdade dos fatos, desde que estabelecida como fundamento da sentença.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "faz coisa julgada, podendo a questão ser novamente decidida caso sobrevenha modificação no estado de fato ou de direito.",
        "correta": true,
        "porQue": "A sentença faz coisa julgada (CPC, arts. 502 e 505): nas relações de trato continuado, sobrevindo modificação no estado de fato ou de direito, a questão pode ser novamente decidida."
      }
    ],
    "insight": "Separe as duas perguntas: a sentença faz ou não faz coisa julgada, e por qual motivo — o par \"faz/não faz\" com um motivo plausível é a armadilha; confira o motivo no art. 505 do CPC.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775168",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 43,
    "materia": "Direito Processual Civil",
    "assunto": "Agravo Interno",
    "artigo": "CPC, art. 1.021",
    "enunciado": "Contra decisão proferida pelo relator, caberá agravo interno para o respectivo órgão colegiado, observadas, quanto ao processamento, as regras do regimento interno do tribunal.\n\nAcerca do tema, assinale a alternativa correta.",
    "alternativas": [
      {
        "texto": "Na petição de agravo interno, o recorrente deverá impugnar, ainda que de forma genérica, todos fundamentos da decisão agravada.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "O agravo será dirigido ao relator, que terá o prazo de 05 (cinco) dias para se retratar.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "É vedado ao relator limitar-se à reprodução dos fundamentos da decisão agravada para julgar improcedente o agravo interno.",
        "correta": true,
        "porQue": "O CPC, art. 1.021, §3º, veda ao relator limitar-se à reprodução dos fundamentos da decisão agravada para julgar improcedente o agravo interno."
      },
      {
        "texto": "Quando o agravo interno for declarado manifestamente inadmissível ou improcedente em votação unânime, o órgão colegiado, em decisão fundamentada, condenará o agravante a pagar ao agravado multa fixada entre cinco e dez por cento do valor atualizado da causa.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Eventual multa para o caso de improcedência unânime será paga ao final do processo.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada tese contra o art. 1.021 do CPC, elemento por elemento: quem julga, prazo de retratação, forma da impugnação, percentual e momento da multa — a VUNESP troca um número ou um destinatário por tese.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775173",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 48,
    "materia": "Direito Civil",
    "assunto": "Posse e Detenção",
    "artigo": "CC, arts. 1.196, 1.198 e 1.210, §1º",
    "enunciado": "A respeito da posse e da detenção, assinale a alternativa correta.",
    "alternativas": [
      {
        "texto": "Posse e detenção são institutos jurídicos diferentes, mas têm uma característica em comum: a ambos se reconhece a possibilidade de adquirir a propriedade da coisa por meio da usucapião.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Apesar de o detentor não ter direito aos interditos possessórios, ele pode utilizar o desforço imediato em nome do possuidor.",
        "correta": true,
        "porQue": "O detentor não tem direito aos interditos possessórios, mas pode utilizar o desforço imediato em nome do possuidor (CC, arts. 1.196, 1.198 e 1.210, §1º)."
      },
      {
        "texto": "Não é possível a conversão da detenção em posse, ainda que rompida a subordinação, em face da inalterabilidade da natureza jurídica do instituto.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A posse não se constitui como direito autônomo em relação à propriedade, de forma que o possuidor não tem direito a conservá-la contra a vontade do proprietário do bem.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Predomina na doutrina que a teoria formulada por Savigny foi acolhida pelo ordenamento jurídico pátrio.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Compare posse e detenção instituto por instituto (usucapião, interditos, desforço, conversão): cada distrator atribui ao detentor um direito que é só do possuidor, ou nega um que ele tem.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3775175",
    "prova": "VUNESP — Paulínia Analista de Procuradoria",
    "ano": 2025,
    "numero": 50,
    "materia": "Direito Civil",
    "assunto": "Direito das Obrigações",
    "artigo": "CC, arts. 252, 253, 265, 295, 296 e 1.437",
    "enunciado": "A respeito do Direito das Obrigações, assinale a alternativa que está de acordo com o disposto no Código Civil.",
    "alternativas": [
      {
        "texto": "Nas obrigações alternativas, a escolha cabe ao credor, se outra coisa não se estipulou expressamente no negócio jurídico.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Em sede de obrigações alternativas, se todas as prestações se tornarem impossíveis sem culpa do devedor, a obrigação será extinta.",
        "correta": true,
        "porQue": "Em sede de obrigações alternativas, se todas as prestações se tornarem impossíveis sem culpa do devedor, a obrigação será extinta (CC, art. 253)."
      },
      {
        "texto": "A solidariedade não se presume e, diante da sua natureza jurídica, é considerada sob o plano da unicidade, de forma que deve ser pura para todos os cocredores ou codevedores.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "Em face do princípio da proteção da confiança, salvo estipulação em contrário, o cedente responde pela solvência do devedor.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "A restituição voluntária do objeto empenhado prova a renúncia do credor à garantia real e a extinção da dívida.",
        "correta": false,
        "porQue": null
      }
    ],
    "insight": "Teste cada tese contra o artigo correspondente do CC (escolha nas alternativas, solidariedade, cessão, penhor): a armadilha troca o titular da escolha, o sujeito que responde ou a consequência prevista.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP (portal da Prefeitura de Paulínia, item 17, 16/12/2025)"
  },
  {
    "id": "Q3782840",
    "prova": "VUNESP — CREF-4 Agente de Fiscalização",
    "ano": 2025,
    "numero": 36,
    "materia": "Direito Constitucional",
    "assunto": "Responsabilidade objetiva",
    "artigo": "CF, art. 37, §6º",
    "enunciado": "Considere que a Sociedade de Economia Mista Mais Água, pessoa jurídica de direito privado, presta o serviço público de tratamento e fornecimento de água no Município ABC. Na última segunda-feira, imbuído do desejo de prejudicar seu chefe imediato, Gabriel, empregado público responsável pela adição de cloro na água, despejou uma quantidade além da indicada, o que ocasionou problemas de saúde em diversos munícipes.\n\nCom base na situação hipotética apresentada e no disposto na Constituição Federal, é correto afirmar que...",
    "alternativas": [
      {
        "texto": "como é possível identificar o agente responsável pela conduta, Gabriel deverá ser imediatamente responsabilizado pelos danos causados.",
        "correta": false,
        "porQue": "A responsabilidade direta pelos danos é da entidade prestadora do serviço público (CF, art. 37, §6º); Gabriel responde apenas em regresso, depois, se verificado dolo ou culpa. Identificar o agente não transfere a ele a responsabilidade direta e imediata."
      },
      {
        "texto": "a Sociedade de Economia Mista Mais Água só será a responsável direta pela reparação dos danos se o Município ABC for detentor de mais de cinquenta por cento de seu capital.",
        "correta": false,
        "porQue": "O art. 37, §6º, da CF não condiciona a responsabilidade objetiva da prestadora de serviço público a nenhum percentual de participação societária do Município; a condição de 'mais de cinquenta por cento' é um elemento inventado/trocado."
      },
      {
        "texto": "a Sociedade de Economia Mista Mais Água responderá pelos danos provocados por Gabriel, assegurado o direito de regresso contra ele se verificado o dolo ou a culpa.",
        "correta": true,
        "porQue": "É o teor do art. 37, §6º, da CF: a pessoa jurídica de direito privado prestadora de serviço público responde objetivamente pelos danos que seus agentes causarem a terceiros, assegurado o direito de regresso contra o agente nos casos de dolo ou culpa."
      },
      {
        "texto": "Gabriel só será responsabilizado se comprovado que agiu com dolo.",
        "correta": false,
        "porQue": "O direito de regresso contra o agente exige dolo ou culpa; limitar a responsabilização ao dolo exclui a culpa, que também autoriza o regresso."
      },
      {
        "texto": "a Sociedade de Economia Mista Mais Água só será a responsável direta pela reparação dos danos se o Município ABC for detentor de pelo menos vinte e cinco por cento de seu capital.",
        "correta": false,
        "porQue": "O art. 37, §6º, da CF não condiciona a responsabilidade objetiva da prestadora de serviço público a nenhum percentual de participação societária do Município; é o mesmo elemento inventado da outra alternativa, com o número trocado (vinte e cinco por cento em vez de cinquenta por cento) — a troca de um único número, armadilha típica da VUNESP."
      }
    ],
    "insight": "O comando é 'com base na situação hipotética e no disposto na Constituição Federal, é correto afirmar que...': a norma está nas alternativas, não no enunciado. Elimine primeiro as alternativas que condicionam a responsabilidade a um percentual de capital ou que colocam o agente como responsável direto e imediato; depois compare 'dolo' com 'dolo ou culpa' no regresso — a VUNESP troca um único elemento (ator, condição ou dolo/culpa) na alternativa que, de resto, parece correta.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (preliminar, Edital 16/12/2025; definitivo não conferido para estas questões)"
  },
  {
    "id": "Q3782850",
    "prova": "VUNESP — CREF-4 Agente de Fiscalização",
    "ano": 2025,
    "numero": 46,
    "materia": "Direito Digital / LGPD",
    "assunto": "Sanções administrativas — LGPD",
    "artigo": null,
    "enunciado": "Considere que Josias é agente de tratamento de dados e, em razão de infrações cometidas à Lei Geral de Proteção de Dados Pessoais (LGPD), foi sancionado pela autoridade nacional com a suspensão do exercício da atividade de tratamento dos dados pessoais pelo período de 6 (seis) meses, que foi prorrogado uma vez por igual período.\n\nCom base na situação hipotética apresentada e no disposto na Lei Geral de Proteção de Dados Pessoais, é correto afirmar que...",
    "alternativas": [
      {
        "texto": "o prazo da sanção aplicada está de acordo com o disposto na LGPD.",
        "correta": true,
        "porQue": "O prazo aplicado — 6 (seis) meses, prorrogado uma vez por igual período — é exatamente o prazo do caso descrito no enunciado, e o gabarito oficial confirma que ele está de acordo com a LGPD; nenhum elemento do caso (sanção, prazo ou prorrogação) foi alterado."
      },
      {
        "texto": "a sanção deve ser anulada, pois a autoridade nacional não tem competência para aplicar tal pena.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a sanção foi aplicada indevidamente, pois tal penalidade é direcionada ao encarregado e não ao agente de tratamento.",
        "correta": false,
        "porQue": "Josias é o agente de tratamento de dados no enunciado, e a sanção atinge o agente de tratamento; trocar o alvo da sanção para o encarregado é a armadilha documentada no relatório de padrões (troca do alvo)."
      },
      {
        "texto": "a sanção só estará de acordo com a legalidade se Josias já tiver sido apenado com advertência antes.",
        "correta": false,
        "porQue": null
      },
      {
        "texto": "a sanção deve ser anulada, pois ela não está prevista expressamente na LGPD.",
        "correta": false,
        "porQue": "A suspensão do exercício da atividade de tratamento é sanção prevista na LGPD — é o que confirma a alternativa correta, segundo a qual o prazo aplicado está de acordo com a lei; a sanção não é inexistente na lei."
      }
    ],
    "insight": "O comando pede a conformidade da sanção com a LGPD. Compare cada alternativa com os fatos do enunciado (quem foi sancionado, por quem, qual sanção, qual prazo): elimine primeiro as que trocam o alvo da sanção, negam a competência da autoridade nacional ou inventam um requisito prévio ou a inexistência da sanção na lei; a certa é a que mantém todos os elementos do caso sem trocar nenhum.",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (preliminar, Edital 16/12/2025; definitivo não conferido para estas questões)"
  },
  {
    "id": "Q3782851",
    "prova": "VUNESP — CREF-4 Agente de Fiscalização",
    "ano": 2025,
    "numero": 47,
    "materia": "Direito Penal",
    "assunto": "Exercício ilegal de profissão",
    "artigo": "DL 3.688/1941, art. 47",
    "enunciado": "Considere que Alexandre desde a adolescência pratica atividade física com regularidade, o que o faz acreditar ter os conhecimentos necessários para atuar na profissão de educador físico, mesmo sem ter ensino superior. Assim, munido de dolo, resolveu começar a oferecer o serviço de personal trainer e logo angariou uma vasta clientela.\n\nCom base na situação hipotética apresentada e no disposto na Lei de Contravenções Penais, é correto afirmar que Alexandre...",
    "alternativas": [
      {
        "texto": "estará sujeito exclusivamente à pena de multa, caso tenha até dez alunos.",
        "correta": false,
        "porQue": "A pena do art. 47 do DL 3.688/1941 é prisão simples ou multa, não exclusivamente multa; além disso, o dispositivo não cria limite de alunos — 'até dez alunos' é um número inventado/trocado."
      },
      {
        "texto": "pode ser apenado com prisão simples ou multa.",
        "correta": true,
        "porQue": "É a pena prevista no art. 47 do DL 3.688/1941 para o exercício ilegal de profissão: prisão simples ou multa."
      },
      {
        "texto": "não cometeu crime e nem contravenção penal, pois ele já era praticante de atividade física.",
        "correta": false,
        "porQue": "Ser praticante de atividade física não habilita para a profissão de educador físico; o enunciado traz os elementos da contravenção — ausência de ensino superior, dolo e oferta do serviço a uma vasta clientela."
      },
      {
        "texto": "deve ser apenado apenas com prisão simples.",
        "correta": false,
        "porQue": "A pena do art. 47 do DL 3.688/1941 é prisão simples ou multa; 'apenas com prisão simples' exclui a multa, que é uma das duas penas previstas."
      },
      {
        "texto": "estará sujeito exclusivamente à pena de multa, caso tenha até vinte alunos.",
        "correta": false,
        "porQue": "A pena do art. 47 do DL 3.688/1941 é prisão simples ou multa, não exclusivamente multa; além disso, o dispositivo não cria limite de alunos — 'até vinte alunos' é o mesmo número inventado da outra alternativa, trocado (vinte em vez de dez)."
      }
    ],
    "insight": "Minicaso + 'é correto afirmar que Alexandre...': a norma está nas alternativas. Elimine primeiro as alternativas que criam um limite de alunos — número trocado é a armadilha clássica da VUNESP — e as que reduzem a pena a uma só modalidade; depois separe 'não cometeu nada' (o enunciado traz dolo e ausência de formação) de 'pode ser apenado com...': a banca troca a pena (multa apenas, prisão simples apenas, ou prisão simples ou multa).",
    "status": "treinavel",
    "motivoPendente": null,
    "gabaritoFonte": "Gabarito oficial VUNESP, Versão 1 (preliminar, Edital 16/12/2025; definitivo não conferido para estas questões)"
  }
];

/** Só as questões com enunciado + 5 alternativas + gabarito verificados. */
export function questoesTreinaveis(): QuestaoCadernoMuse[] {
  return QUESTOES_CADERNO_MUSE.filter((q) => q.status === "treinavel");
}

/** Questões do catálogo que ainda não podem treinar, com o motivo. */
export function questoesPendentes(): QuestaoCadernoMuse[] {
  return QUESTOES_CADERNO_MUSE.filter((q) => q.status === "pendente");
}

/** Treináveis de uma matéria (nome exato, como em `materia`). */
export function questoesPorMateria(materia: string): QuestaoCadernoMuse[] {
  return questoesTreinaveis().filter((q) => q.materia === materia);
}

/** Matérias com ao menos uma questão treinável, na ordem em que aparecem. */
export function materiasComTreino(): string[] {
  const vistas = new Set<string>();
  for (const q of questoesTreinaveis()) {
    if (!vistas.has(q.materia)) vistas.add(q.materia);
  }
  return [...vistas];
}

/**
 * Embaralha as alternativas de lugar e reatribui as letras, mantendo o
 * `correta` e o `porQue` em cada alternativa. Mesmo modelo do Treino de
 * Crase: repetir a questão com outra ordem impede decorar a letra.
 */
export function embaralharAlternativasCadernoMuse(
  questao: QuestaoCadernoMuse,
): { letra: string; texto: string; correta: boolean; porQue: string | null }[] {
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
export function repetirQuestaoCadernoMuse(questao: QuestaoCadernoMuse): {
  questao: QuestaoCadernoMuse;
  alternativasEmbaralhadas: ReturnType<typeof embaralharAlternativasCadernoMuse>;
} {
  return { questao, alternativasEmbaralhadas: embaralharAlternativasCadernoMuse(questao) };
}
