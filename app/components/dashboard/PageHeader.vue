<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { NuxtLink } from '#components'
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  title: string
  description?: string
  backTo?: string
}>(), {
  backTo: '/dashboard',
})
</script>

<template>
  <header class="flex items-center gap-3">
    <Button as-child variant="ghost" size="icon">
      <NuxtLink :to="backTo" aria-label="Voltar">
        <ArrowLeft class="size-5" />
      </NuxtLink>
    </Button>
    <div class="space-y-0.5">
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-muted-foreground">
        {{ description }}
      </p>
    </div>
  </header>
</template>
