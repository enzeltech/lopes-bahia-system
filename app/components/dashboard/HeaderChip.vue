<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  class?: string
}>(), {})
</script>

<template>
  <div
    :class="
      cn(
        'flex h-14 items-center gap-3 rounded-md bg-brand-hover px-4 text-white',
        $props.class,
      )
    "
  >
    <span class="flex size-9 shrink-0 items-center justify-center text-white">
      <slot name="icon" />
    </span>
    <div class="flex min-w-0 flex-col leading-tight">
      <slot />
    </div>
  </div>
</template>
