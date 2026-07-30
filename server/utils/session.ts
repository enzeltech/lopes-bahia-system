import type { Cargo } from '~/types/usuario'

declare module '#auth-utils' {
  interface User {
    id: string
    cpf: string
    nome: string
    cargo: Cargo
    email?: string
  }
}

export {}
