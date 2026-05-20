<script setup lang="ts">
import { ArrowRight, BookOpen, Clock } from 'lucide-vue-next'
import { NuxtLink } from '#components'
import type { CapacitacaoTema } from '@/types/capacitacao'

defineProps<{
  tema: CapacitacaoTema
}>()
</script>

<template>
  <NuxtLink
    :to="`/dashboard/capacitacao/${tema.id}`"
    class="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
  >
    <div class="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand to-brand-hover">
      <BookOpen class="size-14 text-white/80 transition-transform duration-300 group-hover:scale-110" />
      <div
        aria-hidden="true"
        class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
      />
      <span
        class="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
      >
        {{ tema.videos.length }} {{ tema.videos.length === 1 ? 'aula' : 'aulas' }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <h3 class="text-lg font-bold text-foreground transition-colors group-hover:text-brand">
        {{ tema.nome }}
      </h3>
      <p class="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {{ tema.descricao }}
      </p>

      <div class="flex items-center justify-between border-t border-border pt-3 text-sm">
        <span class="flex items-center gap-1.5 text-muted-foreground">
          <Clock class="size-4" />
          Autogerenciado
        </span>
        <span class="flex items-center gap-1 font-medium text-brand">
          Iniciar
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
