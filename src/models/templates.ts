// src/models/templates.ts
import { defaultCtToraxValues, type CtToraxData } from "./ct_torax";
import { defaultCtAbdome } from "./ct_abdome";
import { defaultCtCranio } from "./ct_cranio";

// Definimos explicitamente para melhor autocomplete
export type TemplateKey = "TC Tórax" | "TC Abdome" | "TC Crânio";

// Todos os templates devem ter o MESMO shape (CtToraxData)
export const templates: Record<TemplateKey, CtToraxData> = {
  "TC Tórax": defaultCtToraxValues,
  "TC Abdome": defaultCtAbdome,
  "TC Crânio": defaultCtCranio,
};
