import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { capacitacaoTemas } from '../../../db/schema'
import { isSuperAdmin } from '../../../utils/permissions'

const bodySchema = z.object({
  nome: z.string().min(1).max(160).optional(),
  descricao: z.string().max(2000).optional(),
  ordem: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Tema inválido.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.' })

  const db = useDb()
  const [row] = await db.update(capacitacaoTemas).set(parsed.data).where(eq(capacitacaoTemas.id, id)).returning()
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Tema não encontrado.' })
  return row
})
