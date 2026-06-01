import type {
  EstatisticasSetor,
  FeedbackStatus,
  Lead,
  Setor,
} from '@/types/oferta-ativa'

function emptyStats(): EstatisticasSetor {
  return {
    trabalhados: 0,
    interessados: 0,
    naoInteressados: 0,
    recontatar: 0,
    numerosInvalidos: 0,
  }
}

/**
 * Oferta Ativa (fluxo de fila):
 * - setores  = setores locais visíveis ao usuário (GET /api/oferta-ativa/setores)
 * - próximo  = lead da fila geral da C2S casado por tag e travado p/ o corretor
 * - finalizar= grava o resultado no banco e reflete na C2S (mark_as_interacted)
 */
export function useOfertaAtiva() {
  const setores = useState<Setor[]>('oa-setores', () => [])
  const isGerente = useState('oa-is-gerente', () => false)

  const setorAtivoId = useState<string | null>('oa-setor-ativo', () => null)
  const currentLead = useState<Lead | null>('oa-lead', () => null)
  const atendimentoId = useState<string | null>('oa-atendimento', () => null)
  const stats = useState<EstatisticasSetor>('oa-stats', () => emptyStats())
  const semLeads = useState('oa-sem-leads', () => false)

  const loadingSetores = useState('oa-loading-setores', () => false)
  const loadingLead = useState('oa-loading-lead', () => false)
  const enviando = useState('oa-enviando', () => false)
  const erro = useState<string | null>('oa-erro', () => null)

  async function loadSetores() {
    loadingSetores.value = true
    erro.value = null
    try {
      const res = await $fetch<{ setores: Setor[], isGerente: boolean }>(
        '/api/oferta-ativa/setores',
      )
      setores.value = res.setores
      isGerente.value = res.isGerente
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar os setores.'
    } finally {
      loadingSetores.value = false
    }
  }

  async function refreshStats() {
    if (!setorAtivoId.value)
      return
    const res = await $fetch<{ stats: EstatisticasSetor }>('/api/oferta-ativa/stats', {
      query: { setorId: setorAtivoId.value },
    })
    stats.value = res.stats
  }

  async function carregarProximo() {
    if (!setorAtivoId.value)
      return
    loadingLead.value = true
    erro.value = null
    try {
      const res = await $fetch<{ atendimentoId: string | null, lead: Lead | null }>(
        '/api/oferta-ativa/fila/proximo',
        { method: 'POST', body: { setorId: setorAtivoId.value } },
      )
      currentLead.value = res.lead
      atendimentoId.value = res.atendimentoId
      semLeads.value = !res.lead
      await refreshStats()
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar o próximo lead.'
      currentLead.value = null
      atendimentoId.value = null
    } finally {
      loadingLead.value = false
    }
  }

  async function selectSetor(setorId: string) {
    setorAtivoId.value = setorId
    currentLead.value = null
    atendimentoId.value = null
    semLeads.value = false
    await carregarProximo()
  }

  async function registrarFeedback(status: FeedbackStatus, observacao: string) {
    if (!atendimentoId.value)
      return
    enviando.value = true
    erro.value = null
    try {
      await $fetch('/api/oferta-ativa/fila/finalizar', {
        method: 'POST',
        body: { atendimentoId: atendimentoId.value, status, observacao },
      })
      await carregarProximo()
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível registrar o feedback.'
    } finally {
      enviando.value = false
    }
  }

  const setorAtivo = computed(
    () => setores.value.find(s => s.id === setorAtivoId.value) ?? null,
  )

  return {
    setores,
    isGerente,
    setorAtivo,
    setorAtivoId,
    currentLead,
    stats,
    semLeads,
    loadingSetores,
    loadingLead,
    enviando,
    erro,
    loadSetores,
    selectSetor,
    registrarFeedback,
  }
}
