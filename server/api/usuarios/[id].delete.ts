import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

/** Remove um usuário (somente super admin). Não permite remover a si mesmo. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Usuário inválido.' })

  if (id === user.id)
    throw createError({ statusCode: 400, statusMessage: 'Você não pode remover o próprio usuário.' })

  const db = useDb()
  const [row] = await db
    .delete(usuarios)
    .where(eq(usuarios.id, id))
    .returning({ id: usuarios.id })

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })

  return { ok: true }
})
