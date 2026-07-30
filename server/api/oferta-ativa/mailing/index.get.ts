import { and, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { ofertaAtivaAtendimentos, ofertaAtivaLeads, usuarios } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

const querySchema = z.object({
  setorId: z.string().uuid().optional(),
})

/**
 * Lotes de mailing importados, agrupados por importação, com quanto de cada
 * lote já foi trabalhado. Filtra por setor quando `setorId` vem na query.
 * Somente gestores.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const parsed = await getValidatedQuery(event, querySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Filtro inválido.' })

  const { setorId } = parsed.data
  const db = useDb()

  const filtros = [eq(ofertaAtivaLeads.origem, 'mailing')]
  if (setorId)
    filtros.push(eq(ofertaAtivaLeads.setorId, setorId))

  const leads = await db
    .select({
      id: ofertaAtivaLeads.id,
      c2sLeadId: ofertaAtivaLeads.c2sLeadId,
      loteId: ofertaAtivaLeads.loteId,
      setorId: ofertaAtivaLeads.setorId,
      importadoPor: ofertaAtivaLeads.importadoPor,
      recebidoEm: ofertaAtivaLeads.recebidoEm,
      raw: ofertaAtivaLeads.raw,
    })
    .from(ofertaAtivaLeads)
    .where(and(...filtros))
    .orderBy(desc(ofertaAtivaLeads.recebidoEm))

  if (!leads.length)
    return { lotes: [] }

  // Quais desses leads já viraram atendimento?
  const ids = leads.map(l => l.c2sLeadId)
  const trabalhados = new Set<string>()
  for (let i = 0; i < ids.length; i += 500) {
    const fatia = await db
      .select({ c2sLeadId: ofertaAtivaAtendimentos.c2sLeadId })
      .from(ofertaAtivaAtendimentos)
      .where(inArray(ofertaAtivaAtendimentos.c2sLeadId, ids.slice(i, i + 500)))
    for (const t of fatia)
      trabalhados.add(t.c2sLeadId)
  }

  const responsaveis = new Map<string, string>()
  const idsUsuarios = [...new Set(leads.map(l => l.importadoPor).filter((x): x is string => !!x))]
  if (idsUsuarios.length) {
    const lista = await db
      .select({ id: usuarios.id, nome: usuarios.nome })
      .from(usuarios)
      .where(inArray(usuarios.id, idsUsuarios))
    for (const u of lista)
      responsaveis.set(u.id, u.nome)
  }

  interface Lote {
    loteId: string
    setorId: string | null
    arquivo: string | null
    importadoPor: string | null
    importadoEm: string
    total: number
    trabalhados: number
    disponiveis: number
  }

  const porLote = new Map<string, Lote>()
  for (const lead of leads) {
    // Leads antigos podem não ter lote; agrupa todos sob a mesma chave.
    const chave = lead.loteId ?? 'sem-lote'
    let lote = porLote.get(chave)
    if (!lote) {
      lote = {
        loteId: chave,
        setorId: lead.setorId,
        arquivo: (lead.raw as any)?.arquivo ?? null,
        importadoPor: lead.importadoPor ? responsaveis.get(lead.importadoPor) ?? null : null,
        importadoEm: lead.recebidoEm.toISOString(),
        total: 0,
        trabalhados: 0,
        disponiveis: 0,
      }
      porLote.set(chave, lote)
    }
    lote.total++
    if (trabalhados.has(lead.c2sLeadId))
      lote.trabalhados++
    else
      lote.disponiveis++
  }

  return { lotes: [...porLote.values()] }
})
