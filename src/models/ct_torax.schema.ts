// src/models/ct_torax.schema.ts
import { z } from "zod";

export const findingSchema = z.object({
  site: z.string().min(1, "Informe o local"),
  type: z.string().min(1, "Informe o tipo"),
  size_mm: z.object({
    long: z.string().optional().default(""),
    short: z.string().optional().default(""),
  }),
  margins: z.string().optional().default("regulares"),
  density: z.string().optional().default("sólido"),
  additional: z.array(z.string()).optional().default([]),
});

export const ctToraxSchema = z.object({
  patient: z.object({
    age: z.string().min(1, "Idade obrigatória"),
    sex: z.string().min(1, "Sexo obrigatório"),
    id: z.string().optional().default(""),
  }),
  indication: z.string().min(1, "Indicação obrigatória"),
  technique: z.array(z.string()).nonempty("Informe ao menos 1 item de técnica"),
  findings: z.array(findingSchema).min(1, "Inclua ao menos 1 achado"),
  ancillary: z.array(z.string()).optional().default([]),
  comparison: z.object({
    priorDate: z.string().optional().default(""),
    change: z.string().optional().default("estável"),
  }),
  impression: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
});
export type CtToraxForm = z.infer<typeof ctToraxSchema>;
