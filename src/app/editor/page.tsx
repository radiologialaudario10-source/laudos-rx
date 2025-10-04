"use client";
import { useState } from "react";
import TemplateSelector from "@/components/TemplateSelector";
import ReportForm from "@/components/ReportForm";
import { templates, TemplateKey } from "@/models/templates";

export default function EditorPage() {
  const [tpl, setTpl] = useState<TemplateKey>("TC Tórax");

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Editor de Laudos</h1>
          <TemplateSelector value={tpl} onChange={setTpl} />
        </div>

        {/* storageKey MUDA por template e força rascunho separado */
        /* key={tpl} força remontagem do form ao trocar o template */}
        <ReportForm
          key={tpl}
          storageKey={`draft_${tpl}`}
          fallback={templates[tpl] as any}
        />
      </div>
    </main>
  );
}
