import type { User } from '@/types/auth'

const STORAGE_KEY = 'usuarioLogado'

export function useAuthUser() {
  const user = useState<User | null>('auth-user', () => null)

  function loadFromStorage() {
    if (!import.meta.client)
      return
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      user.value = null
      return
    }
    try {
      user.value = JSON.parse(raw) as User
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
      user.value = null
    }
  }

  function setUser(next: User) {
    user.value = next
    if (import.meta.client)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function logout() {
    user.value = null
    if (import.meta.client)
      window.localStorage.removeItem(STORAGE_KEY)
  }

  const isSuperAdmin = computed(() => {
    const u = user.value
    if (!u)
      return false
    return (
      u.cpf === '00000000000'
      || u.cargo === 'super_admin'
      || u.role === 'super_admin'
    )
  })

  return {
    user,
    isSuperAdmin,
    setUser,
    logout,
    loadFromStorage,
  }
}
