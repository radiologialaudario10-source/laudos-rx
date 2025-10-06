"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RichEditor from "@/components/RichEditor";
import { textTemplates, type TextTemplateKey } from "@/models/text_templates";

const STORAGE_KEY = "writer_draft_v1";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function WriterPage() {
  const [tpl, setTpl] = useState<TextTemplateKey>("TC Tórax");
  const [html, setHtml] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Carrega rascunho
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHtml(saved);
  }, []);

  // Aplicar template
  const applyTemplate = (key: TextTemplateKey) => {
    setTpl(key);
    // converte texto puro para parágrafos simples
    const lines = textTemplates[key].split("\n").map((l) => `<p>${l || "<br/>"}</p>`).join("");
    setHtml(lines);
  };

  // Salvar rascunho
  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, html || "");
    alert("Rascunho salvo no navegador.");
  };

  // Pré-visualizar (imprimir)
  const printPreview = () => {
    if (!previewRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Pré-visualização</title>
          <style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;line-height:1.6;padding:24px}
            h1{margin-bottom:16px}
          </style>
        </head>
        <body>
          <h1>Laudo</h1>
          ${previewRef.current.innerHTML}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  // Ditado por voz (Web Speech API)
  const toggleDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Ditado não suportado neste navegador.");
      return;
    }
    if (listening) {
      // já está ouvindo -> paramos
      (window as any).__rec?.stop?.();
      setListening(false);
      return;
    }
    const rec = new SR();
    (window as any).__rec = rec;
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      // anexa texto reconhecido como parágrafo
      setHtml((curr) => curr + `<p>${text}</p>`);
    };
    rec.onend = () => setListening(false);

    setListening(true);
    rec.start();
  };

  // IA — melhora/reescreve (usa endpoint local com OpenAI opcional)
  const enhanceWithAI = async () => {
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha na IA");
      setHtml(data.html);
    } catch (e: any) {
      alert(e.message || "Falha ao chamar IA");
    }
  };

  // conteúdo plano para a prévia
  const previewHtml = useMemo(() => html || "<p>—</p>", [
