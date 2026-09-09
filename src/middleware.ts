import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import {
  COOKIE_2FA_STATUS,
  COOKIE_2FA_VERIFIED,
  verify2FaStatusToken,
  verify2FaVerifiedToken,
} from './lib/totp-token'

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'
  const isVerify2FaPage = nextUrl.pathname === '/admin/verify-2fa'
  const isSetup2FaPage = nextUrl.pathname === '/admin/setup-2fa'

  if (isOnAdmin) {
    // 1. Usuário deslogado da sessão principal
    if (!isLoggedIn) {
      if (isLoginPage) {
        return NextResponse.next()
      }
      // Qualquer outra página /admin/* redireciona para login e preserva deep-link
      const loginUrl = new URL('/admin/login', nextUrl)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set('admin_redirect', nextUrl.pathname + nextUrl.search, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
      return response
    }

    // 2. Usuário com sessão principal ativa
    // Checar status do 2FA (token assinado por AUTH_SECRET no cookie ou fallback para o JWT)
    const statusCookie = req.cookies.get(COOKIE_2FA_STATUS)?.value
    const statusToken = await verify2FaStatusToken(statusCookie)
    const is2FaEnabled =
      statusToken !== null
        ? statusToken.enabled
        : Boolean((req.auth as unknown as { twoFactorEnabled?: boolean })?.twoFactorEnabled)

    // Checar se o cookie admin_2fa_verified é válido
    const verifiedCookie = req.cookies.get(COOKIE_2FA_VERIFIED)?.value
    const is2FaVerified = await verify2FaVerifiedToken(verifiedCookie)

    // A) Se estiver na página de login:
    if (isLoginPage) {
      if (is2FaEnabled && !is2FaVerified) {
        return NextResponse.redirect(new URL('/admin/verify-2fa', nextUrl))
      }
      const dest = req.cookies.get('admin_redirect')?.value || '/admin'
      const response = NextResponse.redirect(new URL(dest, nextUrl))
      response.cookies.delete('admin_redirect')
      return response
    }

    // B) Se estiver na página de verificação de 2FA (/admin/verify-2fa):
    if (isVerify2FaPage) {
      // Se 2FA não está habilitado ou já está verificado, redireciona para /admin
      if (!is2FaEnabled || is2FaVerified) {
        const dest = req.cookies.get('admin_redirect')?.value || '/admin'
        const response = NextResponse.redirect(new URL(dest, nextUrl))
        response.cookies.delete('admin_redirect')
        return response
      }
      // Se 2FA está habilitado e ainda não verificado, libera acesso à tela de verificação
      return NextResponse.next()
    }

    // C) Se estiver na página de setup do 2FA (/admin/setup-2fa):
    if (isSetup2FaPage) {
      // Usuário com sessão principal pode acessar setup a qualquer momento
      return NextResponse.next()
    }

    // D) Para qualquer outra página protegida do /admin/*:
    // Se 2FA estiver desativado, libera acesso normalmente SEM checar nenhum cookie de 2FA
    if (!is2FaEnabled) {
      return NextResponse.next()
    }

    // Se 2FA estiver ativado e o cookie admin_2fa_verified for válido, libera acesso
    if (is2FaVerified) {
      return NextResponse.next()
    }

    // Se 2FA estiver ativado mas o cookie estiver ausente/inválido:
    // Redireciona para o desafio /admin/verify-2fa preservando deep-linking
    const verifyUrl = new URL('/admin/verify-2fa', nextUrl)
    const response = NextResponse.redirect(verifyUrl)
    response.cookies.set('admin_redirect', nextUrl.pathname + nextUrl.search, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  }

  return NextResponse.next()
})

export const config = {
  // /admin/:path* — painel administrativo (proteção de rota + 2FA + deep-linking)
  // /auth/popup   — rota de callback OAuth do popup
  matcher: ['/admin/:path*', '/auth/popup'],
}
