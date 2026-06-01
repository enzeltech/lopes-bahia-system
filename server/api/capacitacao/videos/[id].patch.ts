import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { capacitacaoVideos } from '../../../db/schema'
import { isSuperAdmin } from '../../../utils/permissions'
import { extractYoutubeId } from '../../../utils/youtube'

const bodySchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).optional(),
  youtubeId: z.string().max(300).optional(), // aceita link completo; extraído p/ ID curto
  duracaoMin: z.number().int().min(0).optional(),
  ordem: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Vídeo inválido.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.' })

  const patch = { ...parsed.data }
  if (patch.youtubeId !== undefined)
    patch.youtubeId = extractYoutubeId(patch.youtubeId)

  const db = useDb()
  const [row] = await db.update(capacitacaoVideos).set(patch).where(eq(capacitacaoVideos.id, id)).returning()
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Vídeo não encontrado.' })
  return row
})
