import type { C2sLead } from '../../../utils/c2s'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import {
  ofertaAtivaAtendimentos,
  setorCorretores,
  setores,
} from '../../../db/schema'
import { fetchLead, listLeads } from '../../../utils/c2s'
import { isGerente, leadMatchesSetor } from '../../../utils/permissions'

const bodySchema = z.object({
  setorId: z.string().uuid('Setor inválido.'),
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
  const { setorId } = parsed.data
  const db = useDb()

  // Setor existe e está ativo?
  const [setor] = await db
    .select()
    .from(setores)
    .where(and(eq(setores.id, setorId), eq(setores.ativo, true)))
    .limit(1)
  if (!setor)
    throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado.' })

  // Permissão: gestor ou corretor atribuído ao setor.
  if (!isGerente(user.cargo)) {
    const [vinculo] = await db
      .select()
      .from(setorCorretores)
      .where(and(
        eq(setorCorretores.setorId, setorId),
        eq(setorCorretores.usuarioId, user.id),
      ))
      .limit(1)
    if (!vinculo)
      throw createError({ statusCode: 403, statusMessage: 'Você não atende este setor.' })
  }

  // 1) Já existe um lead em atendimento para este corretor neste setor?
  const [emAtendimento] = await db
    .select()
    .from(ofertaAtivaAtendimentos)
    .where(and(
      eq(ofertaAtivaAtendimentos.usuarioId, user.id),
      eq(ofertaAtivaAtendimentos.setorId, setorId),
      eq(ofertaAtivaAtendimentos.status, 'em_atendimento'),
    ))
    .limit(1)

  if (emAtendimento) {
    const lead = await fetchLead(event, emAtendimento.c2sLeadId).catch(() => null)
    return {
      atendimentoId: emAtendimento.id,
      lead: lead
        ? { ...lead, setorId }
        : {
            id: emAtendimento.c2sLeadId,
            setorId,
            nome: emAtendimento.leadNome ?? 'Lead',
            telefone: '',
            tags: [],
          },
      message: 'Lead já em atendimento.',
    }
  }

  // 2) Dedup GLOBAL: leads já trabalhados em QUALQUER campanha saem do jogo
  //    (não repete nem é disputado entre setores/corretores).
  const trabalhados = await db
    .select({ c2sLeadId: ofertaAtivaAtendimentos.c2sLeadId })
    .from(ofertaAtivaAtendimentos)
  const usados = new Set(trabalhados.map(t => t.c2sLeadId))

  // 3) Só leads SEM DONO = status "Novo" (não atendidos) e não arquivados,
  //    casando com as tags do setor. Busca ao vivo, paginando se preciso.
  function elegivel(l: C2sLead): boolean {
    return l.status === 'new'
      && !l.arquivado
      && !usados.has(l.id)
      && leadMatchesSetor(l.tags, setor.tagsC2s)
  }

  // 4) Trava o lead. A coluna c2sLeadId é única (global), então se dois
  //    corretores tentarem o mesmo ao mesmo tempo, só um ganha; o outro pula.
  for (let page = 1; page <= 6; page++) {
    const { leads } = await listLeads(event, { setorId, page, perpage: 50 })
    if (!leads.length)
      break
    for (const lead of leads.filter(elegivel)) {
      const [atendimento] = await db
        .insert(ofertaAtivaAtendimentos)
        .values({
          usuarioId: user.id,
          setorId,
          c2sLeadId: lead.id,
          leadNome: lead.nome,
          leadTelefone: lead.telefone,
          leadEmpreendimento: lead.empreendimento,
          status: 'em_atendimento',
        })
        .onConflictDoNothing({ target: ofertaAtivaAtendimentos.c2sLeadId })
        .returning({ id: ofertaAtivaAtendimentos.id })

      if (atendimento) {
        return {
          atendimentoId: atendimento.id,
          lead: { ...lead, setorId },
          message: 'Lead atribuído.',
        }
      }
      // conflito: outro corretor pegou nesse instante — marca como usado e segue.
      usados.add(lead.id)
    }
  }

  return { atendimentoId: null, lead: null, message: 'Nenhum lead disponível no momento.' }
})
