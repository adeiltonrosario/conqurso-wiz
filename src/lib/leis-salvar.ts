/**
 * Salva um texto de lei no acervo, deixando-o disponível em Leis → Texto Integral.
 * Reutilizado pela inclusão manual e pela busca por link dentro do edital.
 */
import { ehAnexoDeLei, lerAcervo, marcarComoLei, nomeLimpo, salvarAcervo } from "./acervo";
import { limparRuidoLei } from "./limpeza-lei";
import { lerVadeMecum } from "./vademecum";
import { salvarTextoAnexo } from "./anexos-store";
import { LIMITE_TRECHO_IA } from "./pdf";

export type ResultadoLeiSalva = { artigos: number; titulo: string; nome: string };

export function salvarLeiNoAcervo(bruto: string, tituloSugerido?: string): ResultadoLeiSalva {
  const texto = limparRuidoLei(bruto).trim();
  const leis = lerVadeMecum(texto);
  const artigos = leis.reduce((s, l) => s + l.artigos.length, 0);
  const titulo = leis[0]?.nome?.trim() || tituloSugerido?.trim() || "Texto colado";
  if (!artigos) return { artigos: 0, titulo, nome: "" };

  const acervo = lerAcervo();
  const data = new Date().toLocaleDateString("pt-BR");
  const jaUsados = new Set(acervo.provas.filter(ehAnexoDeLei).map((a) => nomeLimpo(a)));
  let nome = `${titulo} — ${data}`;
  let n = 2;
  while (jaUsados.has(nome)) nome = `${titulo} — ${data} (${n++})`;

  void salvarTextoAnexo(nome, texto);
  salvarAcervo({
    ...acervo,
    provas: [
      ...acervo.provas,
      {
        nome: marcarComoLei(nome),
        texto: texto.slice(0, LIMITE_TRECHO_IA),
        chars: texto.length,
      },
    ],
  });
  return { artigos, titulo, nome };
}
