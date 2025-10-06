"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value || "",
    // IMPORTANTE: evita mismatch na hidratação
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Quando "value" muda de fora (ditado, IA, limpar, template...), atualiza o editor
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, false, { preserveWhitespace: true });
      editor.commands.focus("end");
    }
    if (!value && current !== "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  return (
    <div className="border rounded bg-white">
      <div className="border-b p-2 text-sm text-gray-600">
        <span className="font-medium">Editor</span> — use **/** para atalhos
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
