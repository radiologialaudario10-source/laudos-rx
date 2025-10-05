// Importamos a função 'auth' usando o atalho padrão
import { auth } from "@/auth";

// Exportamos a função 'auth' com o nome 'middleware'
export const middleware = auth;

// A configuração de quais rotas proteger continua a mesma
export const config = {
  matcher: ["/editor"],
};