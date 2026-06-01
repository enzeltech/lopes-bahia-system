import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'
import { isGerente } from '../../utils/permissions'

/** Lista usuários ativos para atribuição a setores (somente gestores). */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const db = useDb()
  return db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      cpf: usuarios.cpf,
      cargo: usuarios.cargo,
    })
    .from(usuarios)
    .where(eq(usuarios.ativo, true))
})
