'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PowerOff,
  Clock,
} from 'lucide-react'

function SegurancaContent() {
  const searchParams = useSearchParams()
  const justActivated = searchParams.get('activated') === '1'

  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [backupCodesCount, setBackupCodesCount] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(
    justActivated ? 'Autenticação de dois fatores ativada com sucesso!' : null
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/2fa/status')
        if (res.ok) {
          const data = await res.json()
          setEnabled(Boolean(data.enabled))
          if (typeof data.backupCodesCount === 'number') {
            setBackupCodesCount(data.backupCodesCount)
          }
        }
      } catch {
        setError('Não foi possível verificar o status atual do 2FA.')
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [])

  async function handleDisable() {
    if (!confirm('Deseja realmente desativar o 2FA? Sua conta passará a exigir apenas a senha principal.')) {
      return
    }

    setActionLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Falha ao desativar 2FA.')
      } else {
        setEnabled(false)
        setMessage('2FA desativado com sucesso. O próximo login exigirá apenas a senha principal.')
      }
    } catch {
      setError('Erro de comunicação com o servidor ao desativar 2FA.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow cósmico */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Top navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel</span>
          </Link>
          <span className="text-xs text-purple-300 font-mono">Fase 2.4 — Segurança</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Segurança da Conta & 2FA
              </h1>
              <p className="text-sm text-gray-400">
                Gerencie autenticação de dois fatores e políticas de sessão administrativa.
              </p>
            </div>
          </div>
        </div>

        {/* Notificação de sucesso */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Notificação de erro */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Card Principal de 2FA */}
        <div className="bg-[#0b0826]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-950/40 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-500/15">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  enabled
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-yellow-500/15 border border-yellow-500/25 text-yellow-400'
                }`}
              >
                {enabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Autenticação em Duas Etapas (TOTP)</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Protege sua conta exigindo um código de 6 dígitos do aplicativo autenticador.
                </p>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : enabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  ● 2FA Ativo
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
                  ○ 2FA Desativado
                </span>
              )}
            </div>
          </div>

          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              {enabled
                ? 'Seu portfólio está protegido. Todo novo login (por e-mail e senha, Google ou GitHub) exigirá o código temporário gerado pelo seu aplicativo autenticador configurado.'
                : 'A autenticação de dois fatores está desativada no momento. O login segue normalmente apenas com o primeiro fator (senha ou redes sociais). Recomendamos ativar o 2FA para proteger o acesso administrativo.'}
            </p>

            {/* Informação sobre sincronização de 7 dias */}
            <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 flex items-start gap-3">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300 leading-relaxed">
                <span className="font-semibold text-white">Sessão e 2FA Sincronizados (7 dias):</span> A sessão
                JWT do NextAuth e a verificação do 2FA possuem validade sincronizada de exatamente 7 dias
                (604.800 segundos), sem exigir reautenticação contínua durante o trabalho.
              </div>
            </div>

            {/* Status dos códigos de backup */}
            {enabled && backupCodesCount !== null && (
              <div className="p-4 rounded-xl bg-[#060317] border border-purple-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-gray-300">
                    Códigos de backup descartáveis restantes: <strong className="text-white font-mono text-sm">{backupCodesCount}</strong> de 10
                  </span>
                </div>
                {backupCodesCount <= 2 && (
                  <span className="text-[11px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                    Atenção: poucos códigos restantes
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="pt-6 border-t border-purple-500/15 flex flex-wrap items-center justify-between gap-3">
            {!enabled ? (
              <Link
                href="/admin/setup-2fa"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ativar 2FA Agora</span>
              </Link>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDisable}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PowerOff className="w-3.5 h-3.5" />
                  )}
                  <span>Desativar 2FA</span>
                </button>

                <Link
                  href="/admin/setup-2fa"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconfigurar Chave</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminSegurancaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
          <p className="text-xs text-gray-400">Carregando painel de segurança...</p>
        </div>
      }
    >
      <SegurancaContent />
    </Suspense>
  )
}
