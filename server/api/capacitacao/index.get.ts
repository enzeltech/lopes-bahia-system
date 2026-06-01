import { asc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { capacitacaoTemas, capacitacaoVideos } from '../../db/schema'

/** Temas com seus vídeos aninhados (qualquer usuário autenticado). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()

  const [temas, videos] = await Promise.all([
    db.select().from(capacitacaoTemas).orderBy(asc(capacitacaoTemas.ordem), asc(capacitacaoTemas.createdAt)),
    db.select().from(capacitacaoVideos).orderBy(asc(capacitacaoVideos.ordem), asc(capacitacaoVideos.createdAt)),
  ])

  return temas.map(t => ({
    id: t.id,
    nome: t.nome,
    descricao: t.descricao,
    videos: videos
      .filter(v => v.temaId === t.id)
      .map(v => ({
        id: v.id,
        temaId: v.temaId,
        titulo: v.titulo,
        descricao: v.descricao,
        youtubeId: v.youtubeId,
        duracaoMin: v.duracaoMin,
      })),
  }))
})
