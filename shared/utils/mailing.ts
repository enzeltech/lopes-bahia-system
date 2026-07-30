/**
 * Utilidades do mailing (import de CSV da Oferta Ativa).
 *
 * Vive em `shared/` porque as duas pontas precisam da MESMA regra: o client
 * usa para montar o preview antes de enviar, e o servidor reaplica tudo na
 * hora de gravar — nunca confiando no que veio do browser.
 */

/** Colunas que o import entende. `nome` e `telefone` são obrigatórias. */
export const COLUNAS_MAILING = [
  'nome',
  'telefone',
  'email',
  'empreendimento',
] as const

export type ColunaMailing = (typeof COLUNAS_MAILING)[number]

/** Uma linha do CSV já mapeada para os campos do lead. */
export interface LinhaMailing {
  nome: string
  telefone: string
  email?: string
  empreendimento?: string
}

/**
 * Reduz o telefone aos dígitos e descarta o DDI 55 quando sobra um número
 * brasileiro válido. `(71) 99999-8888` e `+55 71 99999-8888` viram `71999998888`,
 * então a deduplicação enxerga os dois como o mesmo contato.
 */
export function normalizarTelefone(valor: string): string {
  const digitos = (valor ?? '').replace(/\D/g, '')
  if (digitos.length > 11 && digitos.startsWith('55')) {
    const semDdi = digitos.slice(2)
    if (semDdi.length === 10 || semDdi.length === 11)
      return semDdi
  }
  return digitos
}

/** Fixo (10 dígitos) ou celular (11). Fora disso não dá para discar. */
export function telefoneValido(valor: string): boolean {
  const n = normalizarTelefone(valor)
  return n.length === 10 || n.length === 11
}

/** `71999998888` → `(71) 99999-8888`. Devolve a entrada se não reconhecer. */
export function formatarTelefone(valor: string): string {
  const n = normalizarTelefone(valor)
  if (n.length === 11)
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10)
    return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return valor
}

/**
 * Descobre o separador olhando a primeira linha. Planilhas exportadas em
 * português normalmente saem com `;`, as em inglês com `,`.
 */
function detectarDelimitador(primeiraLinha: string): string {
  const candidatos = [';', ',', '\t']
  let melhor = ','
  let maior = 0
  for (const c of candidatos) {
    // Conta só o que está fora de aspas, senão "Silva, João" infla a contagem.
    let n = 0
    let dentroAspas = false
    for (let i = 0; i < primeiraLinha.length; i++) {
      const ch = primeiraLinha[i]
      if (ch === '"')
        dentroAspas = !dentroAspas
      else if (ch === c && !dentroAspas)
        n++
    }
    if (n > maior) {
      maior = n
      melhor = c
    }
  }
  return melhor
}

/**
 * Parser de CSV que respeita aspas, aspas escapadas (`""`) e quebra de linha
 * dentro do campo. Suficiente para o que Excel e Google Sheets exportam.
 */
export function parseCsv(texto: string): string[][] {
  // Remove BOM do Excel, que senão gruda no nome da primeira coluna.
  const limpo = texto.replace(/^﻿/, '')
  const primeiraQuebra = limpo.search(/\r?\n/)
  const delim = detectarDelimitador(
    primeiraQuebra === -1 ? limpo : limpo.slice(0, primeiraQuebra),
  )

  const linhas: string[][] = []
  let campo = ''
  let linha: string[] = []
  let dentroAspas = false

  for (let i = 0; i < limpo.length; i++) {
    const ch = limpo[i]

    if (dentroAspas) {
      if (ch === '"') {
        if (limpo[i + 1] === '"') {
          campo += '"'
          i++
        }
        else {
          dentroAspas = false
        }
      }
      else {
        campo += ch
      }
      continue
    }

    if (ch === '"') {
      dentroAspas = true
    }
    else if (ch === delim) {
      linha.push(campo.trim())
      campo = ''
    }
    else if (ch === '\n' || ch === '\r') {
      // \r\n conta como uma quebra só.
      if (ch === '\r' && limpo[i + 1] === '\n')
        i++
      linha.push(campo.trim())
      campo = ''
      linhas.push(linha)
      linha = []
    }
    else {
      campo += ch
    }
  }

  // Último campo, quando o arquivo não termina em quebra de linha.
  if (campo.length || linha.length) {
    linha.push(campo.trim())
    linhas.push(linha)
  }

  // Descarta linhas totalmente vazias (rodapé em branco é comum).
  return linhas.filter(l => l.some(c => c !== ''))
}

/** Tira acento e caixa para comparar cabeçalhos ("Telefone" ≡ "telefone"). */
function chaveCabecalho(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Sinônimos aceitos por coluna, já normalizados. */
const SINONIMOS: Record<ColunaMailing, string[]> = {
  nome: ['nome', 'nomecompleto', 'cliente', 'contato', 'name', 'leadnome'],
  telefone: [
    'telefone',
    'celular',
    'fone',
    'whatsapp',
    'whats',
    'tel',
    'telefone1',
    'phone',
    'numero',
  ],
  email: ['email', 'mail', 'enderecoemail'],
  empreendimento: [
    'empreendimento',
    'produto',
    'imovel',
    'interesse',
    'projeto',
  ],
}

/**
 * Chuta o mapeamento coluna→campo a partir do cabeçalho, para o gestor abrir a
 * tela com tudo já preenchido. O índice é -1 quando nada casou.
 */
export function sugerirMapeamento(
  cabecalho: string[],
): Record<ColunaMailing, number> {
  const chaves = cabecalho.map(chaveCabecalho)
  const mapa = {} as Record<ColunaMailing, number>

  for (const coluna of COLUNAS_MAILING) {
    const sinonimos = SINONIMOS[coluna]
    // Casa exato primeiro; só depois aceita "telefone residencial" e afins.
    let idx = chaves.findIndex(c => sinonimos.includes(c))
    if (idx === -1)
      idx = chaves.findIndex(c => sinonimos.some(s => c.startsWith(s)))
    mapa[coluna] = idx
  }

  return mapa
}

/** A primeira linha é cabeçalho ou já é dado? */
export function pareceCabecalho(linha: string[]): boolean {
  // Se a linha inteira não tem nenhum telefone plausível, é cabeçalho.
  return !linha.some(c => telefoneValido(c))
}
