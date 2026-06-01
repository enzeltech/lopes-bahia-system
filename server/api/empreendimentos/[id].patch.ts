import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { empreendimentos } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'
import { empreendimentoSchema } from './index.post'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Empreendimento inválido.' })

  const parsed = await readValidatedBody(event, empreendimentoSchema.partial().safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const db = useDb()
  const [row] = await db
    .update(empreendimentos)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(empreendimentos.id, id))
    .returning()

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Empreendimento não encontrado.' })

  return row
})
