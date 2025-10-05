// ARQUIVO: src/lib/reportUtils.ts (VERSÃO CORRIGIDA)

// CORREÇÃO AQUI: Trocamos "ReportData" pelo nome correto "CtToraxData",
// que é o tipo que realmente foi exportado pelo arquivo ct_torax.ts.
import type { CtToraxData } from "@/models/ct_torax";

// E ajustamos o tipo do parâmetro "d" para usar o nome correto também.
export function buildNarrative(d: CtToraxData): string {
  const lines: string[] = [];

  lines.push(`Indicação: ${d.indication || "—"}`);
  lines.push(`Técnica: ${d.technique.join(", ")}`);

  d.findings.forEach((f, i) => {
    // A lógica para montar o texto do laudo está ótima!
    const size = [f.size_mm.long, f.size_mm.short].filter(Boolean).join(" x ") || "—";
    const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
    lines.push(`Achado ${i + 1}: ${f.type || "—"} em ${f.site || "—"}; margens ${f.margins || "—"}; densidade ${f.density || "—"}; medidas ${size} mm${extra}.`);
  });

  if (d.ancillary?.length) {
    lines.push(`Achados acessórios: ${d.ancillary.filter(Boolean).join(", ")}`);
  }

  if (d.comparison?.priorDate) {
    lines.push(`Comparação: Estudo anterior de ${d.comparison.priorDate} evidencia ${d.comparison.change}.`);
  }

  // Usei .join('; ') para ficar mais consistente na leitura.
  if (d.impression?.filter(Boolean).length) {
    lines.push(`Impressão: ${d.impression.filter(Boolean).join("; ")}`);
  }

  if (d.recommendations?.filter(Boolean).length) {
    lines.push(`Recomendações: ${d.recommendations.filter(Boolean).join("; ")}`);
  }

  return lines.join("\n");
}