import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import { ofertaAtivaAtendimentos } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

const bodySchema = z.object({
  observacao: z.string().max(2000).optional(),
  resultado: z.enum(['interessado', 'nao-interessado', 'recontatar', 'numero-invalido']).optional(),
})

/**
 * Edita um atendimento já registrado (controlador de leads): muda observação
 * e/ou resultado. Corretor edita só os próprios; gestor edita qualquer um.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Atendimento inválido.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.' })

  const patch: Record<string, any> = {}
  if (parsed.data.observacao !== undefined)
    patch.observacao = parsed.data.observacao
  if (parsed.data.resultado !== undefined)
    patch.resultado = parsed.data.resultado
  if (!Object.keys(patch).length)
    throw createError({ statusCode: 400, statusMessage: 'Nada para atualizar.' })

  const db = useDb()
  const conds = [eq(ofertaAtivaAtendimentos.id, id)]
  if (!isGerente(user.cargo))
    conds.push(eq(ofertaAtivaAtendimentos.usuarioId, user.id))

  const [row] = await db
    .update(ofertaAtivaAtendimentos)
    .set(patch)
    .where(and(...conds))
    .returning({ id: ofertaAtivaAtendimentos.id })

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Atendimento não encontrado.' })

  return { ok: true }
})
