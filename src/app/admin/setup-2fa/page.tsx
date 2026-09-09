'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Key,
} from 'lucide-react'

export default function Setup2FaPage() {
  const router = useRouter()
  const [loadingSetup, setLoadingSetup] = useState(true)
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSetup() {
      try {
        const res = await fetch('/api/admin/2fa/setup')
        if (!res.ok) {
          throw new Error('Falha ao carregar dados do 2FA')
        }
        const data = await res.json()
        setSecret(data.secret)
        setQrCodeUrl(data.qrCodeUrl)
      } catch (err) {
        setError('Não foi possível iniciar o setup do 2FA. Tente recarregar a página.')
      } finally {
        setLoadingSetup(false)
      }
    }
    loadSetup()
  }, [])

  function handleCopy() {
    if (!secret) return
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
    setError(null)
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Insira o código de 6 dígitos gerado pelo aplicativo.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/2fa/confirm-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Código incorreto. Certifique-se de que o relógio do seu celular está sincronizado.')
        setSubmitting(false)
        return
      }

      // Sucesso! Redireciona para /admin/seguranca
      router.push('/admin/seguranca?activated=1')
      router.refresh()
    } catch {
      setError('Erro de comunicação ao validar código. Tente novamente.')
      setSubmitting(false)
    }
  }

  if (loadingSetup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
        <p className="text-sm text-gray-400">Gerando chave de segurança 2FA...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014] px-4 py-12 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#0b0826]/85 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-950/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Configurar Autenticação 2FA</h1>
                <p className="text-xs text-purple-300">Autenticador TOTP (Google Authenticator / Authy)</p>
              </div>
            </div>
            <Link
              href="/admin/seguranca"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Passo 1: Escanear QR Code */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Escaneie o QR Code no seu aplicativo autenticador</span>
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-4 pl-7">
                Abra seu app (Google Authenticator, Authy, Microsoft Authenticator ou 1Password) e aponte a câmera para o código abaixo:
              </p>

              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-xl max-w-[220px] mx-auto shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code para 2FA"
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>
              )}
            </div>

            {/* Passo 2: Digitação manual do segredo */}
            <div className="pt-4 border-t border-purple-500/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Ou digite a chave manualmente</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 pl-7 mt-2">
                <code className="flex-1 bg-[#060317] border border-purple-500/20 py-2 px-3 rounded-lg text-xs font-mono text-purple-300 tracking-wider break-all select-all">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copiar chave"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Passo 3: Digitar código para ativar */}
            <div className="pt-4 border-t border-purple-500/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h2 className="text-sm font-semibold text-white">
                  Confirme o primeiro código gerado
                </h2>
              </div>

              <form onSubmit={handleConfirm} className="pl-7 space-y-4">
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="000000"
                    disabled={submitting}
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-xl bg-[#060317]/80 border border-purple-500/30 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/seguranca"
                    className="flex-1 text-center py-2.5 px-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 text-gray-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    Cancelar
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting || code.length !== 6}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <span>Ativar 2FA</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
