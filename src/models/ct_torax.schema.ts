// src/models/ct_torax.schema.ts
import { z } from "zod";

/**
 * Schema do formulário de TC de Tórax.
 * Observação: vários campos são opcionais no INPUT (para digitar livre),
 * e recebem defaults no parse (OUTPUT), quando fizer ctToraxSchema.parse(...).
 */
export const ctToraxSchema = z.object({
  studyArea: z.string().optional(),

  patient: z.object({
    age: z.string().min(1, "Idade é obrigatória"),
    sex: z.string().min(1, "Sexo é obrigatório"),
    id: z.string().optional(), // <- opcional no input
  }),

  indication: z.string().min(1, "Indicação é obrigatória"),

  technique: z.array(z.string()).default([]),

  findings: z
    .array(
      z.object({
        site: z.string().min(1, "Local é obrigatório"),
        type: z.string().default("Nódulo"),
        size_mm: z
          .object({
            long: z.string().optional(), // <- opcionais no input
            short: z.string().optional(),
          })
          .default({}),
        margins: z.string().default("regulares"),
        density: z.string().default("sólido"),
        additional: z.array(z.string()).default([]),
      })
    )
    .default([]),

  ancillary: z.array(z.string()).default([]),

  comparison: z
    .object({
      priorDate: z.string().optional(),
      change: z.string().optional(),
    })
    .default({}),

  impression: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

// Tipo “de entrada” (o que o usuário digita; pode ter opcionais)
export type CtToraxInput = z.input<typeof ctToraxSchema>;

// Tipo “de saída” (depois do parse; defaults aplicados)
export type CtToraxForm = z.infer<typeof ctToraxSchema>;
