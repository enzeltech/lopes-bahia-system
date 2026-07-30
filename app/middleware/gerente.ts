/**
 * Restringe a rota a cargos de gestão (super admin, diretor, gerente).
 * O servidor revalida em cada endpoint — isto aqui só evita mostrar a tela.
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, isGerente } = useAuthUser()
  if (!loggedIn.value)
    return navigateTo('/login', { replace: true })

  if (!isGerente.value)
    return navigateTo('/dashboard', { replace: true })
})
