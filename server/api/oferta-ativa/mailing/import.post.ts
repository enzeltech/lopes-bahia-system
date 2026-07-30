import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { normalizarTelefone, telefoneValido } from '#shared/utils/mailing'
import { useDb } from '../../../db/client'
import { ofertaAtivaAtendimentos, ofertaAtivaLeads, setores } from '../../../db/schema'
import { isGerente } from '../../../utils/permissions'

/** Teto por importação — evita derrubar o request com uma planilha gigante. */
const MAX_LINHAS = 5000

const bodySchema = z.object({
  setorId: z.string().uuid('Selecione um setor válido.'),
  nomeArquivo: z.string().max(200).optional(),
  linhas: z
    .array(z.object({
      nome: z.string().max(160).optional().default(''),
      telefone: z.string().max(40),
      email: z.string().max(160).optional(),
      empreendimento: z.string().max(200).optional(),
    }))
    .min(1, 'A planilha está vazia.')
    .max(MAX_LINHAS, `Importe no máximo ${MAX_LINHAS} linhas por vez.`),
})

/**
 * Importa um mailing (CSV já mapeado pelo client) para um setor.
 *
 * O client manda as linhas estruturadas, mas quem manda é o servidor: telefone
 * é revalidado e normalizado aqui, e a deduplicação roda contra o banco.
 *
 * Descartamos uma linha quando:
 *  - o telefone não é um fixo/celular brasileiro válido;
 *  - o número se repete dentro do próprio arquivo;
 *  - o número já está no mailing deste setor;
 *  - o número já foi trabalhado por alguém (atendimento registrado).
 *
 * Somente gestores.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!isGerente(user.cargo))
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  const parsed = await readValidatedBody(event, bodySchema.safeParse)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    })
  }

  const { setorId, nomeArquivo, linhas } = parsed.data
  const db = useDb()

  const [setor] = await db
    .select()
    .from(setores)
    .where(and(eq(setores.id, setorId), eq(setores.ativo, true)))
    .limit(1)
  if (!setor)
    throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado.' })

  // 1) Valida e normaliza, removendo repetidos dentro do próprio arquivo.
  const vistosNoArquivo = new Set<string>()
  let invalidos = 0
  let duplicadosNoArquivo = 0

  const candidatos: Array<{ tel: string, linha: (typeof linhas)[number] }> = []
  for (const linha of linhas) {
    const tel = normalizarTelefone(linha.telefone)
    if (!telefoneValido(tel)) {
      invalidos++
      continue
    }
    if (vistosNoArquivo.has(tel)) {
      duplicadosNoArquivo++
      continue
    }
    vistosNoArquivo.add(tel)
    candidatos.push({ tel, linha })
  }

  if (!candidatos.length) {
    return {
      ok: true,
      loteId: null,
      importados: 0,
      invalidos,
      duplicadosNoArquivo,
      jaNoSetor: 0,
      jaTrabalhados: 0,
    }
  }

  const telefones = candidatos.map(c => c.tel)

  // 2) Já existe no mailing deste setor?
  const existentes = await db
    .select({ tel: ofertaAtivaLeads.telefoneNormalizado })
    .from(ofertaAtivaLeads)
    .where(and(
      eq(ofertaAtivaLeads.setorId, setorId),
      inArray(ofertaAtivaLeads.telefoneNormalizado, telefones),
    ))
  const noSetor = new Set(existentes.map(e => e.tel))

  // 3) Já foi trabalhado? O dedupe de atendimento é global e por telefone,
  //    então uma lista reimportada não devolve quem já foi contatado.
  const trabalhados = await db
    .select({ tel: ofertaAtivaAtendimentos.leadTelefone })
    .from(ofertaAtivaAtendimentos)
  const jaContatados = new Set(
    trabalhados
      .map(t => normalizarTelefone(t.tel ?? ''))
      .filter(t => t.length > 0),
  )

  const loteId = crypto.randomUUID()
  const novos = candidatos
    .filter(c => !noSetor.has(c.tel) && !jaContatados.has(c.tel))
    .map(({ tel, linha }) => ({
      // Id sintético: o dedupe global de atendimentos usa esta coluna, e um
      // lead de mailing não tem id na C2S.
      c2sLeadId: `mailing:${crypto.randomUUID()}`,
      origem: 'mailing' as const,
      setorId,
      loteId,
      importadoPor: user.id,
      nome: linha.nome?.trim() || 'Sem nome',
      telefone: linha.telefone.trim(),
      telefoneNormalizado: tel,
      email: linha.email?.trim() || null,
      empreendimento: linha.empreendimento?.trim() || null,
      tags: setor.tagsC2s ?? [],
      raw: { origem: 'mailing', arquivo: nomeArquivo ?? null },
    }))

  const jaNoSetor = candidatos.filter(c => noSetor.has(c.tel)).length
  const jaTrabalhados = candidatos.filter(
    c => !noSetor.has(c.tel) && jaContatados.has(c.tel),
  ).length

  if (novos.length) {
    // Lotes de 500 para não estourar o limite de parâmetros do Postgres.
    for (let i = 0; i < novos.length; i += 500)
      await db.insert(ofertaAtivaLeads).values(novos.slice(i, i + 500))
  }

  return {
    ok: true,
    loteId: novos.length ? loteId : null,
    importados: novos.length,
    invalidos,
    duplicadosNoArquivo,
    jaNoSetor,
    jaTrabalhados,
  }
})
