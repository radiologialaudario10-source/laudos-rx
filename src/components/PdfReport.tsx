import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CtToraxForm } from "@/models/ct_torax.schema";

/**
 * Vamos aceitar:
 *  - data: CtToraxForm
 *  - title (opcional) para o cabeçalho
 *  - e, se por acaso vier "studyArea" junto em data, usamos como fallback
 */
type PdfData = CtToraxForm & { studyArea?: string };
type Props = { data: PdfData; title?: string };

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12 },
  h1: { fontSize: 16, marginBottom: 10 },
  section: { marginBottom: 8 },
  label: { fontWeight: 700 },
  listItem: { marginBottom: 4 },
});

export default function PdfReport({ data, title }: Props) {
  const heading = title ?? data.studyArea ?? "TC";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Laudo — {heading}</Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Paciente ID: </Text>
            {data.patient?.id || "—"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Indicação: </Text>
            {data.indication || "—"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Técnica: </Text>
            {data.technique?.join(", ") || "—"}
          </Text>
        </View>

        {data.findings?.length ? (
          <View style={styles.section}>
            <Text style={styles.label}>Achados:</Text>
            {data.findings.map((f, i) => {
              const size =
                [f.size_mm.long, f.size_mm.short]
                  .filter(Boolean)
                  .join(" x ") || "—";
              const extra = f.additional?.length
                ? `; adicionais: ${f.additional.join(", ")}`
                : "";
              return (
                <Text key={i} style={styles.listItem}>
                  {i + 1}. {f.type} em {f.site}; margens {f.margins}; densidade{" "}
                  {f.density}; medidas {size}
                  {extra}.
                </Text>
              );
            })}
          </View>
        ) : null}

        {data.ancillary?.length ? (
          <View style={styles.section}>
            <Text>
              <Text style={styles.label}>Achados acessórios: </Text>
              {data.ancillary.filter(Boolean).join(", ")}
            </Text>
          </View>
        ) : null}

        {data.comparison?.priorDate ? (
          <View style={styles.section}>
            <Text>
              <Text style={styles.label}>Comparação: </Text>
              {data.comparison.priorDate} → {data.comparison.change}
            </Text>
          </View>
        ) : null}

        {data.impression?.length ? (
          <View style={styles.section}>
            <Text>
              <Text style={styles.label}>Impressão: </Text>
              {data.impression.filter(Boolean).join("; ")}
            </Text>
          </View>
        ) : null}

        {data.recommendations?.length ? (
          <View style={styles.section}>
            <Text>
              <Text style={styles.label}>Recomendações: </Text>
              {data.recommendations.filter(Boolean).join("; ")}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
