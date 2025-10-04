// src/components/ReportForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ctToraxSchema, CtToraxForm } from "@/models/ct_torax.schema";
import { defaultCtTorax } from "@/models/ct_torax"; // seu modelo atual
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";

const DRAFT_KEY = "draft_ct_torax_v2";

function buildNarrative(data: CtToraxForm) {
  const lines: string[] = [];
  lines.push(`Indicação: ${data.indication}`);
  lines.push(`Técnica: ${data.technique.join(", ")}`);
  data.findings.forEach((f, i) => {
    const size = [f.size_mm.long, f.size_mm.short].filter(Boolean).join(" x ") || "—";
    const extra = f.additional && f.additional.length ? `; adicionais: ${f.additional.join(", ")}` : "";
    lines.push(
      `Achado ${i + 1}: ${f.type} em ${f.site}; margens ${f.margins}; densidade ${f.density}; medidas ${size}${extra}.`
    );
  });
  if (data.ancillary?.length) lines.push(`Achados acessórios: ${data.ancillary.join(", ")}`);
  if (data.comparison?.priorDate) lines.push(`Comparação: ${data.comparison.priorDate} → ${data.comparison.change}`);
  if (data.impression?.length) lines.push(`Impressão: ${data.impression.filter(Boolean).join("; ")}`);
  if (data.recommendations?.length) lines.push(`Recomendações: ${data.recommendations.filter(Boolean).join("; ")}`);
  return lines.join("\n");
}

export default function ReportForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CtToraxForm>({
    resolver: zodResolver(ctToraxSchema),
    defaultValues: defaultCtTorax as any, // mesma forma do seu modelo
    mode: "onChange",
  });

  // arrays dinâmicos
  const { fields, append, remove } = useFieldArray({ control, name: "findings" });

  // carregar rascunho na montagem
  useEffect(() => {
    const draft = loadDraft<CtToraxForm>(DRAFT_KEY, defaultCtTorax as any);
    reset(draft);
  }, [reset]);

  // salvar rascunho a cada mudança
  useEffect(() => {
    const sub = watch((val) => saveDraft(DRAFT_KEY, val));
    return () => sub.unsubscribe();
  }, [watch]);

  const narrative = useMemo(() => buildNarrative(watch()), [watch()]);

  const onSubmit = (data: CtToraxForm) => {
    alert("Validação OK — pronto para salvar/baixar PDF.");
    console.log("Dados válidos:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
      {/* ESQUERDA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Dados do Paciente</h2>
          <button type="button" className="no-print px-3 py-2 rounded border" onClick={() => { clearDraft(DRAFT_KEY); reset(defaultCtTorax as any); }}>
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
                <input className="border p-2 rounded" placeholder="Maior eixo (mm)" {...register(`findings.${i}.size_mm.long` as const)} />
                <input className="border p-2 rounded" placeholder="Menor eixo (mm)" {...register(`findings.${i}.size_mm.short` as const)} />
                <input className="border p-2 rounded" placeholder="Margens" {...register(`findings.${i}.margins` as const)} />
                <input className="border p-2 rounded" placeholder="Densidade" {...register(`findings.${i}.density` as const)} />
              </div>
              <input className="border p-2 rounded w-full mt-2" placeholder="Adicionais (vírgula)"
                {...register(`findings.${i}.additional` as const, {
                  setValueAs: (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean),
                })}
              />
              <button type="button" className="mt-2 text-sm text-red-600" onClick={() => remove(i)}>Remover</button>
            </div>
          ))}
        </div>
        <button type="button" className="bg-gray-200 px-3 py-2 rounded mb-4" onClick={() => append({ site: "", type: "Nódulo", size_mm: { long: "", short: "" }, margins: "regulares", density: "sólido", additional: [] })}>
          + Adicionar Achado
        </button>

        <h2 className="font-semibold mb-2">Comparação</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input className="border p-2 rounded" placeholder="Data prévia (AAAA-MM-DD)" {...register("comparison.priorDate")} />
          <input className="border p-2 rounded" placeholder="Mudança (estável/crescimento)" {...register("comparison.change")} />
        </div>

        <h2 className="font-semibold mb-2">Impressão e Recomendações</h2>
        <textarea className="border p-2 rounded w-full mb-2" rows={3} placeholder="Impressão (separe por ;)"
          {...register("impression", { setValueAs: (v) => String(v).split(";").map((s) => s.trim()).filter(Boolean) })} />
        <textarea className="border p-2 rounded w-full" rows={3} placeholder="Recomendações (separe por ;)"
          {...register("recommendations", { setValueAs: (v) => String(v).split(";").map((s) => s.trim()).filter(Boolean) })} />

        <button type="submit" className="mt-3 bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={!isValid}>
          Validar dados
        </button>
      </div>

      {/* DIREITA — PREVIEW + PDF simples */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Pré-visualização</h2>
          <button className="no-print bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50"
                  onClick={() => window.print()} disabled={!isValid}>
            Salvar como PDF
          </button>
        </div>
        <div className="border rounded p-4 print:p-0 whitespace-pre-wrap bg-white min-h-[280px]">
          <h3 className="font-bold mb-2">Laudo — TC de Tórax</h3>
          <pre className="text-sm leading-6">{narrative}</pre>
        </div>
        {!isValid && <p className="text-xs text-red-600 mt-2">Preencha os campos obrigatórios para habilitar o PDF.</p>}
      </div>
    </form>
  );
}
