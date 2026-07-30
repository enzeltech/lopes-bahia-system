<script setup lang="ts">
import type { ColunaMailing, LinhaMailing } from '#shared/utils/mailing'
import type { LoteMailing, ResultadoImport } from '@/types/oferta-ativa'
import { FileSpreadsheet, Trash2, Upload } from 'lucide-vue-next'
import {
  COLUNAS_MAILING,
  formatarTelefone,
  normalizarTelefone,
  pareceCabecalho,
  parseCsv,
  sugerirMapeamento,
  telefoneValido,
} from '#shared/utils/mailing'
import ConfirmDeleteDialog from '@/components/configuracao/ConfirmDeleteDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'gerente'],
})

const { setores, lotes, loading, enviando, erro, load, importar, removerLote } = useMailing()

const setorId = ref<string>('')
const arquivo = ref<File | null>(null)
const nomeArquivo = ref('')
const linhasCsv = ref<string[][]>([])
const temCabecalho = ref(true)
const mapeamento = ref<Record<ColunaMailing, number>>({
  nome: -1,
  telefone: -1,
  email: -1,
  empreendimento: -1,
})
const erroArquivo = ref<string | null>(null)
const resultado = ref<ResultadoImport | null>(null)

const deleteOpen = ref(false)
const deletando = ref<LoteMailing | null>(null)

onMounted(() => load())

/** Setores que consomem mailing — os de origem só C2S não aceitam import. */
const setoresElegiveis = computed(() =>
  setores.value.filter(s => (s.origemLeads ?? 'c2s') !== 'c2s'),
)

const cabecalho = computed<string[]>(() =>
  temCabecalho.value ? (linhasCsv.value[0] ?? []) : [],
)

/** Rótulo de cada coluna no seletor: o cabeçalho, ou "Coluna 1", "Coluna 2"… */
const opcoesColuna = computed(() => {
  const total = linhasCsv.value[0]?.length ?? 0
  return Array.from({ length: total }, (_, i) => ({
    valor: String(i),
    rotulo: cabecalho.value[i]?.trim() || `Coluna ${i + 1}`,
  }))
})

const linhasDados = computed(() =>
  temCabecalho.value ? linhasCsv.value.slice(1) : linhasCsv.value,
)

/** Aplica o mapeamento às linhas de dados. Sem telefone mapeado, não há o que importar. */
const linhasMapeadas = computed<LinhaMailing[]>(() => {
  const m = mapeamento.value
  if (m.telefone < 0)
    return []
  return linhasDados.value.map(linha => ({
    nome: m.nome >= 0 ? (linha[m.nome] ?? '') : '',
    telefone: linha[m.telefone] ?? '',
    email: m.email >= 0 ? linha[m.email] : undefined,
    empreendimento: m.empreendimento >= 0 ? linha[m.empreendimento] : undefined,
  }))
})

const invalidas = computed(() =>
  linhasMapeadas.value.filter(l => !telefoneValido(l.telefone)).length,
)

/**
 * Repetições dentro do próprio arquivo, que o navegador consegue detectar —
 * assim o contador promete o mesmo número que o servidor vai gravar. O que
 * não dá para saber aqui é o que já existe no banco (já no setor ou já
 * trabalhado); isso só o import responde.
 */
const duplicadas = computed(() => {
  const vistos = new Set<string>()
  let n = 0
  for (const linha of linhasMapeadas.value) {
    if (!telefoneValido(linha.telefone))
      continue
    const tel = normalizarTelefone(linha.telefone)
    if (vistos.has(tel))
      n++
    else
      vistos.add(tel)
  }
  return n
})

/** O que de fato será enviado: telefone válido e sem repetir no arquivo. */
const validas = computed(() => {
  const vistos = new Set<string>()
  return linhasMapeadas.value.filter((linha) => {
    if (!telefoneValido(linha.telefone))
      return false
    const tel = normalizarTelefone(linha.telefone)
    if (vistos.has(tel))
      return false
    vistos.add(tel)
    return true
  })
})

const preview = computed(() => linhasMapeadas.value.slice(0, 5))

const podeImportar = computed(() =>
  !!setorId.value && validas.value.length > 0 && !enviando.value,
)

function nomeSetor(id: string | null): string {
  if (!id)
    return '—'
  return setores.value.find(s => s.id === id)?.nome ?? 'Setor removido'
}

async function onArquivo(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  resultado.value = null
  erroArquivo.value = null

  if (!file) {
    limparArquivo()
    return
  }

  try {
    const texto = await file.text()
    const linhas = parseCsv(texto)
    if (!linhas.length) {
      erroArquivo.value = 'O arquivo está vazio.'
      limparArquivo()
      return
    }

    arquivo.value = file
    nomeArquivo.value = file.name
    linhasCsv.value = linhas
    temCabecalho.value = pareceCabecalho(linhas[0]!)
    mapeamento.value = temCabecalho.value
      ? sugerirMapeamento(linhas[0]!)
      // Sem cabeçalho não há o que adivinhar: assume nome na 1ª e telefone na 2ª.
      : { nome: 0, telefone: linhas[0]!.length > 1 ? 1 : 0, email: -1, empreendimento: -1 }
  }
  catch {
    erroArquivo.value = 'Não foi possível ler o arquivo. Salve como CSV e tente de novo.'
    limparArquivo()
  }
}

function limparArquivo() {
  arquivo.value = null
  nomeArquivo.value = ''
  linhasCsv.value = []
  mapeamento.value = { nome: -1, telefone: -1, email: -1, empreendimento: -1 }
}

// Trocar "tem cabeçalho" muda o que é dado e o que é rótulo — re-sugere o mapa.
watch(temCabecalho, (tem) => {
  if (!linhasCsv.value.length)
    return
  mapeamento.value = tem
    ? sugerirMapeamento(linhasCsv.value[0]!)
    : { nome: 0, telefone: linhasCsv.value[0]!.length > 1 ? 1 : 0, email: -1, empreendimento: -1 }
})

async function onImportar() {
  if (!podeImportar.value)
    return
  erroArquivo.value = null
  try {
    resultado.value = await importar(setorId.value, validas.value, nomeArquivo.value)
    limparArquivo()
  }
  catch (e: any) {
    erroArquivo.value = e?.statusMessage ?? 'Não foi possível importar a lista.'
  }
}

function abrirRemocao(lote: LoteMailing) {
  deletando.value = lote
  deleteOpen.value = true
}

async function confirmarRemocao() {
  if (deletando.value)
    await removerLote(deletando.value.loteId)
  deleteOpen.value = false
  deletando.value = null
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Mailing
      </h1>
      <p class="text-sm text-muted-foreground">
        Importe listas externas (CSV) para abastecer os setores da Oferta Ativa.
      </p>
    </header>

    <Card v-if="erro" class="border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ erro }}
    </Card>

    <Card
      v-if="!loading && !setoresElegiveis.length"
      class="flex flex-col items-center gap-3 px-6 py-12 text-center"
    >
      <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <FileSpreadsheet class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum setor aceita mailing
      </h2>
      <p class="max-w-md text-sm text-muted-foreground">
        Para importar uma lista, edite um setor em Configurações → Setores e mude a
        origem dos leads para <strong>Mailing</strong> ou <strong>Ambos</strong>.
      </p>
      <Button as-child variant="outline" class="mt-1">
        <NuxtLink to="/dashboard/configuracao/setores">
          Ir para Setores
        </NuxtLink>
      </Button>
    </Card>

    <!-- Upload -->
    <Card v-else class="space-y-5 p-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <Label for="mailing-setor">Setor de destino</Label>
          <Select id="mailing-setor" v-model="setorId">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in setoresElegiveis" :key="s.id" :value="s.id">
                {{ s.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label for="mailing-arquivo">Arquivo CSV</Label>
          <input
            id="mailing-arquivo"
            type="file"
            accept=".csv,text/csv,text/plain"
            class="block w-full cursor-pointer rounded-md border border-border bg-background px-3 py-1.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium hover:border-brand/40"
            @change="onArquivo"
          >
        </div>
      </div>

      <p v-if="erroArquivo" class="text-sm text-rose-600">
        {{ erroArquivo }}
      </p>

      <!-- Mapeamento + preview -->
      <div v-if="linhasCsv.length" class="space-y-4 border-t border-border pt-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-sm text-muted-foreground">
            <span class="font-medium text-foreground">{{ nomeArquivo }}</span>
            — {{ linhasDados.length }} {{ linhasDados.length === 1 ? 'linha' : 'linhas' }}
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input v-model="temCabecalho" type="checkbox" class="size-4 accent-brand">
            A primeira linha é cabeçalho
          </label>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="coluna in COLUNAS_MAILING" :key="coluna" class="space-y-1.5">
            <Label class="capitalize">
              {{ coluna }}
              <span v-if="coluna === 'telefone'" class="text-brand">*</span>
            </Label>
            <Select
              :model-value="String(mapeamento[coluna])"
              @update:model-value="(v: any) => (mapeamento[coluna] = Number(v))"
            >
              <SelectTrigger>
                <SelectValue placeholder="Não importar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">
                  Não importar
                </SelectItem>
                <SelectItem v-for="op in opcoesColuna" :key="op.valor" :value="op.valor">
                  {{ op.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p v-if="mapeamento.telefone < 0" class="text-sm text-amber-600">
          Escolha qual coluna contém o telefone para continuar.
        </p>

        <template v-else>
          <div class="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/50">
                  <TableHead class="font-semibold text-foreground">
                    Nome
                  </TableHead>
                  <TableHead class="font-semibold text-foreground">
                    Telefone
                  </TableHead>
                  <TableHead class="font-semibold text-foreground">
                    E-mail
                  </TableHead>
                  <TableHead class="font-semibold text-foreground">
                    Empreendimento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(linha, i) in preview" :key="i">
                  <TableCell>{{ linha.nome || '—' }}</TableCell>
                  <TableCell :class="telefoneValido(linha.telefone) ? '' : 'text-rose-600'">
                    {{ telefoneValido(linha.telefone) ? formatarTelefone(linha.telefone) : `${linha.telefone || '—'} (inválido)` }}
                  </TableCell>
                  <TableCell>{{ linha.email || '—' }}</TableCell>
                  <TableCell>{{ linha.empreendimento || '—' }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-muted-foreground">
              <span class="font-medium text-foreground">{{ validas.length }}</span> prontas para importar
              <template v-if="invalidas">
                · <span class="text-rose-600">{{ invalidas }} com telefone inválido</span>
              </template>
              <template v-if="duplicadas">
                · <span class="text-amber-600">{{ duplicadas }} repetidas no arquivo</span>
              </template>
            </p>
            <Button :disabled="!podeImportar" @click="onImportar">
              <Upload class="size-4" />
              {{ enviando ? 'Importando…' : 'Importar lista' }}
            </Button>
          </div>
        </template>
      </div>

      <!-- Resultado do último import -->
      <div
        v-if="resultado"
        class="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"
      >
        <p class="font-medium text-emerald-800">
          {{ resultado.importados }} {{ resultado.importados === 1 ? 'lead importado' : 'leads importados' }}.
        </p>
        <ul
          v-if="resultado.invalidos || resultado.duplicadosNoArquivo || resultado.jaNoSetor || resultado.jaTrabalhados"
          class="text-emerald-700"
        >
          <li v-if="resultado.invalidos">
            {{ resultado.invalidos }} com telefone inválido
          </li>
          <li v-if="resultado.duplicadosNoArquivo">
            {{ resultado.duplicadosNoArquivo }} repetidos dentro do arquivo
          </li>
          <li v-if="resultado.jaNoSetor">
            {{ resultado.jaNoSetor }} já estavam neste setor
          </li>
          <li v-if="resultado.jaTrabalhados">
            {{ resultado.jaTrabalhados }} já foram trabalhados antes
          </li>
        </ul>
      </div>
    </Card>

    <!-- Lotes importados -->
    <div v-if="lotes.length" class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">
        Listas importadas
      </h2>
      <div class="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50">
              <TableHead class="font-semibold text-foreground">
                Arquivo
              </TableHead>
              <TableHead class="font-semibold text-foreground">
                Setor
              </TableHead>
              <TableHead class="font-semibold text-foreground">
                Importado em
              </TableHead>
              <TableHead class="font-semibold text-foreground">
                Progresso
              </TableHead>
              <TableHead class="w-[80px] text-right font-semibold text-foreground">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="lote in lotes" :key="lote.loteId" class="hover:bg-muted/30">
              <TableCell>
                <p class="font-medium text-foreground">
                  {{ lote.arquivo || 'Lista sem nome' }}
                </p>
                <p v-if="lote.importadoPor" class="text-xs text-muted-foreground">
                  por {{ lote.importadoPor }}
                </p>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ nomeSetor(lote.setorId) }}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatarData(lote.importadoEm) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Badge variant="secondary" class="text-xs">
                    {{ lote.trabalhados }}/{{ lote.total }} trabalhados
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ lote.disponiveis }} na fila
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover lista"
                  :disabled="lote.disponiveis === 0"
                  class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  @click="abrirRemocao(lote)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <ConfirmDeleteDialog
      v-model:open="deleteOpen"
      title="Remover lista"
      :description="`Remover os ${deletando?.disponiveis ?? 0} leads que ainda não foram trabalhados desta lista? Os ${deletando?.trabalhados ?? 0} já atendidos são preservados no histórico.`"
      confirm-label="Remover"
      @confirm="confirmarRemocao"
    />
  </section>
</template>
