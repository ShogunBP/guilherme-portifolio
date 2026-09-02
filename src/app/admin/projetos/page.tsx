import React from 'react'
import { auth } from '@/auth'
import Link from 'next/link'

export default async function AdminProjetosPage() {
  const session = await auth()
  return (
    <div className="min-h-screen bg-[#030014] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Projetos & Portfólio (Sub-rota Protegida)</h1>
        <p className="mt-2 text-gray-400">Logado como: {session?.user?.email}</p>
        <p className="mt-4 text-emerald-400 font-mono text-sm">✓ Deep-linking via cookie executado com sucesso!</p>
        <Link href="/admin" className="mt-6 inline-block text-purple-400 hover:text-purple-300 underline text-sm">
          ← Voltar ao Painel Geral
        </Link>
      </div>
    </div>
  )
}
