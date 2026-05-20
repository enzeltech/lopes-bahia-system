<script setup lang="ts">
import { Construction } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const route = useRoute()

const moduleTitles: Record<string, string> = {
  'configuracao': 'Configurações',
}

const slug = computed(() => String(route.params.slug))
const title = computed(() => moduleTitles[slug.value] ?? 'Módulo')
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      {{ title }}
    </h1>

    <div
      class="grid place-items-center rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center"
    >
      <div class="flex max-w-md flex-col items-center gap-4">
        <span class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
          <Construction class="size-7" />
        </span>
        <h2 class="text-xl font-semibold text-foreground">Em desenvolvimento</h2>
        <p class="text-sm text-muted-foreground">
          Este módulo será construído na próxima etapa.
        </p>
      </div>
    </div>
  </section>
</template>
