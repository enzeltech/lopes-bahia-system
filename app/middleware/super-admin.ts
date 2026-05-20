export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client)
    return

  const { user, isSuperAdmin, loadFromStorage } = useAuthUser()
  if (!user.value)
    loadFromStorage()

  if (!user.value)
    return navigateTo('/login', { replace: true })

  if (!isSuperAdmin.value)
    return navigateTo('/dashboard', { replace: true })
})
