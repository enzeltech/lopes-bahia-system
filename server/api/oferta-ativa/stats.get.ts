import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { ofertaAtivaAtendimentos } from '../../db/schema'

const querySchema = z.object({
  setorId: z.string().uuid('Setor inválido.'),
})

/** Estatísticas de atendimentos finalizados do setor (pool da equipe). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parsed = await getValidatedQuery(event, querySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Parâmetros inválidos.',
    })
  }

  const db = useDb()
  const rows = await db
    .select({ resultado: ofertaAtivaAtendimentos.resultado })
    .from(ofertaAtivaAtendimentos)
    .where(and(
      eq(ofertaAtivaAtendimentos.setorId, parsed.data.setorId),
      eq(ofertaAtivaAtendimentos.status, 'finalizado'),
    ))

  return {
    stats: {
      trabalhados: rows.length,
      interessados: rows.filter(r => r.resultado === 'interessado').length,
      naoInteressados: rows.filter(r => r.resultado === 'nao-interessado').length,
      recontatar: rows.filter(r => r.resultado === 'recontatar').length,
      numerosInvalidos: rows.filter(r => r.resultado === 'numero-invalido').length,
    },
  }
})
