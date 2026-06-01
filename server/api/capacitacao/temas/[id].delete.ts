import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { capacitacaoTemas } from '../../../db/schema'
import { isSuperAdmin } from '../../../utils/permissions'

/** Remove um tema (cascade apaga os vídeos). */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Tema inválido.' })

  const db = useDb()
  const [row] = await db.delete(capacitacaoTemas).where(eq(capacitacaoTemas.id, id)).returning({ id: capacitacaoTemas.id })
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Tema não encontrado.' })
  return { ok: true }
})
