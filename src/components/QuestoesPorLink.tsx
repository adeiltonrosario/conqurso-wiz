/**
 * Busca questões a partir de um link e filtra por matéria, banca e assunto do
 * edital antes de salvar no acervo. Tudo local (sem IA, sem gastar crédito).
 */
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buscarQuestoesPorUrl } from "@/lib/questoes-url.functions";
import {
  extrairQuestoesDePdf,
  classificarQuestao,
  tituloDaQuestao,
  NAO_CLASSIFICADA,
} from "@/lib/questoes-pdf";
import { separarQuestaoColada } from "@/lib/questao-colada";
import { grupoDaMateria, topicosDaMateria, type EditalEstado } from "@/lib/edital";
import type { Questao } from "@/lib/ai.functions";

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textoDaQuestao(q: Questao) {
  return `${q.enunciado} ${q.alternativas.map((a) => a.texto).join(" ")}`;
}

/** Termos significativos, para casar o tópico do edital com o enunciado. */
function termos(t: string) {
  return normalizar(t)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3);
}

export function QuestoesPorLink({
  edital,
  banca,
  materias,
  materiaAtiva,
  existentes,
  onImportar,
}: {
  edital: EditalEstado;
  banca: string;
  materias: string[];
  materiaAtiva: string;
  existentes: Questao[];
  onImportar: (questoes: Questao[]) => void;
}) {
  const buscar = useServerFn(buscarQuestoesPorUrl);
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");
  const [materia, setMateria] = useState(materiaAtiva);
  const [topico, setTopico] = useState("");
  const [palavra, setPalavra] = useState("");
  const [qualquerBanca, setQualquerBanca] = useState(false);
  const [previa, setPrevia] = useState<Questao[]>([]);
  const [descartadas, setDescartadas] = useState(0);
  const [repetidas, setRepetidas] = useState(0);
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});

  const materiaSel = materias.includes(materia) ? materia : (materias[0] ?? "");
  const topicos = useMemo(() => topicosDaMateria(edital, materiaSel), [edital, materiaSel]);

  const jaTenho = useMemo(
    () => new Set(existentes.map((q) => normalizar(q.enunciado).slice(0, 120))),
    [existentes],
  );

  const busca = useMutation({
    mutationFn: () => buscar({ data: { url: url.trim() } }),
    onSuccess: (r) => {
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      const nome = r.titulo || r.url;
      const extraidas = extrairQuestoesDePdf(nome, r.texto, edital, banca).questoes;
      let brutas = extraidas;
      // Página com uma questão só: usa o separador do texto colado.
      if (!brutas.length) {
        const colada = separarQuestaoColada(r.texto);
        if (colada) {
          const achado = classificarQuestao(edital, `${colada.enunciado} ${colada.alternativas.join(" ")}`);
          const mat = achado?.materia ?? NAO_CLASSIFICADA;
          brutas = [
            {
              id: `url:${r.url}:1`,
              banca,
              grupo: mat === NAO_CLASSIFICADA ? "Conhecimento Geral" : grupoDaMateria(edital, mat),
              materia: mat,
              ...(achado?.assunto ? { assunto: achado.assunto } : {}),
              titulo: tituloDaQuestao({
                materia: mat,
                ...(achado?.assunto ? { assunto: achado.assunto } : {}),
                banca,
              }),
              origem: r.url,
              prova: nome,
              enunciado: colada.enunciado,
              alternativas: colada.alternativas.map((texto, i) => ({
                letra: "ABCDE"[i] ?? String(i + 1),
                texto,
                correta: colada.correta === ("ABCDE"[i] ?? ""),
                explicacao: "",
              })),
              explicacao: "",
            },
          ];
        }
      }

      if (!brutas.length) {
        toast.error("Não reconheci questões nessa página. Copie e cole em “Incluir → Nova questão”.");
        setPrevia([]);
        return;
      }

      const paginaTemBanca = normalizar(r.texto).includes(normalizar(banca));
      if (!qualquerBanca && !paginaTemBanca) {
        toast.error(
          `Não achei referência à banca ${banca} nessa página. Marque “aceitar qualquer banca” se quiser importar assim.`,
        );
        setPrevia([]);
        return;
      }

      const termosTopico = topico ? termos(topico) : [];
      const chave = normalizar(palavra.trim());
      let fora = 0;
      let repet = 0;
      const aprovadas: Questao[] = [];

      for (const q of brutas) {
        const texto = normalizar(textoDaQuestao(q));
        if (materiaSel && q.materia !== materiaSel) {
          fora++;
          continue;
        }
        if (termosTopico.length) {
          const casa =
            q.assunto === topico || termosTopico.some((t) => texto.includes(t));
          if (!casa) {
            fora++;
            continue;
          }
        }
        if (chave && !texto.includes(chave)) {
          fora++;
          continue;
        }
        if (jaTenho.has(normalizar(q.enunciado).slice(0, 120))) {
          repet++;
          continue;
        }
        const assunto = topico || q.assunto;
        aprovadas.push({
          ...q,
          id: `url:${r.url}:${q.numero ?? aprovadas.length + 1}`,
          origem: r.url,
          prova: nome,
          ...(assunto ? { assunto } : {}),
          titulo: tituloDaQuestao({
            materia: q.materia,
            ...(assunto ? { assunto } : {}),
            banca: q.banca,
            ...(q.ano ? { ano: q.ano } : {}),
          }),
        });
      }

      setDescartadas(fora);
      setRepetidas(repet);
      setPrevia(aprovadas);
      setMarcadas(Object.fromEntries(aprovadas.map((q) => [q.id, true])));
      if (!aprovadas.length) {
        toast.info(
          repet
            ? "Todas as questões dessa página já estão no seu acervo."
            : "Nenhuma questão da página passou pelos filtros de matéria, banca e assunto.",
        );
      } else {
        toast.success(`${aprovadas.length} questão(ões) prontas para conferir.`);
      }
    },
    onError: (e: Error) => toast.error(e.message || "Não consegui ler esse link."),
  });

  const selecionadas = previa.filter((q) => marcadas[q.id]);

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="size-4 text-primary" /> Buscar questões por link
        </span>
        <span className="text-xs text-muted-foreground">{aberto ? "fechar" : "abrir"}</span>
      </button>

      {aberto && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cole o endereço de uma página pública com questões. O app lê, separa e mostra só o que
            combina com a matéria, a banca e o assunto do seu edital — sem gastar crédito.
          </p>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              Matéria
              <select
                value={materiaSel}
                onChange={(e) => {
                  setMateria(e.target.value);
                  setTopico("");
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {materias.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-muted-foreground">
              Assunto do edital
              <select
                value={topico}
                onChange={(e) => setTopico(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Todos os assuntos</option>
                {topicos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <input
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            placeholder="Palavra-chave (opcional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={qualquerBanca}
              onChange={(e) => setQualquerBanca(e.target.checked)}
            />
            Aceitar qualquer banca (por padrão só {banca})
          </label>

          <Button
            className="w-full"
            disabled={busca.isPending || url.trim().length < 8 || !materiaSel}
            onClick={() => busca.mutate()}
          >
            {busca.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Lendo a página…
              </>
            ) : (
              "Buscar e filtrar questões"
            )}
          </Button>

          {(previa.length > 0 || descartadas > 0 || repetidas > 0) && (
            <p className="text-xs text-muted-foreground">
              {previa.length} aprovada(s) · {descartadas} fora dos filtros · {repetidas} já no acervo
            </p>
          )}

          {previa.length > 0 && (
            <div className="space-y-2">
              {previa.map((q, i) => (
                <label
                  key={q.id}
                  className="flex gap-2 rounded-lg border border-border p-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={marcadas[q.id] ?? false}
                    onChange={(e) => setMarcadas((m) => ({ ...m, [q.id]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <span className="space-y-1">
                    <span className="block font-semibold text-foreground">
                      {i + 1}. {q.titulo}
                    </span>
                    <span className="block text-muted-foreground">
                      {q.enunciado.slice(0, 220)}
                      {q.enunciado.length > 220 ? "…" : ""}
                    </span>
                    <span className="block text-muted-foreground">
                      {q.alternativas.length} alternativas
                      {q.alternativas.some((a) => a.correta) ? " · com gabarito" : " · sem gabarito"}
                    </span>
                  </span>
                </label>
              ))}

              <Button
                className="w-full"
                variant="secondary"
                disabled={!selecionadas.length}
                onClick={() => {
                  onImportar(selecionadas);
                  toast.success(`${selecionadas.length} questão(ões) salvas no acervo.`);
                  setPrevia([]);
                  setMarcadas({});
                }}
              >
                Salvar no acervo ({selecionadas.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
