export type EstagioEmpreendimento =
  | 'Lançamento'
  | 'Em obras'
  | 'Pronto para morar'
  | 'Entregue'

export interface Empreendimento {
  id: string
  nome: string
  tipo: string
  dormitorios: number
  suites: number
  vagas: number
  areaM2: number
  estagio: EstagioEmpreendimento
  dataEntrega: string
  endereco: string
  bairro: string
  incorporador: string
  coordenador: string
}

export interface EmpreendimentoFiltros {
  nome: string
  bairro: string
  tipo: string
  estagio: string
}
