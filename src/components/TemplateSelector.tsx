// src/components/TemplateSelector.tsx
"use client";
import { TemplateKey, templates } from "@/models/templates";

export default function TemplateSelector({
  value,
  onChange,
}: {
  value: TemplateKey;
  onChange: (v: TemplateKey) => void;
}) {
  const options = Object.keys(templates) as TemplateKey[];
  
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="template-select" className="text-sm font-medium text-gray-700">Template:</label>
      <select
        id="template-select"
        className="border-gray-300 rounded-md shadow-sm p-2 bg-white text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as TemplateKey)}
      >
        {options.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  );
}