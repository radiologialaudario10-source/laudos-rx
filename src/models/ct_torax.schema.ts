import { z } from "zod";

/**
 * Schema de validação para o formulário de TC de Tórax.
 * Ele define os campos, se são opcionais e as mensagens de erro.
 */
export const ctToraxSchema = z.object({
  studyArea: z.string().optional(),

  patient: z.object({
    age: z.string().min(1, "Idade é obrigatória"),
    sex: z.string().min(1, "Sexo é obrigatório"),
    id: z.string().optional(),
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
            long: z.string().optional(),
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

// O tipo de DADOS DE ENTRADA do formulário (o que o usuário digita)
export type CtToraxInput = z.input<typeof ctToraxSchema>;

// O tipo de DADOS DE SAÍDA após a validação (com defaults aplicados)
export type CtToraxForm = z.infer<typeof ctToraxSchema>;