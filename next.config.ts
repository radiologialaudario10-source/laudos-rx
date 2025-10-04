// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não deixe o ESLint travar o build (especialmente na Vercel)
  eslint: { ignoreDuringBuilds: true },

  // Mantemos TypeScript como bloqueador de erros (boa prática)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
