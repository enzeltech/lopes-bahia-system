export const CARGOS = [
  'super_admin',
  'diretor',
  'gerente',
  'corretor',
  'operacional',
] as const

export type Cargo = (typeof CARGOS)[number]

export const CARGO_LABEL: Record<Cargo, string> = {
  super_admin: 'Super Admin',
  diretor: 'Diretor',
  gerente: 'Gerente',
  corretor: 'Corretor',
  operacional: 'Operacional',
}

export interface UsuarioConfig {
  cpf: string
  nome: string
  cargo: Cargo
  email?: string
}

export interface UsuarioFormPayload {
  cpf: string
  nome: string
  cargo: Cargo
  email?: string
  senha?: string
}
