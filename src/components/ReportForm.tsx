"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Padronizado com o modelo ct_torax.ts
import { ctToraxSchema, type CtToraxData } from "@/models/ct_torax";

import { saveDraft, clearDraft } from "@/lib/storage";
import CaseSelector from "./CaseSelector";
import type { TemplateKey } from "@/models/templates";

type Props = {
  storageKey: string;
  initialData: CtToraxData;      // dados carregados (draft ou default)
  defaultTemplate: CtToraxData;  // template "zerado" para o botão Limpar
  activeTemplateKey: TemplateKey;
};

export default function ReportForm({
  storageKey,
  initialData,
  defaultTemplate,
  activeTemplateKey,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue, // 👈 precisamos dele para adicionar linhas em "Técnica"
    formState: { errors, isValid },
  } = useForm<CtToraxData>({
    resolver: zodResolver(ctToraxSchema),
    defaultValues: initialData as DefaultValues<CtToraxData>,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "findings",
  });

  // Reset quando trocar template/draft
  useEffect(() => {
    reset(initialData as DefaultValues<CtToraxData>);
  }, [initialData, reset]);

  // Salvar rascunho a cada mudança
  const formData = watch();
  useEffect(() => {
    saveDraft(storageKey, formData);
  }, [formData, storageKey]);

  // Submit (exemplo salvando em /api/reports)
  const onSubmit = async (data: CtToraxData) => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Falha ao salvar o laudo no servidor");
      }

      const result = await response.json();
      alert(`Laudo salvo com sucesso! ID do Laudo: ${result.id}`);
    } catch (error: any) {
      alert(`Ocorreu um erro ao salvar o laudo: ${error.message}`);
    }
  };

  // Narrativa do preview
  const narrative = useMemo(() => {
    const d = formData;
    const lines: string[] = [];
    lines.push(`Indicação: ${d.indication || "—"}`);
    lines.push(`Técnica: ${d.technique?.join(", ") || "—"}`);
    (d.findings ?? []).forEach((f, i) => {
      const size =
        [f.size_mm?.long, f.size_mm?.short].filter(Boolean).join(" x ") || "—";
      const extra = f.additional?.length
        ? `; adicionais: ${f.additional.join(", ")}`
        : "";
      lines.push(
        `Achado ${i + 1}: ${f.type || "—"} em ${f.site || "—"}; margens ${
          f.margins || "—"
        }; densidade ${f.density || "—"}; medidas ${size} mm${extra}.`
      );
    });
    if (d.impression?.filter(Boolean).length) {
      lines.push(`Impressão: ${d.impression.filter(Boolean).join("; ")}`);
    }
    if (d.recommendations?.filter(Boolean).length) {
      lines.push(
        `Recomendações: ${d.recommendations.filter(Boolean).join("; ")}`
      );
    }
    return lines.join("\n\n");
  }, [formData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
      {/* COLUNA ESQUERDA — FORMULÁRIO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Dados do Paciente</h2>
          <div className="flex items-center gap-2">
            <CaseSelector
              activeTemplateKey={activeTemplateKey}
              onSelect={(tpl) => reset(tpl as DefaultValues<CtToraxData>)}
            />
            <button
              type="button"
              className="text-sm p-2 border rounded hover:bg-gray-50"
              onClick={() => {
                clearDraft(storageKey);
                reset(defaultTemplate as DefaultValues<CtToraxData>);
              }}
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            {...register("patient.age")}
            className="border p-2 rounded"
            placeholder="Idade"
          />
          <input
            {...register("patient.sex")}
            className="border p-2 rounded"
            placeholder="Sexo"
          />
          <input
            {...register("patient.id")}
            className="border p-2 rounded"
            placeholder="ID do Paciente"
          />
        </div>

        {/* Indicação */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Indicação Clínica</h2>
          <textarea
            {...register("indication")}
            className="border p-2 rounded w-full"
            placeholder="Motivo do exame"
            rows={2}
          />
        </div>

        {/* Técnica — inputs dinâmicos */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Técnica</h2>
          <div className="grid grid-cols-2 gap-2">
            {(formData.technique ?? []).map((_, i) => (
              <input
                key={i}
                {...register(`technique.${i}`)}
                placeholder={`Técnica ${i + 1}`}
                className="border p-2 rounded"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [...(formData.technique ?? []), ""];
              setValue("technique", next, { shouldValidate: true });
            }}
            className="mt-2 bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            + Técnica
          </button>
        </div>

        {/* Achados */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Achados</h2>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-3 relative bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  Remover
                </button>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <input
                    {...register(`findings.${index}.site`)}
                    placeholder="Local"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.type`)}
                    placeholder="Tipo (Nódulo, etc)"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.size_mm.long`)}
                    placeholder="Eixo longo (mm)"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.size_mm.short`)}
                    placeholder="Eixo curto (mm)"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.margins`)}
                    placeholder="Margens"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.density`)}
                    placeholder="Densidade"
                    className="border p-2 rounded"
                  />
                  <input
                    {...register(`findings.${index}.additional` as const, {
                      setValueAs: (v) =>
                        String(v)
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                    })}
                    placeholder="Adicionais (vírgula)"
                    className="border p-2 rounded col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                site: "",
                type: "Nódulo",
                size_mm: { long: "", short: "" },
                margins: "",
                density: "",
                additional: [],
              })
            }
            className="bg-gray-200 px-3 py-2 rounded mt-2 text-sm hover:bg-gray-300"
          >
            + Adicionar Achado
          </button>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Salvar Laudo no Banco
        </button>
      </div>

      {/* COLUNA DIREITA — PREVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Pré-visualização</h2>
        </div>
        <div className="border rounded-lg p-4 bg-white min-h-[400px] text-sm leading-relaxed print:p-0">
          <h3 className="font-bold text-base mb-4">
            Laudo de {formData.studyArea || "Tomografia"}
          </h3>
          <pre className="font-sans whitespace-pre-wrap">{narrative}</pre>
        </div>
      </div>
    </form>
  );
}
