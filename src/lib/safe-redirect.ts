/**
 * Validação centralizada de destinos locais (deep-linking) para o fluxo de
 * autenticação. Deve ser usada por todos os consumidores de `admin_redirect`
 * e `redirectTo` (login, 2FA, middleware e redirect-target).
 */

export const SAFE_REDIRECT_FALLBACK = '/admin'

/** Desfaz até 2 camadas de percent-encoding para enxergar `//` e `\` mascarados. */
function decodeOnce(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Apenas caminhos locais são aceitos como destino de redirect. */
export function isValidLocalRedirect(target: unknown): target is string {
  if (typeof target !== 'string') return false

  let candidate = target.trim()
  if (!candidate) return false

  // Até 2 camadas de decodificação: /%2F%2Fhost -> //host, /%255C//host -> /\//host.
  for (let depth = 0; depth < 2; depth += 1) {
    if (
      !candidate.startsWith('/') ||
      candidate.startsWith('//') ||
      candidate.startsWith('/\\') ||
      candidate.startsWith('\\') ||
      candidate.includes('\\')
    ) {
      return false
    }
    candidate = decodeOnce(candidate)
  }

  // Cadeia decodificada final também precisa continuar local.
  return (
    candidate.startsWith('/') &&
    !candidate.startsWith('//') &&
    !candidate.startsWith('/\\') &&
    !candidate.includes('\\')
  )
}

/**
 * Retorna o destino local seguro ou o fallback `/admin`.
 * Caminhos locais válidos passam inalterados (preserva deep-linking).
 */
export function sanitizeLocalRedirect(target: unknown): string {
  return isValidLocalRedirect(target) ? target : SAFE_REDIRECT_FALLBACK
}
