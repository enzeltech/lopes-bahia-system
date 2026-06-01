import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { empreendimentos } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Empreendimento inválido.' })

  const db = useDb()
  const [row] = await db
    .delete(empreendimentos)
    .where(eq(empreendimentos.id, id))
    .returning({ id: empreendimentos.id })

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Empreendimento não encontrado.' })

  return { ok: true }
})
