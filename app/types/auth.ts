export interface LoginCredentials {
  cpf: string
  senha: string
}

export type UserRole = 'super_admin' | 'admin' | 'funcionario'

export interface User {
  nome: string
  cpf: string
  cargo: string
  role?: UserRole | string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  usuario: User
}
