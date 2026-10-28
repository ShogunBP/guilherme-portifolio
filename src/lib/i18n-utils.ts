/**
 * Utilitários para transformação e manipulação de dicionários de tradução i18n.
 * Compartilhado entre frontend e backend (Fase 3.2.1 e 3.2.2).
 */

/**
 * Achata um objeto ou array aninhado para notação de ponto ('hero.role', 'experience.jobs.0.title').
 */
export function flatten<T = any>(obj: Record<string, unknown>, prefix = ''): Record<string, T> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flatten(val as Record<string, unknown>, fullKey))
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flatten(item as Record<string, unknown>, `${fullKey}.${index}`))
        } else {
          acc[`${fullKey}.${index}`] = item as T
        }
      })
    } else {
      acc[fullKey] = val as T
    }
    return acc
  }, {} as Record<string, T>)
}

/**
 * Reconverte um objeto achatado com notação de ponto em estrutura aninhada de objetos e arrays.
 */
export function unflatten(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current = result

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (isLast) {
        current[part] = value
      } else {
        const nextPart = parts[i + 1]
        const isNextIndex = /^\d+$/.test(nextPart)

        if (!(part in current)) {
          current[part] = isNextIndex ? [] : {}
        }
        current = current[part]
      }
    }
  }

  return result
}
