// src/app/editor/page.tsx
import ReportForm from "@/components/ReportForm";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-bold">Editor de Laudos (TC de Tórax)</h1>
        <ReportForm />
      </div>
    </main>
  );
}
