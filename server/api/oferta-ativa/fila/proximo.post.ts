import type { C2sLead } from '../../../utils/c2s'
import { and, asc, eq, notInArray } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../db/client'
import {
  ofertaAtivaAtendimentos,
  ofertaAtivaLeads,
  setorCorretores,
  setores,
} from '../../../db/schema'
import { fetchLead, listLeads } from '../../../utils/c2s'
import { isGerente, leadMatchesSetor } from '../../../utils/permissions'

const bodySchema = z.object({
  setorId: z.string().uuid('Setor inválido.'),
})

/** Shape devolvido ao front, igual para lead da C2S e lead de mailing. */
interface LeadResposta {
  id: string
  setorId: string
  nome: string
  telefone: string
  email?: string
  empreendimento?: string
  tags: string[]
}

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

  const usaC2s = setor.origemLeads === 'c2s' || setor.origemLeads === 'ambos'
  const usaMailing = setor.origemLeads === 'mailing' || setor.origemLeads === 'ambos'
  const tagsSetor = setor.tagsC2s ?? []

  /** Monta o shape de resposta a partir de uma linha de `oferta_ativa_leads`. */
  function leadDoBanco(item: typeof ofertaAtivaLeads.$inferSelect): LeadResposta {
    return {
      id: item.c2sLeadId,
      setorId,
      nome: item.nome,
      telefone: item.telefone,
      email: item.email ?? undefined,
      empreendimento: item.empreendimento ?? undefined,
      tags: item.tags ?? [],
    }
  }

  /**
   * Rehidrata o lead de um atendimento já aberto. Lead de mailing não existe na
   * C2S, então precisa vir do banco — consultar a API devolveria 404.
   */
  async function recuperarLeadEmAtendimento(
    atendimento: typeof ofertaAtivaAtendimentos.$inferSelect,
  ): Promise<LeadResposta> {
    const fallback: LeadResposta = {
      id: atendimento.c2sLeadId,
      setorId,
      nome: atendimento.leadNome ?? 'Lead',
      telefone: atendimento.leadTelefone ?? '',
      empreendimento: atendimento.leadEmpreendimento ?? undefined,
      tags: [],
    }

    if (atendimento.origem === 'mailing') {
      const [item] = await db
        .select()
        .from(ofertaAtivaLeads)
        .where(eq(ofertaAtivaLeads.c2sLeadId, atendimento.c2sLeadId))
        .limit(1)
      return item ? leadDoBanco(item) : fallback
    }

    const lead = await fetchLead(event, atendimento.c2sLeadId).catch(() => null)
    return lead ? { ...lead, setorId } : fallback
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
    const lead = await recuperarLeadEmAtendimento(emAtendimento)
    return { atendimentoId: emAtendimento.id, lead, message: 'Lead já em atendimento.' }
  }

  // 2) Dedup GLOBAL: leads já trabalhados em QUALQUER campanha saem do jogo
  //    (não repete nem é disputado entre setores/corretores).
  const trabalhados = await db
    .select({ c2sLeadId: ofertaAtivaAtendimentos.c2sLeadId })
    .from(ofertaAtivaAtendimentos)
  const usados = new Set(trabalhados.map(t => t.c2sLeadId))

  /**
   * Trava o lead inserindo o atendimento. `c2sLeadId` é único global, então se
   * dois corretores tentarem o mesmo ao mesmo tempo só um ganha — o outro
   * recebe `null` e segue para o próximo candidato.
   */
  async function travar(
    lead: LeadResposta,
    origem: 'c2s' | 'mailing',
  ): Promise<string | null> {
    const [atendimento] = await db
      .insert(ofertaAtivaAtendimentos)
      .values({
        usuarioId: user.id,
        setorId,
        c2sLeadId: lead.id,
        origem,
        leadNome: lead.nome,
        leadTelefone: lead.telefone,
        leadEmpreendimento: lead.empreendimento,
        status: 'em_atendimento',
      })
      .onConflictDoNothing({ target: ofertaAtivaAtendimentos.c2sLeadId })
      .returning({ id: ofertaAtivaAtendimentos.id })
    return atendimento?.id ?? null
  }

  // Guardamos a falha da C2S para só reportá-la se NENHUMA origem entregar
  // lead — assim uma integração fora do ar não vira um silencioso "fila vazia".
  let c2sIndisponivel = false
  let erroC2s: unknown = null

  // 3) Origem C2S: busca ao vivo, só leads sem dono (status "Novo"), não
  //    arquivados e casando com as tags do setor.
  if (usaC2s) {
    const elegivel = (l: C2sLead): boolean =>
      l.status === 'new'
      && !l.arquivado
      && !usados.has(l.id)
      && leadMatchesSetor(l.tags, tagsSetor)

    for (let page = 1; page <= 6; page++) {
      let lote: C2sLead[]
      try {
        const res = await listLeads(event, { setorId, page, perpage: 50 })
        lote = res.leads
      }
      catch (err) {
        // C2S fora do ar: cai para o espelho local em vez de derrubar a fila.
        c2sIndisponivel = true
        erroC2s = err
        break
      }
      if (!lote.length)
        break
      for (const lead of lote.filter(elegivel)) {
        const atendimentoId = await travar({ ...lead, setorId }, 'c2s')
        if (atendimentoId)
          return { atendimentoId, lead: { ...lead, setorId }, message: 'Lead atribuído.' }
        usados.add(lead.id)
      }
    }

    // 3b) Fallback: usa o que o webhook/sync já espelhou em oferta_ativa_leads.
    if (c2sIndisponivel) {
      const espelhados = await db
        .select()
        .from(ofertaAtivaLeads)
        .where(eq(ofertaAtivaLeads.origem, 'c2s'))
        .orderBy(asc(ofertaAtivaLeads.recebidoEm))
        .limit(200)

      for (const cache of espelhados) {
        if (usados.has(cache.c2sLeadId))
          continue
        if (!leadMatchesSetor(cache.tags ?? [], tagsSetor))
          continue
        const lead = leadDoBanco(cache)
        const atendimentoId = await travar(lead, 'c2s')
        if (atendimentoId)
          return { atendimentoId, lead, message: 'Lead atribuído (cópia local).' }
        usados.add(cache.c2sLeadId)
      }
    }
  }

  // 4) Origem mailing: leads da lista importada para ESTE setor, na ordem em
  //    que entraram, excluindo os que já viraram atendimento.
  if (usaMailing) {
    const disponiveis = await db
      .select()
      .from(ofertaAtivaLeads)
      .where(and(
        eq(ofertaAtivaLeads.setorId, setorId),
        eq(ofertaAtivaLeads.origem, 'mailing'),
        notInArray(
          ofertaAtivaLeads.c2sLeadId,
          db.select({ id: ofertaAtivaAtendimentos.c2sLeadId }).from(ofertaAtivaAtendimentos),
        ),
      ))
      .orderBy(asc(ofertaAtivaLeads.recebidoEm))
      .limit(50)

    for (const item of disponiveis) {
      if (usados.has(item.c2sLeadId))
        continue
      const lead = leadDoBanco(item)
      const atendimentoId = await travar(lead, 'mailing')
      if (atendimentoId)
        return { atendimentoId, lead, message: 'Lead atribuído.' }
      usados.add(item.c2sLeadId)
    }
  }

  // Nada entregue. Se a C2S falhou, o motivo é esse — não uma fila vazia.
  if (c2sIndisponivel)
    throw erroC2s

  return { atendimentoId: null, lead: null, message: 'Nenhum lead disponível no momento.' }
})
