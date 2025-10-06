// src/models/text_templates.ts
export type TextTemplateKey = "TC Tórax" | "TC Abdome" | "TC Crânio";

export const textTemplates: Record<TextTemplateKey, string> = {
  "TC Tórax": `Indicação:
Técnica:
Achados:
Impressão:`,

  "TC Abdome": `Indicação:
Técnica:
Fígado:
Vias biliares:
Pâncreas:
Baço:
Rins/Adrenais:
Trato gastrointestinal:
Impressão:`,

  "TC Crânio": `Indicação:
Técnica:
Parênquima:
Sistema ventricular:
Espaços subaracnoides:
Calota craniana:
Impressão:`,
};
