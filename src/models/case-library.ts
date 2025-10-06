// src/models/case-library.ts
import type { CtToraxInput } from "./ct_torax.schema";

type CaseLibrary = {
  [key: string]: {
    [caseName: string]: CtToraxInput;
  };
};

export const caseLibrary: CaseLibrary = {
  // Chave agora é "Tórax", para bater com o `studyArea` do template
  "Tórax": {
    "Pneumonia Lobar": {
      studyArea: "Tórax", // Garante consistência
      patient: { age: "65", sex: "M", id: "PAC-PNEUMO-01" },
      indication: "Febre, tosse produtiva e dispneia há 3 dias.",
      technique: ["Multislice", "Sem contraste"],
      findings: [{
        site: "Lobo inferior direito",
        type: "Consolidação parenquimatosa",
        size_mm: {},
        margins: "mal definidos",
        density: "coeficiente de atenuação de partes moles",
        additional: ["Broncogramas aéreos no interior"],
      }],
      impression: ["Consolidação no lobo inferior direito, compatível com processo infeccioso (pneumonia)."],
    },
    "DPOC (Enfisema)": {
      studyArea: "Tórax",
      patient: { age: "72", sex: "M", id: "PAC-DPOC-01" },
      indication: "Dispneia crônica, tabagista de longa data.",
      technique: ["Multislice", "Alta resolução", "Sem contraste"],
      findings: [{
        site: "Difusamente nos parênquimas pulmonares",
        type: "Enfisema centrolobular e parasseptal",
        size_mm: {},
        margins: "",
        density: "hipoatenuação",
        additional: ["Bolhas apicais", "Aprisionamento aéreo"],
      }],
      impression: ["Sinais de enfisema pulmonar difuso, compatível com DPOC."],
    },
  },
  // Chave agora é "Abdome"
  "Abdome": {
    "Apendicite Aguda": {
      studyArea: "Abdome",
      patient: { age: "24", sex: "F", id: "PAC-APEND-01" },
      indication: "Dor em fossa ilíaca direita há 24 horas.",
      technique: ["Multislice", "Com contraste IV"],
      findings: [{
        site: "Fossa ilíaca direita",
        type: "Apendice cecal distendido",
        size_mm: { long: "12" },
        margins: "",
        density: "paredes espessadas com realce pós-contraste",
        additional: ["Densificação da gordura mesentérica adjacente"],
      }],
      impression: ["Achados tomográficos sugestivos de apendicite aguda não complicada."],
    },
  },
  // Chave agora é "Crânio" (ainda vazio, por isso não aparecerá)
  "Crânio": {},
};