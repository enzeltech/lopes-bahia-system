import { listLeads } from '../../utils/c2s'
import { upsertLeads } from '../../utils/leads-cache'
import { isGerente } from '../../utils/permissions'

/**
 * Sincroniza o cache local com a fila da C2S via pull (GET /integration/leads).
 * Útil quando a entrega é por pull (ou para um refresh manual). Somente gestores.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const { leads } = await listLeads(event, { perpage: 50 })
  const gravados = await upsertLeads(leads.map(lead => ({ lead })))
  return { ok: true, encontrados: leads.length, gravados }
})
