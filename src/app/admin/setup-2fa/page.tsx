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
  FileText,
  AlertTriangle,
} from 'lucide-react'

export default function Setup2FaPage() {
  const router = useRouter()
  const [loadingSetup, setLoadingSetup] = useState(true)
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [savedConfirmed, setSavedConfirmed] = useState(false)
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

  function handleCopyAllBackupCodes() {
    if (!backupCodes || backupCodes.length === 0) return
    const textToCopy = `CÓDIGOS DE BACKUP 2FA - Guilherme Portfólio\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n${backupCodes.join('\n')}\n\nGuarde em local seguro. Cada código só pode ser usado uma vez.`
    navigator.clipboard.writeText(textToCopy)
    setCopiedBackup(true)
    setTimeout(() => setCopiedBackup(false), 2500)
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

      // Se retornou os códigos de backup gerados, mostra a etapa de backup
      if (Array.isArray(data.backupCodes) && data.backupCodes.length > 0) {
        setBackupCodes(data.backupCodes)
        setSubmitting(false)
      } else {
        // Fallback
        router.push('/admin/seguranca?activated=1')
        router.refresh()
      }
    } catch {
      setError('Erro de comunicação ao validar código. Tente novamente.')
      setSubmitting(false)
    }
  }

  function handleFinishSetup() {
    if (!savedConfirmed) return
    router.push('/admin/seguranca?activated=1')
    router.refresh()
  }

  if (loadingSetup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
        <p className="text-sm text-gray-400">Gerando chave de segurança 2FA...</p>
      </div>
    )
  }

  // Etapa Final: Exibição Única dos Códigos de Backup
  if (backupCodes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030014] px-4 py-12 text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-[#0b0826]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-950/50">
            {/* Header de sucesso */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white">2FA Ativado com Sucesso!</h1>
              <p className="text-xs text-gray-400 mt-1">
                Agora salve seus códigos de backup descartáveis.
              </p>
            </div>

            {/* Alerta importante */}
            <div className="p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 mb-0.5">Atenção: exibição única!</p>
                <p className="text-amber-200/90 leading-relaxed">
                  Estes 10 códigos são a sua garantia para entrar caso perca seu celular. Cada código só pode ser usado uma vez e eles <strong>nunca mais serão exibidos</strong>.
                </p>
              </div>
            </div>

            {/* Grid dos 10 códigos */}
            <div className="bg-[#060317] border border-purple-500/25 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/15">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  10 Códigos de Uso Único
                </span>
                <button
                  type="button"
                  onClick={handleCopyAllBackupCodes}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedBackup ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Todos</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {backupCodes.map((bCode, idx) => (
                  <div
                    key={bCode}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0b0826]/70 border border-purple-500/15 font-mono text-sm tracking-wider text-purple-200"
                  >
                    <span className="text-gray-500 text-xs mr-2">{idx + 1}.</span>
                    <span className="font-semibold">{bCode}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trava por Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={savedConfirmed}
                  onChange={(e) => setSavedConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-purple-500/40 text-purple-600 focus:ring-purple-500 bg-[#060317] cursor-pointer"
                />
                <span className="text-xs text-gray-300 leading-snug">
                  Já copiei e salvei meus 10 códigos de backup em um local seguro.
                </span>
              </label>
            </div>

            {/* Botão de Finalizar */}
            <button
              type="button"
              onClick={handleFinishSetup}
              disabled={!savedConfirmed}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Concluir e Ir para Segurança</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
