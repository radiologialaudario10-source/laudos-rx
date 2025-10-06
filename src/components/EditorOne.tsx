"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useDebouncedFlag } from "@/lib/useDebouncedFlag";
import { polishPt } from "@/lib/speech";
import { templates, type TemplateKey } from "@/models/templates";
import { defaultCtToraxValues, type CtToraxData } from "@/models/ct_torax";
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";

// carrega o editor rico somente no cliente (evita SSR mismatch)
const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

type PreviewProps = { html: string; onClose: () => void };
function PreviewModal({ html, onClose }: PreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white w-[min(900px,92vw)] max-h-[85vh] rounded shadow-lg overflow-hidden">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">Pré-visualização</h3>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-gray-100">
            Fechar
          </button>
        </div>
        <div className="p-4 overflow-auto">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

/** ===== Tipos mínimos para Web Speech API (pra evitar 'any') ===== */
interface SRAlternative {
  transcript: string;
  confidence?: number;
}
interface SRResult {
  isFinal: boolean;
  0: SRAlternative;
  length: number;
}
interface SRResultList {
  length: number;
  [index: number]: SRResult;
}
interface SREvent extends Event {
  resultIndex: number;
  results: SRResultList;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart?: (ev: Event) => void;
  onresult?: (ev: SREvent) => void;
  onerror?: (ev: any) => void; // tipagem fraca só aqui
  onend?: (ev: Event) => void;
}
// declarações globais para o construtor
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}
/** =============================================================== */

/** Gera um HTML inicial a partir do template de Tórax */
function narrativeFromTorax(data: CtToraxData): string {
  const lines: string[] = [];
  lines.push(`<p><strong>Indicação:</strong> ${data.indication || "—"}</p>`);
  lines.push(`<p><strong>Técnica:</strong> ${data.technique?.join(", ") || "—"}</p>`);
  (data.findings ?? []).forEach((f, i) => {
    const size = [f.size_mm?.long, f.size_mm?.short].filter(Boolean).join(" x ") || "—";
    const extra = f.additional?.length ? `; adicionais: ${f.additional.join(", ")}` : "";
    lines.push(
      `<p><strong>Achado ${i + 1}:</strong> ${f.type || "—"} em ${f.site || "—"}; margens ${
        f.margins || "—"
      }; densidade ${f.density || "—"}; medidas ${size} mm${extra}.</p>`
    );
  });
  if (data.impression?.filter(Boolean).length) {
    lines.push(`<p><strong>Impressão:</strong> ${data.impression.filter(Boolean).join("; ")}</p>`);
  }
  if (data.recommendations?.filter(Boolean).length) {
    lines.push(
      `<p><strong>Recomendações:</strong> ${data.recommendations.filter(Boolean).join("; ")}</p>`
    );
  }
  return lines.join("\n");
}

export default function EditorOne() {
  const [tpl, setTpl] = useState<TemplateKey>("TC Tórax");
  const [html, setHtml] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Ditado
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState(""); // parcial “ao vivo”
  const recRef = useRef<SpeechRecognition | null>(null);

  // status visual de salvamento local (draft)
  const saveStatus = useDebouncedFlag(html, 800);

  const storageKey = useMemo(() => `editor_one_${tpl}`, [tpl]);

  /** Carrega rascunho ao trocar template */
  useEffect(() => {
    const draft = loadDraft<string>(storageKey, "");
    setHtml(draft);
  }, [storageKey]);

  /** Salva rascunho automático */
  useEffect(() => {
    saveDraft(storageKey, html);
  }, [html, storageKey]);

  /** Atalho de teclado: ⌘⇧D (Mac) ou Ctrl+Shift+D (Win) para ligar/desligar ditado */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.shiftKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        if (listening) stopDictation();
        else startDictation();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening]);

  /** Aplicar template */
  function applyTemplate(key: TemplateKey) {
    setTpl(key);
    if (key === "TC Tórax") {
      const text = narrativeFromTorax(defaultCtToraxValues);
      setHtml(text);
    } else {
      setHtml(
        `<p><strong>Indicação:</strong> —</p>
         <p><strong>Técnica:</strong> —</p>
         <p><strong>Achados:</strong></p>
         <p><strong>Impressão:</strong> —</p>
         <p><strong>Recomendações:</strong> —</p>`
      );
    }
  }

  /** ============ DITADO POR VOZ ============ */
  function startDictation() {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) {
      alert("Seu navegador não suporta ditado por voz (use Google Chrome).");
      return;
    }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setListening(true);
      setInterim("");
    };

    rec.onresult = (event: SREvent) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const transcript = r[0].transcript;
        if (r.isFinal) finalChunk += transcript + " ";
        else interimChunk += transcript;
      }

      // grava apenas o FINAL, já polido
      if (finalChunk.trim()) {
        const polido = polishPt(finalChunk.trim());
        setHtml((prev) => {
          const sep = prev && !prev.endsWith(" ") ? " " : "";
          return prev + sep + polido + " ";
        });
      }

      // mostra parcial “ao vivo”
      setInterim(interimChunk);
    };

    rec.onerror = () => {
      setListening(false);
      setInterim("");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    rec.start();
    recRef.current = rec;
  }

  function stopDictation() {
    recRef.current?.stop();
    setListening(false);
    setInterim("");
  }
  /** ======================================== */

  /** Salvar no backend (usa /api/reports) */
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, template: tpl }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      alert("Laudo salvo com sucesso!");
    } catch (e) {
      alert("Erro ao salvar o laudo.");
      // veja o console do navegador/terminal para detalhes
      // console.error(e);
    } finally {
      setSaving(false);
    }
  }

  /** IA (usa /api/ai/rewrite) */
  async function handleAi() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.html) setHtml(data.html);
      else alert("IA indisponível. Texto não alterado.");
    } catch {
      alert("IA indisponível agora.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Editor de Laudos</h1>

          {/* Seleção de template */}
          <div className="relative">
            <select
              value={tpl}
              onChange={(e) => applyTemplate(e.target.value as TemplateKey)}
              className="border rounded px-3 py-2"
            >
              {(Object.keys(templates) as TemplateKey[]).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="px-3 py-2 rounded border hover:bg-gray-50"
            onClick={() => {
              clearDraft(storageKey);
              setHtml("");
            }}
            title="Limpar rascunho"
          >
            Limpar
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* badge de status do salvamento local */}
          <span
            className={
              "text-xs px-2 py-1 rounded " +
              (saveStatus === "saving"
                ? "bg-yellow-100 text-yellow-700"
                : saveStatus === "saved"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600")
            }
            title="Status do salvamento local"
          >
            {saveStatus === "saving" ? "Salvando…" : saveStatus === "saved" ? "Salvo" : "—"}
          </span>

          {/* Ditado */}
          {listening ? (
            <button
              type="button"
              className="px-3 py-2 rounded bg-red-600 text-white"
              onClick={stopDictation}
              title="Parar ditado (⌘⇧D / Ctrl+Shift+D)"
            >
              ● Gravando (parar)
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-2 rounded border hover:bg-gray-50"
              onClick={startDictation}
              title="Ditado por voz (⌘⇧D / Ctrl+Shift+D)"
            >
              🎤 Ditado
            </button>
          )}

          {/* IA */}
          <button
            type="button"
            className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
            onClick={handleAi}
            disabled={aiLoading}
            title="Ajustar texto com IA"
          >
            {aiLoading ? "IA…" : "✨ IA"}
          </button>

          {/* Pré-visualizar */}
          <button
            type="button"
            className="px-3 py-2 rounded border hover:bg-gray-50"
            onClick={() => setShowPreview(true)}
          >
            Pré-visualizar
          </button>

          {/* Salvar */}
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Parcial do ditado ao vivo (não grava, só exibe) */}
      {listening && interim && (
        <div className="text-sm text-gray-500">
          <strong>Transcrevendo… </strong>
          <span className="italic">{interim}</span>
        </div>
      )}

      {/* Editor */}
      <RichEditor value={html} onChange={setHtml} />

      {/* Modal de Prévia */}
      {showPreview && <PreviewModal html={html} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
