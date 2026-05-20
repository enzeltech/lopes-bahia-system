<script setup lang="ts">
import type { Component } from 'vue'
import {
  BarChart3,
  Calculator,
  ExternalLink,
  Globe,
  MessageSquareText,
} from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

interface UsefulLink {
  id: string
  title: string
  url: string
  icon: Component
}

const links: UsefulLink[] = [
  {
    id: 'hp-12c',
    title: 'Calculadora HP-12C',
    url: 'https://epxx.co/ctb/hp12c.html',
    icon: Calculator,
  },
  {
    id: 'simulador-financiamento',
    title: 'Calculadora de Financiamento',
    url: 'https://www.mobills.com.br/calculadoras/simulador-de-financiamento-imobiliario/',
    icon: Calculator,
  },
  {
    id: 'indicadores-economicos',
    title: 'Indicadores Econômicos',
    url: 'https://www.bcb.gov.br/estatisticas',
    icon: BarChart3,
  },
  {
    id: 'site-prontos',
    title: 'Site da Prontos',
    url: 'https://lopesnet.contact2sale.com/webapp',
    icon: Globe,
  },
  {
    id: 'lopesnet-contatos',
    title: 'Site Lopesnet Contatos',
    url: 'https://lopesnet.contact2sale.com/webapp',
    icon: Globe,
  },
  {
    id: 'chatgpt',
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: MessageSquareText,
  },
]
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      Links Úteis
    </h1>

    <Card class="p-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-4 rounded-lg border border-border bg-background p-4 transition-all duration-200 outline-none hover:border-brand/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-brand/10 group-hover:text-brand"
          >
            <component :is="link.icon" class="size-5" />
          </span>

          <h3 class="flex-1 text-sm font-medium uppercase tracking-wide text-foreground transition-colors group-hover:text-brand">
            {{ link.title }}
          </h3>

          <ExternalLink
            class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
          />
        </a>
      </div>
    </Card>
  </section>
</template>
