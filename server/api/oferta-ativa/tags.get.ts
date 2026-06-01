import { listTags } from '../../utils/c2s'
import { isGerente } from '../../utils/permissions'

/** Tags da C2S, para configurar o match dos setores (somente gestores). */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  return listTags(event)
})
