import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

// A CORREÇÃO ESTÁ AQUI 👇
// Agora, além de pegar 'auth', 'signIn' e 'signOut',
// nós também pegamos os 'handlers' e já exportamos os métodos GET e POST de dentro dele.
export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})