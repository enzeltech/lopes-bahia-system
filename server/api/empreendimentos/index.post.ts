import { z } from 'zod'
import { useDb } from '../../db/client'
import { empreendimentos } from '../../db/schema'
import { isSuperAdmin } from '../../utils/permissions'

export const empreendimentoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.').max(160),
  tipo: z.string().max(60).optional(),
  dormitorios: z.number().int().min(0).optional(),
  suites: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  areaM2: z.number().int().min(0).optional(),
  estagio: z.string().max(40).optional(),
  dataEntrega: z.string().max(40).optional(),
  endereco: z.string().max(200).optional(),
  bairro: z.string().max(120).optional(),
  incorporador: z.string().max(120).optional(),
  coordenador: z.string().max(120).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isSuperAdmin(user))
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado.' })

  const parsed = await readValidatedBody(event, empreendimentoSchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const db = useDb()
  const [row] = await db.insert(empreendimentos).values(parsed.data).returning()
  return row
})
