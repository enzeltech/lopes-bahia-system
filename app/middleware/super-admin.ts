export default defineNuxtRouteMiddleware(() => {
  const { user, loggedIn } = useUserSession()
  if (!loggedIn.value)
    return navigateTo('/login', { replace: true })

  const isSuper = user.value?.cpf === '00000000000' || user.value?.cargo === 'super_admin'
  if (!isSuper)
    return navigateTo('/dashboard', { replace: true })
})
