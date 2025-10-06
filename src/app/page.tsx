"use client";

import { useEffect, useState } from "react";
import ReportForm from "@/components/ReportForm";
import TemplateSelector from "@/components/TemplateSelector";
import { templates, type TemplateKey } from "@/models/templates";

// ✅ Use o modelo padronizado
import type { CtToraxData } from "@/models/ct_torax";
import { loadDraft } from "@/lib/storage";

export default function EditorPage() {
  const [tpl, setTpl] = useState<TemplateKey>("TC Tórax");

  // ✅ Agora o estado usa CtToraxData (não CtToraxInput)
  const [initialData, setInitialData] = useState<CtToraxData>(templates["TC Tórax"]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // quando trocar de template, carregue o rascunho daquele template
    const draftKey = `draft_${tpl}`;
    const defaultTemplate = templates[tpl]; // CtToraxData
    const draft = loadDraft<CtToraxData>(draftKey, defaultTemplate);
    setInitialData(draft);
    setIsReady(true);
  }, [tpl]);

  if (!isReady) {
    return (
      <main className="min-h-screen grid place-items-center text-gray-600">
        Carregando editor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Editor de Laudos</h1>
          <TemplateSelector
            value={tpl}
            onChange={(novoTemplate) => {
              // (opcional) debug:
              // console.log("Template ANTERIOR:", tpl, "→ NOVO:", novoTemplate);
              setTpl(novoTemplate);
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <ReportForm
            storageKey={`draft_${tpl}`}
            initialData={initialData}        // CtToraxData
            defaultTemplate={templates[tpl]} // CtToraxData
            activeTemplateKey={tpl}
          />
        </div>
      </div>
    </main>
  );
}
