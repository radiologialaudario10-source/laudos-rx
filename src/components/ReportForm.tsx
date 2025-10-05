"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ctToraxSchema,
  type CtToraxInput,
  type CtToraxForm,
} from "@/models/ct_torax.schema";
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";

const PdfReport = dynamic(() => import("./PdfReport"), { ssr: false });

type Props = {
  storageKey?: string;
  fallback: CtToraxInput;
};

export default function ReportForm({
  storageKey = "draft_ct_torax_v2",
  fallback,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
    previewRef = useRef<HTMLDivElement>(null)
  } = useForm<CtToraxInput>({
    resolver: zodResolver(ctToraxSchema),
    defaultValues: fallback as DefaultValues<CtToraxInput>,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "findings",
  });

  useEffect(() => {
    const draft = loadDraft<CtToraxInput>(storageKey, fallback);
    reset(draft);
  }, [reset, storageKey, fallback]);

  const formData = watch();
  useEffect(() => {
    saveDraft(storageKey, formData);
  }, [formData, storageKey]);

  const onSubmit = async (data: CtToraxInput) => {
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Falha ao salvar o laudo no servidor');
        }

        const result = await response.json();
        console.log('Laudo salvo com sucesso!', result);
        alert(`Laudo salvo com sucesso! ID do Laudo: ${result.id}`);

      } catch (error) {
        console.error(error);
        alert(`Ocorreu um erro ao salvar o laudo: ${error.message}`);
      }
    };

  const narrative = useMemo(() => {
    const d = formData;
    const lines: string[] = [];
    lines.push(`Indicação: ${d.indication || "—"}`);
    lines.push(`Técnica: ${d.technique?.join(", ") || "—"}`);
    (d.findings ?? []).forEach((f, i) => {
      const size = [f.size_mm?.long, f.size_mm?.short].filter(Boolean).join(" x ") || "—";
      const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
      lines.push(`Achado ${i + 1}: ${f.type || "—"} em ${f.site || "—"}; margens ${f.margins || "—"}; densidade ${f.density || "—"}; medidas ${size} mm${extra}.`);
    });
    if (d.impression?.length) lines.push(`Impressão: ${d.impression.join("; ")}`);
    return lines.join("\n\n");
  }, [formData]);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
      {/* Coluna Esquerda: Formulário */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="font-semibold">Dados do Paciente</h2>
            <div className="flex gap-2">
                <button type="button" className="text-sm p-2 border rounded" onClick={() => {
                    const exampleData: CtToraxInput = {
                        patient: { age: "45", sex: "Feminino", id: "PAC-001" },
                        indication: "Tosse persistente",
                        technique: ["Multislice", "Sem contraste"],
                        findings: [
                            { site: "Lobo inferior esquerdo", type: "Consolidação", size_mm: { long: "30", short: "25" } }
                        ],
                        impression: ["Consolidação sugestiva de processo infeccioso."],
                    };
                    reset(exampleData);
                }}>
                    Preencher Exemplo
                </button>
                <button type="button" className="text-sm p-2 border rounded" onClick={() => reset(fallback as DefaultValues<CtToraxInput>)}>
                    Limpar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input {...register("patient.age")} className="border p-2 rounded" placeholder="Idade" />
          <input {...register("patient.sex")} className="border p-2 rounded" placeholder="Sexo" />
          <input {...register("patient.id")} className="border p-2 rounded" placeholder="ID do Paciente" />
        </div>
        {(errors.patient?.age || errors.patient?.sex) && <p className="text-red-500 text-sm mt-1">{errors.patient.age?.message || errors.patient.sex?.message}</p>}

        <div>
          <h2 className="font-semibold mb-2">Indicação Clínica</h2>
          <textarea {...register("indication")} className="border p-2 rounded w-full" placeholder="Motivo do exame" rows={2}></textarea>
          {errors.indication && <p className="text-red-500 text-sm mt-1">{errors.indication.message}</p>}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Achados</h2>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3 relative bg-white">
                 <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 text-xs">Remover</button>
                 <div className="grid grid-cols-2 gap-2">
                    <input {...register(`findings.${index}.site`)} placeholder="Local" className="border p-2 rounded" />
                    <input {...register(`findings.${index}.type`)} placeholder="Tipo (Nódulo, etc)" className="border p-2 rounded" />
                    <input {...register(`findings.${index}.size_mm.long`)} placeholder="Eixo longo (mm)" className="border p-2 rounded" />
                    <input {...register(`findings.${index}.size_mm.short`)} placeholder="Eixo curto (mm)" className="border p-2 rounded" />
                 </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => append({ site: "", type: "Nódulo" })} className="bg-gray-200 px-3 py-2 rounded mt-2 text-sm">+ Adicionar Achado</button>
        </div>

        <button type="submit" disabled={!isValid} className="mt-4 w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">Salvar Laudo no Banco</button>
      </div>

      {/* Coluna Direita: Preview e Ações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pré-visualização</h2>
        </div>
        <div ref={previewRef} className="border rounded p-4 bg-white min-h-[400px] text-sm leading-relaxed whitespace-pre-wrap print:p-0">
            <h3 className="font-bold text-base mb-4">Laudo de {formData.studyArea || "Tomografia"}</h3>
            <pre className="font-sans">{narrative}</pre>
        </div>
      </div>
    </form>
  );
}