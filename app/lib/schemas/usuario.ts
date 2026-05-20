import { z } from 'zod'
import { CARGOS } from '@/types/usuario'
import { isValidCPFLength, unmask } from '@/lib/format'

export function buildUsuarioSchema({ requireSenha }: { requireSenha: boolean }) {
  return z.object({
    nome: z
      .string({ required_error: 'Informe o nome.' })
      .min(1, 'Informe o nome.'),
    cpf: z
      .string({ required_error: 'Informe o CPF.' })
      .min(1, 'Informe o CPF.')
      .refine(v => isValidCPFLength(v), 'CPF deve ter 11 dígitos.'),
    cargo: z.enum(CARGOS, { required_error: 'Selecione um cargo.' }),
    email: z
      .union([z.string().email('Email inválido.'), z.literal('')])
      .optional(),
    senha: requireSenha
      ? z.string({ required_error: 'Informe a senha.' }).min(4, 'Mínimo 4 caracteres.')
      : z.string().optional(),
  })
}

export function cpfDigits(value: string) {
  return unmask(value)
}
