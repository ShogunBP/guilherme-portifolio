'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Lock, Mail, KeyRound, AlertCircle, Loader2 } from 'lucide-react'

interface LoginFormProps {
  availableProviders: {
    google: boolean
    github: boolean
  }
  initialError?: string
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function GitHubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export default function LoginForm({
  availableProviders,
  initialError,
}: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(
    null
  )

  const popupTimerRef = useRef<NodeJS.Timeout | null>(null)

  function getErrorMessage(err: string | null | undefined): string | null {
    if (!err) return null
    if (err === 'AccessDenied') {
      return 'Acesso Negado: Esta conta social não possui permissão de administrador.'
    }
    if (err === 'Configuration') {
      return 'Erro de configuração no servidor de autenticação.'
    }
    if (err === 'OAuthCallbackError') {
      return 'Ocorreu um erro durante a autenticação social.'
    }
    return err
  }

  const [error, setError] = useState<string | null>(
    getErrorMessage(initialError)
  )

  // Caso esta tela tenha sido renderizada dentro de um popup após redirecionamento de erro:
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.opener &&
      window.name === 'oauth_popup'
    ) {
      const err =
        initialError ||
        new URLSearchParams(window.location.search).get('error')
      if (err) {
        try {
          window.opener.postMessage(
            { type: 'AUTH_POPUP_ERROR', error: err },
            window.location.origin
          )
        } catch {}
        window.close()
      }
    }
  }, [initialError])

  // Limpa o timer de monitoramento ao desmontar o componente
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearInterval(popupTimerRef.current)
      }
    }
  }, [])

  // Escuta mensagens do popup de autenticação
  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (!event.data || typeof event.data !== 'object') return

      if (event.data.type === 'AUTH_POPUP_SUCCESS') {
        if (popupTimerRef.current) clearInterval(popupTimerRef.current)

        try {
          const redirectRes = await fetch('/api/admin/redirect-target')
          const { redirectTo } = await redirectRes.json()
          const safeRedirect =
            redirectTo && redirectTo.startsWith('/') ? redirectTo : '/admin'
          router.push(safeRedirect)
        } catch {
          router.push('/admin')
        }
        router.refresh()
      } else if (event.data.type === 'AUTH_POPUP_ERROR') {
        if (popupTimerRef.current) clearInterval(popupTimerRef.current)
        setOauthLoading(null)
        setError(getErrorMessage(event.data.error))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

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

  function handleSocialLogin(provider: 'google' | 'github') {
    setError(null)
    setOauthLoading(provider)

    const width = 500
    const height = 650
    const left = Math.max(
      0,
      Math.round(window.screenX + (window.outerWidth - width) / 2)
    )
    const top = Math.max(
      0,
      Math.round(window.screenY + (window.outerHeight - height) / 2)
    )

    const popup = window.open(
      `/auth/popup?provider=${provider}`,
      'oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,toolbar=no,menubar=no`
    )

    if (!popup) {
      setOauthLoading(null)
      setError(
        'O navegador bloqueou a janela de autenticação. Permita popups para este site e tente novamente.'
      )
      return
    }

    popup.focus?.()

    // Monitora periodicamente se o usuário fechou o popup manualmente
    if (popupTimerRef.current) clearInterval(popupTimerRef.current)
    popupTimerRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        if (popupTimerRef.current) clearInterval(popupTimerRef.current)
        setOauthLoading(null)
      }
    }, 400)
  }

  const hasSocialProviders =
    availableProviders.google || availableProviders.github

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
              disabled={loading || !!oauthLoading}
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

          {/* Divisória e Botões de Login Social Condicionais */}
          {hasSocialProviders && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0b0826] px-3 text-gray-400 font-medium tracking-wider">
                    ou continue com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {availableProviders.google && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading || !!oauthLoading}
                    className="w-full py-2.5 px-4 bg-[#120f38]/90 hover:bg-[#19154a] border border-purple-500/30 hover:border-purple-400/50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-950/30"
                  >
                    {oauthLoading === 'google' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-gray-300">
                          Autenticando com Google...
                        </span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4" />
                        <span>Entrar com Google</span>
                      </>
                    )}
                  </button>
                )}

                {availableProviders.github && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading || !!oauthLoading}
                    className="w-full py-2.5 px-4 bg-[#120f38]/90 hover:bg-[#19154a] border border-purple-500/30 hover:border-purple-400/50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-950/30"
                  >
                    {oauthLoading === 'github' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-gray-300">
                          Autenticando com GitHub...
                        </span>
                      </>
                    ) : (
                      <>
                        <GitHubIcon className="w-4 h-4" />
                        <span>Entrar com GitHub</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

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
