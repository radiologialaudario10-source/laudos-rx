"use client";

import dynamic from "next/dynamic";
// PDF por template (client-only)
const PdfReport = dynamic(() => import("./PdfReport"), { ssr: false });

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ctToraxSchema, CtToraxForm } from "@/models/ct_torax.schema";
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";

export default function ReportForm({
  storageKey = "draft_ct_torax_v2",
  fallback,
}: {
  storageKey?: string;
  fallback: CtToraxForm;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CtToraxForm>({
    resolver: zodResolver(ctToraxSchema),
    defaultValues: fallback as any,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "findings" });

  // Carrega rascunho ao montar / trocar template
  useEffect(() => {
    const draft = loadDraft<CtToraxForm>(storageKey, fallback as any);
    reset(draft);
  }, [reset, storageKey, fallback]);

  // Salva rascunho a cada mudança
  useEffect(() => {
    const sub = watch((val) => saveDraft(storageKey, val));
    return () => sub.unsubscribe();
  }, [watch, storageKey]);

  // Narrativa para o preview
  const narrative = useMemo(() => {
    const data = watch();
    const lines: string[] = [];
    lines.push(`Indicação: ${data.indication}`);
    lines.push(`Técnica: ${data.technique.join(", ")}`);
    data.findings.forEach((f, i) => {
      const size = [f.size_mm.long, f.size_mm.short].filter(Boolean).join(" x ") || "—";
      const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
      lines.push(
        `Achado ${i + 1}: ${f.type} em ${f.site}; margens ${f.margins}; densidade ${f.density}; medidas ${size}${extra}.`
      );
    });
    if (data.ancillary?.length) lines.push(`Achados acessórios: ${data.ancillary.filter(Boolean).join(", ")}`);
    if (data.comparison?.priorDate) lines.push(`Comparação: ${data.comparison.priorDate} → ${data.comparison.change}`);
    if (data.impression?.length) lines.push(`Impressão: ${data.impression.filter(Boolean).join("; ")}`);
    if (data.recommendations?.length) lines.push(`Recomendações: ${data.recommendations.filter(Boolean).join("; ")}`);
    return lines.join("\n");
  }, [watch()]);

  const onSubmit = (data: CtToraxForm) => {
    alert("Validação OK — pronto para salvar/baixar PDF.");
    console.log("Dados válidos:", data);
  };

  // ---- DOWNLOAD DE PDF (react-pdf com fallback em html2pdf.js) ----
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      // 1) Tenta com @react-pdf/renderer
      try {
        const ReactPDF: any = await import("@react-pdf/renderer");
        const pdfFn = ReactPDF?.pdf ?? ReactPDF?.default?.pdf;
        if (typeof pdfFn === "function") {
          const element = <PdfReport data={watch()} />;
          const blob: Blob = await pdfFn(element).toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `laudo-${(watch().patient?.id || "sem-id")}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          return; // sucesso -> sai
        }
        console.warn("react-pdf indisponível, usando fallback html2pdf.js");
      } catch (e) {
        console.warn("react-pdf falhou, usando fallback html2pdf.js", e);
      }

      // 2) Fallback robusto: html2pdf.js no DOM do preview
      const html2pdf = (await import("html2pdf.js")).default;
      if (!previewRef.current) throw new Error("preview não encontrado");
      await html2pdf()
        .from(previewRef.current)
        .set({
          margin: 10,
          filename: `laudo-${(watch().patient?.id || "sem-id")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } catch (e) {
      console.error(e);
      alert("Falha ao gerar PDF. Abra o console e me envie o erro que eu corrijo.");
    } finally {
      setDownloading(false);
    }
  };
  // ---------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
      {/* COLUNA ESQUERDA — FORMULÁRIO */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Dados do Paciente</h2>
          <button
            type="button"
            className="no-print px-3 py-2 rounded border"
            onClick={() => {
              clearDraft(storageKey);
              reset(fallback as any);
            }}
          >
            Limpar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-1">
          <input className="border p-2 rounded" placeholder="Idade" {...register("patient.age")} />
          <input className="border p-2 rounded" placeholder="Sexo" {...register("patient.sex")} />
          <input className="border p-2 rounded" placeholder="ID" {...register("patient.id")} />
        </div>
        {(errors.patient?.age || errors.patient?.sex) && (
          <p className="text-red-600 text-sm">
            {errors.patient?.age?.message || errors.patient?.sex?.message}
          </p>
        )}

        <h2 className="font-semibold mt-4 mb-2">Indicação</h2>
        <input className="border p-2 rounded w-full mb-1" placeholder="Motivo do exame" {...register("indication")} />
        {errors.indication && <p className="text-red-600 text-sm">{errors.indication.message}</p>}

        <h2 className="font-semibold mt-4 mb-2">Técnica</h2>
        <div className="flex gap-2 mb-4">
          {watch("technique").map((_, i) => (
            <input key={i} className="border p-2 rounded" {...register(`technique.${i}` as const)} />
          ))}
        </div>

        <h2 className="font-semibold mb-2">Achados</h2>
        <div className="space-y-3 mb-2">
          {fields.map((f, i) => (
            <div key={f.id} className="border rounded p-3">
              <div className="grid md:grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="Local" {...register(`findings.${i}.site` as const)} />
                <input className="border p-2 rounded" placeholder="Tipo" {...register(`findings.${i}.type` as const)} />
                <input
                  className="border p-2 rounded"
                  placeholder="Maior eixo (mm)"
                  {...register(`findings.${i}.size_mm.long` as const)}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Menor eixo (mm)"
                  {...register(`findings.${i}.size_mm.short` as const)}
                />
                <input className="border p-2 rounded" placeholder="Margens" {...register(`findings.${i}.margins` as const)} />
                <input className="border p-2 rounded" placeholder="Densidade" {...register(`findings.${i}.density` as const)} />
              </div>
              <input
                className="border p-2 rounded w-full mt-2"
                placeholder="Adicionais (vírgula)"
                {...register(`findings.${i}.additional` as const, {
                  setValueAs: (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean),
                })}
              />
              <button type="button" className="mt-2 text-sm text-red-600" onClick={() => remove(i)}>
                Remover
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="bg-gray-200 px-3 py-2 rounded mb-4"
          onClick={() =>
            append({
              site: "",
              type: "Nódulo",
              size_mm: { long: "", short: "" },
              margins: "regulares",
              density: "sólido",
              additional: [],
            })
          }
        >
          + Adicionar Achado
        </button>

        <h2 className="font-semibold mb-2">Comparação</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Data prévia (AAAA-MM-DD)"
            {...register("comparison.priorDate")}
          />
          <input
            className="border p-2 rounded"
            placeholder="Mudança (estável/crescimento)"
            {...register("comparison.change")}
          />
        </div>

        <h2 className="font-semibold mb-2">Impressão e Recomendações</h2>
        <textarea
          className="border p-2 rounded w-full mb-2"
          rows={3}
          placeholder="Impressão (separe por ;)"
          {...register("impression", {
            setValueAs: (v) => String(v).split(";").map((s) => s.trim()).filter(Boolean),
          })}
        />
        <textarea
          className="border p-2 rounded w-full"
          rows={3}
          placeholder="Recomendações (separe por ;)"
          {...register("recommendations", {
            setValueAs: (v) => String(v).split(";").map((s) => s.trim()).filter(Boolean),
          })}
        />

        <button type="submit" className="mt-3 bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={!isValid}>
          Validar dados
        </button>
      </div>

      {/* COLUNA DIREITA — PREVIEW + EXPORT */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Pré-visualização</h2>

          <div className="no-print flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid}
              title={!isValid ? "Preencha os campos obrigatórios" : "Salvar como PDF (impressão)"}
            >
              Salvar como PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 py-2 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid || downloading}
              title={!isValid ? "Preencha os campos obrigatórios" : "Baixar PDF (Pro)"}
            >
              {downloading ? "Gerando..." : "Baixar PDF (Pro)"}
            </button>
          </div>
        </div>

        <div
          ref={previewRef}
          className="border rounded p-4 print:p-0 whitespace-pre-wrap bg-white min-h-[280px]"
        >
          <h3 className="font-bold mb-2">Laudo — {watch("studyArea") || "TC"}</h3>
          <pre className="text-sm leading-6">{narrative}</pre>
        </div>
      </div>
    </form>
  );
}
