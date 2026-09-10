'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, LogOut, KeyRound, Smartphone } from 'lucide-react'

export default function Verify2FaPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'totp' | 'backup'>('totp')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (mode === 'totp') {
      const val = raw.replace(/\D/g, '').slice(0, 6)
      setCode(val)
    } else {
      // Formato XXXX-XXXX
      const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
      if (clean.length > 4) {
        setCode(`${clean.slice(0, 4)}-${clean.slice(4)}`)
      } else {
        setCode(clean)
      }
    }
    setError(null)
  }

  function handleSwitchMode(newMode: 'totp' | 'backup') {
    setMode(newMode)
    setCode('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === 'totp') {
      if (code.length !== 6) {
        setError('O código precisa ter exatamente 6 dígitos numéricos.')
        return
      }
    } else {
      const cleanBackup = code.replace(/[\s-]/g, '')
      if (cleanBackup.length !== 8) {
        setError('O código de backup deve conter 8 caracteres (ex: XXXX-XXXX).')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type: mode,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Código incorreto. Verifique os dados digitados.')
        setLoading(false)
        return
      }

      // Sucesso! Redireciona para o destino ou /admin
      const redirectUrl = data.redirect && data.redirect.startsWith('/') && !data.redirect.startsWith('//') ? data.redirect : '/admin'
      router.push(redirectUrl)
      router.refresh()
    } catch {
      setError('Falha na comunicação com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  const isButtonDisabled =
    loading ||
    (mode === 'totp' && code.length !== 6) ||
    (mode === 'backup' && code.replace(/[\s-]/g, '').length !== 8)

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
              {mode === 'totp' ? <ShieldCheck className="w-7 h-7" /> : <KeyRound className="w-7 h-7 text-amber-400" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'totp' ? 'Verificação em Duas Etapas' : 'Código de Backup'}
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              {mode === 'totp'
                ? 'Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.'
                : 'Insira um dos seus códigos de backup descartáveis salvos no setup.'}
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
                htmlFor="verification-code"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 text-center"
              >
                {mode === 'totp' ? 'Código TOTP (6 Dígitos)' : 'Código de Recuperação (XXXX-XXXX)'}
              </label>
              <input
                ref={inputRef}
                id="verification-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder={mode === 'totp' ? '••••••' : 'A1B2-C3D4'}
                disabled={loading}
                className="w-full text-center tracking-[0.4em] text-2xl md:text-3xl font-mono py-3 px-4 rounded-xl bg-[#060317]/80 border border-purple-500/30 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors uppercase"
                autoComplete={mode === 'totp' ? 'one-time-code' : 'off'}
                maxLength={mode === 'totp' ? 6 : 9}
              />
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
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

          {/* Alternador de Modo: TOTP <-> Código de Backup */}
          <div className="mt-6 pt-5 border-t border-purple-500/15 text-center">
            {mode === 'totp' ? (
              <button
                type="button"
                onClick={() => handleSwitchMode('backup')}
                className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Perdeu o autenticador? Usar código de backup</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSwitchMode('totp')}
                className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Voltar para autenticador do celular (TOTP)</span>
              </button>
            )}
          </div>

          {/* Rodapé com botão de logout seguro */}
          <div className="mt-6 pt-5 border-t border-purple-500/10 flex items-center justify-center">
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
