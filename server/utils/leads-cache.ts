import type { C2sLead } from './c2s'
import { useDb } from '../db/client'
import { ofertaAtivaLeads } from '../db/schema'

/**
 * Insere/atualiza leads no cache local (`oferta_ativa_leads`).
 * Chave de conflito: c2sLeadId. Guarda o payload bruto quando fornecido.
 */
export async function upsertLeads(
  leads: Array<{ lead: C2sLead, raw?: any }>,
): Promise<number> {
  if (!leads.length)
    return 0
  const db = useDb()
  let n = 0
  for (const { lead, raw } of leads) {
    if (!lead.id)
      continue
    await db
      .insert(ofertaAtivaLeads)
      .values({
        c2sLeadId: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email ?? null,
        empreendimento: lead.empreendimento ?? null,
        tags: lead.tags,
        raw: raw ?? null,
      })
      .onConflictDoUpdate({
        target: ofertaAtivaLeads.c2sLeadId,
        set: {
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email ?? null,
          empreendimento: lead.empreendimento ?? null,
          tags: lead.tags,
          raw: raw ?? null,
        },
      })
    n++
  }
  return n
}
