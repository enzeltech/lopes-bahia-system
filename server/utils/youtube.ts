/** Extrai o ID de vídeo do YouTube de qualquer link (ou retorna o ID puro). */
export function extractYoutubeId(input: string): string {
  const value = (input ?? '').trim()
  if (!value)
    return ''
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
    // não é URL válida
  }
  const fallback = value.match(/[\w-]{11}/)
  return fallback ? fallback[0] : ''
}
