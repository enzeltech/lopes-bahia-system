import type { UsuarioConfig, UsuarioFormPayload } from '@/types/usuario'

/** Gestão de usuários conectada ao banco (somente super admin). */
export function useUsuariosConfig() {
  const usuarios = useState<UsuarioConfig[]>('config-usuarios', () => [])
  const loading = useState('config-usuarios-loading', () => false)
  const erro = useState<string | null>('config-usuarios-erro', () => null)

  async function load() {
    loading.value = true
    erro.value = null
    try {
      usuarios.value = await $fetch<UsuarioConfig[]>('/api/usuarios')
    } catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar os usuários.'
    } finally {
      loading.value = false
    }
  }

  function existsByCpf(cpf: string, exceptId?: string): boolean {
    return usuarios.value.some(u => u.cpf === cpf && u.id !== exceptId)
  }

  async function add(payload: UsuarioFormPayload) {
    const novo = await $fetch<UsuarioConfig>('/api/usuarios', {
      method: 'POST',
      body: payload,
    })
    usuarios.value = [novo, ...usuarios.value]
  }

  async function update(id: string, payload: UsuarioFormPayload) {
    const atualizado = await $fetch<UsuarioConfig>(`/api/usuarios/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    usuarios.value = usuarios.value.map(u => (u.id === id ? atualizado : u))
  }

  async function remove(id: string) {
    await $fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    usuarios.value = usuarios.value.filter(u => u.id !== id)
  }

  return { usuarios, loading, erro, load, existsByCpf, add, update, remove }
}
