const NOTES_PREFIX = 'capacitacao:note:'
const COMPLETED_KEY = 'capacitacao:completed'

function readCompletedSet(): Set<string> {
  if (!import.meta.client)
    return new Set()
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY)
    if (!raw)
      return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeCompletedSet(set: Set<string>) {
  if (!import.meta.client)
    return
  window.localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]))
}

export function useLessonProgress(videoId: MaybeRefOrGetter<string>) {
  const note = ref('')
  const completed = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function load() {
    if (!import.meta.client)
      return
    const id = toValue(videoId)
    note.value = window.localStorage.getItem(`${NOTES_PREFIX}${id}`) ?? ''
    completed.value = readCompletedSet().has(id)
  }

  function setNote(value: string) {
    note.value = value
    if (saveTimer)
      clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (!import.meta.client)
        return
      const id = toValue(videoId)
      if (value)
        window.localStorage.setItem(`${NOTES_PREFIX}${id}`, value)
      else
        window.localStorage.removeItem(`${NOTES_PREFIX}${id}`)
    }, 400)
  }

  function markCompleted() {
    if (!import.meta.client)
      return
    const id = toValue(videoId)
    const set = readCompletedSet()
    set.add(id)
    writeCompletedSet(set)
    completed.value = true
  }

  function isCompleted(id: string): boolean {
    return readCompletedSet().has(id)
  }

  onMounted(load)
  watch(() => toValue(videoId), load)

  return {
    note,
    completed,
    setNote,
    markCompleted,
    isCompleted,
  }
}
