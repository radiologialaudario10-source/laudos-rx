"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <p className="text-sm">Logado como {session.user?.name}</p>
        <button 
          onClick={() => signOut()} 
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Sair
        </button>
      </>
    )
  }
  return (
    <button 
      onClick={() => signIn("github")} 
      className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
    >
      Entrar com GitHub
    </button>
  )
}