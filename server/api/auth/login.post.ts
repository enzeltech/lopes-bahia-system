import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { usuarios } from '../../db/schema'

const bodySchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

export default defineEventHandler(async (event) => {
  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { cpf, senha } = parsed.data
  const db = useDb()

  const [row] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.cpf, cpf))
    .limit(1)

  if (!row || !row.ativo) {
    throw createError({
      statusCode: 401,
      statusMessage: 'CPF ou senha inválidos.',
    })
  }

  const ok = await bcrypt.compare(senha, row.senhaHash)
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'CPF ou senha inválidos.',
    })
  }

  await setUserSession(event, {
    user: {
      id: row.id,
      cpf: row.cpf,
      nome: row.nome,
      cargo: row.cargo,
      email: row.email ?? undefined,
    },
  })

  return { ok: true }
})
