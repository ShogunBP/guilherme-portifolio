import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'

  if (isOnAdmin) {
    if (isLoginPage) {
      if (isLoggedIn) {
        const response = NextResponse.redirect(new URL('/admin', nextUrl))
        response.cookies.delete('admin_redirect')
        return response
      }
      return NextResponse.next()
    }

    if (isLoggedIn) {
      return NextResponse.next()
    }

    // Usuário deslogado tentando acessar /admin ou subrota protegida
    const loginUrl = new URL('/admin/login', nextUrl)
    const response = NextResponse.redirect(loginUrl)
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
  matcher: ['/admin/:path*'],
}
