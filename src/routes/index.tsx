import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * A home (/) não tem mais o menu antigo de 8 cartões: ela redireciona
 * para /trilha, que é a tela Hoje — Trilha + home juntas.
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Concurseiro Inteligente — estude com agente de IA" },
      {
        name: "description",
        content:
          "Resolva questões de concurso com explicação passo a passo da IA, gere redações, analise padrões de provas e monte simulados idênticos à banca.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/trilha" });
  },
});
