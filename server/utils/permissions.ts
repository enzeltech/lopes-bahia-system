import type { Cargo } from '~/types/usuario'

/** Cargos com poder de gestão (criar/editar setores, ver tudo). */
const CARGOS_GESTAO: Cargo[] = ['super_admin', 'diretor', 'gerente']

export function isGerente(cargo: Cargo): boolean {
  return CARGOS_GESTAO.includes(cargo)
}

/** Super admin: gerencia usuários e a área de configuração. */
export function isSuperAdmin(user: { cpf?: string, cargo?: Cargo }): boolean {
  return user.cpf === '00000000000' || user.cargo === 'super_admin'
}

/** Lead casa com o setor se o setor não tem tags (curinga) ou há interseção de tags. */
export function leadMatchesSetor(
  leadTags: string[],
  setorTags: string[],
): boolean {
  if (!setorTags.length)
    return true
  const alvo = new Set(setorTags.map(t => t.toLowerCase().trim()))
  return leadTags.some(t => alvo.has(t.toLowerCase().trim()))
}
