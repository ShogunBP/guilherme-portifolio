'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Lock, Mail, KeyRound, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.')
        setLoading(false)
        return
      }

      try {
        const redirectRes = await fetch('/api/admin/redirect-target')
        const { redirectTo } = await redirectRes.json()
        // Seguranca: so aceita destinos relativos ao proprio site
        const safeRedirect =
          redirectTo && redirectTo.startsWith('/') ? redirectTo : '/admin'
        router.push(safeRedirect)
      } catch {
        router.push('/admin')
      }
      router.refresh()
    } catch {
      setError('Ocorreu um erro ao tentar entrar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014] px-4 py-12 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0b0826]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-950/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Área restrita. Insira suas credenciais de administrador.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#120f38]/90 border border-purple-500/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#120f38]/90 border border-purple-500/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-purple-500/10 text-center">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-purple-300 transition-colors"
            >
              ← Voltar ao site público
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
