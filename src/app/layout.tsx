import AuthProvider from "@/components/AuthProvider"; // Importe o provedor

// ... (outros imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider> {/* Envolva o children */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}