/** Progresso e notas de capacitação do usuário atual (persistido no banco). */
export function useCapacitacaoProgresso() {
  const concluidos = useState<Set<string>>('cap-concluidos', () => new Set())
  const notas = useState<Record<string, string>>('cap-notas', () => ({}))
  const loaded = useState('cap-progresso-loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force)
      return
    try {
      const res = await $fetch<{ concluidos: string[], notas: Record<string, string> }>(
        '/api/capacitacao/progresso',
      )
      concluidos.value = new Set(res.concluidos)
      notas.value = res.notas
      loaded.value = true
    } catch {
      // silencioso: a tela ainda funciona sem o progresso carregado
    }
  }

  function isCompleted(videoId: string): boolean {
    return concluidos.value.has(videoId)
  }

  async function markCompleted(videoId: string) {
    await $fetch('/api/capacitacao/progresso', { method: 'POST', body: { videoId } })
    concluidos.value = new Set([...concluidos.value, videoId])
  }

  function getNote(videoId: string): string {
    return notas.value[videoId] ?? ''
  }

  async function saveNote(videoId: string, texto: string) {
    notas.value = { ...notas.value, [videoId]: texto }
    await $fetch('/api/capacitacao/notas', { method: 'PUT', body: { videoId, texto } })
  }

  return { concluidos, notas, loaded, load, isCompleted, markCompleted, getNote, saveNote }
}
