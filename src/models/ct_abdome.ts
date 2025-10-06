// src/models/ct_abdome.ts
import type { CtToraxData } from "./ct_torax";

export const defaultCtAbdome: CtToraxData = {
  studyArea: "TC Abdome",
  patient: { age: "", sex: "", id: "" },
  indication: "",
  technique: ["TC Multislice", "Fase portal", "Com contraste EV"],
  findings: [
    {
      site: "Fígado segmento VI",
      type: "Lesão hipodensa",
      size_mm: { long: "", short: "" },
      margins: "regulares",
      density: "hipodensa",
      additional: [],
    },
  ],
  ancillary: [],
  comparison: { priorDate: "", change: "estável" },
  impression: [""],
  recommendations: [""],
};
