'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, LogOut } from 'lucide-react'

export default function Verify2FaPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      setError('O código precisa ter exatamente 6 dígitos numéricos.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Código incorreto. Verifique seu app autenticador.')
        setLoading(false)
        return
      }

      // Sucesso! Redireciona para o destino ou /admin
      const redirectUrl = data.redirect && data.redirect.startsWith('/') ? data.redirect : '/admin'
      router.push(redirectUrl)
      router.refresh()
    } catch {
      setError('Falha na comunicação com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014] px-4 py-12 text-white relative overflow-hidden">
      {/* Glow cósmico */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0b0826]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-950/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Verificação em Duas Etapas
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="totp-code"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 text-center"
              >
                Código TOTP (6 Dígitos)
              </label>
              <input
                ref={inputRef}
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                placeholder="••••••"
                disabled={loading}
                className="w-full text-center tracking-[0.6em] text-3xl font-mono py-3 px-4 rounded-xl bg-[#060317]/80 border border-purple-500/30 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando código...</span>
                </>
              ) : (
                <>
                  <span>Verificar e Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Rodapé com botão de logout seguro */}
          <div className="mt-8 pt-6 border-t border-purple-500/10 flex items-center justify-center">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancelar e sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
