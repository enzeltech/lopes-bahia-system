<script setup lang="ts">
import TemaCard from '@/components/capacitacao/TemaCard.vue'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const { temas } = useCapacitacao()
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Capacitação
      </h1>
      <p class="text-sm text-muted-foreground">
        Cursos e treinamentos disponíveis para a equipe.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <TemaCard v-for="tema in temas" :key="tema.id" :tema="tema" />
    </div>
  </section>
</template>
