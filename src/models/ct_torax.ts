// src/models/ct_torax.ts
import { z } from "zod";

/** Schema Zod */
export const ctToraxSchema = z.object({
  studyArea: z.string().optional().default("TC"),
  patient: z.object({
    age: z.string().min(1, "Idade é obrigatória"),
    sex: z.string().min(1, "Sexo é obrigatório"),
    id: z.string().optional().default(""),
    // (Opcional) Se quiser Nome:
    // name: z.string().optional().default(""),
  }),
  // Como o conteúdo clínico vai para o editor rico, estes campos podem ficar opcionais:
  indication: z.string().optional().default(""),
  technique: z.array(z.string()).optional().default([]),
  findings: z.array(
    z.object({
      site: z.string().optional().default(""),
      type: z.string().optional().default(""),
      size_mm: z.object({
        long: z.string().optional().default(""),
        short: z.string().optional().default(""),
      }).optional().default({ long: "", short: "" }),
      margins: z.string().optional().default(""),
      density: z.string().optional().default(""),
      additional: z.array(z.string()).optional().default([]),
    })
  ).optional().default([]),
  ancillary: z.array(z.string()).optional().default([]),
  comparison: z.object({
    priorDate: z.string().optional().default(""),
    change: z.string().optional().default("estável"),
  }).optional().default({ priorDate: "", change: "estável" }),
  impression: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),

  // 👇 NOVO: corpo do laudo (HTML do editor rico)
  freeTextHtml: z.string().optional().default(""),
});

export type CtToraxData = z.infer<typeof ctToraxSchema>;

/** Defaults coerentes (sem usar .parse para não validar antes do usuário digitar) */
export const defaultCtToraxValues: CtToraxData = {
  studyArea: "TC",
  patient: { age: "", sex: "", id: "" },
  indication: "",
  technique: [],
  findings: [],
  ancillary: [],
  comparison: { priorDate: "", change: "estável" },
  impression: [],
  recommendations: [],
  freeTextHtml: "", // 👈 novo
};
