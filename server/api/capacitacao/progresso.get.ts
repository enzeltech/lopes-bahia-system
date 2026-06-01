import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { capacitacaoNotas, capacitacaoProgresso } from '../../db/schema'

/** Progresso do usuário atual: vídeos concluídos + notas por vídeo. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()

  const [concluidos, notas] = await Promise.all([
    db.select({ videoId: capacitacaoProgresso.videoId })
      .from(capacitacaoProgresso)
      .where(eq(capacitacaoProgresso.usuarioId, user.id)),
    db.select({ videoId: capacitacaoNotas.videoId, texto: capacitacaoNotas.texto })
      .from(capacitacaoNotas)
      .where(eq(capacitacaoNotas.usuarioId, user.id)),
  ])

  const notasMap: Record<string, string> = {}
  for (const n of notas)
    notasMap[n.videoId] = n.texto

  return {
    concluidos: concluidos.map(c => c.videoId),
    notas: notasMap,
  }
})
