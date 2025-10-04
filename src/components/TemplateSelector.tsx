"use client";
import { TemplateKey, templates } from "@/models/templates";

export default function TemplateSelector({
  value, onChange,
}: { value: TemplateKey; onChange: (v: TemplateKey)=>void }) {
  const options = Object.keys(templates) as TemplateKey[];
  return (
    <div className="flex items-center gap-3">
      <label className="font-medium">Template:</label>
      <select className="border rounded p-2" value={value} onChange={e=>onChange(e.target.value as TemplateKey)}>
        {options.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
    </div>
  );
}
