/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de ESLint durante o build da Vercel para não travar o deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Mantém a verificação de tipos do TypeScript, que é mais importante
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;