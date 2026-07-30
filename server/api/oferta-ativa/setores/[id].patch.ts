import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { setorCorretores, setores } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

const bodySchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  descricao: z.string().max(2000).optional(),
  cor: z.string().max(16).optional(),
  ativo: z.boolean().optional(),
  origemLeads: z.enum(['c2s', 'mailing', 'ambos']).optional(),
  tagsC2s: z.array(z.string()).optional(),
  empreendimentos: z.array(z.string()).optional(),
  corretores: z.array(z.string().uuid()).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Setor inválido.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { corretores, ...campos } = parsed.data
  const db = useDb()

  const [setor] = await db
    .update(setores)
    .set({ ...campos, updatedAt: new Date() })
    .where(eq(setores.id, id))
    .returning()

  if (!setor)
    throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado.' })

  // Substitui o conjunto de corretores quando enviado.
  if (corretores) {
    await db.delete(setorCorretores).where(eq(setorCorretores.setorId, id))
    if (corretores.length) {
      await db.insert(setorCorretores).values(
        corretores.map(usuarioId => ({ setorId: id, usuarioId })),
      )
    }
  }

  return { ...setor, corretores: corretores ?? undefined }
})
