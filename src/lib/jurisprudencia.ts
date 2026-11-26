/**
 * Jurisprudência do STF vinculada às leis do edital — cada julgamento
 * ligado aos artigos que interpreta, com a tese exata do STF.
 *
 * Fonte das teses: workspace/research_notes/stf-julgamentos-improbidade-8429-20261126-2220/report.md
 * (teses conferidas no portal do STF em 26/11/2026). Nada aqui é estimado:
 * só entram teses conferidas na fonte oficial. Por enquanto só a Lei
 * nº 8.429/1992 tem entradas; a estrutura é por lei para crescer depois.
 */

export type StatusJulgamento = "decidido" | "pendente";

export type JulgamentoSTF = {
  /** Referência do processo, ex.: "ARE 843.989/PR". */
  referencia: string;
  /** Tema de repercussão geral, quando houver, ex.: "Tema 1199". */
  tema?: string;
  tipo: "Tema de repercussão geral" | "Controle concentrado" | "Súmula Vinculante";
  /** Data do julgamento (Plenário), ex.: "18/08/2022". */
  data: string;
  /** Tese exata do STF — palavra por palavra. Julgamento pendente traz
   * "Sem tese fixada" em vez de tese. */
  tese: string;
  /** Artigos da lei que o julgamento interpreta (só os dígitos iniciais:
   * "17-B" vira 17, "21, § 4º" vira 21). Vazio quando não interpreta
   * nenhum artigo da lei diretamente — aí vale o campo `contraste`. */
  artigos: number[];
  /** Por que o julgamento entra mesmo sem interpretar artigo da lei. */
  contraste?: string;
  /** A frase "Na prática" do relatório — uma frase, em português claro. */
  notaPratica: string;
  /** URL da fonte (portal do STF quando houver). */
  fonte?: string;
  status: StatusJulgamento;
  /** Detalhe extra, ex.: trânsito em julgado, placar, pendência. */
  observacao?: string;
};

export const JURISPRUDENCIA_POR_LEI: Record<string, JulgamentoSTF[]> = {
  "Lei nº 8.429/1992 (Improbidade Administrativa)": [
    {
      referencia: "ARE 843.989/PR",
      tema: "Tema 1199",
      tipo: "Tema de repercussão geral",
      data: "18/08/2022",
      tese: "1) É necessária a comprovação de responsabilidade subjetiva para a tipificação dos atos de improbidade administrativa, exigindo-se - nos artigos 9º, 10 e 11 da LIA - a presença do elemento subjetivo - DOLO; 2) A norma benéfica da Lei 14.230/2021 - revogação da modalidade culposa do ato de improbidade administrativa -, é IRRETROATIVA, em virtude do artigo 5º, inciso XXXVI, da Constituição Federal, não tendo incidência em relação à eficácia da coisa julgada; nem tampouco durante o processo de execução das penas e seus incidentes; 3) A nova Lei 14.230/2021 aplica-se aos atos de improbidade administrativa culposos praticados na vigência do texto anterior da lei, porém sem condenação transitada em julgado, em virtude da revogação expressa do texto anterior; devendo o juízo competente analisar eventual dolo por parte do agente; 4) O novo regime prescricional previsto na Lei 14.230/2021 é IRRETROATIVO, aplicando-se os novos marcos temporais a partir da publicação da lei.",
      artigos: [1, 9, 10, 11, 23],
      notaPratica:
        "Só há improbidade com dolo, e a extinção da culpa só livra quem ainda não tinha condenação transitada em julgado, mas o novo prazo de prescrição não volta no tempo.",
      fonte:
        "https://portal.stf.jus.br/jurisprudenciaRepercussao/verAndamentoProcesso.asp?incidente=4652910&numeroProcesso=843989&classeProcesso=ARE&numeroTema=1199",
      status: "decidido",
      observacao: "Trânsito em julgado em 16/02/2023.",
    },
    {
      referencia: "RE 852.475/SP",
      tema: "Tema 897",
      tipo: "Tema de repercussão geral",
      data: "08/08/2018",
      tese: "São imprescritíveis as ações de ressarcimento ao erário fundadas na prática de ato doloso tipificado na Lei de Improbidade Administrativa.",
      artigos: [9, 10, 11, 12, 23],
      notaPratica:
        "O dinheiro desviado por ato ímprobo doloso pode ser cobrado para sempre, mesmo que as outras punições já tenham prescrito.",
      status: "decidido",
      observacao: "Julgado por 6 votos a 5; trânsito em julgado em 06/12/2019.",
    },
    {
      referencia: "RE 669.069/MG",
      tema: "Tema 666",
      tipo: "Tema de repercussão geral",
      data: "03/02/2016",
      tese: "É prescritível a ação de reparação de danos à Fazenda Pública decorrente de ilícito civil.",
      artigos: [],
      contraste:
        "Não interpreta nenhum artigo da Lei 8.429/1992 diretamente — o caso era um acidente de trânsito (ilícito civil) e o STF ressalvou que a tese não alcança atos de improbidade; entra por contraste com o Tema 897 (art. 37, § 5º, da CF).",
      notaPratica:
        "Fora da improbidade dolosa, o ressarcimento ao erário prescreve como regra — só o dano de ato ímprobo doloso escapa da prescrição.",
      status: "decidido",
      observacao: "Trânsito em julgado em 31/08/2016.",
    },
    {
      referencia: "RE 976.566/PA",
      tema: "Tema 576",
      tipo: "Tema de repercussão geral",
      data: "13/09/2019",
      tese: "O processo e julgamento de prefeito municipal por crime de responsabilidade (Decreto-lei 201/67) não impede sua responsabilização por atos de improbidade administrativa previstos na Lei 8.429/1992, em virtude da autonomia das instâncias.",
      artigos: [2, 3, 9, 10, 11],
      notaPratica:
        "Prefeito (e, por extensão, agente político) pode responder ao mesmo tempo por crime de responsabilidade e por improbidade, sem que isso seja punição dupla pelo mesmo fato.",
      status: "decidido",
    },
    {
      referencia: "RE 636.886/AL",
      tema: "Tema 899",
      tipo: "Tema de repercussão geral",
      data: "10–17/04/2020",
      tese: "É prescritível a pretensão de ressarcimento ao erário fundada em decisão de Tribunal de Contas.",
      artigos: [],
      contraste:
        "Não interpreta nenhum artigo da Lei 8.429/1992 diretamente — interpreta o art. 37, § 5º, da CF, em contraste com o Tema 897; prazo de 5 anos (Lei 6.830/1980 c/c art. 174 do CTN).",
      notaPratica:
        "A cobrança de débito apurado pelo Tribunal de Contas prescreve em 5 anos, e só vira imprescritível se o mesmo fato for reconhecido em juízo como ato doloso de improbidade.",
      status: "decidido",
      observacao: "Plenário virtual; embargos de declaração rejeitados em 23/08/2021.",
    },
    {
      referencia: "ADIs 7156 e 7236",
      tipo: "Controle concentrado",
      data: "01/07/2026",
      tese: "Sem tese única — conjunto de declarações de (in)constitucionalidade no acórdão: (i) inconstitucional o dispositivo que reduzia pela metade o prazo prescricional após a interrupção (de 8 para 4 anos); (ii) constitucionais as hipóteses de interrupção da prescrição; (iii) ações de improbidade sujeitas a um prazo máximo de 20 anos; (iv) mantidas a exigência de dolo e a taxatividade do rol do art. 11; (v) art. 21, § 4º, parcialmente inconstitucional, com interpretação conforme: a absolvição criminal só impede a ação de improbidade nas hipóteses de inexistência do fato, negativa de autoria ou excludente de ilicitude (arts. 65, 386, I, e 386, IV, do CPP); (vi) inconstitucionais/parcialmente inconstitucionais trechos sobre perda da função pública limitada ao cargo da época (art. 12, § 1º), cômputo do período entre decisão colegiada e trânsito em julgado para a suspensão dos direitos políticos (art. 12, § 10), restrições à indisponibilidade de bens (art. 16), vinculação do juiz ao enquadramento do autor (art. 17) e oitiva prévia obrigatória do Tribunal de Contas em acordo de não persecução civil (art. 17-B, § 3º).",
      artigos: [1, 3, 11, 12, 16, 17, 21, 23],
      notaPratica:
        "O STF manteve o núcleo garantista da reforma de 2021 (dolo e rol taxativo), mas derrubou os trechos que mais enfraqueciam a punição, como o prazo de prescrição cortado pela metade depois de interrompido.",
      fonte:
        "https://noticias.stf.jus.br/postsnoticias/stf-invalida-reducao-de-prazo-de-prescricao-prevista-na-reforma-da-lei-de-improbidade-administrativa/",
      status: "decidido",
      observacao: "Julgamento concluído em 01/07/2026.",
    },
    {
      referencia: "Súmula Vinculante 13",
      tipo: "Súmula Vinculante",
      data: "21/08/2008",
      tese: "A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.",
      artigos: [11],
      notaPratica:
        "Nomear parente até o 3º grau para cargo em comissão, de confiança ou função gratificada é inconstitucional e, desde 2021, é também ato de improbidade por ofensa aos princípios.",
      status: "decidido",
      observacao: "Publicada no DJe nº 167/2008, em 29/08/2008. Vigente.",
    },
    {
      referencia: "RE 1.133.118/SP",
      tema: "Tema 1000",
      tipo: "Tema de repercussão geral",
      data: "—",
      tese: "Sem tese fixada — julgamento inconcluso.",
      artigos: [11],
      notaPratica:
        "Ainda não se sabe se nomear parente para secretário ou ministro é nepotismo proibido — por enquanto, a exceção para cargos políticos continua valendo na jurisprudência dominante.",
      status: "pendente",
      observacao:
        "Sem tese fixada até 25/11/2026; placar parcial 5×3 pela permissão das nomeações; faltam os votos de Fachin e Gilmar Mendes.",
    },
  ],
};

/** Todos os julgamentos vinculados a uma lei (vazio quando a lei não tem). */
export function julgamentosDaLei(lei: string): JulgamentoSTF[] {
  return JURISPRUDENCIA_POR_LEI[lei] ?? [];
}

/**
 * Julgamentos que interpretam algum dos artigos do item — o julgamento
 * aparece abaixo de cada artigo que interpreta.
 */
export function julgamentosDoArtigo(lei: string, numeros: Set<number>): JulgamentoSTF[] {
  return julgamentosDaLei(lei).filter((j) => j.artigos.some((a) => numeros.has(a)));
}

/** Julgamentos que não interpretam artigo da lei — entram por contraste. */
export function julgamentosDeContraste(lei: string): JulgamentoSTF[] {
  return julgamentosDaLei(lei).filter((j) => j.artigos.length === 0);
}
