'use client'

import React, { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

function PopupAuthHandler() {
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider')
  const status = searchParams.get('status')
  const error = searchParams.get('error')

  useEffect(() => {
    // 1. Sucesso na autenticação
    if (status === 'success') {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'AUTH_POPUP_SUCCESS' },
          window.location.origin
        )
      }
      window.close()
      return
    }

    // 2. Erro retornado no callback
    if (error) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'AUTH_POPUP_ERROR', error },
          window.location.origin
        )
      }
      window.close()
      return
    }

    // 3. Inicia o fluxo com o provider requisitado
    if (provider && (provider === 'google' || provider === 'github')) {
      signIn(provider, {
        callbackUrl: '/auth/popup?status=success',
      })
    }
  }, [provider, status, error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014] text-white px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-300">
          {status === 'success'
            ? 'Autenticação concluída. Fechando...'
            : 'Conectando ao provedor de autenticação...'}
        </p>
        <p className="text-xs text-gray-500">
          Esta janela fechará automaticamente.
        </p>
      </div>
    </div>
  )
}

export default function AuthPopupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#030014] text-white">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        </div>
      }
    >
      <PopupAuthHandler />
    </Suspense>
  )
}
