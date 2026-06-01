import { desc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

/** Lista usuários (somente super admin). Nunca retorna o hash da senha. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const db = useDb()
  return db
    .select({
      id: usuarios.id,
      cpf: usuarios.cpf,
      nome: usuarios.nome,
      email: usuarios.email,
      cargo: usuarios.cargo,
      ativo: usuarios.ativo,
    })
    .from(usuarios)
    .orderBy(desc(usuarios.createdAt))
})
