import type { UsuarioConfig } from '@/types/usuario'

export const usuariosMock: UsuarioConfig[] = [
  { cpf: '00000000000', nome: 'Super Admin', cargo: 'super_admin', email: 'admin@lopesbahia.com.br' },
  { cpf: '12345678901', nome: 'Aline Souza', cargo: 'diretor', email: 'aline.souza@lopesbahia.com.br' },
  { cpf: '23456789012', nome: 'Rafael Almeida', cargo: 'gerente', email: 'rafael.almeida@lopesbahia.com.br' },
  { cpf: '34567890123', nome: 'Mariana Souza', cargo: 'gerente', email: 'mariana.souza@lopesbahia.com.br' },
  { cpf: '45678901234', nome: 'Carla Lima', cargo: 'corretor', email: 'carla.lima@lopesbahia.com.br' },
  { cpf: '56789012345', nome: 'Bruno Martins', cargo: 'corretor', email: 'bruno.martins@lopesbahia.com.br' },
  { cpf: '67890123456', nome: 'Camila Reis', cargo: 'corretor', email: 'camila.reis@lopesbahia.com.br' },
  { cpf: '78901234567', nome: 'Diego Ramos', cargo: 'operacional', email: 'diego.ramos@lopesbahia.com.br' },
]
