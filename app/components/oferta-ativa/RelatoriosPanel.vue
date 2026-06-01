<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Totais {
  trabalhados: number
  interessados: number
  naoInteressados: number
  recontatar: number
  numerosInvalidos: number
  taxaConversao: number
}
interface PorCorretor extends Totais { corretorId: string, corretorNome: string }
interface Relatorio { periodo: string, isGerente: boolean, totais: Totais, porCorretor: PorCorretor[] }

const periodos = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: '7 dias' },
  { value: 'mes', label: '30 dias' },
  { value: 'tudo', label: 'Tudo' },
] as const

const periodo = ref<string>('hoje')
const data = ref<Relatorio | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<Relatorio>('/api/oferta-ativa/relatorios', { query: { periodo: periodo.value } })
  } finally {
    loading.value = false
  }
}

watch(periodo, load)
onMounted(load)

const cards = computed(() => {
  const t = data.value?.totais
  return [
    { label: 'Trabalhados', valor: t?.trabalhados ?? 0, cor: 'text-foreground', sub: '' },
    { label: 'Interessados', valor: t?.interessados ?? 0, cor: 'text-emerald-600', sub: `${t?.taxaConversao ?? 0}% de conversão` },
    { label: 'Não interessados', valor: t?.naoInteressados ?? 0, cor: 'text-rose-600', sub: '' },
    { label: 'Recontatar', valor: t?.recontatar ?? 0, cor: 'text-amber-600', sub: '' },
    { label: 'Número inválido', valor: t?.numerosInvalidos ?? 0, cor: 'text-neutral-500', sub: '' },
  ]
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="p in periodos"
        :key="p.value"
        :variant="periodo === p.value ? 'default' : 'outline'"
        size="sm"
        @click="periodo = p.value"
      >
        {{ p.label }}
      </Button>
    </div>

    <Card v-if="loading" class="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
      <Loader2 class="size-4 animate-spin" /> Carregando…
    </Card>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Card v-for="c in cards" :key="c.label" class="flex flex-col gap-1 p-4">
          <span class="text-xs text-muted-foreground">{{ c.label }}</span>
          <span class="text-2xl font-bold tabular-nums" :class="c.cor">{{ c.valor }}</span>
          <span v-if="c.sub" class="text-xs text-muted-foreground">{{ c.sub }}</span>
        </Card>
      </div>

      <Card v-if="data?.isGerente && data.porCorretor.length" class="p-6">
        <h3 class="mb-4 text-base font-semibold text-foreground">
          Ranking de corretores
        </h3>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50">
                <TableHead class="w-10 font-semibold text-foreground">
                  #
                </TableHead>
                <TableHead class="font-semibold text-foreground">
                  Corretor
                </TableHead>
                <TableHead class="text-right font-semibold text-foreground">
                  Trabalhados
                </TableHead>
                <TableHead class="text-right font-semibold text-foreground">
                  Interessados
                </TableHead>
                <TableHead class="text-right font-semibold text-foreground">
                  Conversão
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(c, i) in data.porCorretor" :key="c.corretorId" class="hover:bg-muted/30">
                <TableCell class="font-semibold text-muted-foreground">
                  {{ i + 1 }}
                </TableCell>
                <TableCell class="font-medium text-foreground">
                  {{ c.corretorNome }}
                </TableCell>
                <TableCell class="text-right tabular-nums">
                  {{ c.trabalhados }}
                </TableCell>
                <TableCell class="text-right tabular-nums text-emerald-600">
                  {{ c.interessados }}
                </TableCell>
                <TableCell class="text-right tabular-nums font-medium">
                  {{ c.taxaConversao }}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </template>
  </div>
</template>
