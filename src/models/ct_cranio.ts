// src/models/ct_cranio.ts
import type { CtToraxData } from "./ct_torax";

export const defaultCtCranio: CtToraxData = {
  studyArea: "TC Crânio",
  patient: { age: "", sex: "", id: "" },
  indication: "",
  technique: ["Sem contraste", "Cortes axiais finos", "Reconstruções multiplanares"],
  findings: [
    {
      site: "Parênquima cerebral",
      type: "Hipodensidade",
      size_mm: { long: "", short: "" },
      margins: "mal definidas",
      density: "hipodensa",
      additional: [],
    },
  ],
  ancillary: [],
  comparison: { priorDate: "", change: "estável" },
  impression: [""],
  recommendations: [""],
};
