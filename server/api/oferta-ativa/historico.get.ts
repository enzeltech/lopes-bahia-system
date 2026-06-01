import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { ofertaAtivaAtendimentos, setores, usuarios } from '../../db/schema'
import { isGerente } from '../../utils/permissions'

const querySchema = z.object({
  setorId: z.string().uuid().optional(),
  corretorId: z.string().uuid().optional(),
  status: z.enum(['interessado', 'nao-interessado', 'recontatar', 'numero-invalido']).optional(),
  page: z.coerce.number().int().positive().default(1),
  perpage: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * Histórico de atendimentos finalizados (controlador de leads). Gestores veem
 * todos; corretores veem apenas os próprios. Filtros opcionais + paginação.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = await getValidatedQuery(event, querySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos.' })

  const gestor = isGerente(user.cargo)
  const { setorId, status, page, perpage } = parsed.data
  const corretorId = gestor ? parsed.data.corretorId : user.id

  const conds = [eq(ofertaAtivaAtendimentos.status, 'finalizado')]
  if (corretorId)
    conds.push(eq(ofertaAtivaAtendimentos.usuarioId, corretorId))
  if (setorId)
    conds.push(eq(ofertaAtivaAtendimentos.setorId, setorId))
  if (status)
    conds.push(eq(ofertaAtivaAtendimentos.resultado, status))

  const db = useDb()
  const rows = await db
    .select({
      id: ofertaAtivaAtendimentos.id,
      c2sLeadId: ofertaAtivaAtendimentos.c2sLeadId,
      leadNome: ofertaAtivaAtendimentos.leadNome,
      leadTelefone: ofertaAtivaAtendimentos.leadTelefone,
      leadEmpreendimento: ofertaAtivaAtendimentos.leadEmpreendimento,
      resultado: ofertaAtivaAtendimentos.resultado,
      observacao: ofertaAtivaAtendimentos.observacao,
      finalizadoEm: ofertaAtivaAtendimentos.finalizadoEm,
      corretorNome: usuarios.nome,
      setorNome: setores.nome,
    })
    .from(ofertaAtivaAtendimentos)
    .leftJoin(usuarios, eq(usuarios.id, ofertaAtivaAtendimentos.usuarioId))
    .leftJoin(setores, eq(setores.id, ofertaAtivaAtendimentos.setorId))
    .where(and(...conds))
    .orderBy(desc(ofertaAtivaAtendimentos.finalizadoEm))
    .limit(perpage)
    .offset((page - 1) * perpage)

  return { itens: rows, page, perpage, isGerente: gestor }
})
