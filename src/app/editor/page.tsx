"use client";

import { useEffect, useState } from "react";
import ReportForm from "@/components/ReportForm";
import TemplateSelector from "@/components/TemplateSelector";
import { templates, TemplateKey } from "@/models/templates";
import type { CtToraxForm } from "@/models/ct_torax.schema";
import { loadDraft } from "@/lib/storage";

export default function EditorPage() {
  const [tpl, setTpl] = useState<TemplateKey>("TC Tórax");
  const [fallback, setFallback] = useState<CtToraxForm>(templates["TC Tórax"]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // carrega rascunho tipado do localStorage (no cliente)
    const key = `draft_${tpl}`;
    const base = templates[tpl];
    const draft = loadDraft<CtToraxForm>(key, base);
    setFallback(draft);
    setReady(true);
  }, [tpl]);

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center text-gray-600">
        Carregando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Editor de Laudos</h1>
          <TemplateSelector value={tpl} onChange={setTpl} />
        </div>

        <ReportForm storageKey={`draft_${tpl}`} fallback={fallback} />
      </div>
    </main>
  );
}
