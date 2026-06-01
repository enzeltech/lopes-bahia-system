import { z } from 'zod'
import { useDb } from '../../db/client'
import { capacitacaoProgresso } from '../../db/schema'

const bodySchema = z.object({ videoId: z.string().uuid() })

/** Marca um vídeo como concluído para o usuário atual (idempotente). */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Vídeo inválido.' })

  const db = useDb()
  await db
    .insert(capacitacaoProgresso)
    .values({ usuarioId: user.id, videoId: parsed.data.videoId })
    .onConflictDoNothing()

  return { ok: true }
})
