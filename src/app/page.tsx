"use client";

import { useEffect, useState } from "react";
import ReportForm from "@/components/ReportForm";
import TemplateSelector from "@/components/TemplateSelector";
import { templates, TemplateKey } from "@/models/templates";
import { loadDraft } from "@/lib/storage";
import type { CtToraxForm } from "@/models/ct_torax.schema";

export default function EditorPage() {
  const [tpl, setTpl] = useState<TemplateKey>("TC Tórax");

  useEffect(() => {
    // Quando troca de template, garanta que há um rascunho válido para essa chave
    const draft = loadDraft<CtToraxForm>(`draft_${tpl}`, templates[tpl]);
    localStorage.setItem("draft_ct_torax_v2", JSON.stringify(draft));
    location.hash = tpl; // apenas para refletir a seleção na URL (opcional)
  }, [tpl]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Editor de Laudos</h1>
          <TemplateSelector value={tpl} onChange={setTpl} />
        </div>

        <ReportForm storageKey={`draft_${tpl}`} fallback={templates[tpl]} />
      </div>
    </main>
  );
}
