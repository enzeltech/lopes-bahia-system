import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { ofertaAtivaAtendimentos } from '../../../db/schema'
import { markAsInteracted } from '../../../utils/c2s'

const bodySchema = z.object({
  atendimentoId: z.string().uuid(),
  status: z.enum(['interessado', 'nao-interessado', 'recontatar', 'numero-invalido']),
  observacao: z.string().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }
  const { atendimentoId, status, observacao } = parsed.data
  const db = useDb()

  // Finaliza apenas se o atendimento for do próprio corretor e estiver aberto.
  const [atendimento] = await db
    .update(ofertaAtivaAtendimentos)
    .set({
      status: 'finalizado',
      resultado: status,
      observacao: observacao ?? '',
      finalizadoEm: new Date(),
    })
    .where(and(
      eq(ofertaAtivaAtendimentos.id, atendimentoId),
      eq(ofertaAtivaAtendimentos.usuarioId, user.id),
      eq(ofertaAtivaAtendimentos.status, 'em_atendimento'),
    ))
    .returning()

  if (!atendimento)
    throw createError({ statusCode: 404, statusMessage: 'Atendimento não encontrado.' })

  // Reflete na C2S (best-effort) — tira o lead da fila lá também.
  try {
    await markAsInteracted(event, atendimento.c2sLeadId, {
      status,
      feedback: observacao ?? '',
    })
  } catch (e) {
    console.error('[oferta-ativa] mark_as_interacted falhou:', e)
  }

  return { ok: true }
})
