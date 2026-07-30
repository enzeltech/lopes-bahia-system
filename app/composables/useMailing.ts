import type { LinhaMailing } from '#shared/utils/mailing'
import type { LoteMailing, ResultadoImport, Setor } from '@/types/oferta-ativa'

/** Importação e gestão dos mailings da Oferta Ativa (somente gestores). */
export function useMailing() {
  const setores = useState<Setor[]>('mailing-setores', () => [])
  const lotes = useState<LoteMailing[]>('mailing-lotes', () => [])
  const loading = useState('mailing-loading', () => false)
  const enviando = useState('mailing-enviando', () => false)
  const erro = useState<string | null>('mailing-erro', () => null)

  async function load(setorId?: string) {
    loading.value = true
    erro.value = null
    try {
      const [setoresRes, lotesRes] = await Promise.all([
        $fetch<{ setores: Setor[] }>('/api/oferta-ativa/setores'),
        $fetch<{ lotes: LoteMailing[] }>('/api/oferta-ativa/mailing', {
          query: setorId ? { setorId } : undefined,
        }),
      ])
      setores.value = setoresRes.setores
      lotes.value = lotesRes.lotes
    }
    catch (e: any) {
      erro.value = e?.statusMessage ?? 'Não foi possível carregar os mailings.'
    }
    finally {
      loading.value = false
    }
  }

  async function importar(
    setorId: string,
    linhas: LinhaMailing[],
    nomeArquivo?: string,
  ): Promise<ResultadoImport> {
    enviando.value = true
    try {
      const resultado = await $fetch<ResultadoImport>(
        '/api/oferta-ativa/mailing/import',
        { method: 'POST', body: { setorId, linhas, nomeArquivo } },
      )
      await load()
      return resultado
    }
    finally {
      enviando.value = false
    }
  }

  async function removerLote(loteId: string) {
    await $fetch(`/api/oferta-ativa/mailing/${loteId}`, { method: 'DELETE' })
    await load()
  }

  return { setores, lotes, loading, enviando, erro, load, importar, removerLote }
}
