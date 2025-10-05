import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CtToraxForm } from "@/models/ct_torax.schema";

type Props = { data: CtToraxForm };

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, lineHeight: 1.5 },
  h1: { fontSize: 16, marginBottom: 12, fontWeight: "bold" },
  section: { marginBottom: 10 },
  label: { fontWeight: "bold" },
  listItem: { marginBottom: 4, marginLeft: 10 },
});

export default function PdfReport({ data }: Props) {
  const title = `Laudo — ${data.studyArea ?? "Tomografia Computadorizada"}`;
  const tecnica = data.technique?.join(", ") || "Não especificada";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{title}</Text>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Paciente ID: </Text>{data.patient?.id || "N/A"}</Text>
          <Text><Text style={styles.label}>Idade/Sexo: </Text>{`${data.patient?.age || "N/A"} / ${data.patient?.sex || "N/A"}`}</Text>
        </View>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Indicação: </Text>{data.indication || "N/A"}</Text>
          <Text><Text style={styles.label}>Técnica: </Text>{tecnica}</Text>
        </View>

        {data.findings?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Achados:</Text>
            {data.findings.map((f, i) => {
              const size = [f.size_mm?.long, f.size_mm?.short].filter(Boolean).join(" x ") || "—";
              const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
              const line = `Achado ${i + 1}: ${f.type} em ${f.site}; margens ${f.margins}; densidade ${f.density}; medidas ${size} mm${extra}.`;
              return <Text key={i} style={styles.listItem}>• {line}</Text>;
            })}
          </View>
        )}

        {data.impression?.length > 0 && (
          <View style={styles.section}>
            <Text><Text style={styles.label}>Impressão: </Text>{data.impression.join("; ")}</Text>
          </View>
        )}
        
        {data.recommendations?.length > 0 && (
          <View style={styles.section}>
            <Text><Text style={styles.label}>Recomendações: </Text>{data.recommendations.join("; ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}