import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { setorCorretores, setores } from '../../db/schema'
import { isGerente } from '../../utils/permissions'

/**
 * Lista os setores ativos. Gestores veem todos; corretores veem apenas
 * aqueles a que estão atribuídos. Cada setor inclui os ids dos corretores.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()
  const gerente = isGerente(user.cargo)

  const todos = await db
    .select()
    .from(setores)
    .where(eq(setores.ativo, true))

  const vinculos = await db.select().from(setorCorretores)
  const corretoresPorSetor = new Map<string, string[]>()
  for (const v of vinculos) {
    const arr = corretoresPorSetor.get(v.setorId) ?? []
    arr.push(v.usuarioId)
    corretoresPorSetor.set(v.setorId, arr)
  }

  let visiveis = todos
  if (!gerente) {
    visiveis = todos.filter(s =>
      (corretoresPorSetor.get(s.id) ?? []).includes(user.id),
    )
  }

  const data = visiveis.map(s => ({
    ...s,
    corretores: corretoresPorSetor.get(s.id) ?? [],
  }))

  return { setores: data, isGerente: gerente }
})
