import type { CapacitacaoTema, CapacitacaoVideo } from '@/types/capacitacao'

/** CRUD de temas e vídeos de capacitação (somente super admin). */
export function useCapacitacaoAdmin() {
  const { temas, loading, erro, load } = useCapacitacao()

  async function createTema(payload: { nome: string, descricao?: string }) {
    await $fetch('/api/capacitacao/temas', { method: 'POST', body: payload })
    await load(true)
  }

  async function updateTema(id: string, payload: Partial<CapacitacaoTema>) {
    await $fetch(`/api/capacitacao/temas/${id}`, { method: 'PATCH', body: payload })
    await load(true)
  }

  async function removeTema(id: string) {
    await $fetch(`/api/capacitacao/temas/${id}`, { method: 'DELETE' })
    await load(true)
  }

  async function createVideo(payload: Partial<CapacitacaoVideo> & { temaId: string }) {
    await $fetch('/api/capacitacao/videos', { method: 'POST', body: payload })
    await load(true)
  }

  async function updateVideo(id: string, payload: Partial<CapacitacaoVideo>) {
    await $fetch(`/api/capacitacao/videos/${id}`, { method: 'PATCH', body: payload })
    await load(true)
  }

  async function removeVideo(id: string) {
    await $fetch(`/api/capacitacao/videos/${id}`, { method: 'DELETE' })
    await load(true)
  }

  return {
    temas,
    loading,
    erro,
    load,
    createTema,
    updateTema,
    removeTema,
    createVideo,
    updateVideo,
    removeVideo,
  }
}
