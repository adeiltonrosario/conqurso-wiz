import { describe, expect, it } from "vitest";
import {
  atividadeDaRota,
  definirLei,
  diaIso,
  estadoVazio,
  fecharSegmento,
  formatarTempo,
  leisDoDia,
  pausar,
  retomar,
  totaisAoVivo,
  totalDia,
  trocarAtividade,
  virarDia,
} from "./tempo-estudo";

/** 24/11/2026, 10h00 locais — base determinística para os testes. */
const BASE = new Date(2026, 10, 24, 10, 0, 0).getTime();
const MIN = 60 * 1000;

describe("relógio automático de estudo", () => {
  it("formata segundos como 38s, 45min, 1h23min e 2h05min", () => {
    expect(formatarTempo(0)).toBe("0s");
    expect(formatarTempo(38)).toBe("38s");
    expect(formatarTempo(59)).toBe("59s");
    expect(formatarTempo(60)).toBe("1min");
    expect(formatarTempo(45 * 60)).toBe("45min");
    expect(formatarTempo(83 * 60)).toBe("1h23min");
    expect(formatarTempo(125 * 60)).toBe("2h05min");
    expect(formatarTempo(61)).toBe("1min");
  });

  it("atividadeDaRota: leis é leitura, questões/prova/padrões são questões, revisão/cards são revisão, o resto não conta", () => {
    expect(atividadeDaRota("/leis")).toBe("leitura");
    expect(atividadeDaRota("/questoes")).toBe("questoes");
    expect(atividadeDaRota("/prova-interativa")).toBe("questoes");
    expect(atividadeDaRota("/analise-padroes")).toBe("questoes");
    expect(atividadeDaRota("/revisao")).toBe("revisao");
    expect(atividadeDaRota("/flashcards")).toBe("revisao");
    expect(atividadeDaRota("/trilha")).toBe("outro");
    expect(atividadeDaRota("/")).toBe("outro");
    expect(atividadeDaRota("/inclusao")).toBe("outro");
    expect(atividadeDaRota("/redacao")).toBe("outro");
    expect(atividadeDaRota("/auth")).toBe("outro");
  });

  it("trocar de atividade fecha o trecho anterior e abre o novo", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", BASE);
    estado = trocarAtividade(estado, "questoes", null, BASE + 10 * MIN);
    expect(estado.hoje.porAtividade.leitura).toBe(600);
    expect(estado.hoje.porAtividade.questoes).toBe(0);
    expect(estado.hoje.porLei["Lei 8.429/92"]).toBe(600);
    expect(estado.segmento?.atividade).toBe("questoes");
    // Trocar para a mesma atividade não fecha nada: o trecho segue aberto.
    estado = trocarAtividade(estado, "questoes", null, BASE + 25 * MIN);
    expect(estado.hoje.porAtividade.questoes).toBe(0);
    expect(totaisAoVivo(estado, BASE + 25 * MIN).porAtividade.questoes).toBe(900);
    expect(estado.segmento?.atividade).toBe("questoes");
  });

  it("trocar para 'outro' só fecha o trecho, sem abrir outro", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "questoes", null, BASE);
    estado = trocarAtividade(estado, "outro", null, BASE + 5 * MIN);
    expect(estado.hoje.porAtividade.questoes).toBe(300);
    expect(estado.segmento).toBeNull();
  });

  it("voltar para a MESMA lei retoma e soma no total daquela lei no dia", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", BASE);
    estado = trocarAtividade(estado, "questoes", null, BASE + 10 * MIN);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", BASE + 30 * MIN);
    estado = fecharSegmento(estado, BASE + 45 * MIN);
    expect(estado.hoje.porLei["Lei 8.429/92"]).toBe(600 + 900);
    expect(estado.hoje.porAtividade.leitura).toBe(1500);
    expect(estado.hoje.porAtividade.questoes).toBe(1200);
    expect(totalDia(estado.hoje)).toBe(2700);
  });

  it("abrir OUTRA lei pausa a anterior: cada lei guarda só o seu tempo", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", BASE);
    estado = definirLei(estado, "Lei 10.261/68", BASE + 10 * MIN);
    estado = definirLei(estado, "Lei 8.429/92", BASE + 25 * MIN);
    estado = fecharSegmento(estado, BASE + 30 * MIN);
    expect(estado.hoje.porLei["Lei 8.429/92"]).toBe(600 + 300);
    expect(estado.hoje.porLei["Lei 10.261/68"]).toBe(900);
    expect(leisDoDia(estado.hoje)).toEqual([
      { lei: "Lei 8.429/92", segundos: 900 },
      { lei: "Lei 10.261/68", segundos: 900 },
    ]);
  });

  it("leitura sem lei conta como 'Leitura geral'", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "leitura", null, BASE);
    estado = fecharSegmento(estado, BASE + 2 * MIN);
    expect(estado.hoje.porLei["Leitura geral"]).toBe(120);
  });

  it("pausar guarda o trecho e retomar não conta o intervalo parado", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "questoes", null, BASE);
    estado = pausar(estado, BASE + 10 * MIN);
    expect(estado.hoje.porAtividade.questoes).toBe(600);
    expect(estado.segmento?.pausado).toBe(true);
    // 20 minutos parado não contam.
    estado = retomar(estado, BASE + 30 * MIN);
    estado = fecharSegmento(estado, BASE + 35 * MIN);
    expect(estado.hoje.porAtividade.questoes).toBe(600 + 300);
  });

  it("pausar sem segmento e retomar sem pausa não fazem nada", () => {
    const vazio = estadoVazio(BASE);
    expect(pausar(vazio, BASE)).toBe(vazio);
    expect(retomar(vazio, BASE)).toBe(vazio);
    expect(fecharSegmento(vazio, BASE)).toEqual({ ...vazio, segmento: null });
  });

  it("totaisAoVivo mostra o trecho em contagem sem mudar o estado guardado", () => {
    let estado = estadoVazio(BASE);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", BASE);
    const aoVivo = totaisAoVivo(estado, BASE + 5 * MIN);
    expect(aoVivo.porAtividade.leitura).toBe(300);
    expect(estado.hoje.porAtividade.leitura).toBe(0);
    expect(totalDia(aoVivo)).toBe(300);
  });

  it("virada de dia: o trecho até a meia-noite fica no dia anterior e o histórico guarda 30 dias", () => {
    const ontem = new Date(2026, 10, 23, 23, 50, 0).getTime();
    let estado = estadoVazio(ontem);
    estado = trocarAtividade(estado, "leitura", "Lei 8.429/92", ontem);
    // 10h50 de hoje já é outro dia local.
    const hoje = new Date(2026, 10, 24, 10, 0, 0).getTime();
    estado = virarDia(estado, hoje);
    expect(estado.hoje.data).toBe(diaIso(new Date(hoje)));
    expect(estado.historico).toHaveLength(1);
    expect(estado.historico[0]!.data).toBe("2026-11-23");
    // 10 minutos antes da meia-noite ficaram no dia 23.
    expect(estado.historico[0]!.porAtividade.leitura).toBe(600);
    expect(estado.historico[0]!.porLei["Lei 8.429/92"]).toBe(600);
    // O segmento recomeçou à meia-noite no dia novo.
    expect(estado.segmento?.atividade).toBe("leitura");
    estado = fecharSegmento(estado, hoje);
    expect(estado.hoje.porAtividade.leitura).toBe(10 * 60 * 60);
  });

  it("virada de dia sem estudo no dia anterior não cria dia vazio no histórico", () => {
    const ontem = new Date(2026, 10, 23, 10, 0, 0).getTime();
    const estado = estadoVazio(ontem);
    const hoje = new Date(2026, 10, 24, 10, 0, 0).getTime();
    expect(virarDia(estado, hoje).historico).toHaveLength(0);
  });
});
