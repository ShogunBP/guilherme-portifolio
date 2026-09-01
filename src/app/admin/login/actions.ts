'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export type LoginState = {
  error?: string
}

export async function authenticate(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  try {
    const email = formData.get('email')
    const password = formData.get('password')
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/admin',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }
        default:
          return { error: 'Ocorreu um erro ao tentar entrar. Tente novamente.' }
      }
    }
    // Next.js redirect() throws a NEXT_REDIRECT error which must be rethrown
    throw error
  }
}
