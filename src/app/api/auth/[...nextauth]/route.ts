import { handlers } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

function clear2FaCookies(response: Response): Response {
  // Cria novos cabeçalhos Set-Cookie para expiração imediata dos cookies de 2FA
  const expiredCookie1 = 'admin_2fa_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
  const expiredCookie2 = 'admin_2fa_status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'

  response.headers.append('Set-Cookie', expiredCookie1)
  response.headers.append('Set-Cookie', expiredCookie2)
  return response
}

export async function GET(req: NextRequest) {
  const response = await handlers.GET(req)
  if (req.nextUrl.pathname.includes('/signout')) {
    return clear2FaCookies(response)
  }
  return response
}

export async function POST(req: NextRequest) {
  const response = await handlers.POST(req)
  if (req.nextUrl.pathname.includes('/signout')) {
    return clear2FaCookies(response)
  }
  return response
}
