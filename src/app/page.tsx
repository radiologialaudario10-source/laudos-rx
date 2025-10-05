import AuthButtons from "@/components/AuthButtons"; // Importe o componente

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Site de Laudos Radiológicos</h1>
          <div className="flex items-center gap-2">
            <AuthButtons /> {/* Adicione os botões aqui */}
          </div>
        </div>
        <p className="mb-6">
          Bem-vindo! Use o editor para gerar laudos estruturados e exportar como PDF.
        </p>
        <a
          href="/editor"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ir para o Editor de Laudos
        </a>
      </div>
    </main>
  );
}