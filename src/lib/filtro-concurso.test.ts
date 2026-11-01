import { expect, test } from "vitest";
import { validarFiltro, cargosDaBanca, bancasComMaterias } from "@/lib/edital";
const e:any={texto:"",cargos:["TÉCNICO DPE-PB"],bancas:["FCC","VUNESP"],bancaAtiva:"FCC",cargoAtivo:"TÉCNICO DPE-PB",
materias:[{id:"1",nome:"A",topicos:[],banca:"VUNESP",cargo:"ESCREVENTE"},{id:"2",nome:"B",topicos:[],banca:"VUNESP",cargo:"OFICIAL"}]};
test("x",()=>{expect(bancasComMaterias(e)).toEqual(["VUNESP"]);expect(cargosDaBanca(e,"VUNESP")).toEqual(["ESCREVENTE","OFICIAL"]);
const v=validarFiltro(e);expect(v.bancaAtiva).toBe("");expect(v.cargoAtivo).toBe("");});
