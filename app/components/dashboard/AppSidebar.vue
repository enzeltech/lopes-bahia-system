<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const { collapsed, toggle, hydrate } = useSidebarCollapsed()

onMounted(() => hydrate())
</script>

<template>
  <aside
    :class="
      cn(
        'hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex lg:flex-col',
        collapsed ? 'w-16' : 'w-64',
      )
    "
  >
    <div
      :class="
        cn(
          'flex items-center border-b border-border p-2',
          collapsed ? 'justify-center' : 'justify-end',
        )
      "
    >
      <Button
        variant="ghost"
        size="icon"
        :aria-label="collapsed ? 'Expandir menu' : 'Recolher menu'"
        @click="toggle"
      >
        <PanelLeftClose v-if="!collapsed" class="size-5!" />
        <PanelLeftOpen v-else class="size-5!" />
      </Button>
    </div>

    <SidebarNav :collapsed="collapsed" />
  </aside>
</template>
