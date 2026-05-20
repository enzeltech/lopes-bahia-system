export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client)
    return

  const { user, loadFromStorage } = useAuthUser()
  if (!user.value)
    loadFromStorage()

  if (!user.value)
    return navigateTo('/login', { replace: true })
})
