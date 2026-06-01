import { normalizeLead } from '../../utils/c2s'
import { upsertLeads } from '../../utils/leads-cache'

/**
 * Recebe leads empurrados (push) pela C2S e grava no cache local.
 * Público por natureza (a C2S chama de fora). Se NUXT_C2S_WEBHOOK_SECRET
 * estiver definido, exige o segredo em ?secret= ou no header x-webhook-secret.
 *
 * Aceita um lead único ou uma lista (payload tolerante — ver normalizeLead).
 */
export default defineEventHandler(async (event) => {
  const secret = useRuntimeConfig(event).c2sWebhookSecret
  if (secret) {
    const provided = getHeader(event, 'x-webhook-secret') || getQuery(event).secret
    if (provided !== secret)
      throw createError({ statusCode: 401, statusMessage: 'Webhook não autorizado.' })
  }

  const body = await readBody(event)
  // O lote pode vir como array, {data:[...]}, ou um lead único.
  const raws: any[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [body]

  const leads = raws
    .map(raw => ({ lead: normalizeLead(raw), raw }))
    .filter((x): x is { lead: NonNullable<ReturnType<typeof normalizeLead>>, raw: any } => !!x.lead)

  const gravados = await upsertLeads(leads)
  return { ok: true, recebidos: raws.length, gravados }
})
