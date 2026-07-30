/** De onde o setor puxa leads. `mailing` nunca consulta a C2S. */
export type OrigemLeads = 'c2s' | 'mailing' | 'ambos'

export interface Setor {
  id: string
  nome: string
  descricao?: string
  cor?: string
  ativo?: boolean
  origemLeads?: OrigemLeads
  tagsC2s?: string[]
  empreendimentos?: string[]
  corretores?: string[]
}

/** Um mailing importado, agrupado por importação. */
export interface LoteMailing {
  loteId: string
  setorId: string | null
  arquivo: string | null
  importadoPor: string | null
  importadoEm: string
  total: number
  trabalhados: number
  disponiveis: number
}

/** Contagens devolvidas pelo import — o que entrou e o que foi descartado. */
export interface ResultadoImport {
  ok: boolean
  loteId: string | null
  importados: number
  invalidos: number
  duplicadosNoArquivo: number
  jaNoSetor: number
  jaTrabalhados: number
}

export interface Corretor {
  id: string
  nome: string
  cpf: string
  cargo: string
}

export interface Lead {
  id: string
  setorId: string
  nome: string
  telefone: string
  email?: string
  empreendimento?: string
  tags: string[]
}

export type FeedbackStatus =
  | 'interessado'
  | 'nao-interessado'
  | 'recontatar'
  | 'numero-invalido'

export interface FeedbackRegistro {
  leadId: string
  status: FeedbackStatus
  observacao: string
  registradoEm: string
}

export interface EstatisticasSetor {
  trabalhados: number
  interessados: number
  naoInteressados: number
  recontatar: number
  numerosInvalidos: number
}
