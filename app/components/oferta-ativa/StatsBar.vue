<script setup lang="ts">
import { Card } from '@/components/ui/card'
import type { EstatisticasSetor } from '@/types/oferta-ativa'

defineProps<{
  stats: EstatisticasSetor
  total: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Card class="flex flex-col gap-1 p-4">
      <span class="text-xs text-muted-foreground">Trabalhados</span>
      <span class="text-2xl font-bold tabular-nums text-foreground">
        {{ stats.trabalhados }}<span class="text-sm font-normal text-muted-foreground"> / {{ total }}</span>
      </span>
    </Card>
    <Card class="flex flex-col gap-1 p-4">
      <span class="text-xs text-muted-foreground">Interessados</span>
      <span class="text-2xl font-bold tabular-nums text-emerald-600">
        {{ stats.interessados }}
      </span>
    </Card>
    <Card class="flex flex-col gap-1 p-4">
      <span class="text-xs text-muted-foreground">Não interessados</span>
      <span class="text-2xl font-bold tabular-nums text-rose-600">
        {{ stats.naoInteressados }}
      </span>
    </Card>
    <Card class="flex flex-col gap-1 p-4">
      <span class="text-xs text-muted-foreground">Recontatar</span>
      <span class="text-2xl font-bold tabular-nums text-amber-600">
        {{ stats.recontatar }}
      </span>
    </Card>
  </div>
</template>
