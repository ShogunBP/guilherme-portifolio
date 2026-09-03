import React from 'react'
import LoginForm from './LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams
  const errorParam =
    typeof resolvedParams?.error === 'string' ? resolvedParams.error : undefined

  const availableProviders = {
    google: !!(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    github: !!(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ),
  }

  return (
    <LoginForm
      availableProviders={availableProviders}
      initialError={errorParam}
    />
  )
}
