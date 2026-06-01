import { z } from 'zod'
import { useDb } from '../../db/client'
import { capacitacaoVideos } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'
import { extractYoutubeId } from '../../utils/youtube'

const bodySchema = z.object({
  temaId: z.string().uuid(),
  titulo: z.string().min(1, 'Informe o título.').max(200),
  descricao: z.string().max(2000).optional(),
  youtubeId: z.string().max(300).optional(), // aceita link completo; extraído p/ ID curto
  duracaoMin: z.number().int().min(0).optional(),
  ordem: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.' })

  const db = useDb()
  const [row] = await db.insert(capacitacaoVideos).values({
    temaId: parsed.data.temaId,
    titulo: parsed.data.titulo,
    descricao: parsed.data.descricao ?? '',
    youtubeId: extractYoutubeId(parsed.data.youtubeId ?? ''),
    duracaoMin: parsed.data.duracaoMin ?? 0,
    ordem: parsed.data.ordem ?? 0,
  }).returning()
  return row
})
