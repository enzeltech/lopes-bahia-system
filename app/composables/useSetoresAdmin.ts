import type { Corretor, OrigemLeads, Setor } from '@/types/oferta-ativa'

export interface SetorFormPayload {
  nome: string
  descricao: string
  cor: string
  origemLeads: OrigemLeads
  tagsC2s: string[]
  empreendimentos: string[]
  corretores: string[]
}

/** Gestão de setores da Oferta Ativa (somente gestores). */
export function useSetoresAdmin() {
  const setores = useState<Setor[]>('oa-admin-setores', () => [])
  const corretores = useState<Corretor[]>('oa-admin-corretores', () => [])
  const tagsC2s = useState<string[]>('oa-admin-tags', () => [])
  const loading = useState('oa-admin-loading', () => false)
  const erro = useState<string | null>('oa-admin-erro', () => null)

  async function load() {
    loading.value = true
    erro.value = null
    try {
      const [setoresRes, corretoresRes] = await Promise.all([
        $fetch<{ setores: Setor[] }>('/api/oferta-ativa/setores'),
        $fetch<Corretor[]>('/api/oferta-ativa/corretores'),
      ])
      setores.value = setoresRes.setores
      corretores.value = corretoresRes
      // Tags da C2S são best-effort: se a integração falhar, segue sem elas.
      try {
        tagsC2s.value = await $fetch<string[]>('/api/oferta-ativa/tags')
      } catch {
        tagsC2s.value = []
      }
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar os setores.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: SetorFormPayload) {
    await $fetch('/api/oferta-ativa/setores', { method: 'POST', body: payload })
    await load()
  }

  async function update(id: string, payload: SetorFormPayload) {
    await $fetch(`/api/oferta-ativa/setores/${id}`, { method: 'PATCH', body: payload })
    await load()
  }

  async function remove(id: string) {
    await $fetch(`/api/oferta-ativa/setores/${id}`, { method: 'DELETE' })
    await load()
  }

  return { setores, corretores, tagsC2s, loading, erro, load, create, update, remove }
}
