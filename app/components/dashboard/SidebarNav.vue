<script setup lang="ts">
import type { Component } from 'vue'
import {
  Book,
  Building2,
  ExternalLink,
  Home,
  Link2,
  MessageSquareText,
  Settings,
} from 'lucide-vue-next'
import { NuxtLink } from '#components'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: Component
  superAdminOnly?: boolean
}

interface ExternalNavItem {
  label: string
  url: string
}

withDefaults(defineProps<{
  collapsed?: boolean
}>(), {
  collapsed: false,
})

const emit = defineEmits<{
  (e: 'navigate'): void
}>()

const { isSuperAdmin } = useAuthUser()
const route = useRoute()

const items: NavItem[] = [
  { label: 'Início', to: '/dashboard', icon: Home },
  { label: 'Empreendimentos', to: '/dashboard/empreendimentos', icon: Building2 },
  { label: 'Oferta ativa', to: '/dashboard/oferta-ativa', icon: MessageSquareText },
  { label: 'Links Úteis', to: '/dashboard/links-uteis', icon: Link2 },
  { label: 'Capacitação', to: '/dashboard/capacitacao', icon: Book },
  { label: 'Configurações', to: '/dashboard/configuracao', icon: Settings, superAdminOnly: true },
]

const externalItems: ExternalNavItem[] = [
  { label: 'LopesNet Prontos', url: 'https://prontos.lopesnet.com.br/' },
  { label: 'LopesNet Contatos', url: 'https://lopesnet.contact2sale.com/webapp' },
]

const visibleItems = computed(() =>
  items.filter(item => !item.superAdminOnly || isSuperAdmin.value),
)

function isActive(to: string): boolean {
  if (to === '/dashboard')
    return route.path === '/dashboard'
  return route.path === to || route.path.startsWith(`${to}/`)
}

function rowClass(active: boolean, collapsed: boolean): string {
  return cn(
    'flex items-center gap-3 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
    collapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5',
    active
      ? 'bg-brand text-white shadow-sm'
      : 'text-foreground/80 hover:bg-muted hover:text-foreground',
  )
}
</script>

<template>
  <nav class="flex flex-col gap-1 p-3">
    <NuxtLink
      v-for="item in visibleItems"
      :key="item.to"
      :to="item.to"
      :title="collapsed ? item.label : undefined"
      :class="rowClass(isActive(item.to), collapsed)"
      @click="emit('navigate')"
    >
      <component :is="item.icon" class="size-5 shrink-0" />
      <span v-if="!collapsed">{{ item.label }}</span>
    </NuxtLink>

    <div class="my-2 h-px bg-border" />

    <a
      v-for="link in externalItems"
      :key="link.url"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      :title="collapsed ? link.label : undefined"
      :class="rowClass(false, collapsed)"
      @click="emit('navigate')"
    >
      <ExternalLink class="size-5 shrink-0 text-brand" />
      <span v-if="!collapsed" class="flex-1 truncate">{{ link.label }}</span>
    </a>
  </nav>
</template>
