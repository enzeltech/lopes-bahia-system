<script setup lang="ts">
import { CheckCircle2, PlayCircle } from 'lucide-vue-next'
import { NuxtLink } from '#components'
import type { CapacitacaoVideo } from '@/types/capacitacao'

const props = defineProps<{
  video: CapacitacaoVideo
  index: number
  completed?: boolean
}>()

const href = computed(() => `/dashboard/capacitacao/${props.video.temaId}/${props.video.id}`)
</script>

<template>
  <NuxtLink
    :to="href"
    class="group flex items-start gap-4 rounded-lg border border-border bg-background p-4 outline-none transition-all hover:border-brand/40 hover:bg-muted/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
  >
    <span
      class="grid size-12 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand/15"
    >
      <CheckCircle2 v-if="completed" class="size-6" />
      <PlayCircle v-else class="size-6" />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-muted-foreground">
          Aula {{ index + 1 }}
        </span>
        <span v-if="video.duracaoMin" class="text-xs text-muted-foreground">
          {{ video.duracaoMin }} min
        </span>
      </div>
      <h3 class="mt-1 text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
        {{ video.titulo }}
      </h3>
      <p v-if="video.descricao" class="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {{ video.descricao }}
      </p>
    </div>
  </NuxtLink>
</template>
