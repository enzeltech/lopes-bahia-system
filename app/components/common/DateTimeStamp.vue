<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  align?: 'left' | 'center' | 'right'
  tone?: 'light' | 'dark'
  class?: string
}>(), {
  align: 'center',
  tone: 'light',
})

const { formattedDay, formattedTime } = useCurrentDateTime()
</script>

<template>
  <div
    :class="
      cn(
        'inline-flex flex-col gap-1 text-sm md:text-base leading-tight',
        align === 'left' && 'items-start text-left',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
        tone === 'light' && 'text-white',
        tone === 'dark' && 'text-foreground',
        $props.class,
      )
    "
  >
    <span>{{ formattedDay }}</span>
    <span class="font-medium">{{ formattedTime }}</span>
  </div>
</template>
