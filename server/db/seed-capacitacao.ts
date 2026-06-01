import { capacitacaoTemas as temasMock } from '../../app/lib/mocks/capacitacao'
import { useDb } from './client'
import { capacitacaoTemas, capacitacaoVideos } from './schema'

async function main() {
  const db = useDb()
  const existentes = await db.select({ id: capacitacaoTemas.id }).from(capacitacaoTemas)
  if (existentes.length) {
    console.log(`já existem ${existentes.length} temas — pulando seed`)
    return
  }
  let ordemTema = 0
  for (const t of temasMock) {
    const [tema] = await db
      .insert(capacitacaoTemas)
      .values({ nome: t.nome, descricao: t.descricao, ordem: ordemTema++ })
      .returning({ id: capacitacaoTemas.id })
    let ordemVideo = 0
    for (const v of t.videos) {
      await db.insert(capacitacaoVideos).values({
        temaId: tema.id,
        titulo: v.titulo,
        descricao: v.descricao ?? '',
        youtubeId: v.youtubeId,
        duracaoMin: v.duracaoMin ?? 0,
        ordem: ordemVideo++,
      })
    }
    console.log(`  ✓ ${t.nome} (${t.videos.length} vídeos)`)
  }
  console.log('seed de capacitação concluído')
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
