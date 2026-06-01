export function useAuthUser() {
  const { user, loggedIn, fetch: refreshSession, clear } = useUserSession()

  const isSuperAdmin = computed(() =>
    user.value?.cpf === '00000000000'
    || user.value?.cargo === 'super_admin',
  )

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
  }

  return {
    user,
    loggedIn,
    isSuperAdmin,
    refreshSession,
    logout,
  }
}
