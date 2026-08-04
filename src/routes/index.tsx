import { createFileRoute, Link } from "@tanstack/react-router";
import { PenLine, FilePlus2, ScanSearch, ListChecks, FileText, ArrowRight } from "lucide-react";
import { AppShell } from "../components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Concurseiro Inteligente — estude com agente de IA" },
      {
        name: "description",
        content:
          "Resolva questões de concurso com explicação passo a passo da IA, gere redações, analise padrões de provas e monte simulados idênticos à banca.",
      },
      { property: "og:title", content: "Concurseiro Inteligente — estude com agente de IA" },
      {
        property: "og:description",
        content:
          "Questões comentadas, redação dissertativa, análise de padrões e provas interativas em PDF no seu celular.",
      },
    ],
  }),
  component: Index,
});

const CARDS = [
  {
    to: "/questoes",
    icon: ListChecks,
    titulo: "Questões e explicações",
    texto: "Padrão FCC com 5 alternativas, filtro por matéria e gabarito comentado pela IA.",
  },
  {
    to: "/prova-interativa",
    icon: FileText,
    titulo: "Prova interativa",
    texto: "35+ questões por matéria em scroll vertical, correção automática e download em PDF.",
  },
  {
    to: "/analise-padroes",
    icon: ScanSearch,
    titulo: "Análise de padrões",
    texto: "Grifos de acertos e erros, setas por frase e chat para testar suas hipóteses.",
  },
  {
    to: "/redacao",
    icon: PenLine,
    titulo: "Criação de redação",
    texto: "Dissertativa-argumentativa de até 35 linhas com conectivos coloridos.",
  },
  {
    to: "/inclusao",
    icon: FilePlus2,
    titulo: "Inclusão de conteúdo",
    texto: "Cadastre questões, leis, gramática, provas anteriores e edital.",
  },
] as const;

function Index() {
  return (
    <AppShell
      titulo="Seu agente de estudo vertical"
      descricao="Tudo em um fluxo único, pensado para celular e tablet: da leitura da lei até a prova respondida."
    >
      <div className="grid gap-3">
        {CARDS.map(({ to, icon: Icon, titulo, texto }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
          >
            <span className="rounded-lg bg-secondary p-2 text-primary">
              <Icon className="size-5" strokeWidth={1.9} />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-1 font-display text-base font-bold">
                {titulo}
                <ArrowRight className="size-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{texto}</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
