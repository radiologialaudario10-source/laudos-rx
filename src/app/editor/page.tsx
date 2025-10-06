// src/app/editor/page.tsx
import EditorOneClient from "@/components/EditorOneClient";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6">
        <EditorOneClient />
      </div>
    </main>
  );
}
