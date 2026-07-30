import { z } from 'zod'
import { useDb } from '../../db/client'
import { setorCorretores, setores } from '../../db/schema'
import { isGerente } from '../../utils/permissions'

const bodySchema = z.object({
  nome: z.string().min(1, 'Informe o nome do setor.').max(120),
  descricao: z.string().max(2000).optional(),
  cor: z.string().max(16).optional(),
  origemLeads: z.enum(['c2s', 'mailing', 'ambos']).optional(),
  tagsC2s: z.array(z.string()).optional(),
  empreendimentos: z.array(z.string()).optional(),
  corretores: z.array(z.string().uuid()).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { nome, descricao, cor, origemLeads, tagsC2s, empreendimentos, corretores } = parsed.data
  const db = useDb()

  const [setor] = await db
    .insert(setores)
    .values({
      nome,
      descricao: descricao ?? '',
      cor: cor || '#eb194b',
      origemLeads: origemLeads ?? 'c2s',
      tagsC2s: tagsC2s ?? [],
      empreendimentos: empreendimentos ?? [],
    })
    .returning()

  if (corretores?.length) {
    await db.insert(setorCorretores).values(
      corretores.map(usuarioId => ({ setorId: setor.id, usuarioId })),
    )
  }

  return { ...setor, corretores: corretores ?? [] }
})
