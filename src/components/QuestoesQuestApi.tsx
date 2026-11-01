/**
 * Painel "Buscar na Quest API": filtra por banca/cargo/matéria, mostra a prévia
 * e salva no acervo vinculado à matéria escolhida do edital.
 */
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buscarQuestoesQuestApi, type QuestaoQuestApi } from "@/lib/quest-api.functions";
import { grupoDaMateria, topicosDaMateria, type EditalEstado } from "@/lib/edital";
import { tituloDaQuestao } from "@/lib/questoes-pdf";
import type { Questao } from "@/lib/ai.functions";

const campo = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

export function QuestoesQuestApi({
  edital,
  banca,
  cargo,
  materias,
  materiaAtiva,
  existentes,
  onImportar,
}: {
  edital: EditalEstado;
  banca: string;
  cargo?: string;
  materias: string[];
  materiaAtiva: string;
  existentes: Questao[];
  onImportar: (questoes: Questao[]) => void;
}) {
  const buscar = useServerFn(buscarQuestoesQuestApi);
  const [aberto, setAberto] = useState(false);
  const [materia, setMateria] = useState(materiaAtiva);
  const [topico, setTopico] = useState("");
  const [termo, setTermo] = useState("");
  const [bancaBusca, setBancaBusca] = useState(edital.bancaAtiva || banca);
  const [cargoBusca, setCargoBusca] = useState(cargo ?? "");
  // Acompanha o seletor do concurso (topo) em tempo real.
  useEffect(() => {
    setBancaBusca(edital.bancaAtiva || banca);
  }, [edital.bancaAtiva, banca]);
  useEffect(() => {
    setCargoBusca(cargo ?? "");
  }, [cargo]);
  const [ano, setAno] = useState("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [previa, setPrevia] = useState<QuestaoQuestApi[]>([]);
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});

  const materiaSel = materias.includes(materia) ? materia : (materias[0] ?? "");
  const topicos = useMemo(() => topicosDaMateria(edital, materiaSel), [edital, materiaSel]);
  const jaTenho = useMemo(() => new Set(existentes.map((q) => q.id)), [existentes]);

  const busca = useMutation({
    mutationFn: (p: number) =>
      buscar({
        data: {
          pagina: p,
          ...(bancaBusca.trim() ? { banca: bancaBusca.trim() } : {}),
          ...(cargoBusca.trim() ? { cargo: cargoBusca.trim() } : {}),
          ...((termo.trim() || materiaSel) ? { materia: termo.trim() || materiaSel } : {}),
          ...(ano.trim() ? { ano: ano.trim() } : {}),
        },
      }),
    onSuccess: (r, p) => {
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      setPagina(p);
      setTotal(r.total);
      const novas = r.questoes.filter((q) => !jaTenho.has(q.id));
      setPrevia(novas);
      setMarcadas(Object.fromEntries(novas.map((q) => [q.id, true])));
      if (!r.questoes.length) toast.info("Nenhuma questão encontrada com esses filtros.");
      else if (!novas.length) toast.info("Essas questões já estão no seu acervo. Tente a próxima página.");
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao buscar na Quest API."),
  });

  function salvar() {
    const escolhidas = previa.filter((q) => marcadas[q.id]);
    const assunto = topico || undefined;
    const convertidas: Questao[] = escolhidas.map((q) => {
      const ass = assunto ?? q.assuntoApi ?? undefined;
      return {
        id: q.id,
        banca: q.banca || banca,
        grupo: grupoDaMateria(edital, materiaSel),
        materia: materiaSel,
        ...(ass ? { assunto: ass } : {}),
        ...(q.ano ? { ano: q.ano } : {}),
        ...(q.numero ? { numero: q.numero } : {}),
        titulo: tituloDaQuestao({
          materia: materiaSel,
          ...(ass ? { assunto: ass } : {}),
          banca: q.banca || banca,
          ...(q.ano ? { ano: q.ano } : {}),
        }),
        origem: "Quest API",
        prova: [q.banca, q.orgao, q.cargo, q.ano].filter(Boolean).join(" · "),
        enunciado: q.enunciado,
        alternativas: q.alternativas.map((a) => ({ ...a, explicacao: "" })),
        explicacao: "",
      };
    });
    onImportar(convertidas);
    toast.success(`${convertidas.length} questão(ões) salvas no acervo em ${materiaSel}.`);
    setPrevia((p) => p.filter((q) => !marcadas[q.id]));
  }

  const selecionadas = previa.filter((q) => marcadas[q.id]).length;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={aberto}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Database className="size-4 text-primary" /> Buscar na Quest API
        </span>
        <span className="text-xs text-muted-foreground">{aberto ? "fechar" : "abrir"}</span>
      </button>

      {aberto && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Questões reais de provas, com gabarito oficial. Elas entram no acervo vinculadas à matéria do
            edital que você escolher abaixo.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              Salvar na matéria do edital
              <select
                value={materiaSel}
                onChange={(e) => {
                  setMateria(e.target.value);
                  setTopico("");
                }}
                className={campo}
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
              <select value={topico} onChange={(e) => setTopico(e.target.value)} className={campo}>
                <option value="">Usar o assunto da questão</option>
                {topicos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              Assunto para buscar na Quest API
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Ex.: Crase, Inquérito policial, Porcentagem"
                className={campo}
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Banca
              <input value={bancaBusca} onChange={(e) => setBancaBusca(e.target.value)} className={campo} />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Cargo (opcional)
              <input value={cargoBusca} onChange={(e) => setCargoBusca(e.target.value)} className={campo} />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Ano (opcional)
              <input
                value={ano}
                onChange={(e) => setAno(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="2024"
                className={campo}
              />
            </label>
          </div>

          <Button
            className="w-full"
            disabled={busca.isPending || !materiaSel}
            onClick={() => busca.mutate(1)}
          >
            {busca.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Buscando…
              </>
            ) : (
              "Buscar questões"
            )}
          </Button>

          {total !== null && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {total.toLocaleString("pt-BR")} encontradas · página {pagina}
              </span>
              <span className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busca.isPending || pagina <= 1}
                  onClick={() => busca.mutate(pagina - 1)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busca.isPending || pagina * 10 >= total}
                  onClick={() => busca.mutate(pagina + 1)}
                >
                  Próxima
                </Button>
              </span>
            </div>
          )}

          {previa.length > 0 && (
            <div className="space-y-2">
              {previa.map((q, i) => (
                <label key={q.id} className="flex gap-2 rounded-lg border border-border p-2 text-xs">
                  <input
                    type="checkbox"
                    checked={marcadas[q.id] ?? false}
                    onChange={(e) => setMarcadas((m) => ({ ...m, [q.id]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <span className="space-y-1">
                    <span className="block font-semibold text-foreground">
                      {i + 1}. {[q.banca, q.orgao, q.cargo, q.ano].filter(Boolean).join(" · ")}
                    </span>
                    {(q.materiaApi || q.assuntoApi) && (
                      <span className="block text-primary">
                        {[q.materiaApi, q.assuntoApi].filter(Boolean).join(" — ")}
                      </span>
                    )}
                    <span className="block whitespace-pre-line text-muted-foreground">
                      {q.enunciado.slice(0, 260)}
                      {q.enunciado.length > 260 ? "…" : ""}
                    </span>
                    <span className="block text-muted-foreground">
                      {q.alternativas.length} alternativas ·{" "}
                      {q.temGabarito ? "com gabarito" : "sem gabarito"}
                    </span>
                  </span>
                </label>
              ))}
              <Button className="w-full" variant="secondary" disabled={!selecionadas} onClick={salvar}>
                Salvar no acervo ({selecionadas})
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
