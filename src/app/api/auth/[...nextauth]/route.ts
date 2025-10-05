// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth" // Importa os handlers da nossa fonte da verdade
export const { GET, POST } = handlers