import { and, eq, inArray } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { ofertaAtivaAtendimentos, ofertaAtivaLeads } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

/**
 * Remove os leads ainda NÃO trabalhados de um lote de mailing.
 *
 * Quem já virou atendimento fica: apagar o lead apagaria o rastro de um
 * contato que de fato aconteceu, e o histórico do corretor depende dele.
 * Somente gestores.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const loteId = getRouterParam(event, 'loteId')
  if (!loteId)
    throw createError({ statusCode: 400, statusMessage: 'Lote inválido.' })

  const db = useDb()

  const doLote = await db
    .select({ c2sLeadId: ofertaAtivaLeads.c2sLeadId })
    .from(ofertaAtivaLeads)
    .where(and(
      eq(ofertaAtivaLeads.loteId, loteId),
      eq(ofertaAtivaLeads.origem, 'mailing'),
    ))

  if (!doLote.length)
    throw createError({ statusCode: 404, statusMessage: 'Lote não encontrado.' })

  const ids = doLote.map(l => l.c2sLeadId)
  const trabalhados = new Set<string>()
  for (let i = 0; i < ids.length; i += 500) {
    const fatia = await db
      .select({ c2sLeadId: ofertaAtivaAtendimentos.c2sLeadId })
      .from(ofertaAtivaAtendimentos)
      .where(inArray(ofertaAtivaAtendimentos.c2sLeadId, ids.slice(i, i + 500)))
    for (const t of fatia)
      trabalhados.add(t.c2sLeadId)
  }

  const removiveis = ids.filter(id => !trabalhados.has(id))
  let removidos = 0
  for (let i = 0; i < removiveis.length; i += 500) {
    const fatia = removiveis.slice(i, i + 500)
    if (!fatia.length)
      continue
    await db
      .delete(ofertaAtivaLeads)
      .where(inArray(ofertaAtivaLeads.c2sLeadId, fatia))
    removidos += fatia.length
  }

  return { ok: true, removidos, preservados: trabalhados.size }
})
