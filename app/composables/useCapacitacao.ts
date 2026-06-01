import type { CapacitacaoTema, CapacitacaoVideo } from '@/types/capacitacao'

/** Temas e vídeos vindos da API (`/api/capacitacao`). */
export function useCapacitacao() {
  const temas = useState<CapacitacaoTema[]>('capacitacao-temas', () => [])
  const loading = useState('capacitacao-loading', () => false)
  const loaded = useState('capacitacao-loaded', () => false)
  const erro = useState<string | null>('capacitacao-erro', () => null)

  async function load(force = false) {
    if (loaded.value && !force)
      return
    loading.value = true
    erro.value = null
    try {
      temas.value = await $fetch<CapacitacaoTema[]>('/api/capacitacao')
      loaded.value = true
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar a capacitação.'
    } finally {
      loading.value = false
    }
  }

  function getTema(temaId: string): CapacitacaoTema | undefined {
    return temas.value.find(t => t.id === temaId)
  }

  function getVideo(temaId: string, videoId: string): CapacitacaoVideo | undefined {
    return getTema(temaId)?.videos.find(v => v.id === videoId)
  }

  function getNextVideo(temaId: string, videoId: string): CapacitacaoVideo | undefined {
    const tema = getTema(temaId)
    if (!tema)
      return undefined
    const idx = tema.videos.findIndex(v => v.id === videoId)
    if (idx < 0 || idx >= tema.videos.length - 1)
      return undefined
    return tema.videos[idx + 1]
  }

  return { temas, loading, loaded, erro, load, getTema, getVideo, getNextVideo }
}
