import type { H3Event } from 'h3'

/**
 * Cliente server-only da API de integração do Contact2Sale (C2S).
 *
 * Base e token vêm do runtimeConfig (NUXT_C2S_BASE_URL / NUXT_C2S_TOKEN),
 * nunca expostos ao client. A API usa o padrão JSON:API:
 *   { data: [{ id, type, attributes: {...} }], meta: { total } }
 * e autentica via header `Authorization: <token>` (sem o prefixo "Bearer").
 */

const DEFAULT_BASE = 'https://api.contact2sale.com/integration'

export interface C2sLead {
  id: string
  setorId: string
  nome: string
  telefone: string
  email?: string
  empreendimento?: string
  tags: string[]
  /** alias do status na C2S: 'new' (Novo), 'under_negotiation', 'lost' (Arquivado)… */
  status?: string
  arquivado?: boolean
}

export interface C2sSetor {
  id: string
  nome: string
  descricao?: string
}

interface JsonApiItem {
  id: string
  type?: string
  attributes?: Record<string, any>
}

/** Modo demo: o Nuxt pode coagir "true" do env para boolean — aceita ambos. */
function mockLeadsEnabled(event: H3Event): boolean {
  return String(useRuntimeConfig(event).c2sMockLeads) === 'true'
}

function getConfig(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  const token = cfg.c2sToken
  const baseUrl = (cfg.c2sBaseUrl || DEFAULT_BASE).replace(/\/$/, '')
  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Integração C2S não configurada (NUXT_C2S_TOKEN ausente).',
    })
  }
  return { token, baseUrl }
}

async function c2sFetch<T>(
  event: H3Event,
  path: string,
  query?: Record<string, any>,
): Promise<T> {
  const { token, baseUrl } = getConfig(event)
  try {
    return await $fetch<T>(`${baseUrl}${path}`, {
      headers: { Authorization: token },
      query,
    })
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode ?? 502
    throw createError({
      statusCode: status === 403 ? 502 : status,
      statusMessage:
        status === 403
          ? 'Token C2S inválido ou sem permissão.'
          : `Falha ao consultar a C2S (${status}).`,
    })
  }
}

/** Primeiro valor não-vazio entre várias chaves possíveis do payload. */
function pick(attrs: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = attrs?.[k]
    if (typeof v === 'string' && v.trim())
      return v.trim()
    if (typeof v === 'number')
      return String(v)
  }
  return undefined
}

function mapTags(raw: any): string[] {
  if (!Array.isArray(raw))
    return []
  return raw
    .map((t) => {
      if (typeof t === 'string')
        return t
      // C2S usa `tag_name` no payload real do lead; `name` em outros lugares.
      return t?.tag_name ?? t?.name ?? t?.attributes?.name ?? null
    })
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
}

/**
 * Mapeia o lead da C2S (formato real, confirmado em produção):
 *   attributes.customer.{name,phone,email}
 *   attributes.product.{description, tags[].name, real_estate_detail.negotiation_name}
 */
function mapLead(item: JsonApiItem, setorId: string): C2sLead {
  const a = item.attributes ?? item ?? {}
  const customer = a.customer ?? {}
  const product = a.product ?? {}
  const empreendimento
    = (typeof product.description === 'string' && product.description.trim())
      || product.real_estate_detail?.negotiation_name
      || pick(a, ['product_name', 'empreendimento'])
      || undefined

  return {
    id: String(item.id ?? a.id ?? ''),
    setorId,
    nome: pick(customer, ['name', 'nome']) ?? pick(a, ['name', 'nome', 'customer_name']) ?? 'Sem nome',
    telefone: pick(customer, ['phone', 'cellphone', 'telefone', 'whatsapp', 'mobile'])
      ?? pick(a, ['phone', 'telefone', 'whatsapp']) ?? '',
    email: pick(customer, ['email', 'e_mail']) ?? pick(a, ['email']),
    empreendimento,
    tags: mapTags(product.tags ?? a.tags),
    status: a.lead_status?.alias ?? a.lead_status?.name,
    arquivado: !!a.archive_details?.archived,
  }
}

/**
 * Normaliza um payload arbitrário de lead (webhook ou item da API) para C2sLead.
 * A C2S pode mandar `{data:{...}}`, `{lead:{...}}`, o item JSON:API, ou um objeto
 * achatado — tentamos todos. Retorna null se não der pra extrair um id.
 */
export function normalizeLead(payload: any): C2sLead | null {
  const item: JsonApiItem = payload?.data ?? payload?.lead ?? payload
  if (!item || typeof item !== 'object')
    return null
  const mapped = mapLead(item, '')
  return mapped.id ? mapped : null
}

/**
 * Setores = sub-empresas (equipes de corretores) da conta C2S.
 * Cada equipe enxerga apenas os próprios leads — exatamente o conceito de "setor".
 */
export async function listSetores(event: H3Event): Promise<C2sSetor[]> {
  const list = await c2sFetch<Array<{ id: string, name: string }>>(event, '/companies')
  if (!Array.isArray(list))
    return []
  return list.map(c => ({ id: c.id, nome: c.name }))
}

export interface ListLeadsParams {
  /** Setor (local) ao qual os leads serão atribuídos no nosso lado. */
  setorId?: string
  page?: number
  perpage?: number
  createdGte?: string
}

/**
 * Lista a fila geral de leads da conta C2S. O endpoint de integração devolve
 * os leads pendentes (novos) — não há segmentação por sub-empresa via query;
 * a divisão em setores acontece no nosso lado (match por tags).
 */
/** Leads fictícios para demonstração quando a fila real da C2S está vazia (DEV). */
function mockLeads(): C2sLead[] {
  return [
    { id: 'mock-1', setorId: '', nome: 'Ana Beatriz Costa', telefone: '(71) 99812-3344', email: 'ana.costa@email.com', empreendimento: 'Vista Pituba Towers', tags: ['Quente', 'Investidor'] },
    { id: 'mock-2', setorId: '', nome: 'Pedro Henrique Lima', telefone: '(71) 99721-8810', email: 'pedrolima@email.com', empreendimento: 'Itaigara Garden', tags: ['Investidor'] },
    { id: 'mock-3', setorId: '', nome: 'Lúcia Mendes', telefone: '(71) 98155-9090', empreendimento: 'Edifício Caminho das Árvores', tags: ['Morno'] },
    { id: 'mock-4', setorId: '', nome: 'Roberto Albuquerque', telefone: '(71) 99334-2211', email: 'r.albuquerque@email.com', empreendimento: 'Barra Premium Residence', tags: ['Quente'] },
    { id: 'mock-5', setorId: '', nome: 'Camila Ferreira', telefone: '(71) 99887-4422', email: 'camila.f@email.com', empreendimento: 'Graça Vista', tags: ['Frio'] },
  ]
}

export async function listLeads(
  event: H3Event,
  params: ListLeadsParams = {},
): Promise<{ leads: C2sLead[], total: number }> {
  // DEV: fila simulada.
  if (mockLeadsEnabled(event)) {
    const leads = mockLeads().map(l => ({ ...l, setorId: params.setorId ?? '' }))
    return { leads, total: leads.length }
  }

  const query: Record<string, any> = {
    page: params.page ?? 1,
    // A C2S limita perpage a no máximo 50.
    perpage: Math.min(params.perpage ?? 50, 50),
  }
  if (params.createdGte)
    query.created_gte = params.createdGte

  const res = await c2sFetch<{ data?: JsonApiItem[], meta?: { total?: number } }>(
    event,
    '/leads',
    query,
  )
  const data = Array.isArray(res?.data) ? res.data : []
  return {
    leads: data.map(item => mapLead(item, params.setorId ?? '')),
    total: res?.meta?.total ?? data.length,
  }
}

/** Busca um único lead da C2S (usado para reidratar um atendimento em curso). */
export async function fetchLead(
  event: H3Event,
  leadId: string,
): Promise<C2sLead | null> {
  // DEV: resolve leads simulados sem chamar a C2S.
  if (mockLeadsEnabled(event))
    return mockLeads().find(l => l.id === leadId) ?? null

  const res = await c2sFetch<{ data?: JsonApiItem } | JsonApiItem>(
    event,
    `/leads/${encodeURIComponent(leadId)}`,
  )
  const item = (res as any)?.data ?? res
  if (!item?.id)
    return null
  return mapLead(item as JsonApiItem, '')
}

/** Tags cadastradas na conta C2S — usadas para configurar o match dos setores. */
export async function listTags(event: H3Event): Promise<string[]> {
  const res = await c2sFetch<{ data?: JsonApiItem[] }>(event, '/tags')
  const data = Array.isArray(res?.data) ? res.data : []
  return data
    .map(t => t.attributes?.name)
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
}

/**
 * Registra a interação do corretor de volta na C2S, tirando o lead da fila.
 * Best-effort: o chamador decide se um erro aqui deve ou não abortar o fluxo.
 */
export async function markAsInteracted(
  event: H3Event,
  leadId: string,
  payload: Record<string, any>,
): Promise<void> {
  const { token, baseUrl } = getConfig(event)
  await $fetch(`${baseUrl}/leads/${encodeURIComponent(leadId)}/mark_as_interacted`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: payload,
  })
}
