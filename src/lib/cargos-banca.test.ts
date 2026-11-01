import { expect, test } from "vitest";
import { cargosDaBanca } from "./edital";
test("cargo vinculado à banca aparece mesmo com matérias sem cargo", () => {
  const e: any = { texto: "", cargos: ["AGENTE DE POLÍCIA CIVIL"], bancas: ["INSTITUTO AOCP"],
    bancaDoCargo: { "AGENTE DE POLÍCIA CIVIL": "INSTITUTO AOCP" },
    materias: [{ id: "1", nome: "Português", grupo: "Conhecimento Geral", topicos: [], banca: "INSTITUTO AOCP" }] };
  expect(cargosDaBanca(e, "INSTITUTO AOCP")).toEqual(["AGENTE DE POLÍCIA CIVIL"]);
});
