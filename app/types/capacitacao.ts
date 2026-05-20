export interface CapacitacaoVideo {
  id: string
  temaId: string
  titulo: string
  descricao?: string
  youtubeId: string
  duracaoMin?: number
}

export interface CapacitacaoTema {
  id: string
  nome: string
  descricao: string
  videos: CapacitacaoVideo[]
}
