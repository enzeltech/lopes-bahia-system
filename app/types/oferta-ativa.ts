export interface Setor {
  id: string
  nome: string
  descricao?: string
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
