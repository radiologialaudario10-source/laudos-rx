// src/models/ct_torax.ts

export type CtToraxData = {
  modality: "CT";
  studyArea: "Thorax";
  patient: { age: string; sex: string; id: string };
  indication: string;
  technique: string[];
  findings: {
    site: string;
    type: string;
    size_mm: { long: string; short: string };
    margins: string;
    density: string;
    additional: string[];
  }[];
  ancillary: string[];
  comparison: { priorDate: string; change: string };
  impression: string[];
  recommendations: string[];
};

export const defaultCtTorax: CtToraxData = {
  modality: "CT",
  studyArea: "Thorax",
  patient: { age: "", sex: "", id: "" },
  indication: "",
  technique: ["Multislice", "Sem contraste"],
  findings: [
    {
      site: "Lobo superior direito",
      type: "Nódulo",
      size_mm: { long: "", short: "" },
      margins: "regulares",
      density: "sólido",
      additional: [],
    },
  ],
  ancillary: ["Ateromatose"],
  comparison: { priorDate: "", change: "estável" },
  impression: [""],
  recommendations: [""],
};
