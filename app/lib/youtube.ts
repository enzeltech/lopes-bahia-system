/**
 * Extrai o ID de um vídeo do YouTube a partir de qualquer formato de link
 * (watch?v=, youtu.be/, embed/, shorts/, live/) ou do próprio ID já colado.
 * Retorna '' se não conseguir identificar.
 */
export function extractYoutubeId(input: string): string {
  const value = (input ?? '').trim()
  if (!value)
    return ''

  // Já é um ID puro (11 caracteres válidos, sem barra/espaço).
  if (/^[\w-]{11}$/.test(value))
    return value

  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    const host = url.hostname.replace(/^www\.|^m\./, '')

    if (host === 'youtu.be')
      return url.pathname.slice(1).split('/')[0] || ''

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = url.searchParams.get('v')
      if (v)
        return v
      const m = url.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/)
      if (m)
        return m[1]
    }
  } catch {
    // não é uma URL válida
  }

  // Último recurso: procura um padrão de ID dentro da string.
  const fallback = value.match(/[\w-]{11}/)
  return fallback ? fallback[0] : ''
}

/** URL de embed a partir de um ID ou link completo. */
export function youtubeEmbedUrl(idOrUrl: string): string {
  const id = extractYoutubeId(idOrUrl)
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : ''
}

/** URL "watch" (útil para pré-preencher o formulário de edição). */
export function youtubeWatchUrl(id: string): string {
  return id ? `https://youtu.be/${id}` : ''
}
