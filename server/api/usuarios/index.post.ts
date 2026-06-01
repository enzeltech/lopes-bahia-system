import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

const bodySchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos.'),
  nome: z.string().min(1, 'Informe o nome.').max(120),
  cargo: z.enum(['super_admin', 'diretor', 'gerente', 'corretor', 'operacional']),
  email: z.union([z.string().email('Email inválido.'), z.literal('')]).optional(),
  senha: z.string().min(4, 'Senha: mínimo 4 caracteres.'),
})

/** Cria um usuário (somente super admin). CPF é único; senha é hasheada. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { cpf, nome, cargo, email, senha } = parsed.data
  const db = useDb()

  const [existe] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.cpf, cpf)).limit(1)
  if (existe)
    throw createError({ statusCode: 409, statusMessage: 'Já existe um usuário com esse CPF.' })

  const [row] = await db
    .insert(usuarios)
    .values({
      cpf,
      nome,
      cargo,
      email: email || null,
      senhaHash: await bcrypt.hash(senha, 10),
    })
    .returning({
      id: usuarios.id,
      cpf: usuarios.cpf,
      nome: usuarios.nome,
      email: usuarios.email,
      cargo: usuarios.cargo,
      ativo: usuarios.ativo,
    })

  return row
})
