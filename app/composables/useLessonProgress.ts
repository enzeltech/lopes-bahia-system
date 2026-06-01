/**
 * Progresso de uma aula (nota + conclusão) ligado ao banco via
 * useCapacitacaoProgresso. Mantém a mesma interface usada pela página do vídeo.
 */
export function useLessonProgress(videoId: MaybeRefOrGetter<string>) {
  const { load, isCompleted, markCompleted: markDone, getNote, saveNote } = useCapacitacaoProgresso()

  const note = ref('')
  const completed = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  async function refresh() {
    await load()
    const id = toValue(videoId)
    note.value = getNote(id)
    completed.value = isCompleted(id)
  }

  function setNote(value: string) {
    note.value = value
    if (saveTimer)
      clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveNote(toValue(videoId), value)
    }, 400)
  }

  async function markCompleted() {
    await markDone(toValue(videoId))
    completed.value = true
  }

  onMounted(refresh)
  watch(() => toValue(videoId), refresh)

  return { note, completed, setNote, markCompleted, isCompleted }
}
