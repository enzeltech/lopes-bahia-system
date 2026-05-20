import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DAY_PATTERN = "EEEE, dd 'de' MMMM 'de' yyyy"
const TIME_PATTERN = "HH:mm'h'"

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function useCurrentDateTime() {
  const now = ref(new Date())

  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    intervalId = setInterval(() => {
      now.value = new Date()
    }, 30_000)
  })

  onBeforeUnmount(() => {
    if (intervalId)
      clearInterval(intervalId)
  })

  const formattedDay = computed(() =>
    capitalize(format(now.value, DAY_PATTERN, { locale: ptBR })),
  )

  const formattedTime = computed(() =>
    format(now.value, TIME_PATTERN, { locale: ptBR }),
  )

  return { now, formattedDay, formattedTime }
}
