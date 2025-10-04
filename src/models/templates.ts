import { defaultCtTorax } from "./ct_torax";
import { defaultCtAbdome } from "./ct_abdome";
import { defaultCtCranio } from "./ct_cranio";
export const templates = {
  "TC Tórax": defaultCtTorax,
  "TC Abdome": defaultCtAbdome,
  "TC Crânio": defaultCtCranio,
};
export type TemplateKey = keyof typeof templates;
