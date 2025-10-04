import type { ReportData } from "@/models/ct_torax";

export function buildNarrative(d: ReportData): string {
  const lines: string[] = [];
  lines.push(`Indicação: ${d.indication || "—"}`);
  lines.push(`Técnica: ${d.technique.join(", ")}`);
  d.findings.forEach((f, i) => {
    const size = [f.size_mm.long, f.size_mm.short].filter(Boolean).join(" x ") || "—";
    const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
    lines.push(`Achado ${i + 1}: ${f.type || "—"} em ${f.site || "—"}; margens ${f.margins || "—"}; densidade ${f.density || "—"}; medidas ${size}${extra}.`);
  });
  if (d.ancillary?.length) lines.push(`Achados acessórios: ${d.ancillary.filter(Boolean).join(", ")}`);
  if (d.comparison?.priorDate) lines.push(`Comparação: ${d.comparison.priorDate} → ${d.comparison.change}`);
  if (d.impression?.filter(Boolean).length) lines.push(`Impressão: ${d.impression.filter(Boolean).join("; ")}`);
  if (d.recommendations?.filter(Boolean).length) lines.push(`Recomendações: ${d.recommendations.filter(Boolean).join("; ")}`);
  return lines.join("\n");
}
