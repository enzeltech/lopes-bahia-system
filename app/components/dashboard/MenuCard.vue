<script setup lang="ts">
import { NuxtLink } from '#components'
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  title: string
  imageSrc: string
  to?: string
  imageAlt?: string
  class?: string
}>(), {
  to: undefined,
  imageAlt: undefined,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const rootClass = computed(() =>
  cn(
    'group relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-200 text-left shadow-sm outline-none transition-all duration-300 ease-out',
    'hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
    'active:translate-y-0 active:shadow-md',
  ),
)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :aria-label="title"
    :class="cn(rootClass, $props.class)"
    @click="emit('click')"
  >
    <img
      :src="imageSrc"
      :alt="imageAlt ?? title"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.06]"
      loading="lazy"
    >
    <div
      aria-hidden="true"
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90"
    />
    <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
      <h3 class="text-xl font-bold uppercase tracking-wide text-white drop-shadow-sm sm:text-2xl">
        {{ title }}
      </h3>
    </div>
  </NuxtLink>

  <button
    v-else
    type="button"
    :aria-label="title"
    :class="cn(rootClass, $props.class)"
    @click="emit('click')"
  >
    <img
      :src="imageSrc"
      :alt="imageAlt ?? title"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.06]"
      loading="lazy"
    >
    <div
      aria-hidden="true"
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90"
    />
    <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
      <h3 class="text-xl font-bold uppercase tracking-wide text-white drop-shadow-sm sm:text-2xl">
        {{ title }}
      </h3>
    </div>
  </button>
</template>
