<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowRight,
  Briefcase,
  Building2,
  PlayCircle,
  Users,
} from 'lucide-vue-next'
import { NuxtLink } from '#components'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const { usuarios, load } = useUsuariosConfig()

onMounted(() => load())

interface ConfigCard {
  title: string
  description: string
  to: string
  icon: Component
  counter?: ComputedRef<string>
}

const cards: ConfigCard[] = [
  {
    title: 'Usuários',
    description: 'Gerenciar acesso e permissões da equipe.',
    to: '/dashboard/configuracao/usuarios',
    icon: Users,
    counter: computed(() => `${usuarios.value.length} cadastrados`),
  },
  {
    title: 'Setores da Oferta Ativa',
    description: 'Definir tags da C2S e corretores de cada setor.',
    to: '/dashboard/configuracao/setores',
    icon: Briefcase,
  },
  {
    title: 'Empreendimentos',
    description: 'Cadastrar e editar empreendimentos do catálogo.',
    to: '/dashboard/configuracao/empreendimentos',
    icon: Building2,
  },
  {
    title: 'Temas e Vídeos',
    description: 'Organizar o conteúdo da plataforma de capacitação.',
    to: '/dashboard/configuracao/temas',
    icon: PlayCircle,
  },
]
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Configurações
      </h1>
      <p class="text-sm text-muted-foreground">
        Área administrativa do sistema. Apenas super administradores.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <div class="flex items-start justify-between">
          <span
            class="grid size-12 place-items-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/15"
          >
            <component :is="card.icon" class="size-6" />
          </span>
          <ArrowRight class="size-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
        </div>

        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-foreground group-hover:text-brand">
            {{ card.title }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ card.description }}
          </p>
        </div>

        <p v-if="card.counter" class="mt-auto text-xs font-medium text-muted-foreground">
          {{ card.counter.value }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
