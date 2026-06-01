import bcrypt from 'bcryptjs'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

const bodySchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos.').optional(),
  nome: z.string().min(1).max(120).optional(),
  cargo: z.enum(['super_admin', 'diretor', 'gerente', 'corretor', 'operacional']).optional(),
  email: z.union([z.string().email('Email inválido.'), z.literal('')]).optional(),
  ativo: z.boolean().optional(),
  senha: z.union([z.string().min(4, 'Senha: mínimo 4 caracteres.'), z.literal('')]).optional(),
})

/** Atualiza um usuário (somente super admin). Senha só muda se enviada. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Usuário inválido.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { cpf, nome, cargo, email, ativo, senha } = parsed.data
  const db = useDb()

  // CPF, se mudou, não pode colidir com outro usuário.
  if (cpf) {
    const [colisao] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(and(eq(usuarios.cpf, cpf), ne(usuarios.id, id)))
      .limit(1)
    if (colisao)
      throw createError({ statusCode: 409, statusMessage: 'Já existe um usuário com esse CPF.' })
  }

  const patch: Record<string, any> = { updatedAt: new Date() }
  if (cpf !== undefined)
    patch.cpf = cpf
  if (nome !== undefined)
    patch.nome = nome
  if (cargo !== undefined)
    patch.cargo = cargo
  if (email !== undefined)
    patch.email = email || null
  if (ativo !== undefined)
    patch.ativo = ativo
  if (senha)
    patch.senhaHash = await bcrypt.hash(senha, 10)

  const [row] = await db
    .update(usuarios)
    .set(patch)
    .where(eq(usuarios.id, id))
    .returning({
      id: usuarios.id,
      cpf: usuarios.cpf,
      nome: usuarios.nome,
      email: usuarios.email,
      cargo: usuarios.cargo,
      ativo: usuarios.ativo,
    })

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })

  return row
})
