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

function SecurityContent() {
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

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    action: 'disable' | 'reset' | null
    codeType: 'totp' | 'backup' | 'email'
    code: string
    loading: boolean
    error: string | null
  }>({
    open: false,
    action: null,
    codeType: 'totp',
    code: '',
    loading: false,
    error: null,
  })

  function openConfirmModal(action: 'disable' | 'reset') {
    setError(null)
    setMessage(null)
    setConfirmModal({
      open: true,
      action,
      codeType: 'totp',
      code: '',
      loading: false,
      error: null,
    })
  }

  async function handleConfirmAction() {
    if (!confirmModal.action || confirmModal.codeType === 'email') return
    setConfirmModal((m) => ({ ...m, loading: true, error: null }))

    try {
      const res = await fetch('/api/admin/2fa/confirm-sensitive-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: confirmModal.action,
          code: confirmModal.code,
          type: confirmModal.codeType,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setConfirmModal((m) => ({
          ...m,
          loading: false,
          error:
            data.message ||
            (data.error === 'invalid_code'
              ? 'Código incorreto. Verifique seu autenticador ou use um código de backup válido.'
              : 'Falha ao confirmar ação. Tente novamente.'),
        }))
        return
      }

      const executedAction = confirmModal.action
      setConfirmModal({ open: false, action: null, codeType: 'totp', code: '', loading: false, error: null })

      if (executedAction === 'disable') {
        document.cookie = 'admin_2fa_verified=; path=/; max-age=0'
        document.cookie = 'admin_2fa_status=; path=/; max-age=0'
        setEnabled(false)
        setBackupCodesCount(null)
        setMessage('2FA desativado com sucesso. O próximo login exigirá apenas a senha principal.')
      } else if (executedAction === 'reset') {
        document.cookie = 'admin_2fa_verified=; path=/; max-age=0'
        document.cookie = 'admin_2fa_status=; path=/; max-age=0'
        window.location.href = '/admin/setup-2fa'
      }
    } catch {
      setConfirmModal((m) => ({
        ...m,
        loading: false,
        error: 'Erro de comunicação ao validar a confirmação de segurança. Tente novamente.',
      }))
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-300 font-mono hidden sm:inline">Fase 2.4 — Segurança</span>
            <button
              type="button"
              onClick={async () => {
                const { signOut } = await import('next-auth/react')
                // Limpa cookie do lado cliente também
                document.cookie = 'admin_2fa_verified=; path=/; max-age=0'
                document.cookie = 'admin_2fa_status=; path=/; max-age=0'
                await signOut({ callbackUrl: '/admin/login' })
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
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
                  onClick={() => openConfirmModal('disable')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>Desativar 2FA</span>
                </button>

                <button
                  type="button"
                  onClick={() => openConfirmModal('reset')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconfigurar Chave</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmação de Segundo Fator */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0b0826]/95 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/60 p-6 w-full max-w-md relative z-10">
              <h3 className="text-lg font-bold text-white mb-1">
                {confirmModal.action === 'disable' ? 'Desativar 2FA' : 'Reconfigurar 2FA'}
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                {confirmModal.action === 'disable'
                  ? 'Para desativar, prove a posse do seu segundo fator.'
                  : 'Para reconfigurar, prove a posse do seu segundo fator atual. O segredo e os códigos de backup antigos serão invalidados.'}
              </p>

              {/* Seletor de método de confirmação */}
              <div className="flex gap-2 mb-4 text-xs">
                {(['totp', 'backup', 'email'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setConfirmModal((m) => ({
                        ...m,
                        codeType: t,
                        code: '',
                        error: null,
                      }))
                    }
                    className={`flex-1 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      confirmModal.codeType === t
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                        : 'bg-transparent border-purple-500/20 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {t === 'totp' ? 'Código TOTP' : t === 'backup' ? 'Código de Backup' : 'E-mail'}
                  </button>
                ))}
              </div>

              {/* Input por tipo */}
              {confirmModal.codeType === 'totp' && (
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={confirmModal.code}
                  onChange={(e) =>
                    setConfirmModal((m) => ({ ...m, code: e.target.value.replace(/\D/g, '').slice(0, 6), error: null }))
                  }
                  className="w-full bg-[#060317] border border-purple-500/25 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 mb-4"
                  autoFocus
                />
              )}

              {confirmModal.codeType === 'backup' && (
                <input
                  type="text"
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  value={confirmModal.code}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^A-Z0-9a-z]/g, '').toUpperCase().slice(0, 8)
                    const formatted = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw
                    setConfirmModal((m) => ({ ...m, code: formatted, error: null }))
                  }}
                  className="w-full bg-[#060317] border border-purple-500/25 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 mb-4"
                  autoFocus
                />
              )}

              {confirmModal.codeType === 'email' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs mb-4 flex items-start gap-2">
                  {/* TODO: Resend integration — envio real de e-mail não implementado nesta fase */}
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    A confirmação por e-mail será disponibilizada em uma versão futura do sistema.
                    Por enquanto, use o código TOTP do seu aplicativo autenticador ou um código de backup.
                  </span>
                </div>
              )}

              {/* Erro */}
              {confirmModal.error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{confirmModal.error}</span>
                </div>
              )}

              {/* Ações do modal */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({ open: false, action: null, codeType: 'totp', code: '', loading: false, error: null })
                  }
                  disabled={confirmModal.loading}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={
                    confirmModal.loading ||
                    confirmModal.codeType === 'email' ||
                    (confirmModal.codeType === 'totp' && confirmModal.code.length < 6) ||
                    (confirmModal.codeType === 'backup' && confirmModal.code.length < 9)
                  }
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    confirmModal.action === 'disable'
                      ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/30'
                  }`}
                >
                  {confirmModal.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verificando...
                    </span>
                  ) : confirmModal.action === 'disable' ? (
                    'Confirmar Desativação'
                  ) : (
                    'Confirmar Reconfiguração'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminSecurityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
          <p className="text-xs text-gray-400">Carregando painel de segurança...</p>
        </div>
      }
    >
      <SecurityContent />
    </Suspense>
  )
}
