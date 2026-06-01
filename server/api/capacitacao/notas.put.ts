import { z } from 'zod'
import { useDb } from '../../db/client'
import { capacitacaoNotas } from '../../db/schema'

const bodySchema = z.object({
  videoId: z.string().uuid(),
  texto: z.string().max(5000),
})

/** Salva (upsert) a nota do usuário atual para um vídeo. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos.' })

  const { videoId, texto } = parsed.data
  const db = useDb()
  await db
    .insert(capacitacaoNotas)
    .values({ usuarioId: user.id, videoId, texto })
    .onConflictDoUpdate({
      target: [capacitacaoNotas.usuarioId, capacitacaoNotas.videoId],
      set: { texto, updatedAt: new Date() },
    })

  return { ok: true }
})
