import { z } from 'zod'
import { isValidCPFLength } from '@/lib/format'

export const loginSchema = z.object({
  cpf: z
    .string({ required_error: 'Informe o CPF.' })
    .min(1, 'Informe o CPF.')
    .refine(isValidCPFLength, 'CPF deve ter 11 dígitos.'),
  senha: z
    .string({ required_error: 'Informe a senha.' })
    .min(1, 'Informe a senha.'),
})

export type LoginSchema = z.infer<typeof loginSchema>
