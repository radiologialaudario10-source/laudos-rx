// src/components/Header.tsx
import AuthButtons from "@/components/AuthButtons";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <a href="/" className="font-bold text-lg hover:text-gray-300">
          Editor de Laudos
        </a>
        <div className="flex items-center gap-4">
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
}