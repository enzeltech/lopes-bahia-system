import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { setores } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

/** Desativa o setor (soft delete) — preserva o histórico de atendimentos. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Setor inválido.' })

  const db = useDb()
  const [setor] = await db
    .update(setores)
    .set({ ativo: false, updatedAt: new Date() })
    .where(eq(setores.id, id))
    .returning({ id: setores.id })

  if (!setor)
    throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado.' })

  return { ok: true }
})
