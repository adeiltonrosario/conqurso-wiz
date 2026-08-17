import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extrairMateriasEdital } from "@/lib/ai.functions";
import { bancasDoEdital, cargosDoEdital, novoId, useEdital, type GrupoEdital } from "@/lib/edital";
import { FiltroConcurso } from "@/components/FiltroConcurso";

const GRUPOS: GrupoEdital[] = ["Conhecimento Geral", "Conhecimento Específico"];

/** Cadastro das matérias do edital: extração por IA e edição manual. */
export function EditalMaterias() {
  const {
    edital,
    aplicar,
    definirMaterias,
    atualizarMateria,
    removerMateria,
    adicionarCargo,
    removerCargo,
    adicionarBanca,
    removerBanca,
  } = useEdital();
  const extrair = useServerFn(extrairMateriasEdital);
  const [texto, setTexto] = useState<string | null>(null);
  const [nova, setNova] = useState("");
  const [novoGrupo, setNovoGrupo] = useState<GrupoEdital>("Conhecimento Específico");
  const [topicoNovo, setTopicoNovo] = useState<Record<string, string>>({});
  const [novoCargo, setNovoCargo] = useState("");
  const [novaBanca, setNovaBanca] = useState("");

  const valor = texto ?? edital.texto;
  const cargos = edital.cargos ?? [];
  const bancas = edital.bancas ?? [];
  const bancasDisponiveis = bancasDoEdital(edital);
  const cargosDisponiveis = cargosDoEdital(edital);

  const mut = useMutation({
    mutationFn: () => extrair({ data: { texto: valor.trim() } }),
    onSuccess: ({ materias, cargos: cargosIA, bancas: bancasIA }) => {
      if (!materias.length) {
        toast.error("A IA não encontrou matérias nesse texto.");
        return;
      }
      const existentes = new Set(edital.materias.map((m) => m.nome.trim().toLowerCase()));
      const novas = materias
        .filter((m) => m.nome && !existentes.has(m.nome.trim().toLowerCase()))
        .map((m) => ({
          id: novoId(),
          nome: m.nome.trim(),
          grupo: m.grupo === "Conhecimento Geral" ? "Conhecimento Geral" : "Conhecimento Específico",
          topicos: (m.topicos ?? []).map((t) => t.trim()).filter(Boolean),
          banca: edital.bancaAtiva ?? "",
          cargo: edital.cargoAtivo ?? "",
        })) as typeof edital.materias;
      const cargosAtuais = edital.cargos ?? [];
      const vistos = new Set(cargosAtuais.map((c) => c.trim().toLowerCase()));
      const cargosNovos = (cargosIA ?? [])
        .map((c) => c.trim())
        .filter((c) => c && !vistos.has(c.toLowerCase()) && vistos.add(c.toLowerCase()));
      const bancasAtuais = edital.bancas ?? [];
      const vistasBancas = new Set(bancasAtuais.map((b) => b.trim().toLowerCase()));
      const bancasNovas = (bancasIA ?? [])
        .map((b) => b.trim())
        .filter((b) => b && !vistasBancas.has(b.toLowerCase()) && vistasBancas.add(b.toLowerCase()));
      aplicar({
        texto: valor.trim(),
        materias: [...edital.materias, ...novas],
        cargos: [...cargosAtuais, ...cargosNovos],
        bancas: [...bancasAtuais, ...bancasNovas],
      });
      toast.success(
        `${novas.length} matéria(s), ${cargosNovos.length} cargo(s) e ${bancasNovas.length} banca(s) do edital cadastrados.`,
      );
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao ler o edital."),
  });


  const adicionar = () => {
    const nome = nova.trim();
    if (nome.length < 2) return;
    if (edital.materias.some((m) => m.nome.trim().toLowerCase() === nome.toLowerCase())) {
      toast.error("Essa matéria já está cadastrada.");
      return;
    }
    definirMaterias([
      ...edital.materias,
      {
        id: novoId(),
        nome,
        grupo: novoGrupo,
        topicos: [],
        banca: edital.bancaAtiva ?? "",
        cargo: edital.cargoAtivo ?? "",
      },
    ]);
    setNova("");
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
      <div>
        <h2 className="font-display text-base font-bold">Matérias do edital</h2>
        <p className="text-xs text-muted-foreground">
          Cole o conteúdo programático para a IA extrair as matérias e os tópicos, ou cadastre na mão.
          Elas aparecem em Questões, Leis, Prova, Padrões e Trilha, separadas por banca e cargo.
        </p>
      </div>

      <FiltroConcurso />

      <div className="space-y-2">
        <Label htmlFor="edital-texto">Conteúdo programático do edital</Label>
        <Textarea
          id="edital-texto"
          rows={5}
          value={valor}
          onChange={(e) => setTexto(e.target.value.slice(0, 40000))}
          placeholder="Cole aqui o trecho do edital com as disciplinas e os tópicos…"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={valor.trim().length < 20 || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Lendo o edital…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" /> Extrair matérias com a IA
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              aplicar({ texto: valor.trim() });
              toast.success("Texto do edital salvo.");
            }}
          >
            Salvar texto
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="edital-cargo">Cargos do edital</Label>
        <p className="text-xs text-muted-foreground">
          Só estes cargos aparecem na Trilha, para você não estudar o conteúdo de outro cargo.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            adicionarCargo(novoCargo);
            setNovoCargo("");
          }}
        >
          <Input
            id="edital-cargo"
            value={novoCargo}
            onChange={(e) => setNovoCargo(e.target.value.slice(0, 160))}
            placeholder="Ex.: Escrivão de Polícia Civil"
            className="h-9"
          />
          <Button type="submit" variant="outline" aria-label="Adicionar cargo">
            <Plus className="size-4" />
          </Button>
        </form>
        {cargos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum cargo cadastrado — extraia do edital ou adicione acima.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {cargos.map((c) => (
              <li
                key={c}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
              >
                <span>{c}</span>
                <button type="button" onClick={() => removerCargo(c)} aria-label={`Remover ${c}`}>
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="edital-banca">Bancas do edital</Label>
        <p className="text-xs text-muted-foreground">
          Só estas bancas aparecem como banca prevista na Trilha, para o estudo seguir o estilo da
          organizadora certa.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            adicionarBanca(novaBanca);
            setNovaBanca("");
          }}
        >
          <Input
            id="edital-banca"
            value={novaBanca}
            onChange={(e) => setNovaBanca(e.target.value.slice(0, 60))}
            placeholder="Ex.: Cebraspe"
            className="h-9"
          />
          <Button type="submit" variant="outline" aria-label="Adicionar banca">
            <Plus className="size-4" />
          </Button>
        </form>
        {bancas.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma banca cadastrada — extraia do edital ou adicione acima.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {bancas.map((b) => (
              <li
                key={b}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
              >
                <span>{b}</span>
                <button type="button" onClick={() => removerBanca(b)} aria-label={`Remover ${b}`}>
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>


      <div className="grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={nova}
          onChange={(e) => setNova(e.target.value.slice(0, 80))}
          placeholder="Adicionar matéria manualmente"
        />
        <select
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value as GrupoEdital)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={adicionar} aria-label="Adicionar matéria">
          <Plus className="size-4" />
        </Button>
      </div>

      {edital.materias.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nenhuma matéria do edital cadastrada ainda — o app usa as matérias padrão.
        </p>
      ) : (
        <ul className="space-y-3">
          {edital.materias.map((m) => (
            <li key={m.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={m.nome}
                  onChange={(e) => atualizarMateria(m.id, { nome: e.target.value.slice(0, 80) })}
                  className="h-8 flex-1 min-w-40"
                />
                <select
                  value={m.grupo}
                  onChange={(e) =>
                    atualizarMateria(m.id, { grupo: e.target.value as GrupoEdital })
                  }
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {GRUPOS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={m.banca ?? ""}
                  onChange={(e) => atualizarMateria(m.id, { banca: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  aria-label={`Banca de ${m.nome}`}
                >
                  <option value="">Todas as bancas</option>
                  {bancasDisponiveis.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={m.cargo ?? ""}
                  onChange={(e) => atualizarMateria(m.id, { cargo: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  aria-label={`Cargo de ${m.nome}`}
                >
                  <option value="">Todos os cargos</option>
                  {cargosDisponiveis.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removerMateria(m.id)}
                  aria-label={`Remover ${m.nome}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>

              {m.topicos.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {m.topicos.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() =>
                          atualizarMateria(m.id, { topicos: m.topicos.filter((x) => x !== t) })
                        }
                        aria-label={`Remover tópico ${t}`}
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = (topicoNovo[m.id] ?? "").trim();
                  if (t.length < 2 || m.topicos.includes(t)) return;
                  atualizarMateria(m.id, { topicos: [...m.topicos, t] });
                  setTopicoNovo((s) => ({ ...s, [m.id]: "" }));
                }}
              >
                <Input
                  value={topicoNovo[m.id] ?? ""}
                  onChange={(e) =>
                    setTopicoNovo((s) => ({ ...s, [m.id]: e.target.value.slice(0, 200) }))
                  }
                  placeholder="Adicionar tópico do edital"
                  className="h-8"
                />
                <Button type="submit" size="sm" variant="outline" aria-label="Adicionar tópico">
                  <Plus className="size-4" />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
