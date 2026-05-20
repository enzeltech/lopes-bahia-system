<script setup lang="ts">
import { NotebookPen } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})
</script>

<template>
  <section class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
    <header class="flex items-center gap-2">
      <NotebookPen class="size-5 text-brand" />
      <h2 class="text-base font-semibold text-foreground">Minhas anotações</h2>
    </header>

    <textarea
      v-model="value"
      rows="10"
      placeholder="Anote os pontos principais da aula aqui…"
      class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    />

    <p class="text-xs text-muted-foreground">
      Salvo automaticamente no seu navegador.
    </p>
  </section>
</template>
