<script setup lang="ts">
import { Construction } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const route = useRoute()

const titles: Record<string, string> = {
  empreendimentos: 'Gerenciar empreendimentos',
  temas: 'Temas e vídeos',
}

const descriptions: Record<string, string> = {
  empreendimentos: 'Cadastro e edição do catálogo de empreendimentos. Será habilitado quando a API estiver conectada.',
  temas: 'Organização do conteúdo da plataforma de capacitação. Será habilitado quando a API estiver conectada.',
}

const slug = computed(() => String(route.params.modulo))
const title = computed(() => titles[slug.value] ?? 'Módulo')
const description = computed(() => descriptions[slug.value] ?? 'Em desenvolvimento.')
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="space-y-1">
      <NuxtLink
        to="/dashboard/configuracao"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
      >
        ← Configurações
      </NuxtLink>
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {{ title }}
      </h1>
    </header>

    <Card class="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Construction class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Aguardando backend
      </h2>
      <p class="max-w-md text-sm text-muted-foreground">
        {{ description }}
      </p>
      <Button as-child variant="outline">
        <NuxtLink to="/dashboard/configuracao">
          Voltar para Configurações
        </NuxtLink>
      </Button>
    </Card>
  </section>
</template>
