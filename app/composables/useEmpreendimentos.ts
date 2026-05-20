import { empreendimentosMock } from '@/lib/mocks/empreendimentos'
import type { Empreendimento, EmpreendimentoFiltros } from '@/types/empreendimento'

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values)).filter(Boolean) as T[]
}

export function useEmpreendimentos() {
  const empreendimentos: Empreendimento[] = empreendimentosMock

  const options = computed(() => ({
    nomes: unique(empreendimentos.map(e => e.nome)).sort(),
    bairros: unique(empreendimentos.map(e => e.bairro)).sort(),
    tipos: unique(empreendimentos.map(e => e.tipo)).sort(),
    estagios: unique(empreendimentos.map(e => e.estagio)).sort(),
  }))

  function search(filtros: EmpreendimentoFiltros): Empreendimento[] {
    return empreendimentos.filter((e) => {
      if (filtros.nome && e.nome !== filtros.nome)
        return false
      if (filtros.bairro && e.bairro !== filtros.bairro)
        return false
      if (filtros.tipo && e.tipo !== filtros.tipo)
        return false
      if (filtros.estagio && e.estagio !== filtros.estagio)
        return false
      return true
    })
  }

  return {
    options,
    search,
  }
}
