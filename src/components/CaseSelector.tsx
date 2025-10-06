"use client";
import { templates, type TemplateKey } from "@/models/templates";

type Props = {
  activeTemplateKey: TemplateKey;
  onSelect: (tplData: unknown) => void; // recebe o OBJETO do template
};

export default function CaseSelector({ activeTemplateKey, onSelect }: Props) {
  return (
    <select
      className="border rounded p-2 text-sm"
      value={activeTemplateKey}
      onChange={(e) => {
        const key = e.target.value as TemplateKey;
        onSelect(templates[key]); // entrega o OBJETO do template pro reset
      }}
    >
      {Object.keys(templates).map((k) => (
        <option key={k} value={k}>
          {k}
        </option>
      ))}
    </select>
  );
}
