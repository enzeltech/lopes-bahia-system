import type { Lead, Setor } from '@/types/oferta-ativa'

export const setoresMock: Setor[] = [
  { id: 'setor-a', nome: 'Setor A', descricao: 'Pituba, Itaigara e Caminho das Árvores' },
  { id: 'setor-b', nome: 'Setor B', descricao: 'Barra, Graça e Vitória' },
  { id: 'setor-c', nome: 'Setor C', descricao: 'Stella Maris, Patamares e Piatã' },
  { id: 'setor-d', nome: 'Setor D', descricao: 'Federação, Horto Bela Vista e Brotas' },
]

export const leadsMock: Lead[] = [
  // Setor A
  { id: 'l-001', setorId: 'setor-a', nome: 'Ana Beatriz Costa', telefone: '(71) 99812-3344', email: 'ana.costa@email.com', empreendimento: 'Vista Pituba Towers', tags: ['Quente', '3 dorms'] },
  { id: 'l-002', setorId: 'setor-a', nome: 'Pedro Henrique Lima', telefone: '(71) 99721-8810', email: 'pedrolima@email.com', empreendimento: 'Itaigara Garden', tags: ['Investidor'] },
  { id: 'l-003', setorId: 'setor-a', nome: 'Lúcia Mendes', telefone: '(71) 98155-9090', empreendimento: 'Edifício Caminho das Árvores', tags: ['Primeiro imóvel'] },
  { id: 'l-004', setorId: 'setor-a', nome: 'Roberto Albuquerque', telefone: '(71) 99334-2211', email: 'r.albuquerque@email.com', empreendimento: 'Vista Pituba Towers', tags: ['Financiamento'] },

  // Setor B
  { id: 'l-005', setorId: 'setor-b', nome: 'Camila Ferreira', telefone: '(71) 99887-4422', email: 'camila.f@email.com', empreendimento: 'Barra Premium Residence', tags: ['Quente', 'À vista'] },
  { id: 'l-006', setorId: 'setor-b', nome: 'João Vinícius Souza', telefone: '(71) 99201-7766', empreendimento: 'Barra Premium Residence', tags: ['Pesquisando'] },
  { id: 'l-007', setorId: 'setor-b', nome: 'Marina Tavares', telefone: '(71) 98844-5566', email: 'marina@email.com', empreendimento: 'Edifício Graça Vista', tags: ['Cliente Lopes'] },

  // Setor C
  { id: 'l-008', setorId: 'setor-c', nome: 'Felipe Andrade', telefone: '(71) 99511-3344', email: 'felipe.a@email.com', empreendimento: 'Cobertura Stella Maris', tags: ['Investidor', 'Alto padrão'] },
  { id: 'l-009', setorId: 'setor-c', nome: 'Beatriz Nogueira', telefone: '(71) 98699-1122', empreendimento: 'Patamares Business Center', tags: ['Comercial'] },
  { id: 'l-010', setorId: 'setor-c', nome: 'Diego Ramos', telefone: '(71) 99445-7788', email: 'diego.ramos@email.com', empreendimento: 'Cobertura Stella Maris', tags: ['Quente'] },

  // Setor D
  { id: 'l-011', setorId: 'setor-d', nome: 'Tatiane Oliveira', telefone: '(71) 99122-3344', empreendimento: 'Horto Bela Vista', tags: ['Indicação'] },
  { id: 'l-012', setorId: 'setor-d', nome: 'Marcelo Pinto', telefone: '(71) 99876-2211', email: 'marcelo@email.com', empreendimento: 'Cidade Jardim Park', tags: ['Financiamento'] },
  { id: 'l-013', setorId: 'setor-d', nome: 'Renata Carvalho', telefone: '(71) 98733-9988', email: 'renata.c@email.com', empreendimento: 'Horto Bela Vista', tags: ['Quente', 'Decidida'] },
]
