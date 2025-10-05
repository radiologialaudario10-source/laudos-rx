// AQUI ESTÁ A CORREÇÃO: trocamos "@/auth" por "./auth"
// Isso diz: "procure o arquivo auth.ts na mesma pasta que eu"
export { auth as middleware } from "./auth"

export const config = {
  // A regra para proteger a rota /editor continua a mesma
  matcher: ["/editor"],
}