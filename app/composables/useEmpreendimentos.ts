import type { Empreendimento, EmpreendimentoFiltros } from '@/types/empreendimento'

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values)).filter(Boolean) as T[]
}

/** Catálogo de empreendimentos vindo da API (`/api/empreendimentos`). */
export function useEmpreendimentos() {
  const empreendimentos = useState<Empreendimento[]>('empreendimentos', () => [])
  const loading = useState('empreendimentos-loading', () => false)
  const erro = useState<string | null>('empreendimentos-erro', () => null)

  async function load() {
    loading.value = true
    erro.value = null
    try {
      empreendimentos.value = await $fetch<Empreendimento[]>('/api/empreendimentos')
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar os empreendimentos.'
    } finally {
      loading.value = false
    }
  }

  const options = computed(() => ({
    nomes: unique(empreendimentos.value.map(e => e.nome)).sort(),
    bairros: unique(empreendimentos.value.map(e => e.bairro)).sort(),
    tipos: unique(empreendimentos.value.map(e => e.tipo)).sort(),
    estagios: unique(empreendimentos.value.map(e => e.estagio)).sort(),
  }))

  function search(filtros: EmpreendimentoFiltros): Empreendimento[] {
    return empreendimentos.value.filter((e) => {
      if (filtros.nome && e.nome !== filtros.nome)
        return false
      if (filtros.bairro && e.bairro !== filtros.bairro)
        return false
      if (filtros.tipo && e.tipo !== filtros.tipo)
        return false
      if (filtros.estagio && e.estagio !== filtros.estagio)
        return false
      return true
    })
  }

  async function create(payload: Partial<Empreendimento>) {
    const novo = await $fetch<Empreendimento>('/api/empreendimentos', { method: 'POST', body: payload })
    empreendimentos.value = [novo, ...empreendimentos.value]
  }

  async function update(id: string, payload: Partial<Empreendimento>) {
    const atualizado = await $fetch<Empreendimento>(`/api/empreendimentos/${id}`, { method: 'PATCH', body: payload })
    empreendimentos.value = empreendimentos.value.map(e => (e.id === id ? atualizado : e))
  }

  async function remove(id: string) {
    await $fetch(`/api/empreendimentos/${id}`, { method: 'DELETE' })
    empreendimentos.value = empreendimentos.value.filter(e => e.id !== id)
  }

  return { empreendimentos, loading, erro, load, options, search, create, update, remove }
}
