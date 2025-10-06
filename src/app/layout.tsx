// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header"; // Importamos nosso novo cabeçalho

export const metadata: Metadata = {
  title: "Editor de Laudos",
  description: "Gerador de laudos radiológicos estruturados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>
          <Header /> {/* O cabeçalho fica aqui, sempre visível */}
          <main className="max-w-6xl mx-auto p-6">
            {children} {/* O conteúdo de cada página será renderizado aqui */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}