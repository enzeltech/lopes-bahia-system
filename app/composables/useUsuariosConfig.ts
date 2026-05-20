import { usuariosMock } from '@/lib/mocks/usuarios'
import type { UsuarioConfig, UsuarioFormPayload } from '@/types/usuario'

const STORAGE_KEY = 'config:usuarios'

function loadFromStorage(): UsuarioConfig[] | null {
  if (!import.meta.client)
    return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as UsuarioConfig[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function persist(list: UsuarioConfig[]) {
  if (!import.meta.client)
    return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useUsuariosConfig() {
  const usuarios = useState<UsuarioConfig[]>('config-usuarios', () => [...usuariosMock])

  function hydrate() {
    const stored = loadFromStorage()
    if (stored)
      usuarios.value = stored
    else
      persist(usuarios.value)
  }

  function existsByCpf(cpf: string): boolean {
    return usuarios.value.some(u => u.cpf === cpf)
  }

  function add(payload: UsuarioFormPayload) {
    const novo: UsuarioConfig = {
      cpf: payload.cpf,
      nome: payload.nome,
      cargo: payload.cargo,
      email: payload.email,
    }
    usuarios.value = [novo, ...usuarios.value]
    persist(usuarios.value)
  }

  function update(originalCpf: string, payload: UsuarioFormPayload) {
    usuarios.value = usuarios.value.map(u =>
      u.cpf === originalCpf
        ? { cpf: payload.cpf, nome: payload.nome, cargo: payload.cargo, email: payload.email }
        : u,
    )
    persist(usuarios.value)
  }

  function remove(cpf: string) {
    usuarios.value = usuarios.value.filter(u => u.cpf !== cpf)
    persist(usuarios.value)
  }

  function resetToMock() {
    usuarios.value = [...usuariosMock]
    persist(usuarios.value)
  }

  return {
    usuarios,
    hydrate,
    existsByCpf,
    add,
    update,
    remove,
    resetToMock,
  }
}
