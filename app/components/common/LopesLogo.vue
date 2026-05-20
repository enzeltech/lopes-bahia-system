<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  tone?: 'brand' | 'light' | 'dark'
  src?: string
  alt?: string
  class?: string
}>(), {
  tone: 'brand',
  src: '/images/lopes-bahia.webp',
  alt: 'Lopes Bahia',
})
</script>

<template>
  <div
    role="img"
    :aria-label="alt"
    :style="{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }"
    :class="
      cn(
        'block bg-no-repeat [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-position:center] [mask-size:contain] [-webkit-mask-size:contain]',
        tone === 'brand' && 'bg-brand',
        tone === 'light' && 'bg-white',
        tone === 'dark' && 'bg-foreground',
        $props.class,
      )
    "
  />
</template>
