// src/components/PdfReport.tsx
"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CtToraxForm } from "@/models/ct_torax.schema";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, lineHeight: 1.4 },
  h1: { fontSize: 16, marginBottom: 8 },
  section: { marginTop: 8 },
  label: { fontWeight: 700 },
});

export default function PdfReport({ data }: { data: CtToraxForm }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Laudo — {data.studyArea || "TC"}</Text>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Paciente ID: </Text>{data.patient?.id || "—"}</Text>
          <Text><Text style={styles.label}>Indicação: </Text>{data.indication || "—"}</Text>
          <Text><Text style={styles.label}>Técnica: </Text>{data.technique?.join(", ")}</Text>
        </View>

        {data.findings?.map((f, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.label}>Achado {i + 1}</Text>
            <Text>{`${f.type || "—"} em ${f.site || "—"}; margens ${f.margins || "—"}; densidade ${f.density || "—"}; medidas ${(f.size_mm.long || "—")} x ${(f.size_mm.short || "—")} mm.`}</Text>
            {!!f.additional?.length && <Text>Adicionais: {f.additional.join(", ")}</Text>}
          </View>
        ))}

        {!!data.impression?.filter(Boolean).length && (
          <View style={styles.section}>
            <Text style={styles.label}>Impressão</Text>
            <Text>{data.impression.filter(Boolean).join("; ")}</Text>
          </View>
        )}

        {!!data.recommendations?.filter(Boolean).length && (
          <View style={styles.section}>
            <Text style={styles.label}>Recomendações</Text>
            <Text>{data.recommendations.filter(Boolean).join("; ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
