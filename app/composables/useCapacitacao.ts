import { capacitacaoTemas } from '@/lib/mocks/capacitacao'
import type { CapacitacaoTema, CapacitacaoVideo } from '@/types/capacitacao'

export function useCapacitacao() {
  const temas = readonly(capacitacaoTemas)

  function getTema(temaId: string): CapacitacaoTema | undefined {
    return capacitacaoTemas.find(t => t.id === temaId)
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

  return {
    temas,
    getTema,
    getVideo,
    getNextVideo,
  }
}
