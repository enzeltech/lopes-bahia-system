import { leadsMock, setoresMock } from '@/lib/mocks/oferta-ativa'
import type {
  EstatisticasSetor,
  FeedbackRegistro,
  FeedbackStatus,
  Lead,
  Setor,
} from '@/types/oferta-ativa'

const STORAGE_KEY = 'oferta-ativa:feedbacks'

function emptyStats(): EstatisticasSetor {
  return {
    trabalhados: 0,
    interessados: 0,
    naoInteressados: 0,
    recontatar: 0,
    numerosInvalidos: 0,
  }
}

function loadFeedbacks(): FeedbackRegistro[] {
  if (!import.meta.client)
    return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return []
    const arr = JSON.parse(raw) as FeedbackRegistro[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persistFeedbacks(feedbacks: FeedbackRegistro[]) {
  if (!import.meta.client)
    return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks))
}

export function useOfertaAtiva() {
  const setores: Setor[] = setoresMock
  const feedbacks = useState<FeedbackRegistro[]>('oa-feedbacks', () => [])

  function hydrate() {
    feedbacks.value = loadFeedbacks()
  }

  function trabalhados(setorId: string): Set<string> {
    return new Set(
      feedbacks.value
        .filter((f) => {
          const lead = leadsMock.find(l => l.id === f.leadId)
          return lead?.setorId === setorId
        })
        .map(f => f.leadId),
    )
  }

  function proximoLead(setorId: string): Lead | null {
    const worked = trabalhados(setorId)
    return leadsMock.find(l => l.setorId === setorId && !worked.has(l.id)) ?? null
  }

  function registrarFeedback(leadId: string, status: FeedbackStatus, observacao: string) {
    const novo: FeedbackRegistro = {
      leadId,
      status,
      observacao,
      registradoEm: new Date().toISOString(),
    }
    feedbacks.value = [...feedbacks.value, novo]
    persistFeedbacks(feedbacks.value)
  }

  function estatisticas(setorId: string): EstatisticasSetor {
    const setorFeedbacks = feedbacks.value.filter((f) => {
      const lead = leadsMock.find(l => l.id === f.leadId)
      return lead?.setorId === setorId
    })

    const stats = emptyStats()
    stats.trabalhados = setorFeedbacks.length
    for (const f of setorFeedbacks) {
      if (f.status === 'interessado')
        stats.interessados++
      else if (f.status === 'nao-interessado')
        stats.naoInteressados++
      else if (f.status === 'recontatar')
        stats.recontatar++
      else if (f.status === 'numero-invalido')
        stats.numerosInvalidos++
    }
    return stats
  }

  function totalDoSetor(setorId: string): number {
    return leadsMock.filter(l => l.setorId === setorId).length
  }

  function resetSetor(setorId: string) {
    feedbacks.value = feedbacks.value.filter((f) => {
      const lead = leadsMock.find(l => l.id === f.leadId)
      return lead?.setorId !== setorId
    })
    persistFeedbacks(feedbacks.value)
  }

  return {
    setores,
    hydrate,
    proximoLead,
    registrarFeedback,
    estatisticas,
    totalDoSetor,
    resetSetor,
  }
}
