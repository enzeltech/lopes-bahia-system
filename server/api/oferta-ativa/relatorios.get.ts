import { and, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../db/client'
import { ofertaAtivaAtendimentos, setores, usuarios } from '../../db/schema'
import { isGerente } from '../../utils/permissions'

const querySchema = z.object({
  periodo: z.enum(['hoje', 'semana', 'mes', 'tudo']).default('hoje'),
  corretorId: z.string().uuid().optional(),
  setorId: z.string().uuid().optional(),
})

function inicioDoPeriodo(periodo: string): Date | null {
  const agora = new Date()
  if (periodo === 'tudo')
    return null
  if (periodo === 'semana') {
    const d = new Date(agora)
    d.setDate(d.getDate() - 7)
    return d
  }
  if (periodo === 'mes') {
    const d = new Date(agora)
    d.setDate(d.getDate() - 30)
    return d
  }
  // hoje
  const d = new Date(agora)
  d.setHours(0, 0, 0, 0)
  return d
}

function zerado() {
  return { trabalhados: 0, interessados: 0, naoInteressados: 0, recontatar: 0, numerosInvalidos: 0 }
}
function acumular(acc: ReturnType<typeof zerado>, resultado: string | null) {
  acc.trabalhados++
  if (resultado === 'interessado')
    acc.interessados++
  else if (resultado === 'nao-interessado')
    acc.naoInteressados++
  else if (resultado === 'recontatar')
    acc.recontatar++
  else if (resultado === 'numero-invalido')
    acc.numerosInvalidos++
}
function comConversao(t: ReturnType<typeof zerado>) {
  return {
    ...t,
    taxaConversao: t.trabalhados > 0 ? Number(((t.interessados / t.trabalhados) * 100).toFixed(1)) : 0,
  }
}

/**
 * Relatório de produtividade da Oferta Ativa. Gestores veem todos (e podem
 * filtrar por corretor/setor); corretores veem apenas os próprios números.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = await getValidatedQuery(event, querySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos.' })

  const gestor = isGerente(user.cargo)
  const { periodo, setorId } = parsed.data
  // Corretor só enxerga os próprios dados.
  const corretorId = gestor ? parsed.data.corretorId : user.id

  const db = useDb()
  const conds = [eq(ofertaAtivaAtendimentos.status, 'finalizado')]
  const inicio = inicioDoPeriodo(periodo)
  if (inicio)
    conds.push(gte(ofertaAtivaAtendimentos.finalizadoEm, inicio))
  if (corretorId)
    conds.push(eq(ofertaAtivaAtendimentos.usuarioId, corretorId))
  if (setorId)
    conds.push(eq(ofertaAtivaAtendimentos.setorId, setorId))

  const rows = await db
    .select({
      resultado: ofertaAtivaAtendimentos.resultado,
      usuarioId: ofertaAtivaAtendimentos.usuarioId,
      corretorNome: usuarios.nome,
      setorNome: setores.nome,
    })
    .from(ofertaAtivaAtendimentos)
    .leftJoin(usuarios, eq(usuarios.id, ofertaAtivaAtendimentos.usuarioId))
    .leftJoin(setores, eq(setores.id, ofertaAtivaAtendimentos.setorId))
    .where(and(...conds))

  const totais = zerado()
  const porCorretorMap = new Map<string, ReturnType<typeof zerado> & { corretorId: string, corretorNome: string }>()

  for (const r of rows) {
    acumular(totais, r.resultado)
    const atual = porCorretorMap.get(r.usuarioId) ?? {
      corretorId: r.usuarioId,
      corretorNome: r.corretorNome ?? '—',
      ...zerado(),
    }
    acumular(atual, r.resultado)
    porCorretorMap.set(r.usuarioId, atual)
  }

  const porCorretor = [...porCorretorMap.values()]
    .map(c => ({ corretorId: c.corretorId, corretorNome: c.corretorNome, ...comConversao(c) }))
    .sort((a, b) => b.trabalhados - a.trabalhados)

  return {
    periodo,
    isGerente: gestor,
    totais: comConversao(totais),
    porCorretor,
  }
})
