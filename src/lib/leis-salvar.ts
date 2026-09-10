/**
 * Salva um texto de lei no acervo, deixando-o disponível em Leis → Texto Integral.
 * Reutilizado pela inclusão manual e pela busca por link dentro do edital.
 */
import { ehAnexoDeLei, lerAcervo, marcarComoLei, nomeLimpo, salvarAcervo } from "./acervo";
import { limparRuidoLei } from "./limpeza-lei";
import { lerVadeMecum } from "./vademecum";
import { lerTextoAnexo, removerTextoAnexo, salvarTextoAnexo } from "./anexos-store";
import { LIMITE_TRECHO_IA } from "./pdf";
import { renomearLeiNosFavoritos } from "./favoritos";
import { renomearLeiNosOcultos } from "./ocultos";
import { renomearAnexoNasLeis } from "./edital";

export type ResultadoLeiSalva = { artigos: number; titulo: string; nome: string };

/**
 * `nomePreferido` é o nome cadastrado no Detalhamento do edital: quando existe,
 * ele manda, para que edital e acervo mostrem sempre o mesmo nome e não haja
 * cópias duplicadas da mesma lei.
 */
export function salvarLeiNoAcervo(bruto: string, nomePreferido?: string): ResultadoLeiSalva {
  const texto = limparRuidoLei(bruto).trim();
  const leis = lerVadeMecum(texto);
  const artigos = leis.reduce((s, l) => s + l.artigos.length, 0);
  const nome = nomePreferido?.trim() || leis[0]?.nome?.trim() || "Texto colado";
  if (!artigos) return { artigos: 0, titulo: nome, nome: "" };

  const acervo = lerAcervo();
  const item = {
    nome: marcarComoLei(nome),
    texto: texto.slice(0, LIMITE_TRECHO_IA),
    chars: texto.length,
  };
  const alvo = nome.toLowerCase();
  const indice = acervo.provas.findIndex(
    (a) => ehAnexoDeLei(a) && nomeLimpo(a).toLowerCase() === alvo,
  );
  const provas =
    indice >= 0
      ? acervo.provas.map((a, i) => (i === indice ? { ...a, ...item } : a))
      : [...acervo.provas, item];

  void salvarTextoAnexo(nome, texto);
  salvarAcervo({ ...acervo, provas });
  return { artigos, titulo: nome, nome };
}
