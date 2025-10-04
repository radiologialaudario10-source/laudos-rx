// src/components/ReportForm.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import type { CtToraxData } from "@/models/ct_torax";
import { defaultCtTorax } from "@/models/ct_torax";
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";

const DRAFT_KEY = "draft_ct_torax_v1";

export default function ReportForm() {
  const [data, setData] = useState<CtToraxData>(structuredClone(defaultCtTorax));

  // Carrega rascunho na montagem
  useEffect(() => {
    const loaded = loadDraft(DRAFT_KEY, defaultCtTorax);
    setData(structuredClone(loaded));
  }, []);

  // Salva rascunho a cada mudança
  useEffect(() => {
    saveDraft(DRAFT_KEY, data);
  }, [data]);

  // Atualiza um campo por caminho (ex.: "patient.age", "findings.0.site")
  function setField(path: string, value: any) {
    setData((prev) => {
      const clone: any = structuredClone(prev);
      const parts = path.split(".");
      let ref = clone;
      while (parts.length > 1) ref = ref[parts.shift()!];
      ref[parts[0]] = value;
      return clone;
    });
  }

  function addFinding() {
    setData((prev) => ({
      ...prev,
      findings: [
        ...prev.findings,
        {
          site: "",
          type: "Nódulo",
          size_mm: { long: "", short: "" },
          margins: "regulares",
          density: "sólido",
          additional: [],
        },
      ],
    }));
  }

  function clearAll() {
    clearDraft(DRAFT_KEY);
    setData(structuredClone(defaultCtTorax));
  }

  // Validação leve (sem bibliotecas ainda)
  const errors = useMemo(() => {
    return {
      age: !data.patient.age,
      sex: !data.patient.sex,
      indication: !data.indication,
    };
  }, [data]);

  const isValid = !errors.age && !errors.sex && !errors.indication;

  // Narrativa para o preview
  const narrative = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Indicação: ${data.indication || "—"}`);
    lines.push(`Técnica: ${data.technique.join(", ")}`);

    data.findings.forEach((f, i) => {
      const size = [f.size_mm.long, f.size_mm.short].filter(Boolean).join(" x ") || "—";
      const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
      lines.push(
        `Achado ${i + 1}: ${f.type || "—"} em ${f.site || "—"}; margens ${f.margins || "—"}; densidade ${
          f.density || "—"
        }; medidas ${size}${extra}.`
      );
    });

    if (data.ancillary?.length) lines.push(`Achados acessórios: ${data.ancillary.filter(Boolean).join(", ")}`);
    if (data.comparison?.priorDate) lines.push(`Comparação: ${data.comparison.priorDate} → ${data.comparison.change}`);
    if (data.impression?.filter(Boolean).length) lines.push(`Impressão: ${data.impression.filter(Boolean).join("; ")}`);
    if (data.recommendations?.filter(Boolean).length)
      lines.push(`Recomendações: ${data.recommendations.filter(Boolean).join("; ")}`);

    return lines.join("\n");
  }, [data]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* COLUNA ESQUERDA — FORMULÁRIO */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Dados do Paciente</h2>
          <div className="flex gap-2">
            <button type="button" onClick={clearAll} className="no-print px-3 py-2 rounded border">
              Limpar formulário
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-1">
          <input className="border p-2 rounded" placeholder="Idade"
            value={data.patient.age} onChange={(e) => setField("patient.age", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Sexo"
            value={data.patient.sex} onChange={(e) => setField("patient.sex", e.target.value)} />
          <input className="border p-2 rounded" placeholder="ID"
            value={data.patient.id} onChange={(e) => setField("patient.id", e.target.value)} />
        </div>
        {errors.age && <p className="text-red-600 text-sm">Idade é obrigatória.</p>}
        {errors.sex && <p className="text-red-600 text-sm">Sexo é obrigatório.</p>}

        <h2 className="font-semibold mt-4 mb-2">Indicação</h2>
        <input className="border p-2 rounded w-full mb-1" placeholder="Motivo do exame"
          value={data.indication} onChange={(e) => setField("indication", e.target.value)} />
        {errors.indication && <p className="text-red-600 text-sm">Indicação é obrigatória.</p>}

        <h2 className="font-semibold mt-4 mb-2">Técnica</h2>
        <div className="flex gap-2 mb-4">
          {data.technique.map((t, i) => (
            <input key={i} className="border p-2 rounded" value={t}
              onChange={(e) => setField(`technique.${i}`, e.target.value)} />
          ))}
        </div>

        <h2 className="font-semibold mb-2">Achados</h2>
        <div className="space-y-3 mb-2">
          {data.findings.map((f, i) => (
            <div key={i} className="border rounded p-3">
              <div className="grid md:grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="Local (ex.: LSD)" value={f.site}
                  onChange={(e) => setField(`findings.${i}.site`, e.target.value)} />
                <input className="border p-2 rounded" placeholder="Tipo (ex.: Nódulo)" value={f.type}
                  onChange={(e) => setField(`findings.${i}.type`, e.target.value)} />
                <input className="border p-2 rounded" placeholder="Maior eixo (mm)" value={f.size_mm.long}
                  onChange={(e) => setField(`findings.${i}.size_mm.long`, e.target.value)} />
                <input className="border p-2 rounded" placeholder="Menor eixo (mm)" value={f.size_mm.short}
                  onChange={(e) => setField(`findings.${i}.size_mm.short`, e.target.value)} />
                <input className="border p-2 rounded" placeholder="Margens" value={f.margins}
                  onChange={(e) => setField(`findings.${i}.margins`, e.target.value)} />
                <input className="border p-2 rounded" placeholder="Densidade" value={f.density}
                  onChange={(e) => setField(`findings.${i}.density`, e.target.value)} />
              </div>
              <input className="border p-2 rounded w-full mt-2" placeholder="Adicionais (separe por vírgula)"
                onChange={(e) =>
                  setField(
                    `findings.${i}.additional`,
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                } />
            </div>
          ))}
        </div>

        <button className="bg-gray-200 px-3 py-2 rounded mb-4" type="button" onClick={addFinding}>
          + Adicionar Achado
        </button>

        <h2 className="font-semibold mb-2">Comparação</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input className="border p-2 rounded" placeholder="Data do exame prévio (ex.: 2025-01-15)"
            value={data.comparison.priorDate} onChange={(e) => setField("comparison.priorDate", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Mudança (ex.: estável, crescimento)"
            value={data.comparison.change} onChange={(e) => setField("comparison.change", e.target.value)} />
        </div>

        <h2 className="font-semibold mb-2">Impressão e Recomendações</h2>
        <textarea className="border p-2 rounded w-full mb-2" rows={3}
          placeholder="Impressão (separe por ponto e vírgula)"
          onChange={(e) => setField("impression", e.target.value.split(";").map(s => s.trim()).filter(Boolean))} />
        <textarea className="border p-2 rounded w-full" rows={3}
          placeholder="Recomendações (separe por ponto e vírgula)"
          onChange={(e) => setField("recommendations", e.target.value.split(";").map(s => s.trim()).filter(Boolean))} />
      </div>

      {/* COLUNA DIREITA — PRÉ-VISUALIZAÇÃO E PDF */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Pré-visualização</h2>
          <button
            className="no-print px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={() => window.print()}
            disabled={!isValid}
            title={!isValid ? "Preencha idade, sexo e indicação" : "Salvar como PDF"}
          >
            Salvar como PDF
          </button>
        </div>
        <div className="border rounded p-4 print:p-0 whitespace-pre-wrap bg-white">
          <h3 className="font-bold mb-2">Laudo — TC de Tórax</h3>
          <pre className="text-sm leading-6">{narrative}</pre>
        </div>
        {!isValid && (
          <p className="text-xs text-red-600 mt-2">
            Para gerar o PDF, preencha: {errors.age ? "idade" : ""}{errors.age && (errors.sex || errors.indication) ? ", " : ""}
            {errors.sex ? "sexo" : ""}{errors.sex && errors.indication ? " e " : ""}{errors.indication ? "indicação" : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
