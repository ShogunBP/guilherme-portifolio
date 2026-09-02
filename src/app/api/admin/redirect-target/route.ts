import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const redirectCookie = cookieStore.get('admin_redirect')
  const redirectTo = redirectCookie?.value ?? '/admin'

  // Limpa o cookie após ler
  const response = NextResponse.json({ redirectTo })
  response.cookies.delete('admin_redirect')
  return response
}
