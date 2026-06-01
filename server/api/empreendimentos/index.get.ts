import { asc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { empreendimentos } from '../../db/schema'

/** Lista o catálogo de empreendimentos (qualquer usuário autenticado). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()
  return db.select().from(empreendimentos).orderBy(asc(empreendimentos.nome))
})
